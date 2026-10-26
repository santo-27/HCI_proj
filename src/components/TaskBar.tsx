import { AGE_GROUP_META } from "../lib/difficulty";
import { useProfile } from "../context/profile";
import { IconHome, IconSticker } from "../art/icons";
import { IconButton } from "./IconButton";
import "./components.css";

interface TaskBarProps {
  onHome: () => void;
  onStickers: () => void;
  onChangeAge: () => void;
}

export function TaskBar({ onHome, onStickers, onChangeAge }: TaskBarProps) {
  const { age, stickers } = useProfile();
  const meta = age ? AGE_GROUP_META[age] : null;

  return (
    <nav className="task-bar" aria-label="Main navigation">
      <IconButton label="Home" icon={<IconHome />} onClick={onHome} tone="solid" />

      <button type="button" className="task-bar__item task-bar__item--book" onClick={onStickers}>
        <IconSticker size={30} />
        <span>Sticker book</span>
        <span className="task-bar__count">{stickers.length} / 16</span>
      </button>

      {meta && (
        <button
          type="button"
          className="task-bar__item task-bar__item--age"
          onClick={onChangeAge}
          aria-label={`Playing as ${meta.label}, ages ${meta.ages}. Tap to change.`}
        >
          <span aria-hidden="true">{meta.emoji}</span>
          <span>{meta.label}</span>
        </button>
      )}
    </nav>
  );
}