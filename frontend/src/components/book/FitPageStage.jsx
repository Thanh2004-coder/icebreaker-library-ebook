import { useCallback, useLayoutEffect, useRef, useState } from "react";

/** Matches design-page artwork (~627x1002). width / height */
export const PAGE_ASPECT = 5 / 8;
/** Comfortable layout width - content is measured here, then the whole page scales. */
const BASE_WIDTH = 440;
const BASE_HEIGHT = Math.round(BASE_WIDTH / PAGE_ASPECT);
const MIN_STAGE = 160;

function readStageSize(stage) {
  const rect = stage.getBoundingClientRect();
  let availW = Math.max(stage.clientWidth || 0, rect.width || 0);
  let availH = Math.max(stage.clientHeight || 0, rect.height || 0);

  if (availW < MIN_STAGE) {
    availW = Math.max(window.innerWidth - 64, 280);
  }
  if (availH < MIN_STAGE) {
    availH = Math.max(Math.floor(window.innerHeight * 0.55), 320);
  }

  return { availW, availH };
}

/**
 * Fit a fixed-aspect base page into the stage.
 * Content never changes the aspect - only uniform scale does.
 */
export function fitPageBox(availW, availH) {
  const maxW = Math.min(availW, BASE_WIDTH, window.innerWidth);
  const maxH = Math.min(availH, window.innerHeight);

  let width = maxW;
  let height = width / PAGE_ASPECT;

  if (height > maxH) {
    height = maxH;
    width = height * PAGE_ASPECT;
  }

  return {
    width: Math.max(1, Math.floor(width)),
    height: Math.max(1, Math.floor(height)),
  };
}

/**
 * Stable ebook page stage:
 * 1) Layout at fixed BASE_WIDTH x BASE_HEIGHT (ebook aspect)
 * 2) Uniformly scale that box into the available stage (outerScale only)
 */
export default function FitPageStage({ children, pageKey, className = "" }) {
  const stageRef = useRef(null);
  const scaleRef = useRef(null);
  const rafRef = useRef(0);
  const [box, setBox] = useState(() => {
    if (typeof window === "undefined") {
      return { width: 0, height: 0, scale: 1 };
    }
    const seed = fitPageBox(Math.max(window.innerWidth - 64, 280), Math.max(window.innerHeight * 0.55, 320));
    return {
      width: seed.width,
      height: seed.height,
      scale: seed.width / BASE_WIDTH,
    };
  });

  const recalculate = useCallback(() => {
    const stage = stageRef.current;
    const scaleEl = scaleRef.current;
    if (!stage || !scaleEl) return;

    const { availW, availH } = readStageSize(stage);
    const fitted = fitPageBox(availW, availH);
    const scale = fitted.width / BASE_WIDTH;

    scaleEl.style.width = `${BASE_WIDTH}px`;
    scaleEl.style.height = `${BASE_HEIGHT}px`;
    scaleEl.style.minHeight = `${BASE_HEIGHT}px`;

    setBox((prev) => {
      if (
        prev.width === fitted.width &&
        prev.height === fitted.height &&
        Math.abs(prev.scale - scale) < 0.001
      ) {
        return prev;
      }
      return {
        width: fitted.width,
        height: fitted.height,
        scale,
      };
    });
  }, []);

  const scheduleRecalculate = useCallback(() => {
    window.cancelAnimationFrame(rafRef.current);
    rafRef.current = window.requestAnimationFrame(() => {
      recalculate();
    });
  }, [recalculate]);

  useLayoutEffect(() => {
    scheduleRecalculate();

    const stage = stageRef.current;
    if (!stage) return undefined;

    const ro = new ResizeObserver(scheduleRecalculate);
    ro.observe(stage);

    const onViewport = () => scheduleRecalculate();
    window.addEventListener("resize", onViewport);
    window.addEventListener("orientationchange", onViewport);
    window.visualViewport?.addEventListener("resize", onViewport);

    const images = stage.querySelectorAll("img");
    images.forEach((img) => {
      img.addEventListener("load", scheduleRecalculate);
      if (img.complete) scheduleRecalculate();
    });

    document.fonts?.ready?.then(scheduleRecalculate).catch(() => {});

    const t1 = window.setTimeout(scheduleRecalculate, 32);
    const t2 = window.setTimeout(scheduleRecalculate, 180);

    return () => {
      window.cancelAnimationFrame(rafRef.current);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      ro.disconnect();
      window.removeEventListener("resize", onViewport);
      window.removeEventListener("orientationchange", onViewport);
      window.visualViewport?.removeEventListener("resize", onViewport);
      images.forEach((img) => img.removeEventListener("load", scheduleRecalculate));
    };
  }, [scheduleRecalculate, pageKey]);

  const ready = box.width > 0 && box.height > 0;

  return (
    <div ref={stageRef} className={`ebook-stage ${className}`.trim()}>
      <div
        className="ebook-fit-frame"
        style={
          ready
            ? {
                width: box.width,
                height: box.height,
              }
            : undefined
        }
      >
        <div className="ebook-fit-clip">
          <div
            ref={scaleRef}
            className="ebook-fit-scale"
            style={
              ready
                ? {
                    width: BASE_WIDTH,
                    height: BASE_HEIGHT,
                    minHeight: BASE_HEIGHT,
                    transform: `scale(${box.scale})`,
                    transformOrigin: "top left",
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
