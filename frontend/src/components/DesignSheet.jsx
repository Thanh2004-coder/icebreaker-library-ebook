export default function DesignSheet({ sheet }) {
  if (!sheet?.image) return null;

  return (
    <article className="design-sheet design-sheet-page">
      <img
        src={sheet.image}
        alt={sheet.alt || `Trang ${sheet.page}`}
        className="design-sheet-image"
        loading="lazy"
      />
    </article>
  );
}
