/*
 * Jigsaw — drag the pieces back into the picture.
 *
 * Every piece is the *same* drawing viewed through a different viewBox window,
 * so the cuts are exact and a 2x2 board and a 6x6 board need no separate art.
 * See art/puzzle.tsx for why the picture is a patterned card rather than a
 * plain portrait.
 *
 * The generosity is all in the difficulty profile. A Little player gets four
 * pieces, faint outlines showing where each one goes, and a 110px snap radius
 * that forgives a wide miss; a Big player gets thirty-six pieces, no outlines
 * and a 42px radius. Nothing about the code changes between them.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import type { GameProps } from "../registry";
import type { JigsawConfig } from "../../lib/difficulty";
import { CREATURES } from "../../art/creatures";
import type { CreatureSpec } from "../../art/creatures";
import { PUZZLE_VIEW, PuzzleScene } from "../../art/puzzle";
import { cssVars } from "../../lib/css";
import { shuffle, sample } from "../../lib/shuffle";
import { useDragDrop } from "../../lib/useDragDrop";
import { playCorrect, playRetry } from "../../lib/audio";
import { speak } from "../../lib/speech";
import "./jigsaw.css";

interface Piece {
  id: string;
  row: number;
  col: number;
}

/** One window onto the shared drawing. */
function PieceArt({
  piece,
  config,
  spec,
}: {
  piece: Piece;
  config: JigsawConfig;
  spec: CreatureSpec;
}) {
  const w = PUZZLE_VIEW / config.columns;
  const h = PUZZLE_VIEW / config.rows;

  return (
    <svg
      className="jigsaw__art"
      viewBox={`${piece.col * w} ${piece.row * h} ${w} ${h}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <PuzzleScene
        spec={spec}
        background="var(--puzzle-bg)"
        detail="var(--puzzle-detail)"
      />
    </svg>
  );
}

export function Jigsaw({ config, onWin, onProgress }: GameProps<JigsawConfig>) {
  const spec = useMemo(() => sample(CREATURES, 1)[0], []);

  const pieces = useMemo(() => {
    const all: Piece[] = [];
    for (let row = 0; row < config.rows; row++) {
      for (let col = 0; col < config.columns; col++) {
        all.push({ id: `p-${row}-${col}`, row, col });
      }
    }
    return all;
  }, [config.rows, config.columns]);

  const [trayOrder, setTrayOrder] = useState<string[]>(() =>
    shuffle(pieces.map((p) => p.id)),
  );
  const [placed, setPlaced] = useState<string[]>([]);
  const [wrongPiece, setWrongPiece] = useState<string | null>(null);

  const cellIds = useMemo(
    () => pieces.map((p) => `c-${p.row}-${p.col}`),
    [pieces],
  );

  const pieceById = useCallback(
    (id: string) => pieces.find((p) => p.id === id)!,
    [pieces],
  );

  const describeCell = useCallback(
    (cellId: string) => {
      const [, row, col] = cellId.split("-");
      return `Row ${Number(row) + 1}, column ${Number(col) + 1}`;
    },
    [],
  );

  const handleDrop = useCallback(
    (pieceId: string, cellId: string | null) => {
      // Released over nothing at all: no attempt counted, no sound. The child
      // simply changed their mind.
      if (!cellId) return;

      const piece = pieceById(pieceId);
      const home = `c-${piece.row}-${piece.col}`;

      if (cellId === home) {
        playCorrect();
        setPlaced((p) => [...p, pieceId]);
        setTrayOrder((t) => t.filter((id) => id !== pieceId));
        return;
      }

      // Wrong spot. The piece goes back to the tray with a soft tone and a
      // wiggle — it is never consumed, and there is nothing to undo.
      playRetry();
      setWrongPiece(pieceId);
      window.setTimeout(() => setWrongPiece(null), 600);
    },
    [pieceById],
  );

  const drag = useDragDrop({
    onDrop: handleDrop,
    matchMode: "nearest",
    snapRadius: config.snapRadius,
    targetOrder: cellIds,
    labelForItem: () => "puzzle piece",
    labelForTarget: describeCell,
  });

  useEffect(() => {
    onProgress(placed.length, pieces.length);
  }, [placed.length, pieces.length, onProgress]);

  useEffect(() => {
    if (placed.length !== pieces.length || pieces.length === 0) return;
    speak("The picture is finished!");
    const timer = window.setTimeout(
      () => onWin({}),
      500,
    );
    return () => window.clearTimeout(timer);
    // Fires once, on the drop that completed the picture.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placed.length, pieces.length]);

  const boardVars = cssVars({
    "--cols": config.columns,
    "--rows": config.rows,
  });

  return (
    <div className="jigsaw">
      <p className="sr-only" aria-live="polite">
        {drag.liveMessage}
      </p>

      <div
        className="jigsaw__board"
        style={boardVars}
        role="group"
        aria-label="The picture"
      >
        {pieces.map((piece) => {
          const cellId = `c-${piece.row}-${piece.col}`;
          const isPlaced = placed.includes(piece.id);
          const isHovered = drag.hovered === cellId;

          return (
            <div
              key={cellId}
              {...drag.targetProps(cellId)}
              className={`jigsaw__cell ${isHovered ? "is-target" : ""} ${
                isPlaced ? "is-filled" : ""
              }`}
            >
              {isPlaced ? (
                <PieceArt piece={piece} config={config} spec={spec} />
              ) : (
                // Training wheels: a faint copy of the piece that belongs
                // here. Switched off for the oldest group.
                config.showGhosts && (
                  <span className="jigsaw__ghost">
                    <PieceArt piece={piece} config={config} spec={spec} />
                  </span>
                )
              )}
            </div>
          );
        })}
      </div>

      <div className="jigsaw__tray" role="group" aria-label="Pieces to place">
        {trayOrder.map((id) => {
          const piece = pieceById(id);
          const isHeld = drag.held === id;

          return (
            <button
              key={id}
              type="button"
              {...drag.itemProps(id)}
              className={`jigsaw__piece ${isHeld ? "is-held" : ""} ${
                isHeld && drag.viaKeyboard ? "is-held-key" : ""
              } ${wrongPiece === id ? "is-wiggling" : ""}`}
              aria-label={
                isHeld
                  ? "Holding a puzzle piece. Arrow keys to move it, Enter to drop it, Escape to put it back."
                  : "Puzzle piece. Press Enter to pick it up."
              }
            >
              <PieceArt piece={piece} config={config} spec={spec} />
            </button>
          );
        })}

        {trayOrder.length === 0 && (
          <p className="jigsaw__done">All done!</p>
        )}
      </div>
    </div>
  );
}
