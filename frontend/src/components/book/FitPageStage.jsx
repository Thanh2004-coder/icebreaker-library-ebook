import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

/**
 * Tỷ lệ trang ebook.
 * ~627 x 1002
 */
export const PAGE_ASPECT = 5 / 8;

/**
 * Kích thước layout gốc.
 */
const BASE_WIDTH = 469;
const BASE_HEIGHT = Math.round(
    BASE_WIDTH / PAGE_ASPECT
);

const MIN_STAGE = 160;

/**
 * NORMAL VIEW
 */
const DESKTOP_BREAKPOINT = 900;
const NORMAL_MAX_WIDTH = 520;

/**
 * FOCUS / ZOOM VIEW
 *
 * Trang sẽ lớn hơn bình thường nhưng
 * không chiếm toàn bộ viewport.
 */
const FOCUS_WIDTH_RATIO = 0.78;
const FOCUS_HEIGHT_RATIO = 0.82;

/**
 * Đọc kích thước stage.
 */
function readStageSize(stage) {
  const rect = stage.getBoundingClientRect();

  let availW = Math.max(
      stage.clientWidth || 0,
      rect.width || 0
  );

  let availH = Math.max(
      stage.clientHeight || 0,
      rect.height || 0
  );

  if (availW < MIN_STAGE) {
    availW = Math.max(
        window.innerWidth - 32,
        280
    );
  }

  if (availH < MIN_STAGE) {
    availH = Math.max(
        Math.floor(window.innerHeight * 0.75),
        320
    );
  }

  return {
    availW,
    availH,
  };
}

/**
 * Kiểm tra Focus mode.
 *
 * Hỗ trợ cả trường hợp:
 * .ebook-focus
 * là parent hoặc chính stage.
 */
function detectFocusMode(stage) {
  if (!stage) {
    return false;
  }

  return (
      stage.classList.contains("ebook-focus") ||
      Boolean(stage.closest(".ebook-focus"))
  );
}

/**
 * =========================================================
 * NORMAL PAGE
 * =========================================================
 */
function fitNormalPage(
    availW,
    availH
) {
  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;

  const isMobile =
      viewportW < DESKTOP_BREAKPOINT;

  let maxW;

  if (isMobile) {
    maxW = Math.min(
        availW,
        viewportW - 32
    );
  } else {
    maxW = Math.min(
        availW,
        Math.floor(viewportW * 0.5),
        NORMAL_MAX_WIDTH
    );
  }

  const maxH = Math.max(
      viewportH - 120,
      320
  );

  let width = maxW;
  let height =
      width / PAGE_ASPECT;

  if (height > maxH) {
    height = maxH;
    width =
        height * PAGE_ASPECT;
  }

  return {
    width: Math.max(
        1,
        Math.floor(width)
    ),

    height: Math.max(
        1,
        Math.floor(height)
    ),
  };
}

/**
 * =========================================================
 * FOCUS / ZOOM PAGE
 * =========================================================
 *
 * QUAN TRỌNG:
 *
 * Không lấy availW / availH làm giới hạn chính.
 *
 * Focus phải có khả năng lớn hơn stage bình thường.
 */
function fitFocusPage() {
  const viewportW =
      window.innerWidth;

  const viewportH =
      window.innerHeight;

  /**
   * Giới hạn theo viewport.
   */
  const maxWidth =
      viewportW *
      FOCUS_WIDTH_RATIO;

  const maxHeight =
      viewportH *
      FOCUS_HEIGHT_RATIO;

  /**
   * Bắt đầu bằng kích thước tối đa
   * mà viewport cho phép.
   */
  let width = maxWidth;

  let height =
      width / PAGE_ASPECT;

  /**
   * Nếu quá cao thì giảm lại.
   */
  if (height > maxHeight) {
    height = maxHeight;

    width =
        height * PAGE_ASPECT;
  }

  return {
    width: Math.max(
        1,
        Math.floor(width)
    ),

    height: Math.max(
        1,
        Math.floor(height)
    ),
  };
}

/**
 * =========================================================
 * PUBLIC API
 * =========================================================
 */
export function fitPageBox(
    availW,
    availH,
    focus = false
) {
  if (focus) {
    return fitFocusPage();
  }

  return fitNormalPage(
      availW,
      availH
  );
}

/**
 * =========================================================
 * FIT PAGE STAGE
 * =========================================================
 */
