/*
 * The one piece of global state: who is playing, how they want the app to
 * behave, and what they have earned.
 *
 * The context object and its hook live here rather than beside the provider
 * component so that the provider file exports a component and nothing else —
 * which is what react-refresh (and the only-export-components lint rule) wants.
 */

import { createContext, useContext } from "react";
import type { AgeGroup, DifficultyProfile, GameId } from "../lib/difficulty";

export interface GameProgress {
  plays: number;
  /** Best result ever, never overwritten by a worse one. 0 means unplayed. */
  bestStars: 0 | 1 | 2 | 3;
}

export type ProgressState = Record<GameId, GameProgress>;

export const EMPTY_PROGRESS: ProgressState = {
  memory: { plays: 0, bestStars: 0 },
  jigsaw: { plays: 0, bestStars: 0 },
  sorter: { plays: 0, bestStars: 0 },
  sequence: { plays: 0, bestStars: 0 },
  reading: { plays: 0, bestStars: 0 },
};

export interface Settings {
  sound: boolean;
  /** Spoken narration. Separate from sound so a child can keep one and not the other. */
  voice: boolean;
  motion: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  sound: true,
  voice: true,
  motion: true,
};

export interface WinRecord {
  stars: 1 | 2 | 3;
  /** The creature sticker awarded, or null once the book is full. */
  sticker: string | null;
}

export interface ProfileValue {
  age: AgeGroup | null;
  setAge: (age: AgeGroup) => void;
  /** Resolved difficulty for the current age. Falls back to Medium pre-pick. */
  profile: DifficultyProfile;

  settings: Settings;
  toggleSetting: (key: keyof Settings) => void;

  progress: ProgressState;
  stickers: readonly string[];
  totalStars: number;

  /** Records a finished game and hands back the sticker it earned. */
  recordWin: (game: GameId, stars: 1 | 2 | 3) => WinRecord;
  resetEverything: () => void;
}

export const ProfileContext = createContext<ProfileValue | null>(null);

export function useProfile(): ProfileValue {
  const value = useContext(ProfileContext);
  if (!value) {
    throw new Error("useProfile must be used inside <ProfileProvider>");
  }
  return value;
}
