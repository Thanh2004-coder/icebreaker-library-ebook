export default function SearchBar({ value, onChange }) {
  return (
    <form className="search-wrap" onSubmit={(event) => event.preventDefault()}>
      <label htmlFor="search">Tìm kiếm trò chơi</label>
      <input
        id="search"
        type="search"
        placeholder="Tìm kiếm trò chơi..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </form>
  );
}
