import { useNavigate } from "react-router-dom";
import { EBOOK, gamesByPage } from "../data/catalog.js";

export default function TableOfContents() {
  const navigate = useNavigate();
  const games = gamesByPage();

  return (
    <article className="toc-page">
      <p className="eyebrow">Mục lục</p>
      <h1>{EBOOK.title}</h1>
      <ul className="toc-list">
        {games.map((game) => (
          <li key={game.id}>
            <button type="button" className="toc-row" onClick={() => navigate(`/page/${game.page}`)}>
              <span className="toc-name">{game.name}</span>
              <span className="toc-dots" aria-hidden="true" />
              <span className="toc-page">{game.page}</span>
            </button>
          </li>
        ))}
      </ul>
    </article>
  );
}
