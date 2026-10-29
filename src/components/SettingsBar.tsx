
import { useProfile } from "../context/profile";
import { IconButton } from "./IconButton";
import {
  IconBellOff,
  IconBellOn,
  IconSoundOff,
  IconSoundOn,
} from "../art/icons";
import "./components.css";

export function SettingsBar({ className = "" }: { className?: string }) {
  const { settings, toggleSetting } = useProfile();

  return (
    <div
      className={`settings-bar ${className}`}
      role="group"
      aria-label="Sound and notifications"
    >
      <div className="settings-bar__item" title="Toggle sound effects">
        <IconButton
          label={settings.sound ? "Sound effects on" : "Sound effects off"}
          icon={settings.sound ? <IconBellOn /> : <IconBellOff />}
          active={settings.sound}
          onClick={() => toggleSetting("sound")}
        />
        <span className="settings-bar__tooltip" role="tooltip">
          {settings.sound ? "Sound effects on" : "Sound effects off"}
        </span>
      </div>

      <div
        className="settings-bar__item"
        title="Toggle voice and spoken instructions"
      >
        <IconButton
          label={settings.voice ? "Voice on" : "Voice off"}
          icon={settings.voice ? <IconSoundOn /> : <IconSoundOff />}
          active={settings.voice}
          onClick={() => toggleSetting("voice")}
        />
        <span className="settings-bar__tooltip" role="tooltip">
          {settings.voice ? "Spoken instructions on" : "Spoken instructions off"}
        </span>
      </div>
    </div>
  );
}
