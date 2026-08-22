import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header.jsx";
import SearchBar from "../components/SearchBar.jsx";
import GameFilters from "../components/GameFilters.jsx";
import SearchResults from "../components/SearchResults.jsx";
import EbookReader from "../components/EbookReader.jsx";
import {
  EBOOK,
  FILTERS,
  GAMES,
  UI,
  clampPage,
  resolveCatalogText,
} from "../data/catalog.js";
import {
  EMPTY_FILTERS,
  filterGames,
  hasActiveQuery,
} from "../data/filterGames.js";

export default function HomePage() {
  const { page } = useParams();
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(EMPTY_FILTERS);

  const homeUi = UI.home || {};
  const currentPage = clampPage(page || 1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
    }, 250);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (!page) {
      navigate("/page/1", { replace: true });
    }
  }, [page, navigate]);

  useEffect(() => {
    const raw = Number(page);

    if (!Number.isFinite(raw) || raw !== currentPage) {
      navigate(`/page/${currentPage}`, { replace: true });
    }
  }, [page, currentPage, navigate]);

  const filtered = useMemo(() => {
    return filterGames(GAMES, {
      search,
      selected,
    });
  }, [search, selected]);

  const querying = hasActiveQuery(search, selected);

  const summaryText = resolveCatalogText(
      homeUi.summary || "{title} · {count} trò chơi"
  )
      .replace("{title}", EBOOK.title)
      .replace("{count}", String(GAMES.length));

  const clearSearch = () => {
    setSearchInput("");
    setSearch("");
    setSelected(EMPTY_FILTERS);
  };

  return (
      <div className="page page-home">
        <Header />

        <main className="layout layout-ebook">
          <SearchBar
              value={searchInput}
              onChange={setSearchInput}
          />

          <GameFilters
              filters={FILTERS}
              selected={selected}
              onChange={setSelected}
          />

          {querying ? (
              <SearchResults
                  games={filtered}
                  total={filtered.length}
                  onClear={clearSearch}
              />
          ) : (
              <div className="result-bar">
                <p>{summaryText}</p>
              </div>
          )}

          <EbookReader page={currentPage} />
        </main>
      </div>
  );
}