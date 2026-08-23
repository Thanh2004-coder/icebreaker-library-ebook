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

/**
 * EbookReader
 *
 * Every ebook page is rendered as a screenshot only.
 *
 * Page mapping:
 * 1  -> screenshot 1
 * 2  -> screenshot 2
 * ...
 * 33 -> screenshot 33
 */

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

    /**
     * Navigate to another page.
     */
    const requestGo = useCallback(
        (target) => {
            const next = clampPage(target);

            if (next === current) {
                return;
            }

            navigate(`/page/${next}`);
        },
        [current, navigate]
    );

    /**
     * Keyboard navigation.
     */
    useEffect(() => {
        const onKey = (event) => {
            /**
             * ESC:
             * close focus mode.
             */
            if (event.key === "Escape" && focused) {
                event.preventDefault();
                setFocused(false);
                return;
            }

            /**
             * Left arrow:
             * previous page.
             */
            if (
                event.key === "ArrowLeft" &&
                current > FIRST_PAGE
            ) {
                event.preventDefault();
                requestGo(current - step);
                return;
            }

            /**
             * Right arrow:
             * next page.
             */
            if (
                event.key === "ArrowRight" &&
                current < LAST_PAGE
            ) {
                event.preventDefault();
                requestGo(current + step);
            }
        };

        window.addEventListener("keydown", onKey);

        return () => {
            window.removeEventListener("keydown", onKey);
        };
    }, [
        current,
        focused,
        requestGo,
    ]);

    /**
     * Prevent background scrolling
     * while focus mode is open.
     */
    useEffect(() => {
        if (!focused) {
            return undefined;
        }

        const previousBodyOverflow =
            document.body.style.overflow;

        const previousHtmlOverflow =
            document.documentElement.style.overflow;

        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";

        return () => {
            document.body.style.overflow =
                previousBodyOverflow;

            document.documentElement.style.overflow =
                previousHtmlOverflow;
        };
    }, [focused]);

    /**
     * Open focus mode.
     *
     * This is used only by the normal page.
     */
    const openFocus = (event) => {
        if (focused) {
            return;
        }

        if (isInteractive(event.target)) {
            return;
        }

        setFocused(true);
    };

    /**
     * Close focus mode.
     */
    const closeFocus = () => {
        setFocused(false);
    };

    /**
     * One screenshot page.
     *
     * IMPORTANT:
     * Do NOT stopPropagation here.
     *
     * When focus mode is open, clicking the screenshot
     * must be able to reach the .ebook-focus container
     * so it can close the overlay.
     */
    const pageLeaf = (
        <div className="book-spread single">
            <div
                className={`${pageClass(
                    current
                )} screenshot-only-page`}
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

    /**
     * FOCUS / FULLSCREEN VIEW
     */
    const stage = focused ? (
        <div
            className="ebook-focus ebook-focus--screenshots"
            onClick={closeFocus}
        >
            {/* PREVIOUS */}
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

            {/* IMAGE */}
            <div className="ebook-focus-book screenshot-focus-book">
                {pageLeaf}
            </div>

            {/* NEXT */}
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
        /**
         * NORMAL PAGE VIEW
         */
        <FitPageStage
            pageKey={current}
            key={`page-${current}`}
        >
            {pageLeaf}
        </FitPageStage>
    );

    return (
        <section
            className="ebook-reader ebook-reader--screenshots"
            aria-label={ariaLabel}
        >
            {stage}

            {/* PAGE NAVIGATION */}
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
                        requestGo(current - step)
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
                        requestGo(current + step)
                    }
                >
                    {readerUi.next ||
                        "Trang sau →"}
                </button>
            </nav>
        </section>
    );
}
