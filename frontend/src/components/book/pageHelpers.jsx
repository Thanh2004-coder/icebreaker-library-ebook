import { getScreenshotByPage } from "../../data/catalog.js";

export function pageClass(pageNumber) {
  return "book-page solo screenshot-page";
}

export function pageStyle() {
  return undefined;
}

export function gamePageStyle() {
  return undefined;
}

export function SheetBody({ page }) {
  const screenshot = getScreenshotByPage(page);

  if (!screenshot) {
    return null;
  }

  return (
      <img
          className="book-page-image"
          src={screenshot}
          alt={`Trang ${page}`}
          draggable={false}
      />
  );
}