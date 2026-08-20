/**
 * Large centered game/web page viewer (ebook pages 5+).
 * Intentionally separate from FitPageStage so pages 1–4 stay unchanged.
 */
export default function GamePageStage({ children, pageKey, className = "" }) {
  return (
    <div className={`ebook-game-viewer ${className}`.trim()} data-page={pageKey}>
      <div className="ebook-game-viewer__stage">
        <div className="ebook-game-viewer__frame">{children}</div>
      </div>
    </div>
  );
}
