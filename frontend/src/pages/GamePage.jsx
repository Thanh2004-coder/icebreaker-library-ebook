import { Link, Navigate, useParams } from "react-router-dom";
import Header from "../components/Header.jsx";
import GameDetail from "../components/game/GameDetail.jsx";
import { UI, getGameById, resolveCatalogText } from "../data/catalog.js";

export default function GamePage() {
  const { id } = useParams();
  const game = getGameById(id);
  const routeUi = UI.gameRoute || {};

  if (!game) return <Navigate to="/page/1" replace />;

  return (
    <div className="page">
      <Header />
      <main className="layout">
        <Link to={`/page/${game.page}`} className="back">
          {resolveCatalogText(routeUi.back || "← Mở trang {page} trong ebook").replace(
            "{page}",
            String(game.page)
          )}
        </Link>
        <section className="ebook-reader ebook-reader-standalone">
          <div className="book-spread single">
            <div className="book-page solo game-page">
              <GameDetail game={game} />
              <span className="page-folio folio-right">{game.page}</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
