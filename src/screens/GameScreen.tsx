/*
 * Thin wrapper: look the game up in the registry and hand it to the shell.
 *
 * This stays small on purpose. Everything a game needs around it lives in
 * GameShell, and everything a game *is* lives in its own folder.
 */

import type { GameId } from "../lib/difficulty";
import { gameById } from "../games/registry";
import { GameShell } from "../components/GameShell";

interface GameScreenProps {
  id: GameId;
  onExit: () => void;
  onHome: () => void;
}

export function GameScreen({ id, onExit, onHome }: GameScreenProps) {
  return <GameShell game={gameById(id)} onExit={onExit} onHome={onHome} />;
}
