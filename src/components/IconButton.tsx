/*
 * A round icon button for the chrome: back, replay, the three toggles.
 *
 * It is icon-only on screen, so the accessible name comes from `label` — which
 * is also the tooltip. Still 64px minimum; secondary does not mean small.
 */

import type { ReactNode } from "react";
import { playTap, unlockAudio } from "../lib/audio";
import "./components.css";

interface IconButtonProps {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  /** Renders the pressed/active look and reports state to screen readers. */
  active?: boolean;
  tone?: "plain" | "solid";
  className?: string;
}

export function IconButton({
  label,
  icon,
  onClick,
  active,
  tone = "plain",
  className = "",
}: IconButtonProps) {
  return (
    <button
      type="button"
      className={`icon-btn icon-btn--${tone} ${active === false ? "is-off" : ""} ${className}`}
      aria-label={label}
      title={label}
      aria-pressed={active === undefined ? undefined : active}
      onClick={() => {
        unlockAudio();
        playTap();
        onClick();
      }}
    >
      {icon}
    </button>
  );
}
