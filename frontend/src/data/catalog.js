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
 * Page 1  -> Screenshot 01.png
 * Page 2  -> Screenshot 02.png
 * Page 3  -> Screenshot 03.png
 * Page 4  -> Screenshot 04.png
 * Page 5  -> Screenshot 05.png
 * ...
 * Page 32 -> Screenshot 32.png
 *
 * Game pages start at page 5:
 * Page 5 -> Game 1
 * Page 6 -> Game 2
 * ...
 * Page 29 -> Game 25
 */
export const SCREENSHOTS = [
  "/images/01.png",
  "/images/02.png",
  "/images/03.png",
  "/images/04.png",
  "/images/05.png",
  "/images/06.png",
  "/images/07.png",
  "/images/08.png",
  "/images/09.png",
  "/images/10.png",
  "/images/11.png",
  "/images/12.png",
  "/images/13.png",
  "/images/14.png",
  "/images/15.png",
  "/images/16.png",
  "/images/17.png",
  "/images/18.png",
  "/images/19.png",
  "/images/20.png",
  "/images/21.png",
  "/images/22.png",
  "/images/23.png",
  "/images/24.png",
  "/images/25.png",
  "/images/26.png",
  "/images/27.png",
  "/images/28.png",
  "/images/29.png",
  "/images/30.png",
  "/images/31.png",
  "/images/32.png",
];

/**
 * Official game names read from the 25 game screenshots.
 *
 * ID 1  -> Page 5
 * ID 25 -> Page 29
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
 * Page 5  -> Game 1
 * Page 6  -> Game 2
 * ...
 * Page 29 -> Game 25
 */
export const GAME_START_PAGE = 5;
export const GAME_END_PAGE =
    GAME_START_PAGE + 25 - 1;

/**
 * Get screenshot mapped to ebook page.
 */
export function getScreenshotByPage(page) {
  const n = Number(page);

  if (!Number.isInteger(n)) {
    return null;
  }

  if (n < 1 || n > SCREENSHOTS.length) {
    return null;
  }

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

  return pages.length
      ? Math.min(...pages)
      : 1;
}

export function lastPage() {
  const pages = [
    ...numberedPages(SHEETS),
    ...numberedPages(GAMES),
    ...numberedPages(WEBS),
  ];

  const catalogLastPage =
      pages.length
          ? Math.max(...pages)
          : 1;

  return Math.max(
      catalogLastPage,
      SCREENSHOTS.length
  );
}

export const FIRST_PAGE = firstPage();
export const LAST_PAGE = lastPage();

export function clampPage(page) {
  const n = Number(page);

  if (!Number.isFinite(n)) {
    return FIRST_PAGE;
  }

  return Math.min(
      Math.max(
          Math.floor(n),
          FIRST_PAGE
      ),
      LAST_PAGE
  );
}

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
  if (!game) {
    return "";
  }

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
  if (text == null) {
    return "";
  }

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
  if (min == null) {
    return "";
  }

  if (max == null) {
    return `${min}+ người`;
  }

  if (min === max) {
    return `${min} người`;
  }

  return `${min}–${max} người`;
}

export function formatDuration(min, max) {
  if (min == null) {
    return "";
  }

  if (min === max) {
    return `${min} phút`;
  }

  return `${min}–${max} phút`;
}

export function getGameById(id) {
  const key = Number(id);

  return (
      GAMES.find(
          (game) =>
              Number(game.id) === key
      ) || null
  );
}



export function gamesByPage() {
  return [...GAMES].sort(
      (a, b) =>
          Number(a.page) -
          Number(b.page)
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
 * 4. mapped screenshot by game position
 * 5. fallback image
 */
export function getHeroImage(game) {
  if (!game) {
    return FALLBACK_GAME_IMAGE;
  }

  const gameIndex = gamesByPage().findIndex(
      (item) =>
          Number(item.id) ===
          Number(game.id)
  );

  const gameScreenshot =
      gameIndex >= 0
          ? SCREENSHOTS[
          GAME_START_PAGE - 1 +
          gameIndex
              ]
          : null;

  return (
      game.heroImage ||
      game.coverImage ||
      game.image ||
      gameScreenshot ||
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
    const img =
        event.currentTarget;

    if (
        img.dataset.fallback === "1"
    ) {
      return;
    }

    img.dataset.fallback = "1";
    img.src = fallbackSrc;
  };
}

export function asLines(value) {
  if (Array.isArray(value)) {
    return value
        .map((item) =>
            String(item).trim()
        )
        .filter(Boolean);
  }

  if (
      value == null ||
      value === ""
  ) {
    return [];
  }

  return String(value)
      .split(/\n/)
      .map((line) =>
          line.trim()
      )
      .filter(Boolean);
}

export function playerModeSections(game) {
  const modes =
      game?.playerModes;

  if (
      !Array.isArray(modes) ||
      !modes.length
  ) {
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
  const raw =
      game?.howToPlay;

  if (Array.isArray(raw)) {
    return raw
        .map((item) =>
            String(item).trim()
        )
        .filter(Boolean);
  }

  if (
      raw == null ||
      raw === ""
  ) {
    return [];
  }

  return String(raw)
      .split(/\n/)
      .map((line) =>
          line
              .replace(
                  /^\d+\.\s*/,
                  ""
              )
              .trim()
      )
      .filter(Boolean);
}

/**
 * Normalized view-model for rendering a game sheet.
 */
export function getGameDisplay(game) {
  if (!game) {
    return null;
  }

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
        (game.contexts || [])
            .join(", "),

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
        asLines(
            game.preparation
        ),

    rules:
        asLines(game.rules),
  };
}

