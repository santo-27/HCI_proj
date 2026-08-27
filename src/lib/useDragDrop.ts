/*
 * Dragging, for both hands and keyboards.
 *
 * Two games need to move a thing onto a place, and both need it to work by
 * finger, mouse, stylus *and* keyboard. That logic lives here once rather than
 * being written twice and drifting apart.
 *
 * Pointer Events with setPointerCapture give a single code path for mouse,
 * touch and pen — no separate touch handlers, and the drag keeps working when
 * the finger slides outside the element. (HTML5 drag-and-drop is not an option:
 * it simply does not fire on touch devices.) Draggables must also carry
 * `touch-action: none` in CSS or the browser steals the gesture to scroll.
 *
 * The keyboard path is a first-class equivalent, not a fallback:
 *
 *     Tab      move between pieces
 *     Enter    pick the piece up
 *     arrows   move it between places
 *     Enter    put it down
 *     Escape   change your mind
 *
 * Focus deliberately stays on the piece the whole time, so there is never a
 * moment where a keyboard user cannot tell where they are.
 */

import { useCallback, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent, KeyboardEvent as ReactKeyboardEvent } from "react";
import { cssVars } from "./css";
import { speak } from "./speech";
import { playPickUp } from "./audio";

export interface Point {
  x: number;
  y: number;
}

interface DragDropOptions {
  /** Called on release. A null target means "dropped nowhere" — not an error. */
  onDrop: (itemId: string, targetId: string | null) => void;
  /**
   * How a position resolves to a target. "contain" wants the pointer inside
   * the target (bins); "nearest" accepts the closest centre within
   * `snapRadius` (jigsaw cells, which should forgive a near miss).
   */
  matchMode?: "contain" | "nearest";
  snapRadius?: number;
  /** Target ids in the order arrow keys should walk them. */
  targetOrder: readonly string[];
  labelForItem?: (id: string) => string;
  labelForTarget?: (id: string) => string;
}

export interface DragDropApi {
  held: string | null;
  hovered: string | null;
  offset: Point;
  /** True while a keyboard hold is in progress, so games can show a cursor. */
  viaKeyboard: boolean;
  /** Text for the game's aria-live region. */
  liveMessage: string;
  itemProps: (itemId: string) => {
    onPointerDown: (e: ReactPointerEvent<HTMLElement>) => void;
    onPointerMove: (e: ReactPointerEvent<HTMLElement>) => void;
    onPointerUp: (e: ReactPointerEvent<HTMLElement>) => void;
    onPointerCancel: (e: ReactPointerEvent<HTMLElement>) => void;
    onKeyDown: (e: ReactKeyboardEvent<HTMLElement>) => void;
    "aria-pressed": boolean;
    style?: CSSProperties;
  };
  targetProps: (targetId: string) => {
    ref: (el: HTMLElement | null) => void;
    "data-target": string;
  };
}

const NO_OFFSET: Point = { x: 0, y: 0 };

