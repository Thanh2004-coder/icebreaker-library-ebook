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
            <div className="search-results__header">
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
                    {games.map((game) => {
                        const gamePage = Number(game.id) + 4;

                        return (
                            <li key={game.id} className="result-card">
                                <div className="result-card__content">
                                    <h2>{game.name}</h2>

                                    <p className="result-page">
                                        Trang {gamePage}
                                    </p>

                                    <p className="card-desc">
                                        {game.description || ""}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className="open-page-btn"
                                    onClick={() =>
                                        navigate(`/page/${gamePage}`)
                                    }
                                >
                                    Xem trang {gamePage}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
}