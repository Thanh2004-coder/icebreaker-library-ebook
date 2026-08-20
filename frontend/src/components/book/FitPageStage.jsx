import { useCallback, useLayoutEffect, useRef, useState } from "react";

function measureAvailable(stage) {
  const rect = stage.getBoundingClientRect();
  const cssW = stage.clientWidth;
  const cssH = stage.clientHeight;
  const fallbackW = Math.max(window.innerWidth - 48, 280);
  const fallbackH = Math.max(Math.floor(window.innerHeight * 0.55), 320);

  const availW = Math.max(cssW, rect.width || 0, 1);
  const availH = Math.max(cssH, rect.height || 0, 1);

  return {
    availW: availW >= 160 ? availW : fallbackW,
    availH: availH >= 120 ? availH : fallbackH,
  };
}

/**
 * Scales one ebook page into the stage using both available width and height.
 * Never collapses to 0 — falls back to viewport-based size if the flex stage
 * has not resolved height yet.
 */
export default function FitPageStage({ children, pageKey, className = "" }) {
  const stageRef = useRef(null);
  const contentRef = useRef(null);
  const [fit, setFit] = useState({
    scale: 1,
    frameW: null,
    frameH: null,
    contentW: null,
  });

  const recalculate = useCallback(() => {
    const stage = stageRef.current;
    const content = contentRef.current;
    if (!stage || !content) return;

    let { availW, availH } = measureAvailable(stage);

    // If flex still collapsed the stage, force a usable viewport box.
    if (availH < 120) {
      availH = Math.max(Math.floor(window.innerHeight * 0.55), 320);
      stage.style.minHeight = `${availH}px`;
    }
    if (availW < 160) {
      availW = Math.max(window.innerWidth - 48, 280);
    }

    const maxBaseWidth = Math.min(availW, Math.max(280, availH * 0.9), 760);

    content.style.width = `${maxBaseWidth}px`;
    content.style.height = "auto";
    content.style.transform = "scale(1)";
    content.style.transformOrigin = "top left";

    const contentW = Math.max(content.scrollWidth, content.offsetWidth, 1);
    const contentH = Math.max(content.scrollHeight, content.offsetHeight, 1);

    const scale = Math.min(1, availW / contentW, availH / contentH);

    setFit({
      scale,
      frameW: Math.max(contentW * scale, 1),
      frameH: Math.max(contentH * scale, 1),
      contentW,
    });
  }, []);

  useLayoutEffect(() => {
    recalculate();
    const timer = window.setTimeout(recalculate, 50);
    const timer2 = window.setTimeout(recalculate, 250);

    const stage = stageRef.current;
    const content = contentRef.current;
    if (!stage || !content) {
      return () => {
        window.clearTimeout(timer);
        window.clearTimeout(timer2);
      };
    }

    const ro = new ResizeObserver(() => {
      window.requestAnimationFrame(recalculate);
    });
    ro.observe(stage);
    ro.observe(content);

    const images = [...content.querySelectorAll("img")];
    const onImg = () => recalculate();
    images.forEach((img) => {
      img.addEventListener("load", onImg);
      if (img.complete) onImg();
    });

    window.addEventListener("resize", recalculate);
    window.addEventListener("orientationchange", recalculate);

    const fontsReady = document.fonts?.ready;
    if (fontsReady) fontsReady.then(recalculate).catch(() => {});

    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(timer2);
      ro.disconnect();
      images.forEach((img) => img.removeEventListener("load", onImg));
      window.removeEventListener("resize", recalculate);
      window.removeEventListener("orientationchange", recalculate);
    };
  }, [recalculate, pageKey]);

  return (
    <div ref={stageRef} className={`ebook-stage ${className}`.trim()}>
      <div
        className="ebook-fit-frame"
        style={{
          width: fit.frameW ?? undefined,
          height: fit.frameH ?? undefined,
        }}
      >
        <div
          ref={contentRef}
          className="ebook-fit-content"
          style={{
            width: fit.contentW ?? "100%",
            transform: `scale(${fit.scale})`,
            transformOrigin: "top left",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
