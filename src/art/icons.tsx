/*
 * The app's icon set, drawn inline.
 *
 * Icons carry most of the meaning here: the youngest players cannot read the
 * labels, so every button is an icon first and a word second. They are drawn
 * on a 24-unit grid with thick, rounded strokes in `currentColor` — thin
 * hairline icons vanish at the sizes a 4-year-old is looking at.
 *
 * No icon library, by project rule. These are the whole set.
 */

import type { ReactNode } from "react";

interface IconProps {
  size?: number | string;
  className?: string;
}

const BASE = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
};

function Svg({ size = 32, className, children }: IconProps & { children: ReactNode }) {
  return (
    <svg {...BASE} width={size} height={size} className={className}>
      {children}
    </svg>
  );
}

export function IconBack(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M15 4 L7 12 L15 20" />
    </Svg>
  );
}

export function IconHome(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3 11 L12 3 L21 11" />
      <path d="M5.5 9.5 V20 h13 V9.5" />
    </Svg>
  );
}

export function IconReplay(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M20 12a8 8 0 1 1-2.6-5.9" />
      <path d="M20 3 v5 h-5" />
    </Svg>
  );
}

export function IconSoundOn(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 9.5h3.5L12 5.5v13L7.5 14.5H4z" />
      <path d="M16 9a4.5 4.5 0 0 1 0 6" />
      <path d="M18.8 6a8 8 0 0 1 0 12" />
    </Svg>
  );
}

export function IconSoundOff(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 9.5h3.5L12 5.5v13L7.5 14.5H4z" />
      <path d="M16.5 9.5 L21 14.5" />
      <path d="M21 9.5 L16.5 14.5" />
    </Svg>
  );
}

export function IconBellOn(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6 17.5h12l-1.6-2.2V10a4.4 4.4 0 0 0-8.8 0v5.3z" />
      <path d="M9.8 20a2.5 2.5 0 0 0 4.4 0" />
      <path d="M12 3.2v1" />
    </Svg>
  );
}

export function IconBellOff(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6 17.5h12l-1.6-2.2V10a4.4 4.4 0 0 0-8.8 0v5.3z" />
      <path d="M9.8 20a2.5 2.5 0 0 0 4.4 0" />
      <path d="M4 4 L20 20" />
    </Svg>
  );
}

export function IconMotionOn(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3 15c3-6 6-6 9 0s6 6 9 0" />
      <path d="M3 9c3-6 6-6 9 0" opacity="0.5" />
    </Svg>
  );
}

export function IconMotionOff(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3 12h18" />
      <path d="M4 4 L20 20" opacity="0.5" />
    </Svg>
  );
}

export function IconStar({ size = 32, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden focusable="false">
      <path
        d="M12 2.6l2.9 5.9 6.5.95-4.7 4.6 1.1 6.45L12 17.45 6.2 20.5l1.1-6.45L2.6 9.45l6.5-.95z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconSticker(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6" />
      <path d="M14 3v6a2 2 0 0 0 2 2h4" />
      <circle cx="10" cy="15" r="2.5" />
    </Svg>
  );
}

/* ---- Game tiles -------------------------------------------------------
 * Each game's icon shows its core action, not a generic symbol: two cards,
 * a puzzle piece, shapes dropping into a bin, pads lighting in order.
 */

export function IconMemory(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3" y="5" width="8" height="11" rx="2" transform="rotate(-7 7 10.5)" />
      <rect x="13" y="8" width="8" height="11" rx="2" transform="rotate(7 17 13.5)" />
      <circle cx="17" cy="13" r="1.8" />
    </Svg>
  );
}

export function IconJigsaw(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 10V5.5A1.5 1.5 0 0 1 5.5 4H10a2 2 0 1 1 4 0h4.5A1.5 1.5 0 0 1 20 5.5V10a2 2 0 1 0 0 4v4.5a1.5 1.5 0 0 1-1.5 1.5H14a2 2 0 1 0-4 0H5.5A1.5 1.5 0 0 1 4 18.5V14a2 2 0 1 0 0-4z" />
    </Svg>
  );
}

export function IconSorter(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="7" cy="6" r="3" />
      <rect x="14" y="3" width="6" height="6" rx="1.4" />
      <path d="M3.5 13h17l-1.5 7.5h-14z" />
    </Svg>
  );
}

export function IconSequence(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3" y="9" width="5" height="10" rx="1.6" />
      <rect x="9.5" y="5" width="5" height="14" rx="1.6" />
      <rect x="16" y="12" width="5" height="7" rx="1.6" />
    </Svg>
  );
}

export function IconReading(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H12v16H6.5A2.5 2.5 0 0 0 4 21z" />
      <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H12v16h5.5A2.5 2.5 0 0 1 20 21z" />
      <path d="M7 7h2.5M15 7h2M7 11h2.5M15 11h2" />
    </Svg>
  );
}
<svg
  viewBox="0 0 24 24"
  width="24"
  height="24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
  aria-hidden="true"
>
  <path d="M11 5 6 9H3v6h3l5 4V5Z" />
  <path d="M15.5 8.5a5 5 0 0 1 0 7" />
  <path d="M19 5a10 10 0 0 1 0 14" />
</svg>
