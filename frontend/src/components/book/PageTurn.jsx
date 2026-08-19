import { useEffect, useRef, useState } from "react";
import { BookPageShell } from "./pageHelpers.jsx";

const TURN_MS_DESKTOP = 700;
const TURN_MS_MOBILE = 650;

function turnDurationMs() {
  if (typeof window === "undefined") return TURN_MS_DESKTOP;
  return window.matchMedia("(max-width: 899px)").matches ? TURN_MS_MOBILE : TURN_MS_DESKTOP;
}

function isMobileTurn() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 899px)").matches;
}

function curlEase(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function curlFrame(direction, progress) {
  const mobile = isMobileTurn();
  const wave = Math.sin(progress * Math.PI);
  const lift = wave * (mobile ? 14 : 22);
  const skew = wave * (mobile ? 2.4 : 3.8);
  const pinch = 1 - wave * (mobile ? 0.045 : 0.07);
  const shadowStrength = 0.12 + wave * (mobile ? 0.2 : 0.32);
  const shadowX = (direction === "next" ? -1 : 1) * (6 + wave * (mobile ? 16 : 26));
  const shadowY = 5 + wave * (mobile ? 7 : 11);
  const shadowBlur = 8 + wave * (mobile ? 18 : 28);

  if (direction === "next") {
    const rotateY = -progress * 168 - wave * 3.5;
    const edgeShift = wave * 18;

    return {
      transform: `translateZ(${lift}px) rotateY(${rotateY}deg) skewX(${skew}deg) scaleX(${pinch})`,
      transformOrigin: "100% 50%",
      filter: `drop-shadow(${shadowX}px ${shadowY}px ${shadowBlur}px rgba(6, 2, 18, ${shadowStrength}))`,
      shadeOpacity: 0.08 + wave * 0.28,
      edgeOpacity: wave * 0.92,
      edgeShift,
      underLift: wave * 0.35,
    };
  }

  const rotateY = 168 - progress * 168 + wave * 3.5;
  const edgeShift = wave * 18;

  return {
    transform: `translateZ(${lift}px) rotateY(${rotateY}deg) skewX(${-skew}deg) scaleX(${pinch})`,
    transformOrigin: "0% 50%",
    filter: `drop-shadow(${shadowX}px ${shadowY}px ${shadowBlur}px rgba(6, 2, 18, ${shadowStrength}))`,
    shadeOpacity: 0.08 + wave * 0.28,
    edgeOpacity: wave * 0.92,
    edgeShift,
    underLift: wave * 0.35,
  };
}

export default function PageTurn({ turn, onComplete }) {
  const finishedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const curlRef = useRef(null);
  const rafRef = useRef(0);
  const startedRef = useRef(0);
  const [frame, setFrame] = useState(() => curlFrame(turn.direction, 0));

  const { from, to, direction } = turn;
  const underPage = to;
  const curlPage = direction === "next" ? from : to;

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
    setFrame(curlFrame(direction, 0));

    const duration = turnDurationMs();

    const tick = (now) => {
      if (!startedRef.current) startedRef.current = now;
      const elapsed = now - startedRef.current;
      const raw = Math.min(elapsed / duration, 1);
      const progress = curlEase(raw);
      const nextFrame = curlFrame(direction, progress);
      setFrame(nextFrame);

      if (curlRef.current) {
        curlRef.current.style.transform = nextFrame.transform;
        curlRef.current.style.transformOrigin = nextFrame.transformOrigin;
        curlRef.current.style.filter = nextFrame.filter;
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
    <div className="page-stage" aria-live="polite" aria-busy="true">
      <div className="page-underneath-shadow" style={{ opacity: frame.underLift }} aria-hidden="true" />
      <div className="page-underneath">
        <BookPageShell pageNumber={underPage} className="page-turn-under" />
      </div>

      <div
        ref={curlRef}
        className={`page-curl is-${direction}`}
        style={{
          transform: frame.transform,
          transformOrigin: frame.transformOrigin,
          filter: frame.filter,
        }}
      >
        <div className="page-curl-face">
          <BookPageShell pageNumber={curlPage} className="page-turn-front-page" />
          <div className="page-curl-shade" style={{ opacity: frame.shadeOpacity }} aria-hidden="true" />
          <div
            className={`page-curl-edge is-${direction}`}
            style={{
              opacity: frame.edgeOpacity,
              transform:
                direction === "next"
                  ? `translateX(${frame.edgeShift}px)`
                  : `translateX(${-frame.edgeShift}px)`,
            }}
            aria-hidden="true"
          />
        </div>
        <div className="page-curl-back" aria-hidden="true">
          <div className="page-curl-back-paper" />
        </div>
      </div>
    </div>
  );
}
