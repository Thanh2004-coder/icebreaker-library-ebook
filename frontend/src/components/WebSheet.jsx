export default function WebSheet({ web }) {
  if (!web) return null;

  if (web.url) {
    return (
      <article className="web-sheet">
        {web.title ? <h1 className="web-sheet-title">{web.title}</h1> : null}
        <iframe
          src={web.url}
          title={web.title || `Web ${web.id}`}
          className="web-sheet-frame"
          loading="lazy"
        />
      </article>
    );
  }

  return (
    <article className="web-sheet web-sheet-empty" aria-label={web.title || `Web ${web.id}`}>
      {web.title ? <h1 className="web-sheet-title">{web.title}</h1> : null}
    </article>
  );
}
