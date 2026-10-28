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

import { useEffect, useState } from "react";
import type { GameId } from "./lib/difficulty";
import { ProfileProvider } from "./context/ProfileProvider";
import { Welcome } from "./screens/Welcome";
import { Home } from "./screens/Home";
import { GameScreen } from "./screens/GameScreen";
import { StickerBookScreen } from "./screens/StickerBookScreen";
import { TaskBar } from "./components/TaskBar";
import { useProfile } from "./context/profile";
import type { VoiceCommand } from "./lib/voiceCommands";

type View =
  | { k: "welcome" }
  | { k: "games" }
  | { k: "game"; id: GameId }
  | { k: "stickers" };

type AppHistoryState = {
  app: true;
  view: View;
  root?: boolean;
};

function normalizeHistoryView(view: View): View {
  return view.k === "welcome" || view.k === "games" || view.k === "game" || view.k === "stickers"
    ? view
    : { k: "welcome" };
}

function Router() {
  const [initialView] = useState<View>(() =>
    (window.history.state as AppHistoryState | null)?.app
      ? normalizeHistoryView((window.history.state as AppHistoryState).view)
      : { k: "welcome" },
  );
  const [view, setView] = useState<View>(initialView);
  const { age, setAge, settings, toggleSetting } = useProfile();

  useEffect(() => {
    const rootState: AppHistoryState = { app: true, view: { k: "welcome" }, root: true };
    const currentState = window.history.state as AppHistoryState | null;

    // Keep the current route when the browser reloads the app. A fresh entry
    // gets a guarded root pair so Back cannot immediately leave the website.
    if (!currentState?.app) {
      window.history.replaceState(rootState, "");
      window.history.pushState(rootState, "");
    }

    const handlePopState = (event: PopStateEvent) => {
      const state = event.state as AppHistoryState | null;

      if (!state?.app) {
        window.history.pushState(rootState, "");
        setView(initialView);
        return;
      }

      setView(normalizeHistoryView(state.view));
      if (state.root) window.history.pushState(rootState, "");
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [initialView]);

  const navigate = (nextView: View) => {
    setView(nextView);
    window.history.pushState({ app: true, view: nextView }, "");
  };

  const goWelcome = () => navigate({ k: "welcome" });
  const openGameChooser = () => navigate({ k: "games" });

  const handleVoiceCommand = (command: VoiceCommand) => {
    switch (command.k) {
      case "open-game":
        navigate({ k: "game", id: command.id });
        break;
      case "games":
        // The chooser needs an age; before one is picked, "home" is the picker.
        navigate(age ? { k: "games" } : { k: "welcome" });
        break;
      case "welcome":
        goWelcome();
        break;
      case "stickers":
        navigate({ k: "stickers" });
        break;
      case "set-age":
        setAge(command.age);
        openGameChooser();
        break;
      case "setting":
        if (settings[command.key] !== command.on) toggleSetting(command.key);
        break;
      case "help":
        // Answered by the button itself; nothing to navigate.
        break;
    }
  };

  return (
    <>
      <TaskBar
        onHome={goWelcome}
        onStickers={() => navigate({ k: "stickers" })}
        onChangeAge={goWelcome}
        onVoiceCommand={handleVoiceCommand}
      />
      <Screen view={view} navigate={navigate} onPicked={openGameChooser} onHome={goWelcome} />
    </>
  );
}

interface ScreenProps {
  view: View;
  navigate: (view: View) => void;
  onPicked: () => void;
  onHome: () => void;
}

function Screen({ view, navigate, onPicked, onHome }: ScreenProps) {
  switch (view.k) {
    case "welcome":
      return <Welcome onPicked={onPicked} />;
    case "games":
      return <Home onPlay={(id) => navigate({ k: "game", id })} />;
    case "game":
      // Keyed so that asking for a different game by voice mid-game starts it
      // fresh rather than reusing the previous game's shell state.
      return <GameScreen key={view.id} id={view.id} onHome={onHome} />;
    case "stickers":
      return <StickerBookScreen />;
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
