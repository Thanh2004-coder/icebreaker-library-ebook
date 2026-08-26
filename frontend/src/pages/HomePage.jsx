import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

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

const STATIC_GAME_LIST = [
  {
    name: "Trò chơi 5 giây",
    page: 5,
    howToPlay:
        "Người chơi có 5 giây để trả lời một câu hỏi trước khi chuyển lượt.",
  },
  {
    name: "This or That",
    page: 6,
    howToPlay:
        "Leader đưa ra hai lựa chọn. Người chơi chọn một trong hai trong vòng 3–5 giây.",
  },
  {
    name: "Tìm điểm chung nhanh",
    page: 7,
    howToPlay:
        "Các nhóm nhỏ tìm những sở thích, thói quen hoặc trải nghiệm giống nhau trong thời gian giới hạn.",
  },
  {
    name: "Bingo làm quen",
    page: 8,
    howToPlay:
        "Người chơi đi xung quanh bắt chuyện và tìm người phù hợp với các ô trên bảng Bingo.",
  },
  {
    name: "Câu chuyện 3 chương",
    page: 9,
    howToPlay:
        "Mỗi người kể một câu chuyện về bản thân theo ba phần: bắt đầu, bất ngờ và kết thúc.",
  },
  {
    name: "Đứng lên ngồi xuống",
    page: 10,
    howToPlay:
        "Người chơi làm theo lệnh Đứng hoặc Ngồi của Leader, càng về sau tốc độ càng nhanh.",
  },
  {
    name: "Đi tìm báu vật",
    page: 11,
    howToPlay:
        "Các đội nhanh chóng tìm đúng vật được Leader yêu cầu và mang về điểm tập kết.",
  },
  {
    name: "Nối vòng tay lớn",
    page: 12,
    howToPlay:
        "Người chơi nắm tay tạo thành mạng lưới rồi cùng nhau gỡ thành một vòng tròn mà không buông tay.",
  },
  {
    name: "Đoán loại rau",
    page: 13,
    howToPlay:
        "Các đội quan sát hình ảnh rau củ và nhanh chóng đưa ra đáp án để ghi điểm.",
  },
  {
    name: "La bàn",
    page: 14,
    howToPlay:
        "Người chơi phản ứng nhanh khi được gọi tên và phối hợp với hai người bên cạnh theo luật.",
  },
  {
    name: "Đổi chỗ thần tốc",
    page: 15,
    howToPlay:
        "Những người có đặc điểm được Leader gọi phải nhanh chóng đổi chỗ cho nhau.",
  },
  {
    name: "Đoán địa danh Việt Nam",
    page: 16,
    howToPlay:
        "Các đội quan sát hình ảnh địa danh Việt Nam và nhanh chóng đoán tên địa điểm.",
  },
  {
    name: "Săn số 1–100",
    page: 17,
    howToPlay:
        "Người chơi tìm số được Leader gọi trên bảng 1–100 và khoanh lại để giành quyền tiếp tục.",
  },
  {
    name: "Đoán hành động",
    page: 18,
    howToPlay:
        "Một người diễn tả hành động bí mật không được nói, đồng đội phải đoán trong thời gian giới hạn.",
  },
  {
    name: "Tôi là ai?",
    page: 19,
    howToPlay:
        "Người chơi dựa vào từng gợi ý để xác định ai phù hợp nhất với từ khóa.",
  },
  {
    name: "Đáp án bí mật",
    page: 20,
    howToPlay:
        "Người chơi đưa ra đáp án theo một chủ đề và cố gắng đoán xem người khác có chọn giống mình hay không.",
  },
  {
    name: "5 Second Rule",
    page: 21,
    howToPlay:
        "Người chơi phải đưa ra đủ ba đáp án đúng theo chủ đề trong vòng 5 giây.",
  },
  {
    name: "Đếm số thay thế",
    page: 22,
    howToPlay:
        "Người chơi lần lượt đếm số, sau đó thay một số bằng từ hoặc hành động mới theo luật.",
  },
  {
    name: "Chữ đầu chữ cuối",
    page: 23,
    howToPlay:
        "Hai người đưa ra chữ đầu và chữ cuối rồi nhanh chóng tìm một từ phù hợp.",
  },
  {
    name: "Đoán từ theo gợi ý",
    page: 24,
    howToPlay:
        "Leader đưa ra từng gợi ý để người chơi suy luận và đoán từ khóa.",
  },
  {
    name: "Ai là gián điệp?",
    page: 25,
    howToPlay:
        "Phần lớn nhận cùng một từ khóa, một người nhận từ gần giống và cả nhóm phải tìm ra gián điệp.",
  },
  {
    name: "Nối từ",
    page: 26,
    howToPlay:
        "Người chơi lần lượt nói từ theo luật nối từ. Ai không nghĩ ra hoặc quá thời gian sẽ mất lượt.",
  },
  {
    name: "Có gì thay đổi?",
    page: 27,
    howToPlay:
        "Người chơi quan sát, sau đó tìm những chi tiết đã bị Leader thay đổi.",
  },
  {
    name: "Cân não Logic",
    page: 28,
    howToPlay:
        "Các đội cùng giải những câu đố logic trong thời gian giới hạn.",
  },
  {
    name: "Giải mật thư",
    page: 29,
    howToPlay:
        "Các đội tìm quy luật và giải mã những manh mối để tìm ra thông điệp bí mật.",
  },
];

