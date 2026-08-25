
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
 * NORMAL VIEW SIZE
 * =========================================================
 *
 * Desktop không cho ebook chiếm quá nhiều chiều ngang.
 *
 * 900 - 1199px  -> tối đa 360px
 * >= 1200px      -> tối đa 400px
 *
 * Mobile không dùng các giới hạn này,
 * mà fit trực tiếp theo viewport.
 */
const NORMAL_DESKTOP_WIDTH_SMALL = 360;
const NORMAL_DESKTOP_WIDTH_LARGE = 400;

const DESKTOP_BREAKPOINT = 900;
const LARGE_DESKTOP_BREAKPOINT = 1200;

/**
 * =========================================================
 * FOCUS VIEW
 * =========================================================
 */
const FOCUS_SIDE_GAP = 56;
const FOCUS_TOP_GAP = 24;
const FOCUS_BOTTOM_GAP = 24;

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
 *
 * Desktop:
 *   Không cho page quá rộng.
 *
 * Mobile:
 *   Page fit theo chiều rộng màn hình.
 *
 * Trong cả hai trường hợp:
 *   - giữ nguyên aspect ratio
 *   - nếu quá cao thì giảm cả width + height
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

  /**
   * MOBILE
   *
   * Dùng gần hết chiều rộng màn hình,
   * nhưng vẫn chừa khoảng hai bên.
   */
  if (isMobile) {
    const mobileSideGap =
      viewportW <= 480
        ? 16
        : 24;

    const maxW = Math.min(
      availW,
      viewportW -
        mobileSideGap * 2
    );

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
   * DESKTOP
   *
   * Chủ động giới hạn width.
   *
   * Không lấy toàn bộ stage width nữa.
   */
  const desktopMaxWidth =
    viewportW >=
    LARGE_DESKTOP_BREAKPOINT
      ? NORMAL_DESKTOP_WIDTH_LARGE
      : NORMAL_DESKTOP_WIDTH_SMALL;

  const maxW = Math.min(
    availW,
    desktopMaxWidth
  );

  /**
   * Chừa khu vực cho navigation phía dưới.
   */
  const maxH = Math.max(
    viewportH - 110,
    400
  );

  let width = maxW;
  let height =
    width / PAGE_ASPECT;

  /**
   * Nếu page cao quá màn hình,
   * giảm toàn bộ page theo tỷ lệ.
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
 * Focus vẫn được phép lớn.
 */
function fitFocusPage(
  availW,
  availH
) {
  const viewportW =
    window.innerWidth;

  const viewportH =
    window.innerHeight;

  const maxWidth =
    Math.max(
      viewportW -
        FOCUS_SIDE_GAP * 2,
      280
    );

  const maxHeight =
    Math.max(
      viewportH -
        FOCUS_TOP_GAP -
        FOCUS_BOTTOM_GAP,
      320
    );

  let width = Math.min(
    availW,
    maxWidth
  );

  let height =
    width / PAGE_ASPECT;

  if (height > maxHeight) {
    height = maxHeight;
    width =
      height * PAGE_ASPECT;
  }

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
 * API cũ.
 *
 * fitPageBox(
 *   width,
 *   height,
 *   false
 * )
 *
 * -> normal
 *
 * fitPageBox(
 *   width,
 *   height,
 *   true
 * )
 *
 * -> focus
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
   * Tính lại kích thước page.
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

      const isFocus =
        detectFocusMode(stage);

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
       * ở kích thước BASE.
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
   * Gom resize vào animation frame.
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
   * Theo dõi kích thước.
   */
  useLayoutEffect(() => {
    scheduleRecalculate();

    const stage =
      stageRef.current;

    if (!stage) {
      return undefined;
    }

    const ro =
      new ResizeObserver(
        scheduleRecalculate
      );

    ro.observe(stage);

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
     * Font.
     */
    document.fonts?.ready
      ?.then(
        scheduleRecalculate
      )
      .catch(() => {});

    /**
     * Recalculate bổ sung
     * sau khi DOM ổn định.
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
   * Recalculate khi đổi page.
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
                  box.focus
                    ? "none"
                    : `${box.width}px`,

                maxHeight:
                  box.focus
                    ? "none"
                    : `${box.height}px`,

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
