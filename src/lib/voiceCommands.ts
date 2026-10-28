/*
 * Turns what a child said into something the app can do.
 *
 * This is deliberately a forgiving keyword matcher, not a grammar. A
 * five-year-old says "the jigsaw one!", "I want puzzles" or just "memory", and
 * all of those should work — so we look for the meaningful word anywhere in
 * the sentence and ignore everything around it.
 *
 * Game names come from the registry, so a new game is voice-openable the
 * moment it has an entry there. Nothing here knows the list of games.
 */

import type { AgeGroup, GameId } from "./difficulty";
import { AGE_GROUPS } from "./difficulty";
import type { GameDefinition } from "../games/registry";

export type VoiceCommand =
  | { k: "open-game"; id: GameId }
  | { k: "games" }
  | { k: "welcome" }
  | { k: "stickers" }
  | { k: "set-age"; age: AgeGroup }
  | { k: "setting"; key: "sound" | "voice"; on: boolean }
  | { k: "help" };

/** Words in game titles that say nothing about which game is meant. */
const FILLER = new Set(["the", "a", "an", "and", "of", "to"]);

function words(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function hasAny(said: Set<string>, candidates: readonly string[]): boolean {
  return candidates.some((w) => said.has(w));
}

/** "on" / "off" from the sentence, or null when the child did not say. */
function onOff(said: Set<string>): boolean | null {
  if (hasAny(said, ["off", "stop", "quiet", "mute", "no"])) return false;
  if (hasAny(said, ["on", "start", "unmute", "yes", "back"])) return true;
  return null;
}

function gameKeywords(game: GameDefinition): string[] {
  return [game.id, ...words(game.title), ...game.voiceWords].filter(
    (w) => !FILLER.has(w),
  );
}

/**
 * The game whose keywords appear most often in the sentence. Recognisers
 * sometimes split a word ("jig saw"), so long keywords are also matched
 * against the sentence with its spaces removed.
 */
function matchGame(
  said: Set<string>,
  squashed: string,
  games: readonly GameDefinition[],
): GameId | null {
  let best: GameId | null = null;
  let bestScore = 0;

  for (const game of games) {
    const score = gameKeywords(game).filter(
      (w) => said.has(w) || (w.length >= 6 && squashed.includes(w)),
    ).length;
    if (score > bestScore) {
      best = game.id;
      bestScore = score;
    }
  }
  return best;
}

function parseOne(
  transcript: string,
  games: readonly GameDefinition[],
): VoiceCommand | null {
  const list = words(transcript);
  if (!list.length) return null;
  const said = new Set(list);
  const squashed = list.join("");

  // Settings first: "turn the sound off" mentions no game, but "talking"
  // must not be mistaken for anything else.
  if (hasAny(said, ["mute", "unmute"])) {
    return { k: "setting", key: "sound", on: said.has("unmute") };
  }
  if (hasAny(said, ["sound", "sounds", "noise", "noises"])) {
    const on = onOff(said);
    if (on !== null) return { k: "setting", key: "sound", on };
  }
  if (hasAny(said, ["talking", "talk", "voice", "speaking", "narration"])) {
    const on = onOff(said);
    if (on !== null) return { k: "setting", key: "voice", on };
  }

  if (hasAny(said, ["help", "what"]) && !matchGame(said, squashed, games)) {
    return { k: "help" };
  }

  if (hasAny(said, ["sticker", "stickers", "book", "collection"])) {
    return { k: "stickers" };
  }

  const age = AGE_GROUPS.find((g) => said.has(g));
  if (age) return { k: "set-age", age };
  if (hasAny(said, ["age", "old"])) return { k: "welcome" };

  const game = matchGame(said, squashed, games);
  if (game) return { k: "open-game", id: game };

  if (hasAny(said, ["home", "back", "games", "menu", "choose", "exit", "leave"])) {
    return { k: "games" };
  }

  return null;
}

/**
 * Tries each of the recogniser's guesses in turn and returns the first one
 * that means something. The top guess is usually right; the rest rescue
 * "open jigsaw" heard as "oh pen jig saw".
 */
export function parseVoiceCommand(
  alternatives: readonly string[],
  games: readonly GameDefinition[],
): VoiceCommand | null {
  for (const transcript of alternatives) {
    const command = parseOne(transcript, games);
    if (command) return command;
  }
  return null;
}

/** The spoken help line, built from the registry so it never goes stale. */
export function voiceHelp(games: readonly GameDefinition[]): string {
  const names = games.map((g) => g.title).join(", ");
  return `You can say the name of a game: ${names}. Or say sticker book, go home, or sound off.`;
}
