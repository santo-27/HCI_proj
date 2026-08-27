/*
 * Failure-tolerant localStorage.
 *
 * Every access is wrapped because localStorage throws outright in Safari
 * private browsing and when a quota is exceeded. A saved-progress feature is
 * never worth crashing the app over, so all failures degrade to "no saved
 * data" and the app runs fine in memory.
 *
 * Stored payloads carry a version. If the shape changes, bump STORAGE_VERSION
 * and old records are discarded instead of being read as the wrong type.
 */

const STORAGE_VERSION = 1;
const PREFIX = "puzzle-playground";

interface Envelope<T> {
  version: number;
  value: T;
}

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(`${PREFIX}:${key}`);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw) as Envelope<T>;
    if (parsed?.version !== STORAGE_VERSION) return fallback;

    return parsed.value ?? fallback;
  } catch {
    return fallback;
  }
}

export function save<T>(key: string, value: T): void {
  try {
    const envelope: Envelope<T> = { version: STORAGE_VERSION, value };
    window.localStorage.setItem(`${PREFIX}:${key}`, JSON.stringify(envelope));
  } catch {
    // Storage blocked or full. The session still works, it just won't persist.
  }
}

export function clearAll(): void {
  try {
    const doomed = Object.keys(window.localStorage).filter((k) =>
      k.startsWith(`${PREFIX}:`),
    );
    doomed.forEach((k) => window.localStorage.removeItem(k));
  } catch {
    // Nothing to do — see above.
  }
}
