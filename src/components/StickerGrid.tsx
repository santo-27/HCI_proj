/*
 * The sticker book: sixteen slots, one per creature.
 *
 * Showing the empty slots as grey silhouettes rather than hiding them is the
 * point of the whole feature — a child can see exactly how many friends are
 * still out there to collect, which is what makes coming back worthwhile.
 * Nothing here can ever be lost or spent.
 */

import { CREATURES, Creature } from "../art/creatures";
import { hueAt, hueClass } from "../lib/hues";
import { speak } from "../lib/speech";
import { playTap, unlockAudio } from "../lib/audio";
import "./components.css";

interface StickerGridProps {
  earned: readonly string[];
  /** Freshly won sticker, drawn with a pop and a ring. */
  highlight?: string | null;
  size?: number;
}

export function StickerGrid({ earned, highlight, size = 78 }: StickerGridProps) {
  return (
    <ul className="sticker-grid">
      {CREATURES.map((spec, i) => {
        const has = earned.includes(spec.id);
        return (
          <li key={spec.id}>
            <button
              type="button"
              className={`sticker ${hueClass(hueAt(i))} ${has ? "sticker--on" : "sticker--off"} ${
                highlight === spec.id ? "sticker--new" : ""
              }`}
              aria-label={has ? spec.name : `${spec.name}, not found yet`}
              onClick={() => {
                unlockAudio();
                playTap();
                speak(has ? spec.name : "Keep playing to find this friend");
              }}
            >
              <Creature spec={spec} size={size} happy={has} />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
