import DesignSheet from "../DesignSheet.jsx";
import GameDetail from "../game/GameDetail.jsx";
import WebSheet from "../WebSheet.jsx";
import { getGamePageBackground, getSheet, UI } from "../../data/catalog.js";

function pageKind(type) {
  if (type === "design") return "design-page";
  if (type === "game") return "game-page";
  if (type === "web") return "web-page";
  return "empty-page";
}

export function pageClass(pageNumber) {
  const sheet = getSheet(pageNumber);
  return `book-page solo ${pageKind(sheet.type)}`;
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
  if (sheet.type === "web") return <WebSheet web={sheet.web} />;
  return <p className="empty">{readerUi.emptyPage || "Trang trống."}</p>;
}
