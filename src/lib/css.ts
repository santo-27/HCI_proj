/*
 * Passing CSS custom properties through React's `style` prop.
 *
 * React types `style` as CSSProperties, which has no index signature, so a
 * custom property like `--x` is a type error at the call site. This is the one
 * place that assertion lives, rather than being scattered through every
 * component that needs to hand a per-item value down to CSS.
 *
 * Note what this is *for*: positions and counts computed at runtime (which
 * grid column a piece sits in, where a confetti flake starts). Colours,
 * spacing and durations still come from tokens.css — never pass a literal
 * colour or duration through here.
 */

import type { CSSProperties } from "react";

export function cssVars(vars: Record<string, string | number>): CSSProperties {
  return vars as CSSProperties;
}
