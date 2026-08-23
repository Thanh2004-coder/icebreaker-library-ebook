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
    getScreenshotByPage,
} from "../data/catalog.js";

/**
 * EbookReader
 *
 * Normal:
 *   FitPageStage -> book-spread -> book-page -> screenshot
 *
 * Focus:
 *   ebook-focus -> img trực tiếp
 *
 * Focus KHÔNG dùng:
 *   FitPageStage
 *   ebook-stage
 *   ebook-fit-frame
 *   ebook-fit-clip
 *   ebook-fit-scale
 *   book-spread
 *   book-page
 */

function isInteractive(target) {
    return Boolean(
        target?.closest(
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

    const screenshot = getScreenshotByPage(current);

    const requestGo = useCallback(
        (target) => {
            const next = clampPage(target);

            if (next === current) return;

            navigate(`/page/${next}`);
        },
        [current, navigate]
    );

    /*
     * Keyboard navigation
     */
    useEffect(() => {
        const onKey = (event) => {
            if (event.key === "Escape" && focused) {
                setFocused(false);
                return;
            }

            if (
                event.key === "ArrowLeft" &&
                current > FIRST_PAGE
            ) {
                requestGo(current - step);
            }

            if (
                event.key === "ArrowRight" &&
                current < LAST_PAGE
            ) {
                requestGo(current + step);
            }
        };

        window.addEventListener("keydown", onKey);

        return () => {
            window.removeEventListener("keydown", onKey);
        };
    }, [current, focused, requestGo]);

    /*
     * Khóa scroll nền khi fullscreen
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

    /*
     * Mở fullscreen
     */
    const openFocus = (event) => {
        if (focused) return;

        if (isInteractive(event.target)) {
            return;
        }

        setFocused(true);
    };

    /*
     * ================================
     * NORMAL PAGE
     * ================================
     *
     * Phần này giữ nguyên hệ thống FitPageStage.
     */
    const normalPage = (
        <div
            className="book-spread single"
            onClick={(event) =>
                event.stopPropagation()
            }
        >
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

    /*
     * ================================
     * FULLSCREEN PAGE
     * ================================
     *
     * QUAN TRỌNG:
     *
     * Không dùng pageLeaf.
     * Không dùng book-page.
     * Không dùng FitPageStage.
     *
     * Chỉ render IMG trực tiếp.
     */
    const fullscreenPage = (
        <img
            className="fullscreen-screenshot"
            src={screenshot}
            alt={`Trang ${current}`}
            draggable={false}
        />
    );

    const ariaLabel = resolveCatalogText(
        readerUi.ariaLabel || "Ebook {title}"
    );

    /*
     * ================================
     * STAGE
     * ================================
     */
    const stage = focused ? (
        <div
            className="ebook-focus ebook-focus--screenshots"
            onClick={() => setFocused(false)}
        >
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

            {/*
             * FULLSCREEN CONTAINER
             *
             * Không có FitPageStage ở đây.
             */}
            <div
                className="fullscreen-screenshot-container"
                onClick={(event) =>
                    event.stopPropagation()
                }
            >
                {fullscreenPage}
            </div>

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
        /*
         * NORMAL MODE
         */
        <FitPageStage
            pageKey={current}
            key={`page-${current}`}
        >
            {normalPage}
        </FitPageStage>
    );

    return (
        <section
            className="ebook-reader ebook-reader--screenshots"
            aria-label={ariaLabel}
        >
            {stage}

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
