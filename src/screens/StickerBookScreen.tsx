/*
 * The reward that persists between visits.
 *
 * There is nothing to spend stickers on and no way to lose one; the book is
 * simply a record of everyone the child has met. Sixteen empty slots are shown
 * from the first visit so the collection has a visible shape to fill in.
 */

import { useEffect } from "react";
import { useProfile } from "../context/profile";
import { StickerGrid } from "../components/StickerGrid";
import { CREATURES } from "../art/creatures";
import { speak } from "../lib/speech";
import "./screens.css";

export function StickerBookScreen() {
  const { stickers } = useProfile();
  const found = stickers.length;

  useEffect(() => {
    speak(
      found === 0
        ? "Your sticker book is empty. Finish a puzzle to meet your first friend."
        : `Your sticker book. You have found ${found} of ${CREATURES.length} friends.`,
    );
  }, [found]);

  return (
    <div className="screen book">
      <header className="book__bar">
        <h1 className="book__title">Sticker Book</h1>
      </header>

      <div className="book__score">
        <p className="book__count">
          {found} <span>of {CREATURES.length} friends</span>
        </p>
      </div>

      <StickerGrid earned={stickers} />
    </div>
  );
}
