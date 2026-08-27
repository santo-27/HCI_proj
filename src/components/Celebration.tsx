/*
 * The win moment: confetti and a cheering friend.
 *
 * Confetti is a few dozen spans falling on staggered delays. Each one takes a
 * hue slot class rather than an inline colour, so the celebration is drawn
 * from the same palette as everything else, and the fall duration is
 * --dur-celebrate — which means the whole thing simply does not animate when
 * the player has asked for less motion, with no extra code path.
 */

import { useMemo } from "react";
import { Creature, creatureById } from "../art/creatures";
import { hueAt, hueClass } from "../lib/hues";
import { cssVars } from "../lib/css";
import { randomInt } from "../lib/shuffle";
import "./components.css";

const PIECE_COUNT = 34;

interface CelebrationProps {
  /** The friend who cheers. Usually the sticker just earned. */
  creature?: string;
}

export function Celebration({ creature = "fox" }: CelebrationProps) {
  // Positions are fixed on first render so the flakes do not re-randomise
  // every time the parent re-renders mid-celebration.
  const pieces = useMemo(
    () =>
      Array.from({ length: PIECE_COUNT }, (_, i) => ({
        id: i,
        hue: hueAt(i + randomInt(6)),
        left: randomInt(100),
        delay: randomInt(700),
        drift: randomInt(80) - 40,
        spin: randomInt(720) - 360,
        scale: 0.6 + randomInt(80) / 100,
      })),
    [],
  );

  return (
    <div className="celebration" aria-hidden="true">
      <div className="celebration__confetti">
        {pieces.map((p) => (
          <span
            key={p.id}
            className={`confetti ${hueClass(p.hue)}`}
            style={cssVars({
              "--x": `${p.left}%`,
              "--delay": `${p.delay}ms`,
              "--drift": `${p.drift}px`,
              "--spin": `${p.spin}deg`,
              "--flake-scale": p.scale,
            })}
          />
        ))}
      </div>
      <div className="celebration__friend">
        <Creature spec={creatureById(creature)} size={130} happy />
      </div>
    </div>
  );
}
