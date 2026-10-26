/*
 * The single source of truth for how hard everything is.
 *
 * Games never hardcode a grid size, a piece count, or a timing. They read
 * their config from here, keyed by the age group the player picked on the
 * first screen. Changing what "Little" means anywhere in the app is a one-file
 * edit, and the three difficulty ladders stay visible side by side instead of
 * being scattered across four game components.
 */

export type AgeGroup = "little" | "medium" | "big";

export type GameId = "memory" | "jigsaw" | "sorter" | "sequence" | "reading";

export const AGE_GROUPS: readonly AgeGroup[] = ["little", "medium", "big"];

export interface AgeGroupMeta {
  id: AgeGroup;
  /** Short label shown on the giant picker buttons. */
  label: string;
  ages: string;
  emoji: string;
  hue: string;
}

export const AGE_GROUP_META: Record<AgeGroup, AgeGroupMeta> = {
  little: { id: "little", label: "Little", ages: "4 to 6", emoji: "🐣", hue: "mint" },
  medium: { id: "medium", label: "Medium", ages: "7 to 9", emoji: "🐤", hue: "sky" },
  big: { id: "big", label: "Big", ages: "10 to 12", emoji: "🦅", hue: "grape" },
};

/* ---- Per-game config shapes ------------------------------------------ */

export interface MemoryConfig {
  columns: number;
  rows: number;
  /** How long a mismatched pair stays face-up before flipping back. */
  peekMs: number;
}

export interface JigsawConfig {
  columns: number;
  rows: number;
  /** Distance in px within which a dropped piece snaps home. */
  snapRadius: number;
  /** Faint outlines of each piece on the board — training wheels. */
  showGhosts: boolean;
}

export interface SorterConfig {
  /** What decides the correct bin: colour alone, shape alone, or both. */
  rule: "color" | "shape" | "both";
  binCount: number;
  itemCount: number;
}

export interface SequenceConfig {
  padCount: number;
  startLength: number;
  targetLength: number;
  /** How long each pad stays lit during playback. */
  litMs: number;
  gapMs: number;
}

export interface ReadingConfig {
  words: readonly string[];
}

export interface DifficultyProfile {
  /** Icon-only for pre-readers; the older groups get words alongside. */
  labelMode: "icon" | "icon-and-text";
  memory: MemoryConfig;
  jigsaw: JigsawConfig;
  sorter: SorterConfig;
  sequence: SequenceConfig;
  reading: ReadingConfig;
}

/* ---- The table -------------------------------------------------------- */

export const DIFFICULTY: Record<AgeGroup, DifficultyProfile> = {
  little: {
    labelMode: "icon",
    memory: { columns: 3, rows: 2, peekMs: 1500 },
    jigsaw: { columns: 2, rows: 2, snapRadius: 110, showGhosts: true },
    sorter: { rule: "color", binCount: 3, itemCount: 6 },
    sequence: { padCount: 4, startLength: 2, targetLength: 5, litMs: 620, gapMs: 260 },
    reading: { words: ["cat", "sun", "red", "fish", "tree"] },
  },
  medium: {
    labelMode: "icon-and-text",
    memory: { columns: 4, rows: 4, peekMs: 1000 },
    jigsaw: { columns: 3, rows: 3, snapRadius: 70, showGhosts: true },
    sorter: { rule: "shape", binCount: 4, itemCount: 8 },
    sequence: { padCount: 4, startLength: 3, targetLength: 8, litMs: 460, gapMs: 180 },
    reading: { words: ["little", "yellow", "happy", "garden", "rocket", "friend"] },
  },
  big: {
    labelMode: "icon-and-text",
    memory: { columns: 6, rows: 5, peekMs: 800 },
    jigsaw: { columns: 6, rows: 6, snapRadius: 42, showGhosts: false },
    sorter: { rule: "both", binCount: 5, itemCount: 12 },
    sequence: { padCount: 6, startLength: 4, targetLength: 10, litMs: 380, gapMs: 140 },
    reading: { words: ["adventure", "wonderful", "rainbow", "elephant", "playground", "together"] },
  },
};

export function profileFor(age: AgeGroup): DifficultyProfile {
  return DIFFICULTY[age];
}

