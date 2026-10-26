/*
 * Shape & Colour Sorter — put each thing where it belongs.
 *
 * The same board teaches three different skills depending on the age group,
 * and the rule comes from the difficulty profile rather than from three
 * separate games:
 *
 *   "color"  bins are colours, shape is noise   (Little)
 *   "shape"  bins are shapes, colour is noise   (Medium)
 *   "both"   bins are a colour *and* a shape    (Big)
 *
 * That last one is the real jump in difficulty: the child has to hold two
 * attributes at once and ignore items that match on only one of them.
 *
 * Nothing is ever consumed by a wrong answer. A misplaced item bounces back to
 * the tray and can be tried again immediately.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import type { GameProps } from "../registry";
import type { SorterConfig } from "../../lib/difficulty";
import type { ShapeId } from "../../art/shapes";
import { SHAPES, SHAPE_NAMES, Shape } from "../../art/shapes";
import type { Hue } from "../../lib/hues";
import { HUES, hueClass } from "../../lib/hues";
import { randomInt, shuffle } from "../../lib/shuffle";
import { useDragDrop } from "../../lib/useDragDrop";
import { playCorrect, playRetry } from "../../lib/audio";
import { speak } from "../../lib/speech";
import "./sorter.css";

interface Bin {
  id: string;
  hue: Hue;
  shape: ShapeId;
  label: string;
}

interface Item {
  id: string;
  hue: Hue;
  shape: ShapeId;
  binId: string;
}

const HUE_NAMES: Record<Hue, string> = {
  coral: "red",
  sunshine: "yellow",
  mint: "green",
  sky: "blue",
  grape: "purple",
  bubblegum: "pink",
};

function describe(rule: SorterConfig["rule"], hue: Hue, shape: ShapeId): string {
  if (rule === "color") return HUE_NAMES[hue];
  if (rule === "shape") return SHAPE_NAMES[shape];
  return `${HUE_NAMES[hue]} ${SHAPE_NAMES[shape]}`;
}

function buildBins(config: SorterConfig): Bin[] {
  const ceiling =
    config.rule === "color"
      ? HUES.length
      : config.rule === "shape"
        ? SHAPES.length
        : HUES.length * SHAPES.length;
  const count = Math.min(config.binCount, ceiling);

  // How many bins go by before the colour repeats. Under a single-attribute
  // rule nothing repeats; under "both" the bins are laid out as a grid of
  // colour x shape, so colours *and* shapes recur across the row.
  const hueSpan = config.rule === "both" ? Math.ceil(Math.sqrt(count)) : count;

  return Array.from({ length: count }, (_, i) => {
    // Only the attribute the rule is about may vary between bins. If the
    // colour bins also differed in shape, a child could "succeed" by matching
    // shapes and never engage with the colour at all — then be lost the moment
    // the shapes stopped agreeing.
    //
    // "both" is the real step up, and it only works because attributes repeat:
    // a red circle and a red square are different bins, so neither colour nor
    // shape alone is enough to place an item.
    const hue: Hue =
      config.rule === "shape" ? "sky" : HUES[i % hueSpan % HUES.length];
    const shape: ShapeId =
      config.rule === "color"
        ? "circle"
        : config.rule === "shape"
          ? SHAPES[i % SHAPES.length]
          : SHAPES[Math.floor(i / hueSpan) % SHAPES.length];

    return {
      id: `bin-${i}`,
      hue,
      shape,
      label: describe(config.rule, hue, shape),
    };
  });
}

function buildItems(config: SorterConfig, bins: Bin[]): Item[] {
  const items = Array.from({ length: config.itemCount }, (_, i) => {
    const bin = bins[i % bins.length];

    // The attribute the rule does *not* care about is randomised, so a child
    // sorting by colour cannot quietly succeed by matching shapes instead.
    const hue =
      config.rule === "shape" ? HUES[randomInt(HUES.length)] : bin.hue;
    const shape =
      config.rule === "color" ? SHAPES[randomInt(SHAPES.length)] : bin.shape;

    return { id: `item-${i}`, hue, shape, binId: bin.id };
  });

  return shuffle(items);
}

export function Sorter({ config, onWin, onProgress }: GameProps<SorterConfig>) {
  const bins = useMemo(() => buildBins(config), [config]);
  const items = useMemo(() => buildItems(config, bins), [config, bins]);

  const [sorted, setSorted] = useState<string[]>([]);
  const [wrongItem, setWrongItem] = useState<string | null>(null);
  const [flashBin, setFlashBin] = useState<string | null>(null);

  const binIds = useMemo(() => bins.map((b) => b.id), [bins]);
  const itemById = useCallback(
    (id: string) => items.find((it) => it.id === id)!,
    [items],
  );

  const handleDrop = useCallback(
    (itemId: string, binId: string | null) => {
      if (!binId) return;

      const item = itemById(itemId);

      if (item.binId === binId) {
        playCorrect();
        setFlashBin(binId);
        window.setTimeout(() => setFlashBin(null), 500);
        setSorted((s) => [...s, itemId]);
        return;
      }

      // Wrong box. It comes straight back — the item is never lost, and there
      // is no counter that goes down.
      playRetry();
      setWrongItem(itemId);
      window.setTimeout(() => setWrongItem(null), 600);
    },
    [itemById],
  );

  const drag = useDragDrop({
    onDrop: handleDrop,
    // A bin is a box you drop into, so containment is the honest test here —
    // unlike the jigsaw, where a near miss should still snap.
    matchMode: "contain",
    targetOrder: binIds,
    labelForItem: (id) => {
      const item = itemById(id);
      return `${HUE_NAMES[item.hue]} ${SHAPE_NAMES[item.shape]}`;
    },
    labelForTarget: (id) => {
      const bin = bins.find((b) => b.id === id);
      return bin ? `${bin.label} box` : "box";
    },
  });

  const remaining = items.filter((it) => !sorted.includes(it.id));

  useEffect(() => {
    onProgress(sorted.length, items.length);
  }, [sorted.length, items.length, onProgress]);

  useEffect(() => {
    if (sorted.length !== items.length || items.length === 0) return;
    speak("Everything is sorted!");
    const timer = window.setTimeout(
      () => onWin({}),
      500,
    );
    return () => window.clearTimeout(timer);
    // Fires once, on the drop that emptied the tray.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sorted.length, items.length]);

  return (
    <div className="sorter">
      <p className="sr-only" aria-live="polite">
        {drag.liveMessage}
      </p>

      <div className="sorter__tray" role="group" aria-label="Things to sort">
        {remaining.map((item) => {
          const isHeld = drag.held === item.id;
          return (
            <button
              key={item.id}
              type="button"
              {...drag.itemProps(item.id)}
              className={`sorter__item ${hueClass(item.hue)} ${
                isHeld ? "is-held" : ""
              } ${isHeld && drag.viaKeyboard ? "is-held-key" : ""} ${
                wrongItem === item.id ? "is-wiggling" : ""
              }`}
              aria-label={
                isHeld
                  ? `Holding the ${HUE_NAMES[item.hue]} ${SHAPE_NAMES[item.shape]}. Arrow keys to choose a box, Enter to drop it, Escape to put it back.`
                  : `${HUE_NAMES[item.hue]} ${SHAPE_NAMES[item.shape]}. Press Enter to pick it up.`
              }
            >
              <Shape shape={item.shape} size="76%" />
            </button>
          );
        })}

        {remaining.length === 0 && <p className="sorter__done">All sorted!</p>}
      </div>

      <div className="sorter__bins" role="group" aria-label="Boxes">
        {bins.map((bin) => {
          const count = sorted.filter(
            (id) => itemById(id).binId === bin.id,
          ).length;

          return (
            <div
              key={bin.id}
              {...drag.targetProps(bin.id)}
              className={`sorter__bin ${hueClass(bin.hue)} ${
                drag.hovered === bin.id ? "is-target" : ""
              } ${flashBin === bin.id ? "is-happy" : ""}`}
            >
              {/* The bin states what it wants as a picture first. Under the
                  "both" rule that picture is the colour and the shape at once,
                  which is exactly the thing being taught. */}
              <span className="sorter__bin-face">
                <Shape
                  shape={bin.shape}
                  size="60%"
                  fill={config.rule === "shape" ? "var(--surface)" : "var(--hue)"}
                  stroke="var(--hue-deep)"
                />
              </span>
              <span className="sorter__bin-label">{bin.label}</span>
              <span className="sorter__bin-count" aria-hidden="true">
                {count}
              </span>
              <span className="sr-only">
                {bin.label} box, {count} inside
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
