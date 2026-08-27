# Puzzle Playground

Four puzzle mini-games for children aged 4–12, built as an HCI course project
where the *interface itself* is the deliverable.

```bash
npm install
npm run dev      # http://localhost:5173
```

## What it is

A child picks their age group on the first screen — Little (4–6), Medium (7–9)
or Big (10–12) — and every game scales to it: how big the board is, how long
you get to look at a mistake, whether words appear next to the pictures, and
how large the whole interface is drawn.

## Features

### Four games, one difficulty ladder

Every game exists in three versions. The child never picks a difficulty — it
follows from the age group they chose, and the same ladder is applied
consistently across all four games.

| Game | Little (4–6) | Medium (7–9) | Big (10–12) |
| --- | --- | --- | --- |
| **Memory Match**<br>Turn over two cards, find the pair | 3×2 board, a long 1.5s look at a mismatch | 4×4, 1.0s, turn counter shown | 6×5 (15 pairs), 0.8s, turn counter |
| **Jigsaw**<br>Drag the pieces back into the picture | 2×2, outlines show where pieces go, generous 110px snap | 3×3, outlines, 70px snap | 6×6 (36 pieces), no outlines, tight 42px snap |
| **Shape Sorter**<br>Put each thing in the right box | Sort by **colour**, 3 boxes, 6 items | Sort by **shape**, 4 boxes, 8 items | Sort by **colour _and_ shape**, 5 boxes, 12 items |
| **Copy the Tune**<br>Watch the lights, tap them back | 4 pads, grows to 5 notes, slow playback | 4 pads, grows to 8 notes | 6 pads, grows to 10 notes, fast playback |

A fresh puzzle is generated every round — a new set of animals, a new picture,
a new pattern — so a game is never the same twice.

### Grows with the child

The age group is a single global choice that changes far more than board size:

- **Board sizes, timings and snap distances** all scale, per the table above.
- **The whole interface scales with it.** Little players get everything drawn
  15% larger; Big players get a denser layout so the larger boards fit.
- **Words appear only when they help.** The youngest group gets an icon-only
  interface; the older two get words alongside every picture.
- **Training wheels come off gradually.** The jigsaw shows faint outlines of
  where each piece belongs for the younger two groups and drops them for the
  oldest. The turn counter runs the other way — hidden from the youngest, who
  gain nothing from a number to measure themselves against, and shown to the
  two groups who can use it.
- It can be changed at any time from the chip on the home screen.

### Talks to children who cannot read yet

- **Every screen narrates itself** on arrival, and each game says what it wants
  you to do.
- **A mascot guides every screen** — a different animal friend per game — and
  **tapping it repeats the instruction**, which is how a child asks "what do I
  do again?" without needing an adult.
- **Sound carries meaning consistently**: a rising two-note blip for a correct
  move, a soft falling tone for try-again, a distinct pick-up click, and a real
  major-chord fanfare on a win.
- **The Copy the Tune pads are musical.** Each pad owns a note from a
  pentatonic scale, which has no dissonant intervals — so whatever order the
  pads come in, the result sounds like a tune rather than an alarm.
- Narration and sound effects are **separate switches**, because a classroom
  often wants one without the other.

### Celebrates, never punishes

- **There is no way to lose.** No game-over screen, no timer that expires, no
  score that decreases, and nothing that can be used up.
- **A wrong move wiggles, plays a soft falling tone, and hands the piece back.**
  In Copy the Tune a wrong tap simply replays the same pattern — the sequence
  never gets shorter and the round never ends.
- **Finishing always earns 1–3 stars.** Stars reward efficiency; the floor is
  one, because completing the puzzle *is* the achievement.
- **Winning is a moment**: a fanfare, falling confetti, a cheering friend, and
  the stars landing one at a time on a rising pitch.
- A **progress bar that only ever moves forward** shows how much of the puzzle
  is done — never a countdown.

### A sticker book that remembers

- Every completed puzzle awards **one of sixteen animal friends**, drawn from
  the ones not yet collected.
- The book shows **all sixteen slots from the first visit** — uncollected ones
  as grey silhouettes — so the child can see how many friends are still out
  there to find.
- **Best star ratings are kept per game** and only ever go up; a worse run
  never overwrites a better one.
- Everything **survives closing the browser**, and degrades to a memory-only
  session where storage is blocked (Safari private browsing) rather than
  crashing.

### Reachable by finger, mouse or keyboard

- **One drag code path** for mouse, touch and stylus, built on Pointer Events —
  and a drag keeps tracking when a finger slides outside the piece.
- **Every drag game is fully playable by keyboard**: Tab to a piece, Enter to
  pick it up, arrows to move it, Enter to drop, Escape to change your mind.
  Focus stays on the piece throughout, and each move is announced aloud and to
  screen readers.
- **The memory grid has arrow-key navigation** — one tab stop for the whole
  board rather than thirty separate ones.
- **Targets are 64px minimum**, not the 44px WCAG floor.
- **Focus rings are thick and deliberately visible**, never suppressed.
- Bright fills are always paired with a **contrast-checked dark ink partner**,
  and the sorting shapes stay distinguishable in greyscale, so no puzzle
  depends on colour vision alone.

### Settings a child can find

Sound, narration and motion each get their own toggle, sitting in the chrome of
every screen rather than behind a menu — the child who needs the sound off is
often not the one who can navigate a menu to find it.

**Reduced motion is honoured from two directions**: the operating system
setting *and* the in-app toggle, because a shared classroom machine's OS
setting is rarely the child's own choice.

## Why it is built this way

**Young children miss small targets.** Fine-motor accuracy at four is poor
enough that the 44px WCAG minimum is not enough, so the floor here is 64px —
and it scales up again for the youngest group.

**A pre-reader cannot be told anything in writing.** Every instruction
therefore travels through at least two channels, a picture and a spoken line,
and the spoken one can be replayed on demand.

**Failure states teach children to stop playing.** A four-year-old who loses
does not analyse their mistake, they disengage. So the app has no way to lose:
mistakes are soft, reversible, and cost nothing but a star at the very end.

**The keyboard path is graded work, not a courtesy.** It is built as a
first-class equivalent of dragging, with the same feedback and announcements,
rather than a degraded fallback bolted on afterwards.

**Accessibility settings belong where a child can reach them.** Anything behind
a menu is, for this audience, effectively not there at all.

## Zero assets

There are no images, no audio files, no icon library and no fonts to download.
Every animal, icon and shape is SVG generated in code; every sound is
synthesized with the Web Audio API; all narration uses the browser's own speech
synthesis. The app works completely offline and fetches nothing from a CDN.

The jigsaw is the clearest example: rather than slicing an image, every piece
is the *same* drawing viewed through a different SVG `viewBox` window — so the
cuts are exact at 2×2 and at 6×6 with no extra art.

## Commands

```bash
npm run dev       # Vite dev server
npm run build     # tsc -b && vite build
npm run lint      # oxlint
npm run preview   # serve the production build
```

There is no test runner; verification is manual. See the checklist in
`PROGRESS.md`.

## Code map

`CLAUDE.md` describes the four ideas holding the app together — the difficulty
table, the game registry, the shared game contract, and the no-fail-state rule.
Read it before changing anything structural.

```
src/lib/          difficulty table, audio, speech, storage, drag, helpers
src/art/          creatures, icons, shapes, the jigsaw picture — all SVG
src/context/      age group, settings and earned stickers
src/components/   the shared UI kit and GameShell
src/screens/      welcome, home, game, sticker book
src/games/        one folder per game, plus the registry
src/styles/       design tokens and global rules
```
