export interface RecognitionResult {
  transcript: string;
}

interface RecognitionEvent {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
}

interface RecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
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
  recognition.onresult = (event) => {
    onResult({ transcript: event.results[0][0].transcript });
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