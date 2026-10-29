/*
 * Memory Match — turn over two cards, find the pair.
 *
 * The classic game, with the punishing parts removed. Nothing is timed, a
 * wrong pair simply turns back over, and matched pairs stay on the board face
 * up so the child can see what they have already found rather than watching
 * the board empty out.
 *
 * Board size and how long a mismatched pair stays visible both come from the
 * difficulty profile — a Little player gets three pairs and a long, forgiving
 * look at their mistake; a Big player gets fifteen pairs and a brief one.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import type { GameProps } from "../registry";
import type { MemoryConfig } from "../../lib/difficulty";
import { CREATURES, Creature } from "../../art/creatures";
import type { CreatureSpec } from "../../art/creatures";
import { hueAt, hueClass } from "../../lib/hues";
import { cssVars } from "../../lib/css";
import { sample, shuffle } from "../../lib/shuffle";
import { playCorrect, playRetry, playTap, unlockAudio } from "../../lib/audio";
import { speak } from "../../lib/speech";
import "./memory.css";

interface Card {
  /** Unique per card; the two halves of a pair share a `creature`. */
  key: string;
  creature: CreatureSpec;
}

function buildDeck(config: MemoryConfig): Card[] {
  // An odd cell count would leave one card without a partner, so we round the
  // pair count down and let the layout absorb the spare cell.
  const pairs = Math.floor((config.columns * config.rows) / 2);
  const chosen = sample(CREATURES, pairs);

  return shuffle(
    chosen.flatMap((creature) => [
      { key: `${creature.id}-a`, creature },
      { key: `${creature.id}-b`, creature },
    ]),
  );
}

export function MemoryMatch({
  config,
  onWin,
  onProgress,
}: GameProps<MemoryConfig>) {
  const deck = useMemo(() => buildDeck(config), [config]);
  const pairCount = deck.length / 2;

  // Roving focus: the grid is a single tab stop and the arrow keys move
  // between cards. Tabbing through thirty separate buttons to reach the one
  // you want is not a usable keyboard path.
  const [cursor, setCursor] = useState(0);

  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [wrong, setWrong] = useState<string[]>([]);

  // A lock, not a state flag: it must be readable synchronously inside the
  // click handler or a fast child can flip a third card during the peek.
  const busy = useRef(false);
  const timers = useRef<number[]>([]);

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);

  useEffect(
    () => () => {
      timers.current.forEach(window.clearTimeout);
    },
    [],
  );

  const matchedPairs = matched.length / 2;

  useEffect(() => {
    onProgress(matchedPairs, pairCount);
  }, [matchedPairs, pairCount, onProgress]);

  useEffect(() => {
    if (matchedPairs !== pairCount || pairCount === 0) return;
    later(() => onWin({}), 450);
    // This fires once, on the move that completed the board.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchedPairs, pairCount]);

  function moveCursor(from: number, key: string): number | null {
    const { columns } = config;
    const rows = Math.ceil(deck.length / columns);
    let row = Math.floor(from / columns);
    let col = from % columns;

    if (key === "ArrowRight") col += 1;
    else if (key === "ArrowLeft") col -= 1;
    else if (key === "ArrowDown") row += 1;
    else if (key === "ArrowUp") row -= 1;
    else return null;

    // Wrapping in both directions means every card is reachable without
    // having to work out where the edges are.
    col = (col + columns) % columns;
    row = (row + rows) % rows;

    const next = row * columns + col;
    return next < deck.length ? next : from;
  }

  function handleKey(index: number, e: ReactKeyboardEvent<HTMLButtonElement>) {
    const next = moveCursor(index, e.key);
    if (next === null) return;

    e.preventDefault();
    setCursor(next);
    // Focus has to follow the cursor, or the visible ring and the real focus
    // drift apart and Enter acts on the wrong card.
    const grid = e.currentTarget.parentElement;
    const target = grid?.children[next] as HTMLElement | undefined;
    target?.focus();
  }

  function flip(card: Card) {
    if (busy.current) return;
    if (matched.includes(card.key) || flipped.includes(card.key)) return;

    unlockAudio();
    playTap();

    const next = [...flipped, card.key];
    setFlipped(next);
    if (next.length < 2) return;

    busy.current = true;

    const [firstKey, secondKey] = next;
    const first = deck.find((c) => c.key === firstKey)!;
    const second = deck.find((c) => c.key === secondKey)!;

    if (first.creature.id === second.creature.id) {
      playCorrect();
      speak(first.creature.name);
      // Matched cards stay face up permanently — the board fills in rather
      // than emptying out.
      later(() => {
        setMatched((m) => [...m, firstKey, secondKey]);
        setFlipped([]);
        busy.current = false;
      }, 320);
      return;
    }

    // Not a match. This is not a failure: the cards wiggle, a soft falling
    // tone plays, and they turn back over for another go.
    playRetry();
    setWrong(next);
    later(() => {
      setFlipped([]);
      setWrong([]);
      busy.current = false;
    }, config.peekMs);
  }

  return (
    <div className="memory">
      <div
        className="memory__board"
        style={cssVars({ "--cols": config.columns })}
        role="group"
        aria-label={`Memory board, ${pairCount} pairs to find`}
      >
        {deck.map((card, i) => {
          const isMatched = matched.includes(card.key);
          const isUp = isMatched || flipped.includes(card.key);
          const isWrong = wrong.includes(card.key);

          return (
            <button
              key={card.key}
              type="button"
              className={`card ${hueClass(hueAt(i))} ${isUp ? "card--up" : ""} ${
                isMatched ? "card--found" : ""
              } ${isWrong ? "is-wiggling" : ""}`}
              // Found cards stay put and stay focusable. Marking them truly
              // `disabled` would pull them out of the tab order and strand the
              // arrow-key cursor as the board fills up; flip() already ignores
              // them.
              aria-disabled={isMatched}
              aria-label={isUp ? card.creature.name : "Face down card"}
              tabIndex={i === cursor ? 0 : -1}
              onClick={() => flip(card)}
              onFocus={() => setCursor(i)}
              onKeyDown={(e) => handleKey(i, e)}
            >
              <span className="card__inner">
                <span className="card__face card__face--back" aria-hidden="true">
                  <span className="card__pattern" />
                </span>
                <span className="card__face card__face--front">
                  <Creature spec={card.creature} size="82%" happy={isMatched} />
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
