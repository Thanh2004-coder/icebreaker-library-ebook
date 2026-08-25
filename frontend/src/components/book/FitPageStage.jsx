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
 * =========================================================
 * NORMAL PAGE
 * =========================================================
 *
 * SÁCH LUÔN Ở NORMAL VIEW.
 *
 * Không còn Focus / Zoom mode.
 * Chạm hoặc click vào sách không thể làm
 * kích thước trang thay đổi trong component này.
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
 * PUBLIC API
 * =========================================================
 */
export function fitPageBox(
    availW,
    availH
) {
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
        };
      });

  /**
   * =======================================================
   * RECALCULATE
   * =======================================================
   *
   * Luôn dùng NORMAL VIEW.
   *
   * Không kiểm tra .ebook-focus.
   * Không có focus scale.
   * Không có transform-origin đặc biệt.
   * Không có left / margin-left để phóng to.
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

        const fitted =
            fitNormalPage(
                availW,
                availH
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
            "hidden";

        setBox((prev) => {
          if (
              prev.width ===
              fitted.width &&
              prev.height ===
              fitted.height &&
              Math.abs(
                  prev.scale -
                  scale
              ) < 0.001
          ) {
            return prev;
          }

          return {
            width:
            fitted.width,

            height:
            fitted.height,

            scale,
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

  /**
   * Không thêm ebook-stage-focus.
   *
   * Dù component bên ngoài có vô tình thêm
   * class "ebook-focus", component này vẫn
   * không chuyển sang chế độ phóng to.
   */
  const stageClassName = [
    "ebook-stage",
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
                        "hidden",

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
                    "hidden",
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

                        transformOrigin:
                            "top left",

                        overflow:
                            "hidden",

                        boxSizing:
                            "border-box",

                        position:
                            "relative",

                        left: "0",

                        marginLeft:
                            "0",
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