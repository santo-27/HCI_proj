/*
 * The jigsaw picture.
 *
 * This is not an image file — there are no image files in this project. It is
 * a set of SVG shapes on a 100x100 grid, and the jigsaw slices it by giving
 * every piece its own <svg> whose viewBox is that piece's rectangle of the
 * same drawing. That is what makes the cuts exact at any grid size, and why
 * changing from a 2x2 to a 6x6 board needs no new art.
 *
 * The creature sits on a patterned card rather than a plain fill for a
 * practical reason: a big flat area of fur makes the corner and edge pieces
 * indistinguishable from one another, which turns the puzzle into guesswork.
 * The dots, the corner blobs and the ground curve give every piece something
 * to recognise.
 *
 * No ids are used anywhere below. Several copies of this drawing are on screen
 * at once (one per piece), and duplicate ids across them would collide.
 */

import { Creature } from "./creatures";
import type { CreatureSpec } from "./creatures";

export const PUZZLE_VIEW = 100;

const DOT_STEP = 12.5;

interface PuzzleSceneProps {
  spec: CreatureSpec;
  /** Background wash. Passed as a token reference by the game. */
  background: string;
  detail: string;
}

export function PuzzleScene({ spec, background, detail }: PuzzleSceneProps) {
  const dots = [];
  for (let y = DOT_STEP / 2; y < PUZZLE_VIEW; y += DOT_STEP) {
    for (let x = DOT_STEP / 2; x < PUZZLE_VIEW; x += DOT_STEP) {
      dots.push(<circle key={`${x}-${y}`} cx={x} cy={y} r={1.8} opacity="0.5" />);
    }
  }

  // The colours arrive as `var(--token)` references and are applied through
  // `style`, not through the `fill` attribute: var() inside an SVG
  // presentation attribute is not reliably substituted across browsers, while
  // the same value in a style declaration always is. Fill inherits, so one
  // wrapper covers every detail shape.
  return (
    <>
      <rect
        x="0"
        y="0"
        width={PUZZLE_VIEW}
        height={PUZZLE_VIEW}
        style={{ fill: background }}
      />

      <g style={{ fill: detail }}>
        {dots}

        {/* Corner blobs — they give the four corner pieces distinct landmarks. */}
        <circle cx="8" cy="8" r="11" opacity="0.32" />
        <circle cx="92" cy="10" r="8" opacity="0.32" />
        <circle cx="10" cy="93" r="9" opacity="0.32" />
        <circle cx="93" cy="92" r="12" opacity="0.32" />

        {/* Ground curve, so the bottom row reads differently from the top. */}
        <path
          d={`M0 82 Q ${PUZZLE_VIEW / 2} 66 ${PUZZLE_VIEW} 82 L ${PUZZLE_VIEW} ${PUZZLE_VIEW} L 0 ${PUZZLE_VIEW} Z`}
          opacity="0.42"
        />
      </g>

      {/* A nested <svg> keeps the creature on its own 0-100 coordinate system,
          so it can be positioned and scaled without touching its internals. */}
      <g transform="translate(16 14)">
        <Creature spec={spec} size={68} />
      </g>
    </>
  );
}
