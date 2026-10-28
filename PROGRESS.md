# Progress

Living status file for Puzzle Playground. `CLAUDE.md` points here; read it
before writing code.

## Status: feature-complete, pending hands-on verification

`npm run build` and `npm run lint` both pass clean. Every screen and all four
games are implemented. What has *not* happened yet is a human playing it — see
the checklist at the bottom, which is the real acceptance gate.

## What exists

**Foundation** (unchanged from the first build session)

| File | Role |
| --- | --- |
| `src/lib/difficulty.ts` | The difficulty table + `starsForEffort`. The single source of truth. |
| `src/lib/audio.ts` | Synthesized sound vocabulary. No audio files anywhere. |
| `src/lib/speech.ts` | Narration via SpeechSynthesis. |
| `src/lib/storage.ts` | localStorage that degrades instead of throwing. |
| `src/lib/shuffle.ts` | Fisher-Yates, `sample`, `randomInt`. |
| `src/styles/tokens.css` | Palette, `--tap-min`, `--dur-*`, age scaling, reduced motion. |
| `src/styles/global.css` | Reset, focus rings, shared keyframes, **hue slot classes**. |
| `src/art/creatures.tsx` | 16 parametric SVG animals. |

**Added since**

| File | Role |
| --- | --- |
| `src/lib/hues.ts` | `Hue` type + `hueClass()`. Components never touch a hex value. |
| `src/lib/css.ts` | `cssVars()` — the one place CSS custom properties are cast for the `style` prop. |
| `src/lib/motion.ts` | `motionReduced()` / `stagger()` for the few *decorative* delays driven from JS rather than CSS. |
| `src/lib/useDragDrop.ts` | Pointer + keyboard dragging, shared by Jigsaw and Sorter. |
| `src/art/icons.tsx` | The whole icon set, inline. |
| `src/art/shapes.tsx` | Five sorting shapes. |
| `src/art/puzzle.tsx` | The jigsaw picture as SVG shapes on a 100x100 grid. |
| `src/context/profile.ts` | Context object, types, `useProfile()`. |
| `src/context/ProfileProvider.tsx` | Age, settings and progress; mirrors them to storage, `<html>`, audio and speech. |
| `src/games/registry.tsx` | `GAMES` and the game contract. |
| `src/components/*` | BigButton, IconButton, Mascot, StarRow, Celebration, StickerGrid, SettingsBar, GameShell. |
| `src/screens/*` | Welcome, Home, GameScreen, StickerBookScreen. |
| `src/games/*/` | MemoryMatch, Jigsaw, Sorter, Sequence. |

**Voice commands**

| File | Role |
| --- | --- |
| `src/lib/voiceCommands.ts` | Keyword parser: transcript → `VoiceCommand`. Game names come from the registry (`title` + `voiceWords`). |
| `src/components/VoiceCommandButton.tsx` | Task-bar mic. Listens, parses, hands the command to `App.tsx`, which does the navigation. Hidden where SpeechRecognition is missing. |

A new game needs a `voiceWords` list in its registry entry; nothing else.
Chrome's recogniser sends audio to Google, so voice commands (like Read Aloud)
do not work offline there — every other feature still does.

## Deviations from CLAUDE.md worth knowing

- **`registry.tsx`, not `registry.ts`.** Its `render` entries return JSX, which
  `.ts` cannot hold. The import path (`./registry`) is unchanged, so the
  architecture described in CLAUDE.md is intact.
- **CSS is grouped per area, not per component**: `components/components.css`,
  `screens/screens.css`, and one file per game folder. Tokens-only rule
  unchanged.
- `public/icons.svg` (Vite template debris, unreferenced) was deleted, and
  `public/favicon.svg` replaced with a project one.

## Notes for whoever works on this next

- **Two JS-driven timing categories, do not confuse them.** Gameplay timings
  (`peekMs`, `litMs`, `gapMs`) come from the difficulty table and must never be
  collapsed for reduced motion — the game stops working. Decorative delays (the
  star stagger) go through `stagger()` in `lib/motion.ts`.
- **`var()` in SVG presentation attributes is not reliable.** `art/puzzle.tsx`
  and `art/shapes.tsx` apply token-driven colours through `style`, not through
  the `fill` attribute. Keep it that way.
- **`aria-disabled`, not `disabled`, on matched memory cards and on inert
  sequence pads.** A real `disabled` drops the element out of the tab order and
  strands the keyboard cursor mid-board.
- **`repeat()` will not take a `calc()` for its count.** Grid column counts that
  are computed (the sequence pads) are worked out in JS and passed as a custom
  property.
- `useDragDrop` hands the live drag offset to CSS as `--drag-x` / `--drag-y`
  rather than a finished `transform`, so each game composes it with its own
  lift. Don't turn it back into a transform.

## Verification checklist — none of this has been done yet

Run `npm run dev` and:

- [ ] Pick each age group in turn. Board sizes, timings and the overall UI
      scale should all change; `<html data-age>` should follow.
- [ ] Play all four games to a win. Expect fanfare, confetti, staggered stars,
      and a new sticker each time.
- [ ] Sticker book fills as you win, and survives a reload.
- [ ] **Keyboard only.** Complete Jigsaw and Sorter with Tab / Enter / arrows /
      Escape. Focus ring visible at every stop. Arrow-key across the memory grid.
- [ ] Sound and voice toggles independently silence effects and narration.
- [ ] Motion toggle **and** OS reduce-motion each kill all animation.
- [ ] Make deliberate wrong moves everywhere: wiggle, soft tone, retry. No fail
      state, no score decrease, nothing consumed.
- [ ] Voice: tap the task-bar mic and say "open jigsaw", "sticker book",
      "go home", "sound off", "I'm big", "help", and some nonsense.
- [ ] Touch, at phone width: drag in Jigsaw and Sorter without the page
      scrolling underneath.
