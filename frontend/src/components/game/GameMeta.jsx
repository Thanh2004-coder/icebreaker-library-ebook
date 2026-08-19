export default function GameMeta({ display }) {
  if (!display) return null;
  return (
    <ul className="meta">
      {display.players ? <li>👥 {display.players}</li> : null}
      {display.context ? <li>📍 {display.context}</li> : null}
      {display.time ? <li>⏱ {display.time}</li> : null}
    </ul>
  );
}
