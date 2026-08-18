import ReviewSection from "./ReviewSection.jsx";
import {
  FALLBACK_GAME_IMAGE,
  FALLBACK_INSTRUCTION_IMAGE,
  asLines,
  getHeroImage,
  getInstructionImage,
  howToPlaySteps,
  onImageError,
} from "../data/catalog.js";

export default function GamePage({ game }) {
  if (!game) return <p className="empty">Không tìm thấy trò chơi.</p>;

  const steps = howToPlaySteps(game);
  const preparation = asLines(game.preparation);
  const rules = asLines(game.rules);
  const purposes = game.purposes?.length ? game.purposes : game.tags || [];
  const players = game.players || (game.minPlayers != null ? `${game.minPlayers} người` : "");
  const context = game.context || (game.contexts || []).join(", ");
  const duration = game.duration || (game.durationMin != null ? `${game.durationMin} phút` : "");

  return (
    <article className="game-sheet">
      <p className="eyebrow">Trang {game.page}</p>
      <h1>{game.name}</h1>
      <img
        className="sheet-hero"
        src={getHeroImage(game)}
        alt={game.name}
        onError={onImageError(FALLBACK_GAME_IMAGE)}
      />
      <p className="card-desc">{game.description}</p>
      <ul className="meta">
        <li>👥 {players}</li>
        <li>📍 {context}</li>
        <li>⏱ {duration}</li>
      </ul>
      <div className="tag-row">
        {purposes.map((item) => (
          <span key={item} className="tag purpose">
            🎯 {item}
          </span>
        ))}
      </div>

      <ReviewSection gameId={game.id} />

      <section>
        <h2>Cách chơi</h2>
        <img
          className="sheet-instruction"
          src={getInstructionImage(game)}
          alt={`Cách chơi ${game.name}`}
          onError={onImageError(FALLBACK_INSTRUCTION_IMAGE)}
        />
        {steps.length ? (
          <ol className="how-to-steps">
            {steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        ) : null}
      </section>

      <section>
        <h2>Chuẩn bị</h2>
        {preparation.map((item) => (
          <p key={item}>{item}</p>
        ))}
      </section>

      <section>
        <h2>Quy định</h2>
        <div className="prose">
          {rules.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>
      </section>
    </article>
  );
}
