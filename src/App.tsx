/*
 * Puzzle Playground.
 *
 * Navigation is a single piece of state rather than a router: there are four
 * places to be, no URLs to share, and no deep links to support. Adding a
 * dependency to switch between four screens would cost more than it gives.
 *
 * The screens themselves are dumb about each other — App owns every transition,
 * which keeps the back behaviour in one readable place.
 */

import { useState } from "react";
import type { GameId } from "./lib/difficulty";
import { ProfileProvider } from "./context/ProfileProvider";
import { useProfile } from "./context/profile";
import { Welcome } from "./screens/Welcome";
import { Home } from "./screens/Home";
import { GameScreen } from "./screens/GameScreen";
import { StickerBookScreen } from "./screens/StickerBookScreen";

type View =
  | { k: "welcome" }
  | { k: "home" }
  | { k: "game"; id: GameId }
  | { k: "stickers" };

function Router() {
  const { age } = useProfile();

  // A returning player skips the age question; a first-time one cannot.
  const [view, setView] = useState<View>(() =>
    age ? { k: "home" } : { k: "welcome" },
  );

  const goHome = () => setView({ k: "home" });

  switch (view.k) {
    case "welcome":
      return <Welcome onPicked={goHome} />;
    case "home":
      return (
        <Home
          onPlay={(id) => setView({ k: "game", id })}
          onStickers={() => setView({ k: "stickers" })}
          onChangeAge={() => setView({ k: "welcome" })}
        />
      );
    case "game":
      return <GameScreen id={view.id} onExit={goHome} />;
    case "stickers":
      return <StickerBookScreen onBack={goHome} />;
  }
}

export default function App() {
  return (
    <ProfileProvider>
      <div className="app">
        <Router />
      </div>
    </ProfileProvider>
  );
}
