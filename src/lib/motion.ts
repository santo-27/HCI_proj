/*
 * Reduced motion for the timings CSS cannot reach.
 *
 * Nearly all animation in the app runs off the --dur-* tokens, which collapse
 * to 0ms under both the OS setting and the in-app toggle. A few sequences are
 * driven from JavaScript instead (confetti cleanup),
 * and those need to ask directly.
 *
 * This is only for *decorative* delays. Gameplay timings — how long a
 * mismatched pair stays visible, how long a pad stays lit — come from the
 * difficulty table and must never be collapsed, or the game stops working.
 */

export function motionReduced(): boolean {
  if (typeof document === "undefined") return false;

  // The in-app toggle writes this; it wins because it is an explicit choice.
  if (document.documentElement.dataset.motion === "off") return true;

  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

/** A decorative delay in ms, or 0 when the player has asked for less motion. */
export function stagger(ms: number): number {
  return motionReduced() ? 0 : ms;
}
