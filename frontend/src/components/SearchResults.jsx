import { useNavigate } from "react-router-dom";

export default function SearchResults({ games, total, onClear }) {
  const navigate = useNavigate();
  const pages = games.map((game) => game.page).filter((page) => page != null && page !== "");

  return (
    <section className="search-results" aria-live="polite">
      <div className="result-bar">
        <p>
          Tìm thấy {total} trò chơi
          {pages.length ? ` ở trang ${pages.join(", ")}` : ""}
        </p>
        <button type="button" className="text-btn" onClick={onClear}>
          Xóa bộ lọc
        </button>
      </div>
      {games.length === 0 ? (
        <p className="empty">Không có trò chơi khớp. Thử nới bộ lọc hoặc xóa từ khóa.</p>
      ) : (
        <ul className="result-list">
          {games.map((game) => (
            <li key={game.id} className="result-card">
              <div>
                <h2>{game.name}</h2>
                <p className="result-page">Trang {game.page}</p>
                <p className="card-desc">{game.description}</p>
              </div>
              <button type="button" className="open-page-btn" onClick={() => navigate(`/page/${game.page}`)}>
                Xem trang {game.page}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