export function useDragDrop({
  onDrop,
  matchMode = "nearest",
  snapRadius = 80,
  targetOrder,
  labelForItem,
  labelForTarget,
}: DragDropOptions): DragDropApi {
  const [held, setHeld] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [offset, setOffset] = useState<Point>(NO_OFFSET);
  const [viaKeyboard, setViaKeyboard] = useState(false);
  const [liveMessage, setLiveMessage] = useState("");

  const targets = useRef(new Map<string, HTMLElement>());
  const origin = useRef<Point>(NO_OFFSET);
  /** Where the dragged element sat when the drag began. */
  const startCentre = useRef<Point>(NO_OFFSET);

  const describeItem = useCallback(
    (id: string) => labelForItem?.(id) ?? "piece",
    [labelForItem],
  );
  const describeTarget = useCallback(
    (id: string) => labelForTarget?.(id) ?? "space",
    [labelForTarget],
  );

  const announce = useCallback((message: string) => {
    setLiveMessage(message);
    speak(message);
  }, []);

  /* ---- Resolving a position to a target ------------------------------- */

  const resolve = useCallback(
    (centre: Point): string | null => {
      let best: string | null = null;
      let bestDistance = Infinity;

      for (const [id, el] of targets.current) {
        const rect = el.getBoundingClientRect();

        if (matchMode === "contain") {
          if (
            centre.x >= rect.left &&
            centre.x <= rect.right &&
            centre.y >= rect.top &&
            centre.y <= rect.bottom
          ) {
            return id;
          }
          continue;
        }

        const dx = centre.x - (rect.left + rect.width / 2);
        const dy = centre.y - (rect.top + rect.height / 2);
        const distance = Math.hypot(dx, dy);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = id;
        }
      }

      if (matchMode === "contain") return null;
      return bestDistance <= snapRadius ? best : null;
    },
    [matchMode, snapRadius],
  );

  /* ---- Pointer path ---------------------------------------------------- */

  const startPointerDrag = useCallback(
    (itemId: string, e: ReactPointerEvent<HTMLElement>) => {
      if (held) return;

      const el = e.currentTarget;
      // Capture means every later move and the release land on this element,
      // even once the finger has travelled well outside it.
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        // Some engines refuse capture for synthetic pointers; the drag still
        // works, it just stops tracking if the pointer leaves the element.
      }

      const rect = el.getBoundingClientRect();
      origin.current = { x: e.clientX, y: e.clientY };
      startCentre.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };

      setHeld(itemId);
      setViaKeyboard(false);
      setOffset(NO_OFFSET);
      playPickUp();
    },
    [held],
  );

  const movePointerDrag = useCallback(
    (itemId: string, e: ReactPointerEvent<HTMLElement>) => {
      if (held !== itemId || viaKeyboard) return;

      const next = {
        x: e.clientX - origin.current.x,
        y: e.clientY - origin.current.y,
      };
      setOffset(next);
      // The piece's centre decides the target, not the fingertip — otherwise
      // grabbing a piece by its corner throws the aim off by half a piece.
      setHovered(
        resolve({
          x: startCentre.current.x + next.x,
          y: startCentre.current.y + next.y,
        }),
      );
    },
    [held, viaKeyboard, resolve],
  );

  const endPointerDrag = useCallback(
    (itemId: string, e: ReactPointerEvent<HTMLElement>, cancelled: boolean) => {
      if (held !== itemId || viaKeyboard) return;

      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // Already released.
      }

      const landed = cancelled ? null : hovered;
      setHeld(null);
      setHovered(null);
      setOffset(NO_OFFSET);
      onDrop(itemId, landed);
    },
    [held, hovered, viaKeyboard, onDrop],
  );

  /* ---- Keyboard path --------------------------------------------------- */

  const handleKey = useCallback(
    (itemId: string, e: ReactKeyboardEvent<HTMLElement>) => {
      const key = e.key;

      if (!held) {
        if (key === "Enter" || key === " ") {
          e.preventDefault();
          const first = targetOrder[0] ?? null;
          setHeld(itemId);
          setViaKeyboard(true);
          setHovered(first);
          playPickUp();
          announce(
            first
              ? `Holding ${describeItem(itemId)}. Use the arrow keys to move it, then press Enter.`
              : `Holding ${describeItem(itemId)}.`,
          );
        }
        return;
      }

      if (held !== itemId) return;

      if (key === "Escape") {
        e.preventDefault();
        setHeld(null);
        setHovered(null);
        setViaKeyboard(false);
        announce(`Put ${describeItem(itemId)} back.`);
        return;
      }

      if (key === "Enter" || key === " ") {
        e.preventDefault();
        const landed = hovered;
        setHeld(null);
        setHovered(null);
        setViaKeyboard(false);
        onDrop(itemId, landed);
        return;
      }

      const step =
        key === "ArrowRight" || key === "ArrowDown"
          ? 1
          : key === "ArrowLeft" || key === "ArrowUp"
            ? -1
            : 0;
      if (step === 0 || targetOrder.length === 0) return;

      e.preventDefault();
      const current = hovered ? targetOrder.indexOf(hovered) : -1;
      // Wrapping means a keyboard user can always reach every place without
      // needing to know where the ends are.
      const nextIndex =
        (current + step + targetOrder.length) % targetOrder.length;
      const nextId = targetOrder[nextIndex];
      setHovered(nextId);
      announce(describeTarget(nextId));
    },
    [
      held,
      hovered,
      targetOrder,
      onDrop,
      announce,
      describeItem,
      describeTarget,
    ],
  );

  const itemProps = useCallback(
    (itemId: string) => ({
      onPointerDown: (e: ReactPointerEvent<HTMLElement>) =>
        startPointerDrag(itemId, e),
      onPointerMove: (e: ReactPointerEvent<HTMLElement>) =>
        movePointerDrag(itemId, e),
      onPointerUp: (e: ReactPointerEvent<HTMLElement>) =>
        endPointerDrag(itemId, e, false),
      onPointerCancel: (e: ReactPointerEvent<HTMLElement>) =>
        endPointerDrag(itemId, e, true),
      onKeyDown: (e: ReactKeyboardEvent<HTMLElement>) => handleKey(itemId, e),
      "aria-pressed": held === itemId,
      // The live offset is handed over as custom properties rather than a
      // finished transform, so each game composes it with its own lift
      // (scale, shadow, rotation) instead of having it overwritten.
      style:
        held === itemId && !viaKeyboard
          ? cssVars({ "--drag-x": `${offset.x}px`, "--drag-y": `${offset.y}px` })
          : undefined,
    }),
    [
      startPointerDrag,
      movePointerDrag,
      endPointerDrag,
      handleKey,
      held,
      viaKeyboard,
      offset,
    ],
  );

  const targetProps = useCallback(
    (targetId: string) => ({
      ref: (el: HTMLElement | null) => {
        if (el) targets.current.set(targetId, el);
        else targets.current.delete(targetId);
      },
      "data-target": targetId,
    }),
    [],
  );

  return {
    held,
    hovered,
    offset,
    viaKeyboard,
    liveMessage,
    itemProps,
    targetProps,
  };
}
