import { useNavigate } from "react-router-dom";
import { UI, resolveCatalogText } from "../data/catalog.js";

export default function SearchResults({ games, onClear }) {
  const navigate = useNavigate();
  const resultsUi = UI.searchResults || {};

  const foundText = resolveCatalogText(
      resultsUi.found || "Tìm thấy {count} trò chơi"
  ).replace("{count}", String(games.length));

  return (
      <section className="search-results" aria-live="polite">
        <div className="result-bar">
          <p>{foundText}</p>

          <button
              type="button"
              className="text-btn"
              onClick={onClear}
          >
            {resultsUi.clear || "Xóa bộ lọc"}
          </button>
        </div>

        {games.length === 0 ? (
            <p className="empty">
              {resultsUi.empty || "Không có trò chơi khớp."}
            </p>
        ) : (
            <ul className="result-list">
              {games.map((game) => (
                  <li key={game.id} className="result-card">
                    <div>
                      <h2>{game.name}</h2>

                      <p className="result-page">
                        {resolveCatalogText(
                            resultsUi.pageLabel || "Trang {page}"
                        ).replace("{page}", String(game.page))}
                      </p>

                      <p className="card-desc">
                        {game.description || ""}
                      </p>
                    </div>

                    <button
                        type="button"
                        className="open-page-btn"
                        onClick={() => navigate(`/page/${game.page}`)}
                    >
                      {resolveCatalogText(
                          resultsUi.openPage || "Xem trang {page}"
                      ).replace("{page}", String(game.page))}
                    </button>
                  </li>
              ))}
            </ul>
        )}
      </section>
  );
}