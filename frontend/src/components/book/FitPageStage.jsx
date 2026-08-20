import { useCallback, useLayoutEffect, useRef, useState } from "react";

/**
 * Scales a single ebook page so it fits entirely inside the stage
 * (available width AND height), without internal scrollbars.
 *
 * pageWidth  = availableWidth (capped)
 * pageHeight = measured content height
 * if pageHeight > availableHeight → scale down by both axes
 */
export default function FitPageStage({ children, pageKey, className = "" }) {
  const stageRef = useRef(null);
  const contentRef = useRef(null);
  const [fit, setFit] = useState({
    scale: 1,
    frameW: 0,
    frameH: 0,
    contentW: 0,
  });

  const recalculate = useCallback(() => {
    const stage = stageRef.current;
    const content = contentRef.current;
    if (!stage || !content) return;

    const availW = stage.clientWidth;
    const availH = stage.clientHeight;
    if (availW < 8 || availH < 8) return;

    // Base width: fill available width but cap for ultrawide / short screens.
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
      frameW: contentW * scale,
      frameH: contentH * scale,
      contentW,
    });
  }, []);

  useLayoutEffect(() => {
    recalculate();

    const stage = stageRef.current;
    const content = contentRef.current;
    if (!stage || !content) return undefined;

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
          width: fit.frameW || undefined,
          height: fit.frameH || undefined,
        }}
      >
        <div
          ref={contentRef}
          className="ebook-fit-content"
          style={{
            width: fit.contentW || undefined,
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
