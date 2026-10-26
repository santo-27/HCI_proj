/*
 * Sound, voice and motion, always reachable.
 *
 * These sit in the chrome of every screen rather than behind a settings menu:
 * the child who needs the sound off is often not the one who can navigate a
 * menu to find it, and an adult should be able to silence the app in one tap.
 *
 * Sound and voice are separate switches on purpose — narration is an
 * accessibility feature for pre-readers, while the effects are decoration, and
 * a classroom often wants one without the other.
 */

import { useProfile } from "../context/profile";
import { IconButton } from "./IconButton";
import {
  IconSoundOff,
  IconSoundOn,
  IconVoiceOff,
  IconVoiceOn,
} from "../art/icons";
import "./components.css";

export function SettingsBar({ className = "" }: { className?: string }) {
  const { settings, toggleSetting } = useProfile();

  return (
    <div className={`settings-bar ${className}`} role="group" aria-label="Sound and motion">
      <IconButton
        label={settings.sound ? "Sounds on" : "Sounds off"}
        icon={settings.sound ? <IconSoundOn /> : <IconSoundOff />}
        active={settings.sound}
        onClick={() => toggleSetting("sound")}
      />
      <IconButton
        label={settings.voice ? "Talking on" : "Talking off"}
        icon={settings.voice ? <IconVoiceOn /> : <IconVoiceOff />}
        active={settings.voice}
        onClick={() => toggleSetting("voice")}
      />
      {/* <IconButton
        label={settings.motion ? "Movement on" : "Movement off"}
        icon={settings.motion ? <IconMotionOn /> : <IconMotionOff />}
        active={settings.motion}
        onClick={() => toggleSetting("motion")}
      /> */}
    </div>
  );
}
