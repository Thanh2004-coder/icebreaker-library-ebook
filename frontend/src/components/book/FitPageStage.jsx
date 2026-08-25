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
 *
 * Nội dung bên trong luôn render ở kích thước này,
 * sau đó dùng transform scale để fit vào màn hình.
 */
const BASE_WIDTH = 469;
const BASE_HEIGHT = Math.round(
    BASE_WIDTH / PAGE_ASPECT
);

const MIN_STAGE = 160;

/**
 * =========================================================
 * NORMAL VIEW
 * =========================================================
 */
const DESKTOP_BREAKPOINT = 900;

/**
 * Desktop không cho ebook quá rộng.
 */
const NORMAL_MAX_WIDTH = 520;

/**
 * =========================================================
 * FOCUS VIEW
 * =========================================================
 *
 * Focus không chiếm toàn bộ màn hình.
 *
 * Giới hạn:
 *   - khoảng 78% chiều rộng viewport
 *   - khoảng 82% chiều cao viewport
 *
 * Như vậy khi phóng to:
 *   - page vẫn lớn hơn normal
 *   - vẫn nhìn thấy khoảng trống xung quanh
 *   - không bị quá khổ
 *   - không tạo cảm giác "full screen page"
 */
const FOCUS_WIDTH_RATIO = 0.78;
const FOCUS_HEIGHT_RATIO = 0.82;

/**
 * Đọc kích thước stage.
 */
function readStageSize(stage) {
  const rect =
      stage.getBoundingClientRect();

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
        Math.floor(
            window.innerHeight * 0.75
        ),
        320
    );
  }

  return {
    availW,
    availH,
  };
}

/**
 * Kiểm tra stage có nằm trong .ebook-focus hay không.
 */
function detectFocusMode(stage) {
  if (!stage) {
    return false;
  }

  return Boolean(
      stage.closest(".ebook-focus")
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
  const viewportW =
      window.innerWidth;

  const viewportH =
      window.innerHeight;

  const isMobile =
      viewportW < DESKTOP_BREAKPOINT;

  let maxW;

  if (isMobile) {
    /**
     * Mobile:
     * page fit theo chiều rộng màn hình,
     * chừa khoảng 16px mỗi bên.
     */
    maxW = Math.min(
        availW,
        viewportW - 32
    );
  } else {
    /**
     * Desktop:
     * page không được quá rộng.
     */
    maxW = Math.min(
        availW,
        Math.floor(
            viewportW * 0.5
        ),
        NORMAL_MAX_WIDTH
    );
  }

  /**
   * Chừa chỗ cho navigation.
   */
  const maxH = Math.max(
      viewportH - 120,
      320
  );

  let width = maxW;

  let height =
      width / PAGE_ASPECT;

  /**
   * Nếu page quá cao thì giảm
   * cả width và height.
   */
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
 * FOCUS PAGE
 * =========================================================
 *
 * KHÔNG cho page chiếm toàn viewport.
 *
 * Đây là phần quan trọng để sửa lỗi:
 *
 * "Bấm phóng to -> page quá to".
 */
function fitFocusPage(
    availW,
    availH
) {
  const viewportW =
      window.innerWidth;

  const viewportH =
      window.innerHeight;

  /**
   * Giới hạn chiều rộng focus.
   *
   * Ví dụ:
   * viewport 1920px
   * -> page tối đa khoảng 1497px
   *
   * viewport 1366px
   * -> page tối đa khoảng 1065px
   */
  const maxWidth =
      viewportW *
      FOCUS_WIDTH_RATIO;

  /**
   * Giới hạn chiều cao focus.
   *
   * Ví dụ:
   * viewport 900px
   * -> page tối đa khoảng 738px
   */
  const maxHeight =
      viewportH *
      FOCUS_HEIGHT_RATIO;

  /**
   * Stage thực tế không được vượt
   * giới hạn viewport.
   */
  let width = Math.min(
      availW,
      maxWidth
  );

  let height =
      width / PAGE_ASPECT;

  /**
   * Nếu page quá cao:
   * giảm height -> giảm width
   * theo đúng aspect ratio.
   */
  if (height > maxHeight) {
    height = maxHeight;

    width =
        height * PAGE_ASPECT;
  }

  /**
   * Safety limit.
   */
  width = Math.min(
      width,
      maxWidth
  );

  height =
      width / PAGE_ASPECT;

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
 *
 * API cũ vẫn giữ nguyên.
 */
export function fitPageBox(
    availW,
    availH,
    focus = false
) {
  if (focus) {
    return fitFocusPage(
        availW,
        availH
    );
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
         * Tự phát hiện focus.
         */
        const isFocus =
            detectFocusMode(stage);

        /**
         * Tính kích thước page.
         */
        const fitted =
            fitPageBox(
                availW,
                availH,
                isFocus
            );

        /**
         * Scale từ BASE_WIDTH.
         */
        const scale =
            fitted.width /
            BASE_WIDTH;

        /**
         * Nội dung bên trong luôn layout
         * ở kích thước cố định.
         */
        scaleEl.style.width =
            `${BASE_WIDTH}px`;

        scaleEl.style.height =
            `${BASE_HEIGHT}px`;

        scaleEl.style.minHeight =
            `${BASE_HEIGHT}px`;

        /**
         * Focus:
         * cho phép nội dung không bị clip.
         */
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

  /**
   * Class cho stage.
   */
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

                    /**
                     * Không cho CSS bên ngoài
                     * ép page lớn hơn kích thước
                     * đã tính.
                     */
                    maxWidth:
                    box.width,

                    maxHeight:
                    box.height,

                    overflow:
                        box.focus
                            ? "visible"
                            : "hidden",
                  }
                  : undefined
            }
        >
          <div
              className="ebook-fit-clip"
              style={
                box.focus
                    ? {
                      overflow:
                          "visible",
                    }
                    : {
                      overflow:
                          "hidden",
                    }
              }
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

                        /**
                         * Scale duy nhất
                         * quyết định kích thước page.
                         */
                        transform:
                            `scale(${box.scale})`,

                        transformOrigin:
                            "top left",

                        overflow:
                            box.focus
                                ? "visible"
                                : "hidden",

                        boxSizing:
                            "border-box",
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

