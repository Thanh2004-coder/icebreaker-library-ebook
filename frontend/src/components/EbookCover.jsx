import { EBOOK, GAMES, GAME_START_PAGE, LAST_PAGE } from "../data/catalog.js";

export default function EbookCover() {
  return (
    <article className="ebook-cover" aria-label="Bìa ebook">
      <p className="eyebrow-light">{EBOOK.kicker}</p>
      <h1>{EBOOK.title}</h1>
      <p className="cover-subtitle">{EBOOK.subtitle}</p>
      <p className="cover-meta">
        {GAMES.length} trò chơi · Trang {GAME_START_PAGE}–{LAST_PAGE}
      </p>
    </article>
  );
}
