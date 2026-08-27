/*
 * The five sorting shapes.
 *
 * Chosen so they stay distinguishable at a glance and after a grayscale pass:
 * a child sorting by shape must not be secretly relying on colour, and a
 * colour-blind child must not be stuck. Round, square, triangle, star and
 * heart differ in silhouette, not just in hue.
 *
 * Each is drawn on the same 100x100 box with the same visual weight, so no
 * shape looks like the "big" one and draws the eye unfairly.
 */

export type ShapeId = "circle" | "square" | "triangle" | "star" | "heart";

export const SHAPES: readonly ShapeId[] = [
  "circle",
  "square",
  "triangle",
  "star",
  "heart",
];

export const SHAPE_NAMES: Record<ShapeId, string> = {
  circle: "circle",
  square: "square",
  triangle: "triangle",
  star: "star",
  heart: "heart",
};

const PATHS: Record<Exclude<ShapeId, "circle" | "square">, string> = {
  triangle: "M50 10 L92 84 L8 84 Z",
  star: "M50 6 L62 38 L96 40 L69 61 L79 94 L50 75 L21 94 L31 61 L4 40 L38 38 Z",
  heart:
    "M50 90 C 14 64 8 42 22 28 C 34 16 46 22 50 34 C 54 22 66 16 78 28 C 92 42 86 64 50 90 Z",
};

interface ShapeProps {
  shape: ShapeId;
  size?: number | string;
  /** Fill colour. Games pass a token reference such as var(--hue). */
  fill?: string;
  stroke?: string;
  className?: string;
  title?: string;
}

export function Shape({
  shape,
  size = 64,
  fill = "var(--hue)",
  stroke = "var(--hue-deep)",
  className,
  title,
}: ShapeProps) {
  // fill/stroke go through `style` rather than the presentation attributes:
  // callers pass `var(--hue)`, and var() is not reliably substituted inside an
  // SVG attribute the way it is inside a style declaration.
  const common = {
    style: { fill, stroke },
    strokeWidth: 6,
    strokeLinejoin: "round" as const,
  };

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {shape === "circle" && <circle cx="50" cy="50" r="40" {...common} />}
      {shape === "square" && (
        <rect x="12" y="12" width="76" height="76" rx="10" {...common} />
      )}
      {shape !== "circle" && shape !== "square" && (
        <path d={PATHS[shape]} {...common} />
      )}
    </svg>
  );
}
