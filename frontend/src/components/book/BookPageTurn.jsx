import { useEffect, useRef } from "react";
import { BookPageShell } from "./pageHelpers.jsx";

const TURN_MS_DESKTOP = 780;
const TURN_MS_MOBILE = 620;

function turnDurationMs() {
  if (typeof window === "undefined") return TURN_MS_DESKTOP;
  return window.matchMedia("(max-width: 899px)").matches ? TURN_MS_MOBILE : TURN_MS_DESKTOP;
}

export default function BookPageTurn({ turn, onComplete }) {
  const finishedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
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
    const timer = window.setTimeout(finish, turnDurationMs() + 80);
    return () => window.clearTimeout(timer);
  }, [turn]);

  return (
    <div className="page-turn-viewport" aria-live="polite" aria-busy="true">
      <BookPageShell pageNumber={underPage} className="page-turn-under" />

      <div
        className={`page-turn-leaf is-${direction}`}
        onAnimationEnd={(event) => {
          if (event.target !== event.currentTarget) return;
          finish();
        }}
      >
        <div className="page-turn-face page-turn-front">
          <BookPageShell pageNumber={frontPage} className="page-turn-front-page" />
          <div className="page-turn-edge-glow" aria-hidden="true" />
        </div>
        <div className="page-turn-face page-turn-back" aria-hidden="true">
          <div className="page-turn-back-paper" />
          <div className="page-turn-back-shade" />
        </div>
      </div>
    </div>
  );
}