export default function FitPageStage({
                                       children,
                                       pageKey,
                                       className = "",
                                     }) {
  const stageRef =
      useRef(null);

  const scaleRef =
      useRef(null);

  const rafRef =
      useRef(0);

  const [box, setBox] =
      useState(() => {
        if (
            typeof window ===
            "undefined"
        ) {
          return {
            width: 0,
            height: 0,
            scale: 1,
            focus: false,
          };
        }

        const seed =
            fitNormalPage(
                Math.max(
                    window.innerWidth - 32,
                    280
                ),
                Math.max(
                    window.innerHeight * 0.75,
                    320
                )
            );

        return {
          width: seed.width,

          height: seed.height,

          scale:
              seed.width /
              BASE_WIDTH,

          focus: false,
        };
      });

  /**
   * =======================================================
   * RECALCULATE
   * =======================================================
   */
  const recalculate =
      useCallback(() => {
        const stage =
            stageRef.current;

        const scaleEl =
            scaleRef.current;

        if (
            !stage ||
            !scaleEl
        ) {
          return;
        }

        const {
          availW,
          availH,
        } = readStageSize(stage);

        /**
         * Xác định Focus.
         */
        const isFocus =
            detectFocusMode(stage);

        /**
         * Tính kích thước.
         *
         * Focus KHÔNG còn bị giới hạn
         * bởi kích thước stage bình thường.
         */
        const fitted =
            fitPageBox(
                availW,
                availH,
                isFocus
            );

        const scale =
            fitted.width /
            BASE_WIDTH;

        /**
         * Nội dung luôn layout
         * ở BASE_WIDTH / BASE_HEIGHT.
         */
        scaleEl.style.width =
            `${BASE_WIDTH}px`;

        scaleEl.style.height =
            `${BASE_HEIGHT}px`;

        scaleEl.style.minHeight =
            `${BASE_HEIGHT}px`;

        scaleEl.style.overflow =
            isFocus
                ? "visible"
                : "hidden";

        setBox((prev) => {
          if (
              prev.width ===
              fitted.width &&
              prev.height ===
              fitted.height &&
              Math.abs(
                  prev.scale -
                  scale
              ) < 0.001 &&
              prev.focus ===
              isFocus
          ) {
            return prev;
          }

          return {
            width:
            fitted.width,

            height:
            fitted.height,

            scale,

            focus:
            isFocus,
          };
        });
      }, []);

  /**
   * =======================================================
   * SCHEDULE RECALCULATE
   * =======================================================
   */
  const scheduleRecalculate =
      useCallback(() => {
        window.cancelAnimationFrame(
            rafRef.current
        );

        rafRef.current =
            window.requestAnimationFrame(
                () => {
                  recalculate();
                }
            );
      }, [recalculate]);

  /**
   * =======================================================
   * RESIZE / VIEWPORT / IMAGE
   * =======================================================
   */
  useLayoutEffect(() => {
    scheduleRecalculate();

    const stage =
        stageRef.current;

    if (!stage) {
      return undefined;
    }

    /**
     * Theo dõi kích thước stage.
     */
    const ro =
        new ResizeObserver(
            scheduleRecalculate
        );

    ro.observe(stage);

    /**
     * Theo dõi viewport.
     */
    const onViewport =
        () => {
          scheduleRecalculate();
        };

    window.addEventListener(
        "resize",
        onViewport
    );

    window.addEventListener(
        "orientationchange",
        onViewport
    );

    window.visualViewport?.addEventListener(
        "resize",
        onViewport
    );

    /**
     * Theo dõi ảnh.
     */
    const images =
        stage.querySelectorAll(
            "img"
        );

    images.forEach(
        (img) => {
          img.addEventListener(
              "load",
              scheduleRecalculate
          );

          if (img.complete) {
            scheduleRecalculate();
          }
        }
    );

    /**
     * Theo dõi font.
     */
    document.fonts?.ready
        ?.then(
            scheduleRecalculate
        )
        .catch(() => {});

    /**
     * Recalculate bổ sung.
     */
    const t1 =
        window.setTimeout(
            scheduleRecalculate,
            32
        );

    const t2 =
        window.setTimeout(
            scheduleRecalculate,
            120
        );

    const t3 =
        window.setTimeout(
            scheduleRecalculate,
            300
        );

    return () => {
      window.cancelAnimationFrame(
          rafRef.current
      );

      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);

      ro.disconnect();

      window.removeEventListener(
          "resize",
          onViewport
      );

      window.removeEventListener(
          "orientationchange",
          onViewport
      );

      window.visualViewport?.removeEventListener(
          "resize",
          onViewport
      );

      images.forEach(
          (img) => {
            img.removeEventListener(
                "load",
                scheduleRecalculate
            );
          }
      );
    };
  }, [
    scheduleRecalculate,
    pageKey,
  ]);

  /**
   * =======================================================
   * PAGE CHANGE
   * =======================================================
   */
  useLayoutEffect(() => {
    scheduleRecalculate();

    const t =
        window.setTimeout(
            scheduleRecalculate,
            50
        );

    return () => {
      window.clearTimeout(t);
    };
  }, [
    pageKey,
    scheduleRecalculate,
  ]);

  const ready =
      box.width > 0 &&
      box.height > 0;

  const stageClassName = [
    "ebook-stage",

    box.focus
        ? "ebook-stage-focus"
        : "",

    className,
  ]
      .filter(Boolean)
      .join(" ");

  /**
   * =======================================================
   * RENDER
   * =======================================================
   */
  return (
      <div
          ref={stageRef}
          className={stageClassName}
      >
        <div
            className="ebook-fit-frame"
            style={
              ready
                  ? {
                    width:
                    box.width,

                    height:
                    box.height,

                    maxWidth:
                    box.width,

                    maxHeight:
                    box.height,

                    overflow:
                        box.focus
                            ? "visible"
                            : "hidden",

                    position:
                        "relative",
                  }
                  : undefined
            }
        >
          <div
              className="ebook-fit-clip"
              style={{
                width: "100%",
                height: "100%",
                overflow:
                    box.focus
                        ? "visible"
                        : "hidden",
              }}
          >
            <div
                ref={scaleRef}
                className="ebook-fit-scale"
                style={
                  ready
                      ? {
                        width:
                        BASE_WIDTH,

                        height:
                        BASE_HEIGHT,

                        minHeight:
                        BASE_HEIGHT,

                        transform:
                            `scale(${box.scale})`,

                        /**
                         * Phóng to từ giữa.
                         */
                        transformOrigin:
                            "top center",

                        overflow:
                            box.focus
                                ? "visible"
                                : "hidden",

                        boxSizing:
                            "border-box",

                        position:
                            "relative",

                        left:
                            box.focus
                                ? "50%"
                                : "0",

                        marginLeft:
                            box.focus
                                ? `${-BASE_WIDTH / 2}px`
                                : "0",
                      }
                      : undefined
                }
            >
              {children}
            </div>
          </div>
        </div>
      </div>
  );
}