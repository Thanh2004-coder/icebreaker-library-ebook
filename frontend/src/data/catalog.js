import catalog from "./catalog.json";

/** Raw catalog — single source of truth for static ebook/game content. */
export const CATALOG = catalog;
export const GAMES = catalog.games || [];
export const FILTERS = catalog.filters || {};
export const SHEETS = catalog.sheets || [];
export const UI = catalog.ui || {};
export const SITE = catalog.site || {};

export const FALLBACK_GAME_IMAGE =
  catalog.assets?.fallbackHeroImage || "/images/games/fallback.svg";
export const FALLBACK_INSTRUCTION_IMAGE =
  catalog.assets?.fallbackInstructionImage || "/images/games/instructions/fallback.svg";

function numberedPages(items, key = "page") {
  return items.map((item) => Number(item?.[key])).filter((n) => Number.isFinite(n));
}

export function lastPage() {
  const pages = [...numberedPages(SHEETS), ...numberedPages(GAMES)];
  return pages.length ? Math.max(...pages) : 1;
}

export function gameStartPage() {
  const pages = numberedPages(GAMES);
  return pages.length ? Math.min(...pages) : lastPage();
}

export const LAST_PAGE = lastPage();
export const GAME_START_PAGE = gameStartPage();

export const EBOOK = {
  ...catalog.ebook,
  lastPage: LAST_PAGE,
  gameStartPage: GAME_START_PAGE,
};

/** Replace {gameStartPage}, {lastPage}, {gameCount} in catalog copy. */
export function resolveCatalogText(text) {
  if (text == null) return "";
  return String(text)
    .replace(/\{gameStartPage\}/g, String(GAME_START_PAGE))
    .replace(/\{lastPage\}/g, String(LAST_PAGE))
    .replace(/\{gameCount\}/g, String(GAMES.length))
    .replace(/\{title\}/g, EBOOK.title || "");
}

export function resolveCatalogLines(value) {
  const lines = asLines(value);
  return lines.map((line) => resolveCatalogText(line));
}

export function formatPlayers(min, max) {
  if (min == null) return "";
  if (max == null) return `${min}+ người`;
  if (min === max) return `${min} người`;
  return `${min}–${max} người`;
}

export function formatDuration(min, max) {
  if (min == null) return "";
  if (min === max) return `${min} phút`;
  return `${min}–${max} phút`;
}

export function getGameById(id) {
  const key = Number(id);
  return GAMES.find((game) => Number(game.id) === key) || null;
}

export function getGameByPage(page) {
  const key = Number(page);
  return GAMES.find((game) => Number(game.page) === key) || null;
}

export function gamesByPage() {
  return [...GAMES].sort((a, b) => a.page - b.page);
}

export function getHeroImage(game) {
  return game?.heroImage || game?.coverImage || game?.image || FALLBACK_GAME_IMAGE;
}

export function getInstructionImage(game) {
  return game?.instructionImage || FALLBACK_INSTRUCTION_IMAGE;
}

export function hasInstructionImage(game) {
  return Boolean(game?.instructionImage?.trim());
}

export function onImageError(fallbackSrc) {
  return (event) => {
    const img = event.currentTarget;
    if (img.dataset.fallback === "1") return;
    img.dataset.fallback = "1";
    img.src = fallbackSrc;
  };
}

export function asLines(value) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (value == null || value === "") return [];
  return String(value)
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function howToPlaySteps(game) {
  const raw = game?.howToPlay;
  if (Array.isArray(raw)) return raw.map((item) => String(item).trim()).filter(Boolean);
  if (raw == null || raw === "") return [];
  return String(raw)
    .split(/\n/)
    .map((line) => line.replace(/^\d+\.\s*/, "").trim())
    .filter(Boolean);
}

/** Normalized view-model for rendering a game sheet — components read this, not raw quirks. */
export function getGameDisplay(game) {
  if (!game) return null;
  const purposes = game.purposes?.length ? game.purposes : game.tags || [];
  return {
    id: game.id,
    page: game.page,
    name: game.name || "",
    description: game.description || "",
    players: game.players || formatPlayers(game.minPlayers, game.maxPlayers),
    time: game.time || game.duration || formatDuration(game.durationMin, game.durationMax),
    context: game.context || (game.contexts || []).join(", "),
    purposes,
    tags: purposes,
    heroImage: getHeroImage(game),
    instructionImage: hasInstructionImage(game) ? game.instructionImage : null,
    showInstructionImage: hasInstructionImage(game),
    howToPlay: howToPlaySteps(game),
    preparation: asLines(game.preparation),
    rules: asLines(game.rules),
  };
}

export function getSheet(page) {
  const n = Number(page);
  const game = getGameByPage(n);
  if (game) return { type: "game", page: n, game };
  const sheet = SHEETS.find((item) => Number(item.page) === n);
  if (sheet) {
    if (sheet.type === "text" && sheet.body) {
      return {
        ...sheet,
        body: resolveCatalogLines(sheet.body),
      };
    }
    return { ...sheet };
  }
  return { type: "empty", page: n };
}

export function isCoverPage(page) {
  return getSheet(page).type === "cover";
}

export function clampPage(page) {
  const n = Number(page);
  if (!Number.isFinite(n)) return 1;
  return Math.min(Math.max(Math.round(n), 1), LAST_PAGE);
}

export function spreadPages(page, twoPage) {
  const current = clampPage(page);
  if (!twoPage) return [current];
  if (isCoverPage(current)) return [current];
  const left = current % 2 === 0 ? current : current - 1;
  const right = left + 1;
  return right <= LAST_PAGE ? [left, right] : [left];
}
