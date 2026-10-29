/*
 * The cast of animal characters, drawn as SVG at runtime.
 *
 * Rather than 16 hand-drawn files, one parametric face renders every creature
 * from a small spec (ear shape, colours, muzzle, pattern). That keeps the
 * characters visually consistent — same eyes, same proportions, same smile —
 * which is what makes them read as one family, while still being distinct
 * enough for a 4-year-old to tell apart at a glance.
 *
 * Every creature carries a `name` because the memory game speaks it aloud.
 */

export type EarShape = "round" | "pointy" | "long" | "none";
export type Pattern = "none" | "spots" | "stripes";

export interface CreatureSpec {
  id: string;
  name: string;
  /** Main fur colour. */
  fur: string;
  /** Inner-ear, muzzle and belly colour. Should be lighter than `fur`. */
  accent: string;
  ear: EarShape;
  muzzle: boolean;
  beak: boolean;
  pattern: Pattern;
  /** Pattern / detail colour. */
  detail: string;
}

export const CREATURES: readonly CreatureSpec[] = [
  { id: "cat", name: "Cat", fur: "#ffa14a", accent: "#ffd9b3", ear: "pointy", muzzle: true, beak: false, pattern: "stripes", detail: "#e07a26" },
  { id: "bear", name: "Bear", fur: "#b07a4f", accent: "#e8c9a8", ear: "round", muzzle: true, beak: false, pattern: "none", detail: "#8a5c38" },
  { id: "bunny", name: "Bunny", fur: "#ffb3d9", accent: "#ffe0f0", ear: "long", muzzle: true, beak: false, pattern: "none", detail: "#e87ab5" },
  { id: "fox", name: "Fox", fur: "#ff7a3d", accent: "#fff0e0", ear: "pointy", muzzle: true, beak: false, pattern: "none", detail: "#d4551c" },
  { id: "frog", name: "Frog", fur: "#6bd968", accent: "#c8f5c0", ear: "none", muzzle: false, beak: false, pattern: "spots", detail: "#3da83a" },
  { id: "panda", name: "Panda", fur: "#f4f1f7", accent: "#ffffff", ear: "round", muzzle: true, beak: false, pattern: "none", detail: "#3a3546" },
  { id: "pig", name: "Pig", fur: "#ff9ec4", accent: "#ffd4e5", ear: "pointy", muzzle: true, beak: false, pattern: "none", detail: "#e06a9c" },
  { id: "owl", name: "Owl", fur: "#a66cff", accent: "#ddc9ff", ear: "pointy", muzzle: false, beak: true, pattern: "spots", detail: "#7a45cc" },
  { id: "mouse", name: "Mouse", fur: "#c7c3d4", accent: "#efedf5", ear: "round", muzzle: true, beak: false, pattern: "none", detail: "#8e88a3" },
  { id: "koala", name: "Koala", fur: "#9aafc4", accent: "#dce6ef", ear: "round", muzzle: true, beak: false, pattern: "none", detail: "#6b8299" },
  { id: "tiger", name: "Tiger", fur: "#ffc93d", accent: "#fff0c2", ear: "round", muzzle: true, beak: false, pattern: "stripes", detail: "#c98a00" },
  { id: "monkey", name: "Monkey", fur: "#c08552", accent: "#f2d7b8", ear: "round", muzzle: true, beak: false, pattern: "none", detail: "#96632f" },
  { id: "penguin", name: "Penguin", fur: "#4a5a80", accent: "#ffffff", ear: "none", muzzle: false, beak: true, pattern: "none", detail: "#2f3c5c" },
  { id: "deer", name: "Deer", fur: "#d9a566", accent: "#f6e3c8", ear: "long", muzzle: true, beak: false, pattern: "spots", detail: "#a87a3d" },
  { id: "puppy", name: "Puppy", fur: "#f2c88c", accent: "#fff2dd", ear: "long", muzzle: true, beak: false, pattern: "none", detail: "#c99a54" },
  { id: "duck", name: "Duck", fur: "#ffd93d", accent: "#fff3bf", ear: "none", muzzle: false, beak: true, pattern: "none", detail: "#e0b81c" },
];

export function creatureById(id: string): CreatureSpec {
  return CREATURES.find((c) => c.id === id) ?? CREATURES[0];
}

const EYE_DARK = "#2b2735";

