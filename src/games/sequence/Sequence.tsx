/*
 * Copy the Tune — watch the lights, then tap them back.
 *
 * The one game here with a memory load that grows, so it is also the one where
 * the "nothing is ever wrong" rule needs the most care. A wrong tap does not
 * end anything and does not shorten the sequence: the pattern is simply played
 * again from the start, and the child tries the same round once more. The only
 * thing a mistake costs is a star at the very end.
 *
 * Each pad owns a note from a pentatonic scale (see lib/audio), which has no
 * dissonant intervals — so whatever order the pads come in, the result still
 * sounds like music rather than an alarm.
 *
 * All timers are held in a ref and cleared on unmount, on replay and before
 * every new playback. A stray timeout here would light pads during the child's
 * turn, which is maddening and looks like a bug in *their* memory, not ours.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { GameProps } from "../registry";
import type { SequenceConfig } from "../../lib/difficulty";
import { CREATURES, Creature } from "../../art/creatures";
import { hueAt, hueClass } from "../../lib/hues";
import { cssVars } from "../../lib/css";
import { randomInt } from "../../lib/shuffle";
import { playPad, playRetry, unlockAudio } from "../../lib/audio";
import { speak } from "../../lib/speech";
import "./sequence.css";

type Phase = "idle" | "showing" | "listening" | "between";

/** Stars fall off with mistakes, but never below one. */
function starsForMistakes(mistakes: number): 1 | 2 | 3 {
  if (mistakes === 0) return 3;
  if (mistakes <= 2) return 2;
  return 1;
}

export function Sequence({
  config,
  onWin,
  onProgress,
}: GameProps<SequenceConfig>) {
  const [pattern, setPattern] = useState<number[]>([]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [lit, setLit] = useState<number | null>(null);
  const [step, setStep] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [wrongPad, setWrongPad] = useState<number | null>(null);

  const timers = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
  }, []);

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  /** Lights and plays the pattern, then hands the turn over. */
  const playback = useCallback(
    (seq: number[]) => {
      clearTimers();
      setPhase("showing");
      setStep(0);
      setLit(null);

      const cycle = config.litMs + config.gapMs;

      seq.forEach((pad, i) => {
        later(() => {
          setLit(pad);
          playPad(pad, config.litMs / 1000);
        }, 600 + i * cycle);
        later(() => setLit(null), 600 + i * cycle + config.litMs);
      });

      later(
        () => {
          setPhase("listening");
          speak("Your turn!");
        },
        600 + seq.length * cycle,
      );
    },
    [config.litMs, config.gapMs, clearTimers, later],
  );

  /* ---- Rounds ---------------------------------------------------------- */

  // First round: build the opening pattern and show it.
  useEffect(() => {
    const first = Array.from({ length: config.startLength }, () =>
      randomInt(config.padCount),
    );
    setPattern(first);
    playback(first);
    // Runs once per mounted game; the shell remounts us for a replay.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    onProgress(pattern.length, config.targetLength);
  }, [pattern.length, config.targetLength, onProgress]);

  const advance = useCallback(() => {
    setPhase("between");

    if (pattern.length >= config.targetLength) {
      speak("You copied the whole tune!");
      later(() => onWin({ stars: starsForMistakes(mistakes) }), 700);
      return;
    }

    // One more note each round, appended so the child's existing memory of the
    // sequence still holds — the pattern grows, it does not change.
    const next = [...pattern, randomInt(config.padCount)];
    setPattern(next);
    later(() => playback(next), 900);
  }, [pattern, config.targetLength, config.padCount, mistakes, onWin, later, playback]);

  function tapPad(pad: number) {
    if (phase !== "listening") return;
    unlockAudio();

    if (pattern[step] === pad) {
      playPad(pad, 0.3);
      setLit(pad);
      later(() => setLit(null), 180);

      const nextStep = step + 1;
      setStep(nextStep);
      if (nextStep >= pattern.length) advance();
      return;
    }

    // Wrong pad. Nothing is lost: the same pattern plays again and the round
    // restarts. The sequence never gets shorter and the game never ends.
    playRetry();
    setMistakes((m) => m + 1);
    setWrongPad(pad);
    setPhase("between");
    later(() => setWrongPad(null), 600);
    later(() => {
      speak("Nearly! Watch again.");
      playback(pattern);
    }, 900);
  }

  const pads = Array.from({ length: config.padCount }, (_, i) => i);

  const status =
    phase === "showing"
      ? "Watch and listen"
      : phase === "listening"
        ? "Your turn — tap them in order"
        : "Get ready";

  return (
    <div className="sequence">
      <p className="sequence__status" aria-live="polite">
        {status}
      </p>

      <p className="sequence__round">
        {/* Framed as how far along you are, never as lives remaining. */}
        Tune length: <strong>{pattern.length}</strong> of {config.targetLength}
      </p>

      <div
        className="sequence__pads"
        // repeat() will not take a calc() for its count, so the column count
        // is worked out here rather than in CSS.
        style={cssVars({ "--pad-cols": Math.ceil(config.padCount / 2) })}
        role="group"
        aria-label="Tune buttons"
      >
        {pads.map((pad) => (
          <button
            key={pad}
            type="button"
            className={`pad ${hueClass(hueAt(pad))} ${lit === pad ? "is-lit" : ""} ${
              wrongPad === pad ? "is-wiggling" : ""
            }`}
            // aria-disabled rather than disabled: a real `disabled` button
            // drops out of the tab order, so a keyboard player would lose
            // their place every time the pattern replayed. The tap is ignored
            // in tapPad instead.
            aria-disabled={phase !== "listening"}
            aria-label={`Button ${pad + 1}, ${CREATURES[pad % CREATURES.length].name}`}
            onClick={() => tapPad(pad)}
          >
            <Creature
              spec={CREATURES[pad % CREATURES.length]}
              size="70%"
              happy={lit === pad}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
