import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SheetBody, pageClass } from "./book/pageHelpers.jsx";
import { FIRST_PAGE, LAST_PAGE, UI, clampPage, resolveCatalogText } from "../data/catalog.js";

function isInteractive(target) {
  return Boolean(target.closest("a, button, input, textarea, select, label"));
}

export default function EbookReader({ page }) {
  const navigate = useNavigate();
  const current = clampPage(page);
  const [focused, setFocused] = useState(false);
  const readerUi = UI.reader || {};

  const step = 1;
  const canPrev = current > FIRST_PAGE;
  const canNext = current < LAST_PAGE;

  const requestGo = useCallback(
    (target) => {
      const next = clampPage(target);
      if (next === current) return;
      navigate(`/page/${next}`);
    },
    [current, navigate]
  );

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape" && focused) {
        setFocused(false);
        return;
      }
      if (event.key === "ArrowLeft" && current > FIRST_PAGE) requestGo(current - step);
      if (event.key === "ArrowRight" && current < LAST_PAGE) requestGo(current + step);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, focused, requestGo, step]);

  useEffect(() => {
    if (!focused) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [focused]);

  const openFocus = (event) => {
    if (focused) return;
    if (isInteractive(event.target)) return;
    setFocused(true);
  };

  const spread = (
    <div className="book-spread single" onClick={(event) => event.stopPropagation()}>
      <div className={pageClass(current)} onClick={openFocus}>
        <SheetBody page={current} />
        <span className="page-folio folio-right">{current}</span>
      </div>
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
              requestGo(current - step);
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
              requestGo(current + step);
            }}
          >
            {readerUi.nextShort || "→"}
          </button>
        </div>
      ) : (
        spread
      )}

      <nav className="reader-nav" aria-label={readerUi.navAriaLabel || "Lật trang"}>
        <button type="button" disabled={!canPrev} onClick={() => requestGo(current - step)}>
          {readerUi.prev || "← Trang trước"}
        </button>
        <p>
          Trang {current} / {LAST_PAGE}
        </p>
        <button type="button" disabled={!canNext} onClick={() => requestGo(current + step)}>
          {readerUi.next || "Trang sau →"}
        </button>
      </nav>
    </section>
  );
}
