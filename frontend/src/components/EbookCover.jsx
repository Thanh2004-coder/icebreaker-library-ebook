import { EBOOK, GAMES, GAME_START_PAGE, LAST_PAGE, UI } from "../data/catalog.js";

export default function EbookCover() {
  const coverUi = UI.cover || {};
  const join = coverUi.pageRangeJoin || "–";
  return (
    <article className="ebook-cover" aria-label={coverUi.ariaLabel || "Bìa ebook"}>
      <p className="eyebrow-light">{EBOOK.kicker}</p>
      <h1>{EBOOK.title}</h1>
      <p className="cover-subtitle">{EBOOK.subtitle}</p>
      <p className="cover-meta">
        {GAMES.length} {coverUi.gamesUnit || "trò chơi"} · Trang {GAME_START_PAGE}
        {join}
        {LAST_PAGE}
      </p>
    </article>
  );
}
