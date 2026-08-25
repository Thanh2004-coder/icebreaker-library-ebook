import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FitPageStage from "./book/FitPageStage.jsx";
import { SheetBody, pageClass } from "./book/pageHelpers.jsx";
import {
    FIRST_PAGE,
    LAST_PAGE,
    UI,
    clampPage,
    resolveCatalogText,
} from "../data/catalog.js";

function isInteractive(target) {
    return Boolean(
        target?.closest?.(
            "a, button, input, textarea, select, label"
        )
    );
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

            setFocused(false);
            navigate(`/page/${next}`);
        },
        [current, navigate]
    );

    /* =========================================================
       KEYBOARD
       ========================================================= */

    useEffect(() => {
        const onKeyDown = (event) => {
            if (event.key === "Escape") {
                if (focused) {
                    event.preventDefault();
                    setFocused(false);
                }
                return;
            }

            if (!focused) return;

            if (
                event.key === "ArrowLeft" &&
                canPrev
            ) {
                event.preventDefault();
                requestGo(current - step);
            }

            if (
                event.key === "ArrowRight" &&
                canNext
            ) {
                event.preventDefault();
                requestGo(current + step);
            }
        };

        window.addEventListener(
            "keydown",
            onKeyDown
        );

        return () => {
            window.removeEventListener(
                "keydown",
                onKeyDown
            );
        };
    }, [
        focused,
        current,
        canPrev,
        canNext,
        requestGo,
    ]);

    /* =========================================================
       KHÓA SCROLL KHI FULLSCREEN
       ========================================================= */

    useEffect(() => {
        if (!focused) return undefined;

        const previousOverflow =
            document.body.style.overflow;

        const previousTouchAction =
            document.body.style.touchAction;

        document.body.style.overflow = "hidden";
        document.body.style.touchAction = "none";

        return () => {
            document.body.style.overflow =
                previousOverflow;

            document.body.style.touchAction =
                previousTouchAction;
        };
    }, [focused]);

    /* =========================================================
       TỰ ĐỘNG SCROLL ĐẾN PAGE MỚI
       ========================================================= */

    useEffect(() => {
        if (focused) return;

        const timer = requestAnimationFrame(() => {
            const pageElement = document.querySelector(
                ".ebook-reader--screenshots .screenshot-only-page"
            );

            if (!pageElement) return;

            pageElement.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        });

        return () => cancelAnimationFrame(timer);
    }, [current, focused]);

    /* =========================================================
       MỞ FULLSCREEN
       ========================================================= */

    const openFocus = (event) => {
        if (focused) return;

        if (isInteractive(event.target)) {
            return;
        }

        setFocused(true);
    };

    /* =========================================================
       PAGE CONTENT
       ========================================================= */

    const pageLeaf = (
        <div
            className="book-spread single"
            onClick={(event) => {
                event.stopPropagation();
            }}
        >
            <div
                className={`${pageClass(current)} screenshot-only-page`}
                onClick={openFocus}
            >
                <SheetBody page={current} />

                <span className="page-folio folio-right">
                    {current}
                </span>
            </div>
        </div>
    );

    const ariaLabel = resolveCatalogText(
        readerUi.ariaLabel || "Ebook {title}"
    );

    /* =========================================================
       FULLSCREEN
       KHÔNG DÙNG FitPageStage Ở ĐÂY
       ========================================================= */

    const focusStage = focused ? (
        <div
            className="ebook-focus ebook-focus--screenshots"
            role="dialog"
            aria-modal="true"
            aria-label={`Xem trang ${current}`}
            onClick={() => setFocused(false)}
        >
            {/* NÚT ĐÓNG */}
            <button
                type="button"
                className="focus-close"
                aria-label="Đóng chế độ phóng to"
                onClick={(event) => {
                    event.stopPropagation();
                    setFocused(false);
                }}
            >
                ×
            </button>

            {/* TRANG TRƯỚC */}
            <button
                type="button"
                className="focus-arrow left"
                disabled={!canPrev}
                aria-label="Trang trước"
                onClick={(event) => {
                    event.stopPropagation();

                    if (canPrev) {
                        requestGo(
                            current - step
                        );
                    }
                }}
            >
                {readerUi.prevShort || "←"}
            </button>

            {/* ẢNH */}
            <div
                className="screenshot-focus-book"
                onClick={(event) => {
                    event.stopPropagation();
                }}
            >
                <div className="screenshot-focus-page">
                    <SheetBody page={current} />

                    <span className="focus-page-number">
                        {current} / {LAST_PAGE}
                    </span>
                </div>
            </div>

            {/* TRANG SAU */}
            <button
                type="button"
                className="focus-arrow right"
                disabled={!canNext}
                aria-label="Trang sau"
                onClick={(event) => {
                    event.stopPropagation();

                    if (canNext) {
                        requestGo(
                            current + step
                        );
                    }
                }}
            >
                {readerUi.nextShort || "→"}
            </button>
        </div>
    ) : null;

    /* =========================================================
       NORMAL VIEW
       ========================================================= */

    return (
        <section
            className="ebook-reader ebook-reader--screenshots"
            aria-label={ariaLabel}
        >
            {!focused && (
                <FitPageStage
                    pageKey={current}
                    key={`page-${current}`}
                >
                    {pageLeaf}
                </FitPageStage>
            )}

            {focusStage}

            <nav
                className="reader-nav"
                aria-label={
                    readerUi.navAriaLabel ||
                    "Lật trang"
                }
            >
                <button
                    type="button"
                    disabled={!canPrev}
                    onClick={() =>
                        requestGo(
                            current - step
                        )
                    }
                >
                    {readerUi.prev ||
                        "← Trang trước"}
                </button>

                <p>
                    Trang {current} / {LAST_PAGE}
                </p>

                <button
                    type="button"
                    disabled={!canNext}
                    onClick={() =>
                        requestGo(
                            current + step
                        )
                    }
                >
                    {readerUi.next ||
                        "Trang sau →"}
                </button>
            </nav>
        </section>
    );
}
