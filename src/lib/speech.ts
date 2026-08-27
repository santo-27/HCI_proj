/*
 * Spoken narration via the browser's SpeechSynthesis API.
 *
 * This is the feature that lets a 4-year-old who cannot read yet play without
 * an adult sitting next to them: every screen announces itself, and each game
 * says what it wants you to do.
 *
 * Two rules matter. Speak cancels whatever is already talking, because kids
 * tap fast and a queue of stale sentences is worse than silence. And every
 * path no-ops safely when the API is missing (older Chromium, some embedded
 * webviews) rather than throwing.
 */

let enabled = true;

function supported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function setSpeechEnabled(next: boolean): void {
  enabled = next;
  if (!next) cancelSpeech();
}

export function cancelSpeech(): void {
  if (!supported()) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    // Some webviews expose the object but throw on use.
  }
}

/**
 * Picks a child-friendly English voice, preferring the higher-quality ones
 * where available. Voices load asynchronously, so this is resolved per call
 * rather than cached at module load.
 */
function pickVoice(): SpeechSynthesisVoice | null {
  try {
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return null;

    const preferred = ["Samantha", "Google UK English Female", "Karen", "Moira"];
    for (const name of preferred) {
      const match = voices.find((v) => v.name === name);
      if (match) return match;
    }
    return voices.find((v) => v.lang.startsWith("en")) ?? voices[0];
  } catch {
    return null;
  }
}

interface SpeakOptions {
  /** Queue after current speech instead of interrupting it. */
  queue?: boolean;
  /** 0.1-10; defaults to a deliberately slow 0.9 for young listeners. */
  rate?: number;
}

export function speak(text: string, options: SpeakOptions = {}): void {
  if (!enabled || !supported() || !text) return;

  try {
    if (!options.queue) window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate ?? 0.9;
    utterance.pitch = 1.15; // Slightly bright — reads as warm, not childish.
    utterance.volume = 1;

    const voice = pickVoice();
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    }

    window.speechSynthesis.speak(utterance);
  } catch {
    // Narration is an enhancement; never let it break gameplay.
  }
}

/**
 * Chrome populates the voice list asynchronously and fires `voiceschanged`
 * once it is ready. Calling this early means the first utterance of the
 * session already has a good voice rather than the robotic default.
 */
export function primeVoices(): void {
  if (!supported()) return;
  try {
    window.speechSynthesis.getVoices();
  } catch {
    // Ignored.
  }
}
