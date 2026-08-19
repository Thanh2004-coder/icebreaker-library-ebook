import { UI } from "../../data/catalog.js";

export default function GameInstructionBlock({ display }) {
  if (!display) return null;
  const labels = UI.game || {};

  return (
    <section>
      <h2>{labels.howToPlay || "Cách chơi"}</h2>
      {display.playerModes?.length ? (
        <div className="player-mode-list">
          {display.playerModes.map((mode) => (
            <div key={mode.key} className="player-mode-block">
              <h3>{mode.label}</h3>
              {mode.instructions.length ? (
                <ol className="how-to-steps">
                  {mode.instructions.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              ) : null}
              {mode.rules.length ? (
                <ul className="player-mode-rules">
                  {mode.rules.map((rule) => (
                    <li key={rule}>{rule}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </div>
      ) : display.howToPlay.length ? (
        <ol className="how-to-steps">
          {display.howToPlay.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      ) : null}
    </section>
  );
}
