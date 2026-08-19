import { useEffect, useRef, useState } from "react";
import { BookPageShell } from "./pageHelpers.jsx";

export const MAGAZINE_TURN_MS_DESKTOP = 720;
export const MAGAZINE_TURN_MS_MOBILE = 600;

function turnDurationMs() {
  if (typeof window === "undefined") return MAGAZINE_TURN_MS_DESKTOP;
  return window.matchMedia("(max-width: 899px)").matches ? MAGAZINE_TURN_MS_MOBILE : MAGAZINE_TURN_MS_DESKTOP;
}

function isMobileTurn() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 899px)").matches;
}

function magazineEase(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function magazineFrame(direction, progress) {
  const mobile = isMobileTurn();
  const wave = Math.sin(progress * Math.PI);
  const lift = wave * (mobile ? 16 : 26);
  const curlX = wave * (mobile ? 1.4 : 2.4);
  const pinch = 1 - wave * (mobile ? 0.035 : 0.055);
  const shadowStrength = 0.14 + wave * (mobile ? 0.22 : 0.34);
  const shadowX = (direction === "next" ? -1 : 1) * (8 + wave * (mobile ? 18 : 30));
  const shadowY = 6 + wave * (mobile ? 8 : 12);
  const shadowBlur = 10 + wave * (mobile ? 20 : 34);

  if (direction === "next") {
    const angle = -progress * 178;
    return {
      transform: `translateZ(${lift}px) rotateY(${angle}deg) rotateX(${curlX}deg) scaleX(${pinch})`,
      transformOrigin: "100% 50%",
      filter: `drop-shadow(${shadowX}px ${shadowY}px ${shadowBlur}px rgba(8, 4, 20, ${shadowStrength}))`,
      curlOpacity: wave * 0.85,
      underShadow: wave * 0.42,
    };
  }

  const angle = 178 - progress * 178;
  return {
    transform: `translateZ(${lift}px) rotateY(${angle}deg) rotateX(${curlX}deg) scaleX(${pinch})`,
    transformOrigin: "0% 50%",
    filter: `drop-shadow(${shadowX}px ${shadowY}px ${shadowBlur}px rgba(8, 4, 20, ${shadowStrength}))`,
    curlOpacity: wave * 0.85,
    underShadow: wave * 0.42,
  };
}

export default function BookPageTurn({ turn, onComplete }) {
  const finishedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const leafRef = useRef(null);
  const rafRef = useRef(0);
  const startedRef = useRef(0);
  const [frame, setFrame] = useState(() => magazineFrame(turn.direction, 0));

  const { from, to, direction } = turn;
  const underPage = direction === "next" ? to : from;
  const frontPage = direction === "next" ? from : to;

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onCompleteRef.current();
  };

  useEffect(() => {
    finishedRef.current = false;
    startedRef.current = 0;
    setFrame(magazineFrame(direction, 0));

    const duration = turnDurationMs();

    const tick = (now) => {
      if (!startedRef.current) startedRef.current = now;
      const elapsed = now - startedRef.current;
      const raw = Math.min(elapsed / duration, 1);
      const progress = magazineEase(raw);
      const nextFrame = magazineFrame(direction, progress);
      setFrame(nextFrame);

      if (leafRef.current) {
        leafRef.current.style.transform = nextFrame.transform;
        leafRef.current.style.transformOrigin = nextFrame.transformOrigin;
        leafRef.current.style.filter = nextFrame.filter;
      }

      if (raw >= 1) {
        finish();
        return;
      }

      rafRef.current = window.requestAnimationFrame(tick);
    };

    rafRef.current = window.requestAnimationFrame(tick);
    const fallback = window.setTimeout(finish, duration + 120);

    return () => {
      window.cancelAnimationFrame(rafRef.current);
      window.clearTimeout(fallback);
    };
  }, [turn, direction]);

  return (
    <div className="magazine-turn-viewport page-turn-viewport" aria-live="polite" aria-busy="true">
      <div className="magazine-turn-stack-shadow" style={{ opacity: frame.underShadow }} aria-hidden="true" />
      <BookPageShell pageNumber={underPage} className="page-turn-under magazine-turn-under" />

      <div
        ref={leafRef}
        className={`magazine-turn-leaf page-turn-leaf is-${direction}`}
        style={{
          transform: frame.transform,
          transformOrigin: frame.transformOrigin,
          filter: frame.filter,
        }}
      >
        <div className="page-turn-face page-turn-front magazine-turn-front">
          <BookPageShell pageNumber={frontPage} className="page-turn-front-page" />
          <div
            className={`magazine-turn-curl is-${direction}`}
            style={{ opacity: frame.curlOpacity }}
            aria-hidden="true"
          />
          <div className="magazine-turn-sheen" aria-hidden="true" />
        </div>
        <div className="page-turn-face page-turn-back magazine-turn-back" aria-hidden="true">
          <div className="page-turn-back-paper" />
          <div className="page-turn-back-shade" />
          <div className="magazine-turn-back-gloss" />
        </div>
      </div>
    </div>
  );
}
