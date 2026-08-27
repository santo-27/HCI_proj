/*
 * Pip, the guide.
 *
 * One creature stays with the child across every screen and says what to do.
 * The speech bubble carries the same words as the narration, so a reader and a
 * pre-reader get the same message through different channels — and tapping the
 * mascot repeats the line, which is how a child asks "what do I do?" again.
 */

import { Creature, creatureById } from "../art/creatures";
import { speak } from "../lib/speech";
import { playTap, unlockAudio } from "../lib/audio";
import "./components.css";

interface MascotProps {
  line: string;
  /** Which creature guides this screen. Different games, different friend. */
  creature?: string;
  happy?: boolean;
  size?: number;
}

export function Mascot({
  line,
  creature = "fox",
  happy = false,
  size = 92,
}: MascotProps) {
  const spec = creatureById(creature);

  return (
    <div className="mascot">
      <button
        type="button"
        className="mascot__body"
        aria-label={`Say that again: ${line}`}
        onClick={() => {
          unlockAudio();
          playTap();
          speak(line);
        }}
      >
        <Creature spec={spec} size={size} happy={happy} className="mascot__art" />
      </button>
      <p className="mascot__bubble">{line}</p>
    </div>
  );
}