function Ears({ spec }: { spec: CreatureSpec }) {
  switch (spec.ear) {
    case "round":
      return (
        <>
          <circle cx="24" cy="28" r="15" fill={spec.fur} />
          <circle cx="76" cy="28" r="15" fill={spec.fur} />
          <circle cx="24" cy="28" r="7.5" fill={spec.accent} />
          <circle cx="76" cy="28" r="7.5" fill={spec.accent} />
        </>
      );
    case "pointy":
      return (
        <>
          <path d="M18 44 L24 6 L50 26 Z" fill={spec.fur} />
          <path d="M82 44 L76 6 L50 26 Z" fill={spec.fur} />
          <path d="M25 38 L28 17 L42 28 Z" fill={spec.accent} />
          <path d="M75 38 L72 17 L58 28 Z" fill={spec.accent} />
        </>
      );
    case "long":
      return (
        <>
          <ellipse cx="33" cy="27" rx="9" ry="24" fill={spec.fur} transform="rotate(-13 33 27)" />
          <ellipse cx="67" cy="27" rx="9" ry="24" fill={spec.fur} transform="rotate(13 67 27)" />
          <ellipse cx="33" cy="27" rx="4.5" ry="15" fill={spec.accent} transform="rotate(-13 33 27)" />
          <ellipse cx="67" cy="27" rx="4.5" ry="15" fill={spec.accent} transform="rotate(13 67 27)" />
        </>
      );
    case "none":
      return null;
  }
}

function PatternMarks({ spec }: { spec: CreatureSpec }) {
  if (spec.pattern === "spots") {
    return (
      <g fill={spec.detail} opacity="0.55">
        <circle cx="28" cy="42" r="5" />
        <circle cx="72" cy="42" r="5" />
        <circle cx="50" cy="30" r="4" />
      </g>
    );
  }
  if (spec.pattern === "stripes") {
    return (
      <g stroke={spec.detail} strokeWidth="4.5" strokeLinecap="round" opacity="0.75">
        <path d="M40 26 L36 34" />
        <path d="M50 23 L50 32" />
        <path d="M60 26 L64 34" />
      </g>
    );
  }
  return null;
}

interface CreatureProps {
  spec: CreatureSpec;
  size?: number | string;
  /** Closed, happy eyes — used when a match is found or a level is won. */
  happy?: boolean;
  className?: string;
}

export function Creature({ spec, size = 96, happy = false, className }: CreatureProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={spec.name}
    >
      <Ears spec={spec} />

      {/* Head */}
      <circle cx="50" cy="55" r="35" fill={spec.fur} />
      <PatternMarks spec={spec} />

      {/* Panda's signature eye patches — the one creature that needs an extra. */}
      {spec.id === "panda" && (
        <g fill={spec.detail}>
          <ellipse cx="36" cy="52" rx="12" ry="13" />
          <ellipse cx="64" cy="52" rx="12" ry="13" />
        </g>
      )}

      {/* Penguin's white face oval */}
      {spec.id === "penguin" && <ellipse cx="50" cy="58" rx="24" ry="28" fill={spec.accent} />}

      {/* Muzzle sits behind the mouth so the smile reads on top of it. */}
      {spec.muzzle && <ellipse cx="50" cy="70" rx="17" ry="12" fill={spec.accent} />}

      {/* Eyes */}
      {happy ? (
        <g stroke={EYE_DARK} strokeWidth="4" strokeLinecap="round" fill="none">
          <path d="M30 52 Q37 45 44 52" />
          <path d="M56 52 Q63 45 70 52" />
        </g>
      ) : (
        <>
          <ellipse cx="37" cy="52" rx="9.5" ry="11" fill="#ffffff" />
          <ellipse cx="63" cy="52" rx="9.5" ry="11" fill="#ffffff" />
          <circle cx="38" cy="54" r="5.2" fill={EYE_DARK} />
          <circle cx="64" cy="54" r="5.2" fill={EYE_DARK} />
          <circle cx="36" cy="51" r="1.9" fill="#ffffff" />
          <circle cx="62" cy="51" r="1.9" fill="#ffffff" />
        </>
      )}

      {/* Nose and mouth, or a beak */}
      {spec.beak ? (
        <path d="M50 60 L40 72 L60 72 Z" fill="#ff9c2e" />
      ) : (
        <>
          <ellipse cx="50" cy="65" rx="5.5" ry="4.2" fill={EYE_DARK} />
          <path
            d="M50 69 Q50 76 43 76 M50 69 Q50 76 57 76"
            stroke={EYE_DARK}
            strokeWidth="3.2"
            strokeLinecap="round"
            fill="none"
          />
        </>
      )}

      {/* Cheeks — small thing, but it is most of why these read as friendly. */}
      <ellipse cx="24" cy="66" rx="6" ry="4" fill="#ff8fb1" opacity="0.45" />
      <ellipse cx="76" cy="66" rx="6" ry="4" fill="#ff8fb1" opacity="0.45" />
    </svg>
  );
}
