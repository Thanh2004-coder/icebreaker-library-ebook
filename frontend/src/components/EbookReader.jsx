import { useCallback, useLayoutEffect } from "react";
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

    const canPrev = current > FIRST_PAGE;
    const canNext = current < LAST_PAGE;

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
     * Không còn Escape / Focus / Zoom.
     */
    useLayoutEffect(() => {
        const onKey = (event) => {
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

        window.addEventListener(
            "keydown",
            onKey
        );

        return () => {
            window.removeEventListener(
                "keydown",
                onKey
            );
        };
    }, [
        current,
        requestGo,
    ]);

    /**
     * Một trang ebook.
     *
     * QUAN TRỌNG:
     * Không có onClick mở focus.
     * Chạm/click vào ảnh chỉ là chạm/click ảnh.
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

    return (
        <section
            className="ebook-reader ebook-reader--screenshots"
            aria-label={ariaLabel}
        >
            <FitPageStage
                pageKey={current}
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