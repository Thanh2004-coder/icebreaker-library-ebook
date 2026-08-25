import { useCallback, useEffect } from "react";
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

export default function EbookReader({ page }) {
    const navigate = useNavigate();

    const current = clampPage(page);

    const readerUi = UI.reader || {};
    const step = 1;

    const canPrev =
        current > FIRST_PAGE;

    const canNext =
        current < LAST_PAGE;

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
     * =========================================================
     * KEYBOARD
     * =========================================================
     *
     * Chỉ dùng ← / → để chuyển trang.
     * Không còn Escape / Focus / Zoom.
     */
    useEffect(() => {
        const onKeyDown = (event) => {
            if (
                event.key === "ArrowLeft" &&
                canPrev
            ) {
                event.preventDefault();

                requestGo(
                    current - step
                );
            }

            if (
                event.key === "ArrowRight" &&
                canNext
            ) {
                event.preventDefault();

                requestGo(
                    current + step
                );
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
        current,
        canPrev,
        canNext,
        requestGo,
    ]);

    /**
     * =========================================================
     * PAGE CONTENT
     * =========================================================
     *
     * Không có onClick mở fullscreen.
     * Người dùng chạm/click vào sách -> không có hành động gì.
     */
    const pageLeaf = (
        <div className="book-spread single">
            <div
                className={`${pageClass(
                    current
                )} screenshot-only-page`}
            >
                <SheetBody page={current} />

                <span className="page-folio folio-right">
                    {current}
                </span>
            </div>
        </div>
    );

    const ariaLabel =
        resolveCatalogText(
            readerUi.ariaLabel ||
            "Ebook {title}"
        );

    /**
     * =========================================================
     * RENDER
     * =========================================================
     */
    return (
        <section
            className="ebook-reader ebook-reader--screenshots"
            aria-label={ariaLabel}
        >
            <FitPageStage
                pageKey={current}
                key={`page-${current}`}
            >
                {pageLeaf}
            </FitPageStage>

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
                    Trang {current} /{" "}
                    {LAST_PAGE}
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