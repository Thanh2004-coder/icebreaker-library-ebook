import { FILTERS } from "./catalog.js";

function unaccent(input) {
  if (input == null) return "";
  return String(input)
    .trim()
    .normalize("NFD")
    .replace(/\p{M}+/gu, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase();
}

function slugToLabel(options, slug) {
  if (!slug || !options) return null;
  return options.find((item) => item.value === slug)?.label || null;
}

function matchesPlayers(game, players) {
  if (!players) return true;
  const count = game.minPlayers;
  switch (players) {
    case "2":
      return count === 2;
    case "3-4":
      return count >= 3 && count <= 4;
    case "5":
      return count === 5;
    case "6-10":
      return count >= 6 && count <= 10;
    case "10+":
      return count >= 10;
    default:
      return true;
  }
}

function matchesDuration(game, duration) {
  if (!duration) return true;
  const minutes = game.durationMin;
  switch (duration) {
    case "under-5":
      return minutes < 5;
    case "5-7":
      return minutes >= 5 && minutes <= 7;
    case "8-10":
      return minutes >= 8 && minutes <= 10;
    case "10-15":
      return minutes >= 10 && minutes <= 15;
    case "over-15":
      return minutes > 15;
    default:
      return true;
  }
}

function contextNames(game) {
  if (game.contexts?.length) return game.contexts;
  if (game.context) return game.context.split(",").map((item) => item.trim()).filter(Boolean);
  return [];
}

function purposeNames(game) {
  if (game.purposes?.length) return game.purposes;
  if (game.purpose) return game.purpose.split(",").map((item) => item.trim()).filter(Boolean);
  return [];
}

function matchesSearch(game, search) {
  if (!search || !search.trim()) return true;
  const raw = search.trim().toLowerCase();
  const needle = unaccent(search);
  const haystack = [game.name, game.description, game.purpose, ...(game.purposes || []), ...(game.tags || [])]
    .filter(Boolean)
    .join(" ");
  return haystack.toLowerCase().includes(raw) || unaccent(haystack).includes(needle);
}

export function filterGames(games, { search, selected }) {
  const list = Array.isArray(games) ? games : [];
  const catalog = FILTERS;
  return list
    .filter((game) => matchesSearch(game, search))
    .filter((game) => matchesPlayers(game, selected?.players))
    .filter((game) => {
      if (!selected?.context) return true;
      const label = slugToLabel(catalog.contexts, selected.context);
      return label ? contextNames(game).includes(label) : true;
    })
    .filter((game) => {
      if (!selected?.purposes?.length) return true;
      const names = purposeNames(game);
      return selected.purposes.some((slug) => {
        const label = slugToLabel(catalog.purposes, slug);
        return label ? names.includes(label) : false;
      });
    })
    .filter((game) => matchesDuration(game, selected?.duration))
    .slice()
    .sort((a, b) => a.page - b.page);
}

export const EMPTY_FILTERS = {
  players: "",
  context: "",
  purposes: [],
  duration: "",
};

export function hasActiveQuery(search, selected) {
  return Boolean(
    (search && search.trim()) ||
      selected?.players ||
      selected?.context ||
      selected?.duration ||
      selected?.purposes?.length
  );
}
