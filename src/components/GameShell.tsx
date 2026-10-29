/*
 * The frame every game plays inside.
 *
 * The shell owns everything that is the same across all four games: the header
 * and its controls, the mascot's instruction, the progress bar, and the entire
 * win sequence — fanfare, confetti, sticker, and the single write to
 * saved progress.
 *
 * Games therefore contain only their own puzzle logic. If you find yourself
 * about to write confetti or star code inside a game, it belongs here instead.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { GameDefinition, WinResult } from "../games/registry";
import { useProfile } from "../context/profile";
import type { WinRecord } from "../context/profile";
import { hueClass } from "../lib/hues";
import { cssVars } from "../lib/css";
import { stagger } from "../lib/motion";
import { playFanfare, unlockAudio } from "../lib/audio";
import { cancelSpeech, speak } from "../lib/speech";
import { IconHome, IconReplay } from "../art/icons";
import { IconButton } from "./IconButton";
import { BigButton } from "./BigButton";
import { Mascot } from "./Mascot";
import { Celebration } from "./Celebration";
import "./components.css";

interface GameShellProps {
  game: GameDefinition;
  onHome: () => void;
}

export function GameShell({ game, onHome }: GameShellProps) {
  const { profile, recordWin } = useProfile();

  const [round, setRound] = useState(0);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [win, setWin] = useState<WinRecord | null>(null);
  const [winMessage, setWinMessage] = useState<string>("");

  // Narrate the game once on arrival. Speaking cancels anything still in
  // flight, so tapping through screens quickly never stacks up sentences.
  useEffect(() => {
    speak(game.narration);
    return cancelSpeech;
  }, [game.narration]);

  const handleProgress = useCallback((done: number, total: number) => {
    setProgress({ done, total });
  }, []);

  const handleWin = useCallback(
    (result: WinResult) => {
      const record = recordWin(game.id);
      setWin(record);
      setWinMessage(result.message ?? "You did it!");
      playFanfare();
    },
    [game.id, recordWin],
  );

  // The celebration line is spoken after the fanfare has had its moment, so
  // the two do not talk over each other.
  const winSpeechTimer = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (!win) return;
    const sticker = win.sticker;
    const line = sticker
      ? `${winMessage} You found a new sticker friend!`
      : winMessage;

    winSpeechTimer.current = window.setTimeout(() => speak(line), stagger(1500));
    return () => window.clearTimeout(winSpeechTimer.current);
  }, [win, winMessage]);

  const playAgain = useCallback(() => {
    setWin(null);
    setProgress({ done: 0, total: 0 });
    setRound((r) => r + 1);
    unlockAudio();
    speak(game.howTo);
  }, [game.howTo]);

  const pct = progress.total > 0 ? (progress.done / progress.total) * 100 : 0;

  return (
    <div className={`shell ${hueClass(game.hue)}`}>
      <header className="shell__bar">
        <div className="shell__title">
          <game.Icon size={34} />
          <h1>{game.title}</h1>
        </div>

        <IconButton
          label="Start this puzzle again"
          icon={<IconReplay />}
          onClick={playAgain}
        />
      </header>

      {/* Progress is shown as a filling bar rather than a countdown: it only
          ever moves forward, and it never runs out. */}
      <div
        className="shell__progress"
        role="progressbar"
        aria-label="How much of the puzzle is done"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <span className="shell__progress-fill" style={cssVars({ "--pct": `${pct}%` })} />
      </div>

      <Mascot line={game.howTo} creature={game.guide} size={72} />

      <main className="shell__stage">
        {game.render({
          profile,
          onWin: handleWin,
          onProgress: handleProgress,
          round,
        })}
      </main>

      {win && (
        <div
          className="win"
          role="dialog"
          aria-modal="true"
          aria-label="You finished the puzzle"
        >
          <Celebration creature={win.sticker ?? game.guide} />

          <div className="win__card">
            <h2 className="win__headline">{winMessage}</h2>
            {win.sticker && (
              <p className="win__sticker-note">You found a new sticker friend!</p>
            )}

            <div className="win__actions">
              <BigButton label="Play again" hue={game.hue} onClick={playAgain} />
              <BigButton
                label="Home"
                hue="sunshine"
                icon={<IconHome size={30} />}
                onClick={onHome}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
