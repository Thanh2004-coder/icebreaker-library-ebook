import { UI } from "../data/catalog.js";

export default function SearchBar({ value, onChange }) {
  const searchUi = UI.search || {};
  return (
    <form className="search-wrap" onSubmit={(event) => event.preventDefault()}>
      <label htmlFor="search">{searchUi.label || "Tìm kiếm trò chơi"}</label>
      <input
        id="search"
        type="search"
        placeholder={searchUi.placeholder || "Tìm kiếm trò chơi..."}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </form>
  );
}
