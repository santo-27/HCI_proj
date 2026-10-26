/*
 * First run: pick who is playing.
 *
 * The age picker is the app's one global setting and it is asked as a question
 * a child can answer about themselves — three big buttons with a growing bird
 * on each — rather than a settings screen an adult has to find. The choice
 * scales everything: board sizes, timings, whether words appear next to icons,
 * and the size of the interface itself.
 */

import { useEffect } from "react";
import type { AgeGroup } from "../lib/difficulty";
import { AGE_GROUPS, AGE_GROUP_META } from "../lib/difficulty";
import type { Hue } from "../lib/hues";
import { useProfile } from "../context/profile";
import { BigButton } from "../components/BigButton";
import { Mascot } from "../components/Mascot";
import { SettingsBar } from "../components/SettingsBar";
import { speak } from "../lib/speech";
import "./screens.css";

const GREETING = "Hello! How old are you? Tap your picture.";

export function Welcome({ onPicked }: { onPicked: () => void }) {
  const { setAge, age } = useProfile();

  // Narration cannot start before a gesture on most browsers, so this line is
  // often silent on a cold load — the mascot is tappable to hear it, and every
  // later screen speaks normally once the first button has been pressed.
  useEffect(() => {
    speak(GREETING);
  }, []);

  function pick(group: AgeGroup) {
    setAge(group);
    onPicked();
  }

  return (
    <div className="screen welcome">
      <div className="welcome__top">
        <SettingsBar />
      </div>

      <h1 className="welcome__title">
        <span className="welcome__title-a">Puzzle</span>
        <span className="welcome__title-b">Playground</span>
      </h1>

      <Mascot line={GREETING} creature="bunny" size={120} />

      <div className="welcome__picker" role="group" aria-label="Choose your age">
        {AGE_GROUPS.map((group) => {
          const meta = AGE_GROUP_META[group];
          return (
            <BigButton
              key={group}
              label={meta.label}
              sublabel={meta.ages}
              hue={meta.hue as Hue}
              selected={age === group}
              icon={<span className="welcome__emoji">{meta.emoji}</span>}
              onClick={() => pick(group)}
            />
          );
        })}
      </div>

      
    </div>
  );
}
