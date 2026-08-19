import { UI } from "../../data/catalog.js";

export default function GameInstructionBlock({ display }) {
  if (!display) return null;
  const labels = UI.game || {};

  return (
    <section>
      <h2>{labels.howToPlay || "Cách chơi"}</h2>
      {display.howToPlay.length ? (
        <ol className="how-to-steps">
          {display.howToPlay.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      ) : null}
    </section>
  );
}
