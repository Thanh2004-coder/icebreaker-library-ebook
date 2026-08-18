import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header.jsx";
import SearchBar from "../components/SearchBar.jsx";
import GameFilters from "../components/GameFilters.jsx";
import SearchResults from "../components/SearchResults.jsx";
import EbookReader from "../components/EbookReader.jsx";
import { EBOOK, FILTERS, GAMES, clampPage } from "../data/catalog.js";
import { EMPTY_FILTERS, filterGames, hasActiveQuery } from "../data/filterGames.js";

export default function HomePage() {
  const { page } = useParams();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(EMPTY_FILTERS);

  const currentPage = clampPage(page || 1);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 250);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (!page) navigate("/page/1", { replace: true });
  }, [page, navigate]);

  const filtered = useMemo(
    () => filterGames(GAMES, { search, selected }),
    [search, selected]
  );
  const querying = hasActiveQuery(search, selected);

  return (
    <div className="page">
      <Header />
      <main className="layout">
        <SearchBar value={searchInput} onChange={setSearchInput} />
        <GameFilters filters={FILTERS} selected={selected} onChange={setSelected} />
        {querying ? (
          <SearchResults
            games={filtered}
            total={filtered.length}
            onClear={() => {
              setSearchInput("");
              setSearch("");
              setSelected(EMPTY_FILTERS);
            }}
          />
        ) : (
          <div className="result-bar">
            <p>{EBOOK.title} · {GAMES.length} trò chơi</p>
          </div>
        )}
        <EbookReader page={currentPage} />
      </main>
    </div>
  );
}
