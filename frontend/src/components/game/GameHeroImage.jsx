import {
  FALLBACK_GAME_IMAGE,
  getHeroImage,
  onImageError,
} from "../../data/catalog.js";

export default function GameHeroImage({ game, className = "sheet-hero" }) {
  if (!game) return null;
  return (
    <img
      className={className}
      src={getHeroImage(game)}
      alt={game.name || ""}
      onError={onImageError(FALLBACK_GAME_IMAGE)}
    />
  );
}