export default function HomePage() {
  const { page } = useParams();

  const navigate = useNavigate();

  const location = useLocation();

  const [searchInput, setSearchInput] =
      useState("");

  const [search, setSearch] =
      useState("");

  const [selected, setSelected] =
      useState(EMPTY_FILTERS);

  const homeUi =
      UI.home || {};

  /*
   * HOME LUÔN LÀ MỘT MÀN HÌNH.
   *
   * page chỉ dùng để xác định
   * ebook đang đứng ở trang nào.
   */
  const currentPage =
      clampPage(page || 1);

  /* =========================================================
     SEARCH
     ========================================================= */

  useEffect(() => {
    const timer =
        setTimeout(() => {
          setSearch(
              searchInput.trim()
          );
        }, 250);

    return () =>
        clearTimeout(timer);
  }, [searchInput]);

  /* =========================================================
     DEFAULT PAGE
     ========================================================= */

  useEffect(() => {
    if (!page) {
      navigate(
          "/page/1",
          {
            replace: true,
          }
      );
    }
  }, [
    page,
    navigate,
  ]);

  /* =========================================================
     INVALID PAGE
     ========================================================= */

  useEffect(() => {
    const raw =
        Number(page);

    if (
        !Number.isFinite(raw) ||
        raw !== currentPage
    ) {
      navigate(
          `/page/${currentPage}`,
          {
            replace: true,
          }
      );
    }
  }, [
    page,
    currentPage,
    navigate,
  ]);

  /* =========================================================
     SCROLL TO EBOOK
     =========================================================

     Chờ route + EbookReader render xong
     rồi mới scroll.

     Dùng 2 requestAnimationFrame để tránh
     scroll quá sớm khi DOM ebook chưa cập nhật.
     ========================================================= */

  useEffect(() => {
    if (
        !location.state?.scrollToEbook
    ) {
      return;
    }

    let frame1 = 0;
    let frame2 = 0;
    let timer = 0;

    const scrollToEbook = () => {
      const ebook =
          document.querySelector(
              ".ebook-reader"
          );

      if (!ebook) {
        return false;
      }

      ebook.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      return true;
    };

    frame1 =
        window.requestAnimationFrame(
            () => {
              frame2 =
                  window.requestAnimationFrame(
                      () => {
                        const found =
                            scrollToEbook();

                        /*
                         * Nếu ebook chưa render kịp,
                         * thử thêm một lần sau 100ms.
                         */
                        if (!found) {
                          timer =
                              window.setTimeout(
                                  scrollToEbook,
                                  100
                              );
                        }

                        /*
                         * Xóa state để refresh/re-render
                         * không tự scroll lại.
                         */
                        navigate(
                            location.pathname,
                            {
                              replace: true,
                              state: {},
                            }
                        );
                      }
                  );
            }
        );

    return () => {
      window.cancelAnimationFrame(
          frame1
      );

      window.cancelAnimationFrame(
          frame2
      );

      window.clearTimeout(
          timer
      );
    };
  }, [
    currentPage,
    location.pathname,
    location.state,
    navigate,
  ]);

  /* =========================================================
     FILTER
     ========================================================= */

  const filtered =
      useMemo(() => {
        return filterGames(
            GAMES,
            {
              search,
              selected,
            }
        );
      }, [
        search,
        selected,
      ]);

  const querying =
      hasActiveQuery(
          search,
          selected
      );

  /* =========================================================
     SUMMARY
     ========================================================= */

  const summaryText =
      resolveCatalogText(
          homeUi.summary ||
          "{title} · {count} trò chơi"
      )
          .replace(
              "{title}",
              EBOOK.title
          )
          .replace(
              "{count}",
              String(
                  STATIC_GAME_LIST.length
              )
          );

  /* =========================================================
     CLEAR SEARCH
     ========================================================= */

  const clearSearch = () => {
    setSearchInput("");

    setSearch("");

    setSelected(
        EMPTY_FILTERS
    );
  };

  /* =========================================================
     OPEN GAME FROM STATIC LIST
     ========================================================= */

  const openGame = (
      gamePage
  ) => {
    navigate(
        `/page/${gamePage}`,
        {
          state: {
            scrollToEbook:
                true,
          },
        }
    );
  };

  return (
      <div className="page page-home">
        <Header />

        <main className="layout layout-ebook">

          {/* =========================
                    SEARCH
                   ========================= */}

          <SearchBar
              value={searchInput}
              onChange={
                setSearchInput
              }
          />

          {/* =========================
                    FILTER
                   ========================= */}

          <GameFilters
              filters={FILTERS}
              selected={selected}
              onChange={
                setSelected
              }
          />

          {/* =========================
                    SEARCH RESULT
                   ========================= */}

          {querying && (
              <SearchResults
                  games={filtered}
                  total={
                    filtered.length
                  }
                  onClear={
                    clearSearch
                  }
              />
          )}

          {/* =========================
                    SUMMARY
                   ========================= */}

          <div className="result-bar">
            <p>
              {summaryText}
            </p>
          </div>

          {/* =========================
                    25 TRÒ CHƠI
                   ========================= */}

          <section className="static-game-list">

            <div className="static-game-list__header">
              <h2>
                25 TRÒ CHƠI
              </h2>

              <p>
                Chọn trò chơi để mở đúng
                trang trong ebook.
              </p>
            </div>

            <div className="static-game-list__items">
              {STATIC_GAME_LIST.map(
                  (game) => (
                      <button
                          type="button"
                          className="static-game-card"
                          key={
                            game.page
                          }
                          onClick={() =>
                              openGame(
                                  game.page
                              )
                          }
                      >
                        <div className="static-game-card__content">
                          <h3>
                            {
                              game.name
                            }
                          </h3>

                          <p>
                            {
                              game.howToPlay
                            }
                          </p>
                        </div>

                        <div className="static-game-card__page">
                          Trang{" "}
                          {
                            game.page
                          }
                        </div>
                      </button>
                  )
              )}
            </div>
          </section>

          {/* =========================
                    EBOOK
                    LUÔN HIỂN THỊ
                   ========================= */}

          <section className="ebook-reader ebook-reader-standalone">
            <EbookReader
                page={
                  currentPage
                }
            />
          </section>

        </main>
      </div>
  );
}