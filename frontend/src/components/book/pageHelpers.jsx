import DesignSheet from "../DesignSheet.jsx";
import GameDetail from "../game/GameDetail.jsx";
import { UI, getSheet } from "../../data/catalog.js";

export function pageClass(pageNumber) {
  const sheet = getSheet(pageNumber);
  const kind = sheet.type === "design" ? "design-page" : sheet.type === "game" ? "game-page" : "empty-page";
  return `book-page solo ${kind}`;
}

export function SheetBody({ page }) {
  const sheet = getSheet(page);
  const readerUi = UI.reader || {};
  if (sheet.type === "design") return <DesignSheet sheet={sheet.sheet} />;
  if (sheet.type === "game") return <GameDetail game={sheet.game} />;
  return <p className="empty">{readerUi.emptyPage || "Trang trống."}</p>;
}

export function BookPageShell({ pageNumber, className = "", children }) {
  return (
    <div className={`${pageClass(pageNumber)} ${className}`.trim()}>
      {children ?? <SheetBody page={pageNumber} />}
      <span className="page-folio folio-right">{pageNumber}</span>
    </div>
  );
}
