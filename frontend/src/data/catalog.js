import catalog from "./catalog.json";

/** Raw catalog — single source of truth for static ebook/game content. */
export const CATALOG = catalog;

export const GAMES = catalog.games || [];
export const WEBS = catalog.webs || [];
export const FILTERS = catalog.filters || {};
export const SHEETS = catalog.sheets || [];
export const UI = catalog.ui || {};
export const SITE = catalog.site || {};

/**
 * Screenshot mapping.
 *
 * Page 1  -> Screenshot 2026-08-22 211740.png
 * Page 2  -> Screenshot 2026-08-22 211748.png
 * ...
 * Page 33 -> Screenshot 2026-08-22 212247.png
 *
 * Game pages start at page 6:
 * Page 6 -> Screenshot 2026-08-22 211822.png
 */
export const SCREENSHOTS = [
  "/images/Screenshot 2026-08-22 211740.png",
  "/images/Screenshot 2026-08-22 211748.png",
  "/images/Screenshot 2026-08-22 211754.png",
  "/images/Screenshot 2026-08-22 211802.png",
  "/images/Screenshot 2026-08-22 211812.png",

  // GAME 01 -> GAME 25
  "/images/Screenshot 2026-08-22 211822.png",
  "/images/Screenshot 2026-08-22 211828.png",
  "/images/Screenshot 2026-08-22 211838.png",
  "/images/Screenshot 2026-08-22 211848.png",
  "/images/Screenshot 2026-08-22 211856.png",
  "/images/Screenshot 2026-08-22 211905.png",
  "/images/Screenshot 2026-08-22 211917.png",
  "/images/Screenshot 2026-08-22 211928.png",
  "/images/Screenshot 2026-08-22 211936.png",
  "/images/Screenshot 2026-08-22 211943.png",
  "/images/Screenshot 2026-08-22 211953.png",
  "/images/Screenshot 2026-08-22 212000.png",
  "/images/Screenshot 2026-08-22 212012.png",
  "/images/Screenshot 2026-08-22 212021.png",
  "/images/Screenshot 2026-08-22 212032.png",
  "/images/Screenshot 2026-08-22 212049.png",
  "/images/Screenshot 2026-08-22 212058.png",
  "/images/Screenshot 2026-08-22 212109.png",
  "/images/Screenshot 2026-08-22 212116.png",
  "/images/Screenshot 2026-08-22 212125.png",
  "/images/Screenshot 2026-08-22 212136.png",
  "/images/Screenshot 2026-08-22 212146.png",
  "/images/Screenshot 2026-08-22 212156.png",
  "/images/Screenshot 2026-08-22 212209.png",
  "/images/Screenshot 2026-08-22 212221.png",
  "/images/Screenshot 2026-08-22 212231.png",
  "/images/Screenshot 2026-08-22 212240.png",
  "/images/Screenshot 2026-08-22 212247.png",
];

/**
 * Official game names read from the 25 game screenshots.
 *
 * ID 1  -> Page 6
 * ID 25 -> Page 30
 */
export const GAME_NAMES = {
  1: "5 Giây",
  2: "This or That",
  3: "Tìm Điểm Chung Nhanh",
  4: "Bingo Làm Quen",
  5: "Câu Chuyện 3 Chương",
  6: "Đứng Lên Ngồi Xuống",
  7: "Đi Tìm Báu Vật",
  8: "Nối Vòng Tay Lớn",
  9: "Đoán Loại Rau",
  10: "Lá Bàn",
  11: "Đổi Chỗ Thần Tốc",
  12: "Đoán Địa Danh Việt Nam",
  13: "Săn Số 1–100",
  14: "Đoán Hành Động",
  15: "Tôi Là Ai?",
  16: "Đáp Án Bí Mật",
  17: "5 Second Rule",
  18: "Đếm Số Thay Thế",
  19: "Chữ Đầu Chữ Cuối",
  20: "Đoán Từ Theo Gợi Ý",
  21: "Ai Là Gián Điệp?",
  22: "Nối Từ",
  23: "Có Gì Thay Đổi?",
  24: "Cân Não Logic",
  25: "Giải Mật Thư",
};

/**
 * Game pages are fixed by the screenshot layout.
 *
 * Page 6  -> Game 1
 * Page 7  -> Game 2
 * ...
 * Page 30 -> Game 25
 */
export const GAME_START_PAGE = 6;
export const GAME_END_PAGE = GAME_START_PAGE + 25 - 1;

/**
 * Get screenshot mapped to ebook page.
 */
export function getScreenshotByPage(page) {
  const n = Number(page);

  if (!Number.isInteger(n)) return null;
  if (n < 1 || n > SCREENSHOTS.length) return null;

  return SCREENSHOTS[n - 1];
}

