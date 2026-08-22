import { UI } from "../data/catalog.js";

export default function GameFilters({ filters, selected, onChange }) {
  if (!filters) return null;
  const filterUi = UI.filters || {};

  const toggleMulti = (key, value) => {
    const current = selected[key] || [];
    const next = current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
    onChange({ ...selected, [key]: next });
  };

  const allLabel = filterUi.all || "Tất cả";

  return (
    <section className="filters" aria-label="Bộ lọc">
      <fieldset>
        <legend>{filterUi.legendPlayers || "Số người"}</legend>
        <div className="chips">
          {filters.players.map((item) => (
            <label key={item.value} className={selected.players === item.value ? "chip on" : "chip"}>
              <input
                type="radio"
                name="players"
                value={item.value}
                checked={selected.players === item.value}
                onChange={() => onChange({ ...selected, players: item.value })}
              />
              {item.label}
            </label>
          ))}
          <button type="button" className="chip ghost" onClick={() => onChange({ ...selected, players: "" })}>
            {allLabel}
          </button>
        </div>
      </fieldset>

      <fieldset>
        <legend>{filterUi.legendDuration || "Thời gian"}</legend>
        <div className="chips">
          {filters.durations.map((item) => (
            <label key={item.value} className={selected.duration === item.value ? "chip on" : "chip"}>
              <input
                type="radio"
                name="duration"
                value={item.value}
                checked={selected.duration === item.value}
                onChange={() => onChange({ ...selected, duration: item.value })}
              />
              {item.label}
            </label>
          ))}
          <button type="button" className="chip ghost" onClick={() => onChange({ ...selected, duration: "" })}>
            {allLabel}
          </button>
        </div>
      </fieldset>
    </section>
  );
}
