/*
 * Sound effects synthesized at runtime with the Web Audio API.
 *
 * There are no audio files in this project. Every sound is built from
 * oscillators and gain envelopes, which keeps the app fully offline, avoids
 * licensing entirely, and lets pitch carry meaning (the Pattern game gives
 * each pad its own note, and the win fanfare is a real chord).
 *
 * Browsers refuse to start an AudioContext outside a user gesture, so the
 * context is created lazily on the first sound and resumed if suspended.
 */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted = false;

function ensureContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  try {
    if (!ctx) {
      ctx = new AudioContext();
      master = ctx.createGain();
      master.gain.value = 0.32;
      master.connect(ctx.destination);
    }
    // Browsers suspend the context if it was built before a real gesture, and
    // again when a tab is backgrounded. Resuming is cheap and idempotent.
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

export function setMuted(next: boolean): void {
  muted = next;
  if (master && ctx) {
    master.gain.setTargetAtTime(next ? 0 : 0.32, ctx.currentTime, 0.02);
  }
}

export function isMuted(): boolean {
  return muted;
}

/** Warms up the audio context. Call from a real click before any auto sounds. */
export function unlockAudio(): void {
  ensureContext();
}

interface ToneOptions {
  freq: number;
  duration?: number;
  type?: OscillatorType;
  delay?: number;
  gain?: number;
  /** Glide to this frequency across the note. Used for the retry "aww". */
  slideTo?: number;
}

function tone({
  freq,
  duration = 0.18,
  type = "sine",
  delay = 0,
  gain = 1,
  slideTo,
}: ToneOptions): void {
  const audio = ensureContext();
  if (!audio || !master || muted) return;

  const start = audio.currentTime + delay;
  const osc = audio.createOscillator();
  const env = audio.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (slideTo !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(slideTo, start + duration);
  }

  // Short attack, exponential decay. Ramping to an audible-but-tiny value
  // rather than 0 avoids the click that exponential ramps to zero produce.
  env.gain.setValueAtTime(0.0001, start);
  env.gain.exponentialRampToValueAtTime(gain, start + 0.012);
  env.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  osc.connect(env);
  env.connect(master);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

/* ---- The app's sound vocabulary --------------------------------------
 * Kept small and consistent so sounds stay learnable: rising = good,
 * falling = try again, and every tap gets the same soft confirmation.
 */

/** Soft confirmation for any tap or card flip. */
export function playTap(): void {
  tone({ freq: 620, duration: 0.11, type: "triangle", gain: 0.55 });
}

/** Rising two-note blip: a pair matched, a piece snapped, a bin accepted. */
export function playCorrect(): void {
  tone({ freq: 660, duration: 0.13, type: "triangle" });
  tone({ freq: 990, duration: 0.2, type: "triangle", delay: 0.09 });
}

/** Gentle falling tone. Never harsh — a wrong move is not a failure here. */
export function playRetry(): void {
  tone({
    freq: 320,
    slideTo: 210,
    duration: 0.3,
    type: "sine",
    gain: 0.7,
  });
}

/** Picking a piece up in a drag game. */
export function playPickUp(): void {
  tone({ freq: 440, duration: 0.09, type: "square", gain: 0.28 });
}

/** Major arpeggio then a sustained triad — the end-of-game celebration. */
export function playFanfare(): void {
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
  notes.forEach((freq, i) => {
    tone({ freq, duration: 0.3, type: "triangle", delay: i * 0.11 });
  });
  [523.25, 659.25, 783.99].forEach((freq) => {
    tone({ freq, duration: 0.9, type: "sine", delay: 0.46, gain: 0.5 });
  });
}

/** One star landing in the results row. Pitch rises with each star. */
export function playStar(index: number): void {
  tone({
    freq: 700 + index * 220,
    duration: 0.26,
    type: "triangle",
    delay: index * 0.16,
  });
}

/**
 * Pentatonic pad note for Pattern Sequence. A pentatonic scale has no
 * dissonant intervals, so any order of pads still sounds musical.
 */
const PAD_SCALE = [392, 440, 494, 587, 659, 784]; // G4 A4 B4 D5 E5 G5

export function playPad(index: number, duration = 0.42): void {
  tone({
    freq: PAD_SCALE[index % PAD_SCALE.length],
    duration,
    type: "sine",
    gain: 0.9,
  });
}
