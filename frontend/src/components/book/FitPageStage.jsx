import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

/**
 * Tỷ lệ trang design.
 * ~627 x 1002
 */
export const PAGE_ASPECT = 5 / 8;

/**
 * Kích thước gốc để layout nội dung.
 *
 * Nội dung bên trong vẫn được render ở kích thước ổn định
 * rồi scale lên/xuống bằng transform.
 */
const BASE_WIDTH = 469;
const BASE_HEIGHT = Math.round(
    BASE_WIDTH / PAGE_ASPECT
);

const MIN_STAGE = 160;

/**
 * Khoảng cách tối thiểu với mép màn hình
 * khi đang ở chế độ phóng to.
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
        window.innerWidth - 64,
        280
    );
  }

  if (availH < MIN_STAGE) {
    availH = Math.max(
        Math.floor(window.innerHeight * 0.55),
        320
    );
  }

  return {
    availW,
    availH,
  };
}

/**
 * Kiểm tra xem stage hiện đang nằm trong
 * popup .ebook-focus hay không.
 *
 * Không cần truyền focus={true}.
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
 * Tính kích thước page ở chế độ bình thường.
 *
 * Vẫn giữ giới hạn BASE_WIDTH để giao diện
 * ebook bình thường không tự nhiên phóng quá lớn.
 */
function fitNormalPage(
    availW,
    availH
) {
  const maxW = Math.min(
      availW,
      BASE_WIDTH,
      window.innerWidth
  );

  const maxH = Math.min(
      availH,
      window.innerHeight
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
 * Tính kích thước page khi popup phóng to.
 *
 * QUAN TRỌNG:
 * Không dùng BASE_WIDTH ở đây.
 *
 * Page được phép chiếm gần toàn bộ màn hình.
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
   * Cho page dùng gần hết chiều ngang.
   */
  const maxWidth =
      Math.max(
          viewportW -
          FOCUS_SIDE_GAP * 2,
          280
      );

  /**
   * Chiều cao khả dụng.
   */
  const maxHeight =
      Math.max(
          viewportH -
          FOCUS_TOP_GAP -
          FOCUS_BOTTOM_GAP,
          320
      );

  /**
   * Ưu tiên kích thước thực tế của popup,
   * nhưng không vượt viewport.
   */
  let width = Math.min(
      availW,
      maxWidth
  );

  let height =
      width / PAGE_ASPECT;

  /**
   * Nếu page quá cao thì giới hạn theo
   * chiều cao màn hình.
   */
  if (height > maxHeight) {
    height = maxHeight;

    width =
        height * PAGE_ASPECT;
  }

  /**
   * Nếu stage rộng hơn viewport nhưng width
   * bị giảm do chiều cao, đảm bảo không vượt
   * giới hạn màn hình.
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
 * API cũ vẫn được giữ lại để tránh breaking code
 * ở những nơi khác đang import fitPageBox().
 *
 * Nếu gọi bình thường => behavior cũ.
 *
 * Nếu truyền focus=true => dùng kích thước lớn.
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
 * FitPageStage
 *
 * Chế độ bình thường:
 *   BASE_WIDTH x BASE_HEIGHT
 *   -> scale vừa stage
 *
 * Chế độ .ebook-focus:
 *   tự động phát hiện popup
 *   -> page sử dụng gần hết viewport
 *
 * Không cần:
 *
 *   focus={true}
 *
 * ở component cha.
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
                    window.innerWidth - 64,
                    280
                ),
                Math.max(
                    window.innerHeight * 0.55,
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
   * Tính lại kích thước.
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
         * Tự phát hiện popup.
         */
        const isFocus =
            detectFocusMode(stage);

        /**
         * Tính page size.
         */
        const fitted =
            fitPageBox(
                availW,
                availH,
                isFocus
            );

        /**
         * Scale từ kích thước layout gốc.
         */
        const scale =
            fitted.width /
            BASE_WIDTH;

        /**
         * Nội dung bên trong luôn layout
         * ở kích thước BASE.
         */
        scaleEl.style.width =
            `${BASE_WIDTH}px`;

        scaleEl.style.height =
            `${BASE_HEIGHT}px`;

        scaleEl.style.minHeight =
            `${BASE_HEIGHT}px`;

        /**
         * Trong popup cho phép overflow.
         *
         * Không để clip trung gian làm nhỏ ảnh.
         */
        if (isFocus) {
          scaleEl.style.overflow =
              "visible";
        } else {
          scaleEl.style.overflow =
              "hidden";
        }

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
   * Gom nhiều lần resize thành một frame.
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

  useLayoutEffect(() => {
    /**
     * Chạy ngay.
     */
    scheduleRecalculate();

    const stage =
        stageRef.current;

    if (!stage) {
      return undefined;
    }

    /**
     * Theo dõi thay đổi kích thước stage.
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
     *
     * Khi ảnh load xong có thể làm thay đổi
     * kích thước layout.
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
     * Chờ font load.
     */
    document.fonts?.ready
        ?.then(
            scheduleRecalculate
        )
        .catch(() => {});

    /**
     * Một vài lần recalculate dự phòng
     * cho trường hợp popup vừa mount.
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
   * Khi pageKey đổi, popup có thể vừa thay page.
   * Đọc lại kích thước sau render.
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
   * Class focus được thêm vào chính stage
   * để CSS hiện tại của mày nhận diện được.
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

  return (
      <div
          ref={stageRef}
          className={
            stageClassName
          }
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
                     * Trong focus không giới hạn
                     * bởi max-width CSS.
                     */
                    maxWidth: box.focus
                        ? "none"
                        : undefined,

                    maxHeight:
                        box.focus
                            ? "none"
                            : undefined,

                    overflow:
                        box.focus
                            ? "visible"
                            : undefined,
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
                    : undefined
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
                         * Đây là scale thực tế.
                         *
                         * Bình thường:
                         *   ~0.8 - 1
                         *
                         * Focus:
                         *   có thể > 1
                         *   và page sẽ lớn.
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