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

  return (
    <article className="game-sheet">
      <p className="eyebrow">
        {labels.pagePrefix || "Trang"} {display.page}
      </p>
      <h1>{display.name}</h1>
      <GameHeroImage game={game} />
      {display.description ? <p className="card-desc">{display.description}</p> : null}
      <GameMeta display={display} />
      <GameTags tags={display.purposes} />

      <GameInstructionBlock display={display} />

      {display.preparation.length ? (
        <section>
          <h2>{labels.preparation || "Chuẩn bị"}</h2>
          {display.preparation.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </section>
      ) : null}

      {display.rules.length ? (
        <section>
          <h2>{labels.rules || "Quy định"}</h2>
          <div className="prose">
            {display.rules.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