/**
 * Raw catalog assets.
 */
export const EBOOK_BACKGROUND =
    catalog.assets?.ebookBackground ||
    "/images/purple-background.png";

export const GAME_PAGE_BACKGROUND =
    catalog.assets?.gamePageBackground ||
    EBOOK_BACKGROUND;

export const FALLBACK_GAME_IMAGE =
    catalog.assets?.fallbackHeroImage ||
    "/images/games/fallback.svg";

export const FALLBACK_INSTRUCTION_IMAGE =
    catalog.assets?.fallbackInstructionImage ||
    "/images/games/instructions/fallback.svg";

function numberedPages(items, key = "page") {
  return items
      .map((item) => Number(item?.[key]))
      .filter((n) => Number.isFinite(n));
}

export function firstPage() {
  const pages = [
    ...numberedPages(SHEETS),
    ...numberedPages(GAMES),
    ...numberedPages(WEBS),
  ];

  return pages.length ? Math.min(...pages) : 1;
}

export function lastPage() {
  const pages = [
    ...numberedPages(SHEETS),
    ...numberedPages(GAMES),
    ...numberedPages(WEBS),
  ];

  const catalogLastPage =
      pages.length ? Math.max(...pages) : 1;

  return Math.max(
      catalogLastPage,
      SCREENSHOTS.length
  );
}

export const FIRST_PAGE = firstPage();
export const LAST_PAGE = lastPage();

export const EBOOK = {
  ...catalog.ebook,
  firstPage: FIRST_PAGE,
  lastPage: LAST_PAGE,
  gameStartPage: GAME_START_PAGE,
};

/**
 * Return the official game name.
 *
 * Priority:
 * 1. catalog.json name
 * 2. OCR-derived GAME_NAMES
 * 3. empty string
 */
export function getGameName(game) {
  if (!game) return "";

  const id = Number(game.id);

  return (
      game.name ||
      GAME_NAMES[id] ||
      ""
  );
}

/**
 * Replace:
 * {gameStartPage}
 * {lastPage}
 * {gameCount}
 * {title}
 */
export function resolveCatalogText(text) {
  if (text == null) return "";

  return String(text)
      .replace(
          /\{gameStartPage\}/g,
          String(GAME_START_PAGE)
      )
      .replace(
          /\{lastPage\}/g,
          String(LAST_PAGE)
      )
      .replace(
          /\{gameCount\}/g,
          String(GAMES.length || 25)
      )
      .replace(
          /\{title\}/g,
          EBOOK.title || ""
      );
}

export function resolveCatalogLines(value) {
  const lines = asLines(value);

  return lines.map((line) =>
      resolveCatalogText(line)
  );
}

export function formatPlayers(min, max) {
  if (min == null) return "";

  if (max == null) {
    return `${min}+ người`;
  }

  if (min === max) {
    return `${min} người`;
  }

  return `${min}–${max} người`;
}

export function formatDuration(min, max) {
  if (min == null) return "";

  if (min === max) {
    return `${min} phút`;
  }

  return `${min}–${max} phút`;
}

export function getGameById(id) {
  const key = Number(id);

  return (
      GAMES.find(
          (game) => Number(game.id) === key
      ) || null
  );
}

export function getGameByPage(page) {
  const key = Number(page);

  return (
      GAMES.find(
          (game) => Number(game.page) === key
      ) ||
      GAMES.find(
          (game) =>
              Number(game.id) ===
              key - GAME_START_PAGE + 1
      ) ||
      null
  );
}

export function getWebByPage(page) {
  const key = Number(page);

  return (
      WEBS.find(
          (web) => Number(web.page) === key
      ) || null
  );
}

export function getDesignSheet(page) {
  const key = Number(page);

  return (
      SHEETS.find(
          (sheet) => Number(sheet.page) === key
      ) || null
  );
}

export function gamesByPage() {
  return [...GAMES].sort(
      (a, b) =>
          Number(a.page) - Number(b.page)
  );
}

/**
 * Get background for a game page.
 */
export function getGamePageBackground(game) {
  return (
      game?.assets?.background ||
      GAME_PAGE_BACKGROUND
  );
}

/**
 * Get hero image for a game.
 *
 * Priority:
 * 1. heroImage
 * 2. coverImage
 * 3. image
 * 4. mapped screenshot by page
 * 5. fallback image
 */
export function getHeroImage(game) {
  if (!game) {
    return FALLBACK_GAME_IMAGE;
  }

  return (
      game.heroImage ||
      game.coverImage ||
      game.image ||
      getScreenshotByPage(game.page) ||
      FALLBACK_GAME_IMAGE
  );
}

