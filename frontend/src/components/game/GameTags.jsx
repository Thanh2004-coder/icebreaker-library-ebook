export default function GameTags({ tags }) {
  const list = Array.isArray(tags) ? tags.filter(Boolean) : [];
  if (!list.length) return null;
  return (
    <div className="tag-row">
      {list.map((item) => (
        <span key={item} className="tag purpose">
          🎯 {item}
        </span>
      ))}
    </div>
  );
}
