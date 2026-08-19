import DesignSheet from "../DesignSheet.jsx";
import GameDetail from "../game/GameDetail.jsx";
import { getGamePageBackground, getSheet, UI } from "../../data/catalog.js";

export function pageClass(pageNumber) {
  const sheet = getSheet(pageNumber);
  const kind = sheet.type === "design" ? "design-page" : sheet.type === "game" ? "game-page" : "empty-page";
  return `book-page solo ${kind}`;
}

export function pageStyle(pageNumber) {
  const sheet = getSheet(pageNumber);
  if (sheet.type !== "game") return undefined;
  const background = getGamePageBackground(sheet.game);
  return { "--game-page-background": `url("${background}")` };
}

export function gamePageStyle(game) {
  if (!game) return undefined;
  const background = getGamePageBackground(game);
  return { "--game-page-background": `url("${background}")` };
}

export function SheetBody({ page }) {
  const sheet = getSheet(page);
  const readerUi = UI.reader || {};
  if (sheet.type === "design") return <DesignSheet sheet={sheet.sheet} />;
  if (sheet.type === "game") return <GameDetail game={sheet.game} />;
  return <p className="empty">{readerUi.emptyPage || "Trang trống."}</p>;
}
