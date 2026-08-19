import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DesignSheet from "./DesignSheet.jsx";
import GameDetail from "./game/GameDetail.jsx";
import { FIRST_PAGE, LAST_PAGE, UI, clampPage, getSheet, resolveCatalogText } from "../data/catalog.js";

function SheetBody({ page }) {
  const sheet = getSheet(page);
  const readerUi = UI.reader || {};
  if (sheet.type === "design") return <DesignSheet sheet={sheet.sheet} />;
  if (sheet.type === "game") return <GameDetail game={sheet.game} />;
  return <p className="empty">{readerUi.emptyPage || "Trang trống."}</p>;
}

function isInteractive(target) {
  return Boolean(target.closest("a, button, input, textarea, select, label"));
}

function pageClass(pageNumber) {
  const sheet = getSheet(pageNumber);
  const kind = sheet.type === "design" ? "design-page" : sheet.type === "game" ? "game-page" : "empty-page";
  return `book-page solo ${kind}`;
}

export default function EbookReader({ page }) {
  const navigate = useNavigate();
  const current = clampPage(page);
  const visible = [current];
  const [focused, setFocused] = useState(false);
  const readerUi = UI.reader || {};

  const go = (next) => navigate(`/page/${clampPage(next)}`);
  const step = 1;
  const canPrev = current > FIRST_PAGE;
  const canNext = current < LAST_PAGE;

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape" && focused) {
        setFocused(false);
        return;
      }
      if (event.key === "ArrowLeft" && canPrev) navigate(`/page/${clampPage(current - step)}`);
      if (event.key === "ArrowRight" && canNext) navigate(`/page/${clampPage(current + step)}`);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [canPrev, canNext, current, step, navigate, focused]);

  useEffect(() => {
    if (!focused) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [focused]);

  const spreadClass = "book-spread single";

  const openFocus = (event) => {
    if (focused) return;
    if (isInteractive(event.target)) return;
    setFocused(true);
  };

  const spread = (
    <div className={spreadClass} onClick={(event) => event.stopPropagation()}>
      {visible.map((pageNumber, index) => (
        <div key={pageNumber} className={pageClass(pageNumber)} onClick={openFocus}>
          <SheetBody page={pageNumber} />
          <span className="page-folio folio-right">{pageNumber}</span>
        </div>
      ))}
    </div>
  );

  const ariaLabel = resolveCatalogText(readerUi.ariaLabel || "Ebook {title}");

  return (
    <section className="ebook-reader" aria-label={ariaLabel}>
      {focused ? (
        <div className="ebook-focus" onClick={() => setFocused(false)}>
          <button
            type="button"
            className="focus-arrow left"
            disabled={!canPrev}
            aria-label="Trang trước"
            onClick={(event) => {
              event.stopPropagation();
              go(current - step);
            }}
          >
            {readerUi.prevShort || "←"}
          </button>
          <div className="ebook-focus-book">{spread}</div>
          <button
            type="button"
            className="focus-arrow right"
            disabled={!canNext}
            aria-label="Trang sau"
            onClick={(event) => {
              event.stopPropagation();
              go(current + step);
            }}
          >
            {readerUi.nextShort || "→"}
          </button>
        </div>
      ) : (
        spread
      )}

      <nav className="reader-nav" aria-label={readerUi.navAriaLabel || "Lật trang"}>
        <button type="button" disabled={!canPrev} onClick={() => go(current - step)}>
          {readerUi.prev || "← Trang trước"}
        </button>
        <p>
          Trang {visible[0]}
          {visible[1] ? `–${visible[1]}` : ""} / {LAST_PAGE}
        </p>
        <button type="button" disabled={!canNext} onClick={() => go(current + step)}>
          {readerUi.next || "Trang sau →"}
        </button>
      </nav>
    </section>
  );
}
