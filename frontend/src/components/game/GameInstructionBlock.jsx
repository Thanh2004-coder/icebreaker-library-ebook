import {
  FALLBACK_INSTRUCTION_IMAGE,
  onImageError,
  resolveCatalogText,
  UI,
} from "../../data/catalog.js";

export default function GameInstructionBlock({ display }) {
  if (!display) return null;
  const labels = UI.game || {};
  const alt = resolveCatalogText(labels.instructionAlt || "Cách chơi {name}").replace(
    "{name}",
    display.name
  );

  return (
    <section>
      <h2>{labels.howToPlay || "Cách chơi"}</h2>
      {display.showInstructionImage ? (
        <img
          className="sheet-instruction"
          src={display.instructionImage}
          alt={alt}
          onError={onImageError(FALLBACK_INSTRUCTION_IMAGE)}
        />
      ) : null}
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
