import { AGE_GROUP_META } from "../lib/difficulty";
import { useProfile } from "../context/profile";
import { IconSticker } from "../art/icons";
import { IconButton } from "./IconButton";
import { SettingsBar } from "./SettingsBar";
import { VoiceCommandButton } from "./VoiceCommandButton";
import type { VoiceCommand } from "../lib/voiceCommands";
import "./components.css";

interface TaskBarProps {
  onHome: () => void;
  onStickers: () => void;
  onChangeAge: () => void;
  onVoiceCommand: (command: VoiceCommand) => void;
}

export function TaskBar({ onHome, onStickers, onChangeAge, onVoiceCommand }: TaskBarProps) {
  const { age, stickers } = useProfile();
  const meta = age ? AGE_GROUP_META[age] : null;

  return (
    <nav className="task-bar" aria-label="Main navigation">
      <IconButton
        label="Home"
        icon={<img className="task-bar__home-logo" src="/favicon.svg" alt="" />}
        onClick={onHome}
      />

      <VoiceCommandButton onCommand={onVoiceCommand} />

      <div className="task-bar__right">
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

        <SettingsBar />

        <button type="button" className="task-bar__item task-bar__item--book" onClick={onStickers}>
          <IconSticker size={30} />
          <span>Sticker book</span>
          <span className="task-bar__count">{stickers.length} / 16</span>
        </button>
      </div>
    </nav>
  );
}