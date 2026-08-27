# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Build in progress.** See `PROGRESS.md` for what exists, what's left, and the
> exact next step. Read that file before writing any code.

## What this is

Puzzle Playground — an HCI course project. A browser app of puzzle mini-games
for children aged 4–12, where the *interface itself* is the deliverable:
oversized targets, saturated colour, icon-first labelling, spoken narration for
pre-readers, and no punishing fail states.

## Commands

```bash
npm run dev       # Vite dev server (default http://localhost:5173)
npm run build     # tsc -b && vite build — must pass clean before calling done
npm run lint      # oxlint
npm run preview   # serve the production build
```

There is no test runner configured. Verification is manual — see the checklist
at the end of `PROGRESS.md`.

## Product decisions already locked in

Do not relitigate these; they were agreed with the user.

- **React + Vite + TypeScript** (React 19, Vite 8, TS 6, oxlint).
- **All ages via a three-button age picker** — Little (4–6), Medium (7–9),
  Big (10–12). The choice is global and scales every game.
- **Four games**: Memory Match, Jigsaw, Shape & Colour Sorter, Pattern Sequence.
- **All four HCI features**: audio + narration, celebration + mascot,
  sticker-book progress, touch + keyboard accessibility.
- **Zero binary assets.** All art is inline SVG generated in code; all sound is
  synthesized with the Web Audio API. The app must work fully offline, and
  nothing may be fetched from a CDN. Do not add an icon library, a font CDN
  link, an animation library, or a router.

## Architecture

Four ideas hold the app together. Breaking any of them is what would turn this
into four unrelated games sharing a folder.

### 1. One difficulty table

`src/lib/difficulty.ts` maps `AgeGroup → DifficultyProfile`. Grid sizes, piece
counts, timings, snap radii and label mode all live there.

**Games must never hardcode a difficulty number.** They receive their config and
read from it. Changing what "Little" means is a one-file edit.

### 2. A game registry

`src/games/registry.ts` exports `GameDefinition[]`. The home grid and the router
both render from that array, so adding a fifth game is a new folder plus one
entry — no edits to `App.tsx` or `Home.tsx`.

### 3. A shared game contract

Every game is a component taking `{ config, onWin, onProgress }`, rendered
inside `GameShell`. The shell owns the header, sound toggle, replay, win
celebration, star award and progress writes. Game components own only their own
puzzle logic. If you find yourself writing confetti or star code inside a game,
it belongs in the shell.

### 4. Nothing is ever "wrong"

A bad move wiggles, plays a soft descending tone, and lets the child retry.
There is no game-over screen, no expiring timer, and no score that decreases.
The star floor is 1 — finishing always earns something. Preserve this when
adding features.

## Conventions that are easy to get wrong

- **Styling is CSS custom properties in `src/styles/tokens.css`.** Never
  hardcode a colour, size, radius or duration in a component. In particular,
  animation durations *must* come from `--dur-*`: those tokens collapse to `0ms`
  under `prefers-reduced-motion` and under the in-app motion toggle, and that is
  the only mechanism making reduced-motion work.
- **`--tap-min` is 64px, not the 44px WCAG floor.** Young children miss small
  targets. Don't "fix" this downward.
- **Bright hues pair with their `-ink` partner** (`--coral` / `--coral-ink`).
  Those pairs are contrast-checked. Never put white text on a bright hue.
- **All dragging uses Pointer Events with `setPointerCapture`** — one code path
  for mouse, touch and stylus. Draggables need `touch-action: none` or mobile
  scroll hijacks the drag. Do not use HTML5 drag-and-drop; it doesn't work on
  touch.
- **Every drag game also needs a keyboard path** (Tab → Enter to lift → arrows
  → Enter to drop → Escape to cancel). This is a graded requirement, not a
  nice-to-have. Focus rings are thick and visible by design; don't suppress them.
- **Audio can only start inside a user gesture.** `unlockAudio()` must be called
  from a real click before anything plays automatically.
- **`speak()` cancels in-flight speech by default.** Kids tap fast; a queue of
  stale sentences is worse than silence.
- **localStorage goes through `src/lib/storage.ts`.** It throws in Safari private
  browsing; the wrapper degrades to "no saved data" instead of crashing.
