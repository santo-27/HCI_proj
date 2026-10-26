import { useEffect, useRef, useState } from "react";
import type { GameProps } from "../registry";
import type { ReadingConfig } from "../../lib/difficulty";
import { listenForWord } from "../../lib/recognition";
import { speak } from "../../lib/speech";
import { IconVoiceOn } from "../../art/icons";
import { BigButton } from "../../components/BigButton";
import { hueClass } from "../../lib/hues";
import "./reading.css";

function cleanWord(value: string): string {
  return value.toLowerCase().replace(/[^a-z]/g, "");
}

export function ReadAloud({ config, onWin, onProgress }: GameProps<ReadingConfig>) {
  const [wordIndex, setWordIndex] = useState(0);
  const [status, setStatus] = useState("Tap the microphone, then read the word.");
  const [listening, setListening] = useState(false);
  const stopListening = useRef<(() => void) | null>(null);
  const mistakes = useRef(0);
  const word = config.words[wordIndex];

  useEffect(() => {
    onProgress(wordIndex, config.words.length);
    return () => stopListening.current?.();
  }, [config.words.length, onProgress, wordIndex]);

  function nextWord() {
    const nextIndex = wordIndex + 1;
    if (nextIndex >= config.words.length) {
      onWin({ message: "Wonderful reading!" });
      return;
    }
    setWordIndex(nextIndex);
    setStatus("Great reading! Try the next word.");
  }

  function startListening() {
    if (listening) return;
    setListening(true);
    setStatus("Listening...");
    stopListening.current = listenForWord(
      ({ transcript }) => {
        setListening(false);
        stopListening.current = null;
        if (cleanWord(transcript) === cleanWord(word)) {
          setStatus(`Yes! You said ${word}.`);
          speak(`Yes! You said ${word}.`);
          nextWord();
        } else {
          mistakes.current += 1;
          setStatus("Nearly! Have another try.");
          speak("Nearly! Have another try.");
        }
      },
      () => {
        setListening(false);
        stopListening.current = null;
        setStatus("I could not hear that. Try again.");
        speak("I could not hear that. Try again.");
      },
      () => {
        setListening(false);
        stopListening.current = null;
      },
    );

    if (!stopListening.current) {
      setListening(false);
      setStatus("Voice recognition is not available in this browser.");
      speak("Voice recognition is not available here. Ask a grown-up for help.");
    }
  }

  return (
    <div className="reading">
      <p className="reading__progress" aria-live="polite">
        Word {Math.min(wordIndex + 1, config.words.length)} of {config.words.length}
      </p>
      <div className={`reading__word ${hueClass("sunshine")}`} aria-live="polite">
        {word}
      </div>
      <p className="reading__status" aria-live="polite">{status}</p>
      <BigButton
        label={listening ? "Listening..." : "Read it aloud"}
        icon={<IconVoiceOn size={38} />}
        hue="coral"
        onClick={startListening}
        selected={listening}
        block
      />
    </div>
  );
}