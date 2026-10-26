/*
 * The list of games, and the contract they all satisfy.
 *
 * The home grid and the view switch in App.tsx both render from GAMES, so a
 * fifth game is a new folder plus one entry in the array below — no edits to
 * App.tsx or Home.tsx. That is the whole reason this file exists.
 *
 * `render` is the seam between the shared shell and a game's own config type.
 * Each entry pulls its own slice out of the difficulty profile and hands it to
 * a component that knows nothing about age groups or the other games. That way
 * game components stay narrowly typed — none of this needs `any`.
 */

import type { ComponentType, ReactNode } from "react";
import type { DifficultyProfile, GameId } from "../lib/difficulty";
import type { Hue } from "../lib/hues";
import {
  IconJigsaw,
  IconMemory,
  IconReading,
  IconSequence,
  IconSorter,
} from "../art/icons";
import { MemoryMatch } from "./memory/MemoryMatch";
import { Jigsaw } from "./jigsaw/Jigsaw";
import { Sorter } from "./sorter/Sorter";
import { Sequence } from "./sequence/Sequence";
import { ReadAloud } from "./reading/ReadAloud";

export interface WinResult {
  stars: 1 | 2 | 3;
  /** Optional line the shell speaks alongside the celebration. */
  message?: string;
}

/** What every game component receives. Nothing more is available to it. */
export interface GameProps<TConfig> {
  config: TConfig;
  onWin: (result: WinResult) => void;
  /** Drives the shell's progress bar. Called with (done, total). */
  onProgress: (done: number, total: number) => void;
}

/** What the shell hands to `render`. */
export interface GameRuntimeProps {
  profile: DifficultyProfile;
  onWin: (result: WinResult) => void;
  onProgress: (done: number, total: number) => void;
  /** Changes to force a fresh game; the shell bumps it on Play again. */
  round: number;
}

export interface GameDefinition {
  id: GameId;
  title: string;
  /** One short line on the home tile, for the age groups that read. */
  blurb: string;
  hue: Hue;
  Icon: ComponentType<{ size?: number | string }>;
  /** Spoken once when the game opens. */
  narration: string;
  /** The mascot's standing instruction inside the game. */
  howTo: string;
  /** The friend who guides this game. */
  guide: string;
  render: (props: GameRuntimeProps) => ReactNode;
}

export const GAMES: readonly GameDefinition[] = [
  {
    id: "memory",
    title: "Memory Match",
    blurb: "Find the pairs",
    hue: "coral",
    Icon: IconMemory,
    narration: "Memory Match. Turn over two cards and find the animals that match.",
    howTo: "Tap two cards to find a matching pair.",
    guide: "cat",
    render: ({ profile, onWin, onProgress, round }) => (
      <MemoryMatch
        key={round}
        config={profile.memory}
        onWin={onWin}
        onProgress={onProgress}
      />
    ),
  },
  {
    id: "jigsaw",
    title: "Jigsaw",
    blurb: "Put the picture back",
    hue: "sky",
    Icon: IconJigsaw,
    narration: "Jigsaw. Drag the pieces to finish the picture.",
    howTo: "Drag each piece onto the board to finish the picture.",
    guide: "owl",
    render: ({ profile, onWin, onProgress, round }) => (
      <Jigsaw
        key={round}
        config={profile.jigsaw}
        onWin={onWin}
        onProgress={onProgress}
      />
    ),
  },
  {
    id: "sorter",
    title: "Shape Sorter",
    blurb: "Drop them in the right box",
    hue: "mint",
    Icon: IconSorter,
    narration: "Shape Sorter. Drag each shape into the box where it belongs.",
    howTo: "Drag each shape into the box where it belongs.",
    guide: "frog",
    render: ({ profile, onWin, onProgress, round }) => (
      <Sorter
        key={round}
        config={profile.sorter}
        onWin={onWin}
        onProgress={onProgress}
      />
    ),
  },
  {
    id: "sequence",
    title: "Copy the Tune",
    blurb: "Watch, listen, repeat",
    hue: "grape",
    Icon: IconSequence,
    narration: "Copy the Tune. Watch which buttons light up, then tap them in the same order.",
    howTo: "Watch the lights, then tap them in the same order.",
    guide: "duck",
    render: ({ profile, onWin, onProgress, round }) => (
      <Sequence
        key={round}
        config={profile.sequence}
        onWin={onWin}
        onProgress={onProgress}
      />
    ),
  },
  {
    id: "reading",
    title: "Read Aloud",
    blurb: "Say the word you see",
    hue: "sunshine",
    Icon: IconReading,
    narration: "Read Aloud. Look at the word, then say it into the microphone.",
    howTo: "Read the word, then tap the microphone and say it.",
    guide: "fox",
    render: ({ profile, onWin, onProgress, round }) => (
      <ReadAloud
        key={round}
        config={profile.reading}
        onWin={onWin}
        onProgress={onProgress}
      />
    ),
  },
];

export function gameById(id: GameId): GameDefinition {
  const found = GAMES.find((g) => g.id === id);
  if (!found) throw new Error(`Unknown game: ${id}`);
  return found;
}
