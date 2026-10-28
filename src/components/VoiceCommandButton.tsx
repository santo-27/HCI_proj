/*
 * "Tell me what to do": a microphone in the task bar that takes spoken
 * commands such as "open jigsaw", "sticker book" or "sound off".
 *
 * This only listens and understands. What a command *does* is up to the
 * caller, which keeps navigation in App.tsx where the rest of it lives.
 *
 * A command that is not understood is treated like any other wrong move in the
 * app: a soft tone, a friendly hint, and the child just tries again. The
 * button is not rendered at all where the browser cannot recognise speech, so
 * nobody is offered a control that does nothing.
 */

import { useEffect, useRef, useState } from "react";
import { GAMES } from "../games/registry";
import { isRecognitionSupported, listenForWord } from "../lib/recognition";
import type { VoiceCommand } from "../lib/voiceCommands";
import { parseVoiceCommand, voiceHelp } from "../lib/voiceCommands";
import { playCorrect, playRetry } from "../lib/audio";
import { cancelSpeech, speak } from "../lib/speech";
import { IconListen } from "../art/icons";
import { IconButton } from "./IconButton";
import "./components.css";

const NOT_HEARD = "Sorry, I did not catch that. Try saying the name of a game.";

export function VoiceCommandButton({ onCommand }: { onCommand: (c: VoiceCommand) => void }) {
  const [listening, setListening] = useState(false);
  const [status, setStatus] = useState("");
  const stop = useRef<(() => void) | null>(null);

  useEffect(() => () => stop.current?.(), []);

  if (!isRecognitionSupported()) return null;

  function finish(line: string) {
    setListening(false);
    stop.current = null;
    setStatus(line);
  }

  function start() {
    if (listening) {
      stop.current?.();
      return;
    }

    // The mascot talking would be picked up by the microphone.
    cancelSpeech();
    setListening(true);
    setStatus("Listening…");

    stop.current = listenForWord(
      ({ transcript, alternatives }) => {
        const command = parseVoiceCommand(alternatives, GAMES);
        if (!command) {
          finish(transcript ? `I heard "${transcript}". ${NOT_HEARD}` : NOT_HEARD);
          playRetry();
          speak(NOT_HEARD);
          return;
        }
        if (command.k === "help") {
          const help = voiceHelp(GAMES);
          finish(help);
          speak(help);
          return;
        }
        finish("");
        playCorrect();
        onCommand(command);
      },
      () => {
        finish(NOT_HEARD);
        playRetry();
        speak(NOT_HEARD);
      },
      // Ends without a result when the child says nothing at all.
      () => {
        setListening(false);
        stop.current = null;
        setStatus((s) => (s === "Listening…" ? "" : s));
      },
    );

    if (!stop.current) finish("The microphone is not working right now.");
  }

  return (
    <div className="voice-cmd">
      <IconButton
        label={listening ? "Listening. Tap to stop." : "Tell me what to do"}
        icon={<IconListen />}
        tone={listening ? "solid" : "plain"}
        className={`hue-coral ${listening ? "voice-cmd__btn--listening" : ""}`}
        onClick={start}
      />
      <p className="voice-cmd__status" role="status" aria-live="polite">
        {status}
      </p>
    </div>
  );
}
