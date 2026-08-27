/*
 * The six bright hues, named.
 *
 * Components never reference a hex value; they take a Hue and put the matching
 * `hue-*` class from global.css on an element, which sets --hue / --hue-deep /
 * --hue-ink locally. That keeps the contrast-checked base/ink pairing intact —
 * you cannot accidentally end up with white text on a bright fill.
 */

export type Hue = "coral" | "sunshine" | "mint" | "sky" | "grape" | "bubblegum";

export const HUES: readonly Hue[] = [
  "coral",
  "sunshine",
  "mint",
  "sky",
  "grape",
  "bubblegum",
];

export function hueClass(hue: Hue): string {
  return `hue-${hue}`;
}

/** Cycles through the palette for lists of arbitrary length. */
export function hueAt(index: number): Hue {
  return HUES[index % HUES.length];
}
