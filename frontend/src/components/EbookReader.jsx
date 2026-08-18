import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import EbookCover from "./EbookCover.jsx";
import TableOfContents from "./TableOfContents.jsx";
import GamePage from "./GamePage.jsx";
import { EBOOK, LAST_PAGE, clampPage, getSheet, isCoverPage, spreadPages } from "../data/catalog.js";

function useTwoPage() {
  const [twoPage, setTwoPage] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(min-width: 900px)").matches : true
  );

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 900px)");
    const onChange = () => setTwoPage(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return twoPage;
}

function FrontMatter({ title, body }) {
  const lines = Array.isArray(body) ? body : [body];
  return (
    <article className="front-matter">
      <p className="eyebrow">{EBOOK.title}</p>
      <h1>{title}</h1>
      {lines.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </article>
  );
}

function SheetBody({ page }) {
  const sheet = getSheet(page);
  if (sheet.type === "cover") return <EbookCover />;
  if (sheet.type === "toc") return <TableOfContents />;
  if (sheet.type === "text") return <FrontMatter title={sheet.title} body={sheet.body} />;
  if (sheet.type === "game") return <GamePage game={sheet.game} />;
  return <p className="empty">Trang trống.</p>;
}

function isInteractive(target) {
  return Boolean(target.closest("a, button, input, textarea, select, label"));
}

export default function EbookReader({ page }) {
  const navigate = useNavigate();
  const twoPage = useTwoPage();
  const current = clampPage(page);
  const visible = useMemo(() => spreadPages(current, twoPage), [current, twoPage]);
  const [focused, setFocused] = useState(false);

  const go = (next) => navigate(`/page/${clampPage(next)}`);
  const coverOnly = twoPage && isCoverPage(current);
  const step = twoPage && !coverOnly ? 2 : 1;
  const canPrev = current > 1;
  const canNext = (twoPage && !coverOnly ? visible[visible.length - 1] : current) < LAST_PAGE;

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

  const spreadClass = coverOnly ? "book-spread cover-only" : visible.length === 2 ? "book-spread" : "book-spread single";

  const openFocus = (event) => {
    if (focused) return;
    if (isInteractive(event.target)) return;
    setFocused(true);
  };

  const spread = (
    <div className={spreadClass} onClick={(event) => event.stopPropagation()}>
      {visible.map((pageNumber, index) => (
        <div
          key={pageNumber}
          className={`book-page ${visible.length === 1 ? "solo" : index === 0 ? "left" : "right"}`}
          onClick={openFocus}
        >
          <SheetBody page={pageNumber} />
          <span className={`page-folio ${index === 0 ? "folio-left" : "folio-right"}`}>{pageNumber}</span>
        </div>
      ))}
    </div>
  );

  return (
    <section className="ebook-reader" aria-label="Ebook Game Warm-up">
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
            ←
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
            →
          </button>
        </div>
      ) : (
        spread
      )}

      <nav className="reader-nav" aria-label="Lật trang">
        <button type="button" disabled={!canPrev} onClick={() => go(current - step)}>
          ← Trang trước
        </button>
        <p>
          Trang {visible[0]}
          {visible[1] ? `–${visible[1]}` : ""} / {LAST_PAGE}
        </p>
        <button type="button" disabled={!canNext} onClick={() => go(current + step)}>
          Trang sau →
        </button>
      </nav>
    </section>
  );
}
