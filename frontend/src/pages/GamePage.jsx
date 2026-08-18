import { Link, Navigate, useParams } from "react-router-dom";
import Header from "../components/Header.jsx";
import GamePageView from "../components/GamePage.jsx";
import { getGameById } from "../data/catalog.js";

export default function GamePage() {
  const { id } = useParams();
  const game = getGameById(id);

  if (!game) return <Navigate to="/page/1" replace />;

  return (
    <div className="page">
      <Header />
      <main className="layout">
        <Link to={`/page/${game.page}`} className="back">
          ← Mở trang {game.page} trong ebook
        </Link>
        <div className="book-spread single">
          <div className="book-page solo">
            <GamePageView game={game} />
            <span className="page-folio folio-right">{game.page}</span>
          </div>
        </div>
      </main>
    </div>
  );
}
