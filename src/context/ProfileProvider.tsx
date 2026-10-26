/*
 * Holds the player profile and mirrors it into the places that need it:
 * localStorage (so a child comes back to their sticker book), the <html>
 * dataset (so tokens.css can rescale the whole UI per age group and collapse
 * the motion tokens), and the audio/speech modules (so the toggles bite).
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { AgeGroup, GameId } from "../lib/difficulty";
import { profileFor } from "../lib/difficulty";
import { CREATURES } from "../art/creatures";
import { setMuted } from "../lib/audio";
import { setSpeechEnabled } from "../lib/speech";
import { clearAll, load, save } from "../lib/storage";
import { sample } from "../lib/shuffle";
import {
  DEFAULT_SETTINGS,
  EMPTY_PROGRESS,
  ProfileContext,
} from "./profile";
import type {
  ProfileValue,
  ProgressState,
  Settings,
  WinRecord,
} from "./profile";

const KEY_AGE = "age";
const KEY_SETTINGS = "settings";
const KEY_PROGRESS = "progress";
const KEY_STICKERS = "stickers";

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [age, setAgeState] = useState<AgeGroup | null>(() =>
    load<AgeGroup | null>(KEY_AGE, null),
  );

  const [settings, setSettings] = useState<Settings>(() => ({
    // Spread over the defaults so a stored record written before a new toggle
    // existed still yields a complete object.
    ...DEFAULT_SETTINGS,
    ...load<Partial<Settings>>(KEY_SETTINGS, {}),
  }));

  const [progress, setProgress] = useState<ProgressState>(() => ({
    ...EMPTY_PROGRESS,
    ...load<Partial<ProgressState>>(KEY_PROGRESS, {}),
  }));

  const [stickers, setStickers] = useState<string[]>(() =>
    load<string[]>(KEY_STICKERS, []),
  );

  /* ---- Mirror outwards ------------------------------------------------ */

  useEffect(() => {
    // tokens.css keys --scale off this. Pre-pick we sit at the middle size.
    document.documentElement.dataset.age = age ?? "medium";
  }, [age]);

  useEffect(() => {
    document.documentElement.dataset.motion = settings.motion ? "on" : "off";
  }, [settings.motion]);

  useEffect(() => {
    setMuted(!settings.sound);
    setSpeechEnabled(settings.voice);
    save(KEY_SETTINGS, settings);
  }, [settings]);

  useEffect(() => {
    if (age) save(KEY_AGE, age);
  }, [age]);

  useEffect(() => {
    save(KEY_PROGRESS, progress);
  }, [progress]);

  useEffect(() => {
    save(KEY_STICKERS, stickers);
  }, [stickers]);

  /* ---- Actions -------------------------------------------------------- */

  const setAge = useCallback((next: AgeGroup) => setAgeState(next), []);

  const toggleSetting = useCallback((key: keyof Settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const recordWin = useCallback(
    (game: GameId): WinRecord => {
      setProgress((prev) => ({
        ...prev,
        [game]: {
          plays: prev[game].plays + 1,
        },
      }));

      // Award a creature the child has not collected yet. Computing it here
      // (rather than inside the setState updater) lets the celebration show
      // the sticker it just earned in the same frame.
      const unearned = CREATURES.filter((c) => !stickers.includes(c.id));
      const awarded = unearned.length ? sample(unearned, 1)[0].id : null;
      if (awarded) setStickers((prev) => [...prev, awarded]);

      return { sticker: awarded };
    },
    [stickers],
  );

  const resetEverything = useCallback(() => {
    clearAll();
    setProgress(EMPTY_PROGRESS);
    setStickers([]);
    setAgeState(null);
  }, []);

  const value = useMemo<ProfileValue>(
    () => ({
      age,
      setAge,
      profile: profileFor(age ?? "medium"),
      settings,
      toggleSetting,
      progress,
      stickers,
      recordWin,
      resetEverything,
    }),
    [
      age,
      setAge,
      settings,
      toggleSetting,
      progress,
      stickers,
      recordWin,
      resetEverything,
    ],
  );

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}
