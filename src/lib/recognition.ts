export interface RecognitionResult {
  transcript: string;
  /** Every guess the recogniser offered, best first. Includes `transcript`. */
  alternatives: string[];
}

interface RecognitionEvent {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
}

interface RecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface RecognitionConstructor {
  new (): RecognitionInstance;
}

declare global {
  interface Window {
    SpeechRecognition?: RecognitionConstructor;
    webkitSpeechRecognition?: RecognitionConstructor;
  }
}

export function isRecognitionSupported(): boolean {
  return typeof window !== "undefined" && Boolean(
    window.SpeechRecognition ?? window.webkitSpeechRecognition,
  );
}

export function listenForWord(
  onResult: (result: RecognitionResult) => void,
  onError: () => void,
  onDone: () => void,
): (() => void) | null {
  if (!isRecognitionSupported()) return null;

  const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
  if (!Recognition) return null;

  const recognition = new Recognition();
  recognition.lang = "en-US";
  recognition.continuous = false;
  recognition.interimResults = false;
  // Children's speech is often misheard on the first guess; asking for a few
  // lets command matching look past it. Single-word reading still uses [0].
  recognition.maxAlternatives = 5;
  recognition.onresult = (event) => {
    const alternatives = Array.from(event.results[0], (alt) => alt.transcript);
    onResult({ transcript: alternatives[0] ?? "", alternatives });
  };
  recognition.onerror = onError;
  recognition.onend = onDone;

  try {
    recognition.start();
  } catch {
    onError();
    return null;
  }

  return () => recognition.stop();
}