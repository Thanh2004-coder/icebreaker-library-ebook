import { UI, getGameDisplay } from "../../data/catalog.js";
import GameHeroImage from "./GameHeroImage.jsx";
import GameInstructionBlock from "./GameInstructionBlock.jsx";
import GameMeta from "./GameMeta.jsx";
import GameTags from "./GameTags.jsx";

export default function GameDetail({ game }) {
  const labels = UI.game || {};
  const display = getGameDisplay(game);

  if (!display) {
    return <p className="empty">{labels.notFound || "Không tìm thấy trò chơi."}</p>;
  }

  const gameNo = String(display.id).padStart(2, "0");

  return (
    <article className="game-sheet">
      <p className="eyebrow game-serial">{gameNo} - PICK YOUR GAME</p>
      <p className="sheet-page-label">
        {labels.pagePrefix || "Trang"} {display.page}
      </p>
      <h1 className="game-title">{display.name}</h1>
      <GameHeroImage game={game} />
      {display.description ? <p className="card-desc">{display.description}</p> : null}
      <GameMeta display={display} />
      <GameTags tags={display.purposes} />

      <div className="game-grid">
        <div className="game-panel">
          <GameInstructionBlock display={display} />
        </div>

        {display.preparation.length ? (
          <section className="game-panel">
            <h2>{labels.preparation || "Chuẩn bị"}</h2>
            {display.preparation.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </section>
        ) : null}

        {display.rules.length ? (
          <section className="game-panel hint-panel">
            <h2>Gợi ý</h2>
            <div className="prose">
              {display.rules.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </article>
  );
}