export function getInstructionImage(game) {
  return (
      game?.instructionImage ||
      FALLBACK_INSTRUCTION_IMAGE
  );
}

export function hasInstructionImage(game) {
  return Boolean(
      game?.instructionImage?.trim()
  );
}

export function onImageError(fallbackSrc) {
  return (event) => {
    const img = event.currentTarget;

    if (img.dataset.fallback === "1") {
      return;
    }

    img.dataset.fallback = "1";
    img.src = fallbackSrc;
  };
}

export function asLines(value) {
  if (Array.isArray(value)) {
    return value
        .map((item) => String(item).trim())
        .filter(Boolean);
  }

  if (value == null || value === "") {
    return [];
  }

  return String(value)
      .split(/\n/)
      .map((line) => line.trim())
      .filter(Boolean);
}

export function playerModeSections(game) {
  const modes = game?.playerModes;

  if (!Array.isArray(modes) || !modes.length) {
    return [];
  }

  return modes
      .map((mode, index) => ({
        key: String(
            mode.key ||
            mode.players ||
            index
        ),

        label:
            mode.label ||
            mode.players ||
            "",

        instructions: asLines(
            mode.instructions
        ),

        rules: asLines(
            mode.rules
        ),
      }))
      .filter(
          (mode) =>
              mode.label &&
              (
                  mode.instructions.length ||
                  mode.rules.length
              )
      );
}

export function howToPlaySteps(game) {
  const raw = game?.howToPlay;

  if (Array.isArray(raw)) {
    return raw
        .map((item) => String(item).trim())
        .filter(Boolean);
  }

  if (raw == null || raw === "") {
    return [];
  }

  return String(raw)
      .split(/\n/)
      .map((line) =>
          line
              .replace(/^\d+\.\s*/, "")
              .trim()
      )
      .filter(Boolean);
}

/**
 * Normalized view-model for rendering a game sheet.
 */
export function getGameDisplay(game) {
  if (!game) return null;

  const purposes =
      game.purposes?.length
          ? game.purposes
          : game.tags || [];

  const modes =
      playerModeSections(game);

  return {
    id: game.id,

    page: game.page,

    /**
     * Official name from the 25-game OCR list.
     */
    name: getGameName(game),

    description:
        game.description || "",

    players:
        game.players ||
        formatPlayers(
            game.minPlayers,
            game.maxPlayers
        ),

    time:
        game.time ||
        game.duration ||
        formatDuration(
            game.durationMin,
            game.durationMax
        ),

    context:
        game.context ||
        (game.contexts || []).join(", "),

    purposes,

    tags: purposes,

    heroImage:
        getHeroImage(game),

    instructionImage:
        hasInstructionImage(game)
            ? game.instructionImage
            : null,

    showInstructionImage:
        hasInstructionImage(game),

    playerModes: modes,

    howToPlay:
        modes.length
            ? []
            : howToPlaySteps(game),

    preparation:
        asLines(game.preparation),

    rules:
        asLines(game.rules),
  };
}

/**
 * Resolve a page into its actual content type.
 *
 * Priority:
 * 1. design sheet
 * 2. game
 * 3. web
 * 4. empty
 */
export function getSheet(page) {
  const n = Number(page);

  const screenshot =
      getScreenshotByPage(n);

  const design =
      getDesignSheet(n);

  if (design) {
    return {
      type: "design",
      page: n,
      sheet: design,
      screenshot,
    };
  }

  const game =
      getGameByPage(n);

  if (game) {
    const gameIndex =
        Number(game.id) ||
        n - GAME_START_PAGE + 1;

    return {
      type: "game",
      page: n,
      game,

      gameIndex,

      screenshot,
    };
  }

  const web =
      getWebByPage(n);

  if (web) {
    return {
      type: "web",
      page: n,
      web,
      screenshot,
    };
  }

  return {
    type: "empty",
    page: n,
    screenshot,
  };
}

export function isCoverPage(page) {
  return Number(page) === FIRST_PAGE;
}

export function clampPage(page) {
  const first =
      FIRST_PAGE || 1;

  const last =
      LAST_PAGE || first;

  const n = Number(page);

  if (!Number.isFinite(n)) {
    return first;
  }

  return Math.min(
      Math.max(
          Math.round(n),
          first
      ),
      last
  );
}

export function spreadPages(page, twoPage) {
  const current =
      clampPage(page);

  if (!twoPage) {
    return [current];
  }

  const first =
      FIRST_PAGE || 1;

  const offset =
      current - first;

  const left =
      offset % 2 === 0
          ? current
          : current - 1;

  const right =
      left + 1;

  return right <= LAST_PAGE
      ? [left, right]
      : [left];
}