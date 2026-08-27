/*
 * The game chooser.
 *
 * The grid renders straight from the registry, so it never needs editing when
 * a game is added. Each tile is a large picture first; the words underneath
 * appear only for the age groups whose difficulty profile asks for them, which
 * is how the same screen serves a four-year-old and a twelve-year-old.
 */

import type { GameId } from "../lib/difficulty";
import { AGE_GROUP_META } from "../lib/difficulty";
import { GAMES } from "../games/registry";
import { useProfile } from "../context/profile";
import { hueClass } from "../lib/hues";
import { StarRow } from "../components/StarRow";
import { SettingsBar } from "../components/SettingsBar";
import { IconSticker } from "../art/icons";
import { playTap, unlockAudio } from "../lib/audio";
import { speak } from "../lib/speech";
import "./screens.css";

interface HomeProps {
  onPlay: (id: GameId) => void;
  onStickers: () => void;
  onChangeAge: () => void;
}

export function Home({ onPlay, onStickers, onChangeAge }: HomeProps) {
  const { profile, progress, stickers, age } = useProfile();
  const withWords = profile.labelMode === "icon-and-text";
  const meta = age ? AGE_GROUP_META[age] : null;

  return (
    <div className="screen home">
      <header className="home__bar">
        <h1 className="home__title">Puzzle Playground</h1>
        <SettingsBar />
      </header>

      <ul className="home__grid">
        {GAMES.map((game) => {
          const best = progress[game.id].bestStars;
          return (
            <li key={game.id}>
              <button
                type="button"
                className={`tile ${hueClass(game.hue)}`}
                onClick={() => {
                  unlockAudio();
                  playTap();
                  onPlay(game.id);
                }}
                // The tile is a picture for pre-readers, so the full name and
                // its best score are spelled out for assistive tech.
                aria-label={
                  best !== 0
                    ? `${game.title}. Best: ${best} of 3 stars.`
                    : `${game.title}. Not played yet.`
                }
                onFocus={() => speak(game.title)}
              >
                <span className="tile__art">
                  <game.Icon size="58%" />
                </span>
                <span className="tile__name">{game.title}</span>
                {withWords && <span className="tile__blurb">{game.blurb}</span>}
                {best !== 0 && (
                  <span className="tile__stars">
                    <StarRow stars={best} size={24} />
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <footer className="home__footer">
        <button type="button" className="chip chip--book" onClick={onStickers}>
          <IconSticker size={30} />
          <span>Sticker book</span>
          <span className="chip__count">{stickers.length} / 16</span>
        </button>

        {meta && (
          <button
            type="button"
            className="chip"
            onClick={onChangeAge}
            aria-label={`Playing as ${meta.label}, ages ${meta.ages}. Tap to change.`}
          >
            <span aria-hidden="true">{meta.emoji}</span>
            <span>{meta.label}</span>
          </button>
        )}
      </footer>
    </div>
  );
}
