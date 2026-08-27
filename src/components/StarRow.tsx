/*
 * The one to three stars awarded for a finished puzzle.
 *
 * Stars pop in one at a time with a rising pitch, which stretches a small
 * reward into a moment worth waiting for. The row never shows zero: the floor
 * is one star, because finishing at all is the achievement being rewarded.
 */

import { useEffect, useState } from "react";
import { IconStar } from "../art/icons";
import { playStar } from "../lib/audio";
import { stagger } from "../lib/motion";
import "./components.css";

interface StarRowProps {
  stars: 1 | 2 | 3;
  /** Animate them in with sound. Off for the quiet summaries on the home grid. */
  animate?: boolean;
  size?: number;
}

const MAX_STARS = 3;

export function StarRow({ stars, animate = false, size = 54 }: StarRowProps) {
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    if (!animate) return;

    const timers: number[] = [];
    for (let i = 0; i < stars; i++) {
      timers.push(
        window.setTimeout(() => {
          setRevealed(i + 1);
          playStar(i);
        }, stagger(380 + i * 420)),
      );
    }
    return () => timers.forEach(window.clearTimeout);
  }, [stars, animate]);

  // The static case is derived rather than pushed through state: the home grid
  // renders dozens of these and none of them should schedule anything.
  const shown = animate ? revealed : stars;

  return (
    <div
      className="star-row"
      role="img"
      aria-label={`${stars} out of ${MAX_STARS} stars`}
    >
      {Array.from({ length: MAX_STARS }, (_, i) => (
        <span
          key={i}
          className={`star ${i < shown ? "star--on" : "star--off"}`}
        >
          <IconStar size={size} />
        </span>
      ))}
    </div>
  );
}
