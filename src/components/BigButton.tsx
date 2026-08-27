/*
 * The app's primary button: deliberately oversized, icon-first, and physical.
 *
 * The chunky bottom edge (a hard shadow rather than a blur) that compresses on
 * press is the whole point — it reads as a real thing to push, which is what
 * makes it obvious to a child who cannot read the label.
 */

import type { ReactNode } from "react";
import type { Hue } from "../lib/hues";
import { hueClass } from "../lib/hues";
import { playTap, unlockAudio } from "../lib/audio";
import "./components.css";

interface BigButtonProps {
  label: string;
  /** Second line, e.g. the age range under "Little". Optional by design. */
  sublabel?: string;
  icon?: ReactNode;
  hue?: Hue;
  onClick: () => void;
  /** Hide the text and keep only the icon — used at labelMode "icon". */
  iconOnly?: boolean;
  block?: boolean;
  selected?: boolean;
  className?: string;
}

export function BigButton({
  label,
  sublabel,
  icon,
  hue = "sky",
  onClick,
  iconOnly = false,
  block = false,
  selected = false,
  className = "",
}: BigButtonProps) {
  return (
    <button
      type="button"
      className={`big-btn ${hueClass(hue)} ${block ? "big-btn--block" : ""} ${className}`}
      aria-pressed={selected || undefined}
      // Every button is a real user gesture, which is the only moment a
      // browser will let us start the audio context.
      onClick={() => {
        unlockAudio();
        playTap();
        onClick();
      }}
    >
      {icon && <span className="big-btn__icon">{icon}</span>}
      {iconOnly ? (
        <span className="sr-only">{label}</span>
      ) : (
        <span className="big-btn__text">
          <span className="big-btn__label">{label}</span>
          {sublabel && <span className="big-btn__sub">{sublabel}</span>}
        </span>
      )}
    </button>
  );
}
