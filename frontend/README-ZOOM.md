# Ebook Zoom Functionality

Tài liệu này mô tả **đúng code hiện tại**. Trong UI, con trỏ trang sách là `zoom-in`, nhưng **không có nút Zoom +/−** và **không dùng `transform: scale`**.

“Zoom” = **chế độ đọc / focus mode**: click vào trang sách → overlay tối, trang được phóng to hơn, có mũi tên ← → ở mép màn hình, click ra ngoài hoặc Escape để thoát.

Toàn bộ logic nằm ở frontend. Catalog game **không** đi qua backend.

---

## Overview

Ebook là một cuốn sách trang số, render từ `frontend/src/data/catalog.json`.

- Route: `/page/:page` (ví dụ `/page/6`).
- Component đọc sách: `frontend/src/components/EbookReader.jsx`.
- Trang hiện tại lấy từ URL, không phải từ một store riêng.
- Desktop (≥ 900px): thường hiện **2 trang** cạnh nhau (trừ bìa).
- Mobile (< 900px): **1 trang**.
- Click vào mặt giấy (không phải nút/link/form) bật focus mode.
- Focus mode **tái sử dụng cùng một cây trang** (`spread`), chỉ bọc thêm overlay.

Route `/games/:id` (`frontend/src/pages/GamePage.jsx`) **không** có focus mode. Chỉ `EbookReader` mới có.

---

## User Interaction

### Bật chế độ phóng to / đọc

1. Mở ebook (mặc định `/page/1`).
2. Click vào **mặt trang** (phần `.book-page`).
3. CSS `cursor: zoom-in` báo hiệu có thể click để phóng to.
4. **Không** bật focus nếu click vào phần tương tác: `a`, `button`, `input`, `textarea`, `select`, `label` (hàm `isInteractive`).

Ví dụ: click “Xem trang”, chip filter, form phản hồi, hoặc hàng mục lục **không** mở focus. Click vùng giấy trống / nội dung tĩnh thì mở.

Nếu đang ở focus rồi, click tiếp lên trang **không** làm gì (`if (focused) return`).

### Tắt chế độ phóng to

- Click **ra ngoài sách**: overlay `.ebook-focus` gọi `setFocused(false)`.
- Click **lên chính cuốn sách** không tắt, vì `.book-spread` có `event.stopPropagation()`.
- Phím **Escape** khi `focused === true`.

Khi focus bật, `document.body.style.overflow = "hidden"` để không cuộn nền phía sau. Thoát focus thì khôi phục overflow cũ.

---

## Zoom Flow

```text
UI bình thường
  EbookReader render `spread` ngay trong trang
        │
        │  click .book-page  (không phải control)
        ▼
focused = true
  overlay .ebook-focus (nền tối, full viewport)
    nút ←  (focus-arrow left)
    .ebook-focus-book
         └── cùng `spread` (1 hoặc 2 .book-page)
    nút →  (focus-arrow right)
        │
        │  click overlay  hoặc  Escape
        ▼
focused = false  →  lại render `spread` bình thường
```

`spread` là **một** khối JSX, không clone data. Đổi `focused` chỉ đổi chỗ đặt `spread`: trong layout hay trong overlay.

Phóng to bằng CSS khi có ancestor `.ebook-focus`:

- Trang cao hơn: `min-height: min(78vh, 860px)`, `max-height: calc(100vh - 48px)`.
- Spread rộng hơn: `.ebook-focus-book { width: min(1180px, 100%) }`, bỏ `max-width: 1080px` của spread thường.
- `cursor` trên trang đổi thành `default` (không còn zoom-in).

Không có state `zoomLevel`. Không có pinch-zoom riêng.

---

## Page Navigation

### Trang hiện tại

1. `App.jsx` map `/page/:page` → `HomePage`.
2. `HomePage` đọc `useParams().page`, gọi `clampPage(page || 1)`.
3. Truyền `page={currentPage}` vào `<EbookReader />`.
4. `EbookReader` gọi `clampPage(page)` lần nữa → biến `current`.

`clampPage` (trong `frontend/src/data/catalog.js`):

- Không phải số → `1`.
- Làm tròn, kẹp trong `[1, LAST_PAGE]`.

`LAST_PAGE` = max của mọi `sheets[].page` và `games[].page` trong `catalog.json` (hiện tại 25).

Nếu vào `/` không có `:page`, `HomePage` `navigate("/page/1", { replace: true })`.

### Cặp trang (spread)

`spreadPages(current, twoPage)`:

| Điều kiện | Kết quả `visible` |
| --- | --- |
| `twoPage === false` (mobile) | `[current]` |
| Trang hiện tại là bìa (`type === "cover"`) | `[current]` (thường `[1]`) |
| Desktop, trang chẵn | `[n, n+1]` nếu `n+1 ≤ LAST_PAGE`, không thì `[n]` |
| Desktop, trang lẻ (không phải bìa) | `[n-1, n]` |

Ví dụ desktop: URL `/page/6` hoặc `/page/7` đều ra trang 6–7. URL `/page/1` chỉ bìa.

`visible` được `useMemo` theo `current` và `twoPage`.

### Bước lật trang (`step`)

- Desktop, không phải bìa: `step = 2`.
- Mobile, hoặc đang ở bìa: `step = 1`.

`go(next)` = `navigate(/page/${clampPage(next)})`.

`canPrev`: `current > 1`.  
`canNext`: trên spread 2 trang thì so sánh **trang phải** (`visible[visible.length - 1]`) với `LAST_PAGE`; còn lại so sánh `current`.

### Nút trái / phải trong focus

Nằm **cố định mép màn hình** (`.focus-arrow.left` / `.right`), không nằm trong trang sách.

- Click ←: `stopPropagation()` rồi `go(current - step)`.
- Click →: `stopPropagation()` rồi `go(current + step)`.
- `disabled` khi không `canPrev` / `canNext`.

`stopPropagation` bắt buộc: overlay đang lắng nghe click để **thoát** focus. Nếu không chặn, bấm mũi tên sẽ vừa lật trang vừa tắt focus.

Thanh `reader-nav` (“← Trang trước” / “Trang sau →”) **vẫn render dưới overlay** và dùng cùng `go` + `step`. Overlay `position: fixed` che viewport; điều hướng trong focus chủ yếu nhờ mũi tên overlay và bàn phím.

### Bàn phím

Listener trên `window` (luôn gắn, không chỉ khi focus):

- `Escape` + đang focus → `setFocused(false)`.
- `ArrowLeft` + `canPrev` → `/page/${current - step}`.
- `ArrowRight` + `canNext` → `/page/${current + step}`.

Đổi trang **không** tắt focus. Đang đọc phóng to, bấm → vẫn ở overlay, chỉ đổi `visible`.

### Chuột

- Click trang → bật focus (nếu chưa focus và không phải control).
- Click overlay tối → tắt focus.
- Click sách trong overlay → không tắt.
- Click mũi tên overlay → lật trang, không tắt.

Không có handler wheel/pinch riêng cho zoom.

---

## State Management

Tất cả trong `EbookReader.jsx` (cộng hook `useTwoPage`):

| State / giá trị | Nguồn | Ý nghĩa |
| --- | --- | --- |
| `page` (prop) | URL `/page/:page` | Trang được yêu cầu |
| `current` | `clampPage(page)` | Trang hợp lệ |
| `twoPage` | `matchMedia("(min-width: 900px)")` | 2 trang hay 1 trang |
| `visible` | `spreadPages(current, twoPage)` | Mảng số trang đang vẽ |
| `focused` | `useState(false)` | Đang focus/zoom hay không |
| `coverOnly` | `twoPage && isCoverPage(current)` | Desktop chỉ hiện bìa |
| `step` | 2 hoặc 1 | Bước lật trang |
| `spreadClass` | class CSS của đôi trang | `book-spread`, thêm `cover-only` hoặc `single` |

**Không** lưu zoom vào `catalog.json`, localStorage, hay backend.

Đổi route (search “Xem trang 6”, mục lục, gõ URL) chỉ đổi `current` / `visible`. `focused` giữ nguyên cho đến khi Escape hoặc click ngoài.

---

## Data Structure

File: `frontend/src/data/catalog.json`.

Loader: `frontend/src/data/catalog.js`.

### Trang không phải game (`sheets`)

```json
{ "page": 1, "type": "cover" }
{ "page": 2, "type": "toc" }
{ "page": 3, "type": "text", "title": "...", "body": ["..."] }
```

### Game

Mỗi game có `page` (số trang ebook) **và** `id` (dùng API, không dùng để vẽ trang).

`getSheet(n)`:

1. Nếu có game với `game.page === n` → `{ type: "game", game }`.
2. Không thì lấy `sheets` cùng số trang.
3. Không thì `{ type: "empty" }`.

`SheetBody` render theo `type`: `EbookCover` / `TableOfContents` / `FrontMatter` / `GamePage` / “Trang trống.”

Search/filter (`filterGames.js`) chạy trên **cùng** `GAMES`. Kết quả dùng `game.page` để `navigate(/page/${game.page})`. Zoom không đọc search state.

Ảnh: `heroImage`, `instructionImage` trên object game. `GamePage` render ảnh; focus mode không đụng path ảnh.

---

## Desktop Behavior

Điều kiện JS: `window.matchMedia("(min-width: 900px)")`.

- Hai cột `.book-spread { grid-template-columns: 1fr 1fr }`, `max-width: 1080px`.
- Trang trái `.book-page.left`, phải `.book-page.right` (bo góc và bóng gáy sách).
- Bìa: `cover-only` → một cột `minmax(0, 520px)`, căn giữa.
- Lật trang nhảy 2 số (trừ bìa).
- Focus: overlay full màn, padding `24px 72px` chừa chỗ mũi tên; sách tối đa ~1180px.

---

## Mobile Behavior

JS: `twoPage === false` khi viewport < 900px. CSS `@media (max-width: 899px)` cũng ép một cột.

- `visible` luôn một phần tử.
- `step = 1`.
- Trang luôn bo góc như `.solo`.
- `max-height` trang thường bỏ (cuộn theo nội dung); trong focus `max-height: calc(100vh - 32px)`.
- `@media (max-width: 560px)`: overlay padding `16px 52px`; `reader-nav` xếp dọc.

Cùng một `focused` và cùng overlay; khác biệt chỉ là 1 trang thay vì 2.

---

## Important Components

| File | Vai trò với Zoom |
| --- | --- |
| `frontend/src/components/EbookReader.jsx` | **Toàn bộ** focus mode: `focused`, overlay, mũi tên, bàn phím, `spread` |
| `useTwoPage()` | Cùng file; desktop vs mobile |
| `SheetBody` | Cùng file; chọn cover/toc/text/game theo số trang |
| `isInteractive` | Cùng file; chặn click control không mở focus |
| `frontend/src/data/catalog.js` | `getSheet`, `spreadPages`, `clampPage`, `isCoverPage`, `LAST_PAGE` |
| `frontend/src/data/catalog.json` | Nguồn trang + game + ảnh |
| `frontend/src/pages/HomePage.jsx` | Đọc URL, truyền `page` vào `EbookReader` |
| `frontend/src/App.jsx` | Route `/page/:page` |
| `frontend/src/styles.css` | Layout sách + overlay focus |
| `GamePage.jsx` (component) | Nội dung một trang game **bên trong** sheet; không tự quản lý zoom |
| `TableOfContents.jsx` | Nút là `<button>` nên click mục lục không mở focus; `navigate` tới `game.page` |
| `frontend/src/pages/GamePage.jsx` | Trang `/games/:id` — **không** dùng `EbookReader`, không có zoom |

---

## Important CSS

Chống **horizontal scroll** khi 2 trang:

1. `* { box-sizing: border-box }` — padding không làm rộng thêm ngoài width.
2. `.layout { width: 100%; max-width: 1100px }` — ebook nằm trong cột giữa, không tràn viewport.
3. `.book-spread` là **CSS Grid** `1fr 1fr`, không phải hai `width: 50%` + margin cứng.
4. Cột đơn dùng `minmax(0, 520px)` / mobile `minmax(0, 1fr)`. `minmax(0, …)` cho phép cột **co nhỏ hơn min-content**, tránh grid đẩy ngang.
5. `.ebook-focus-book { width: min(1180px, 100%) }` — overlay không rộng hơn viewport.
6. `.ebook-focus { overflow: auto }` — nếu vẫn thiếu chỗ thì cuộn overlay, không đẩy `body` ngang.
7. `.book-page { overflow: auto }` — nội dung dài (cách chơi, nội dung khác) cuộn **trong trang**, không làm đôi sách phình ngang.
8. Ảnh `.sheet-hero` / `.sheet-instruction` là `width: 100%; display: block`.

Focus overlay:

- `.ebook-focus`: `position: fixed; inset: 0; z-index: 80; background: rgba(28, 43, 42, 0.52)`.
- `.focus-arrow`: `position: fixed; z-index: 81; top: 50%`.
- `.ebook-focus .book-page { cursor: default }`.

Thường: `.book-page { cursor: zoom-in; max-height: 80vh }`.

---

## How to Modify Game Data/Images Safely

Zoom **không** đọc tên game, id, hay đường dẫn ảnh. Nó chỉ biết số trang và `focused`.

An toàn (không cần sửa `EbookReader` / CSS zoom):

- Sửa object game trong `frontend/src/data/catalog.json` (tên, mô tả, cách chơi, `page`, …).
- Đổi file trong `frontend/public/images/games/` hoặc đổi `heroImage` / `instructionImage`.
- Thêm/bớt game: cập nhật `page` sao cho không trùng; `LAST_PAGE` tự tính.
- Search/filter vẫn dùng cùng catalog; nút “Xem trang N” chỉ `navigate`, không đụng `focused`.

Sau khi đổi `page` của một game, TOC, search, `getSheet`, và zoom đều theo số mới vì cùng `getGameByPage`.

Không gắn zoom vào `if (game.name === "...")` hay `if (id === 8)`.

---

## Things That Must Not Be Changed

Nếu muốn giữ đúng hành vi zoom hiện tại, **đừng**:

- Xóa hoặc đổi nghĩa `focused` / `openFocus` / overlay `.ebook-focus`.
- Bỏ `stopPropagation` trên `.book-spread` hoặc trên nút `.focus-arrow` (sẽ tắt focus khi lật trang).
- Bỏ `isInteractive` (click nội dung tương tác/filter/mục lục sẽ nhầm thành zoom).
- Đổi breakpoint JS `900px` mà không đổi `@media (max-width: 899px)` (lệch 1 trang vs 2 trang).
- Đổi `spreadPages` (cặp chẵn–lẻ và bìa đơn).
- Hard-code số trang trong `EbookReader` thay vì `catalog.json`.
- Thêm Zoom +/− / `transform: scale` nếu chưa thống nhất với overlay hiện tại — code **không** có scale.
- Gắn focus mode vào `pages/GamePage.jsx` mà không copy hành vi `EbookReader` (route đó vốn không zoom).

API, search, filter, catalog là độc lập với `focused`. Hỏng API không tắt được zoom.

---

## Troubleshooting

| Hiện tượng | Hướng kiểm tra |
| --- | --- |
| Click trang không phóng to | Click nhầm `button`/`a`/`input`/`label`? `isInteractive` đang chặn. |
| Click mũi tên lại thoát zoom | Thiếu `stopPropagation` trên `.focus-arrow`. |
| Click sách cũng thoát zoom | Thiếu `stopPropagation` trên `.book-spread`. |
| Desktop chỉ 1 trang | Viewport < 900px, hoặc đang trang bìa (`coverOnly`). |
| Hai trang bị lệch / nhảy 3 trang | `step` phải là 2 trên desktop không-bìa; `spreadPages` ghép chẵn–lẻ. |
| Horizontal scroll | Kiểm tra grid `minmax(0, …)`, `width: min(1180px, 100%)`, ảnh `width: 100%`. |
| Escape không tắt | Listener keydown; `focused` phải `true`. |
| Đổi ảnh/game là zoom hỏng | Zoom không phụ thuộc ảnh. Kiểm tra crash `GamePage` (ảnh/data) bên trong sheet, không phải overlay. |
| `/games/8` không zoom | Đúng hành vi: chỉ `/page/:page` + `EbookReader` có focus. |
| Overlay mà nền vẫn cuộn | Effect `document.body.style.overflow = "hidden"` khi `focused`. |

Kiểm tra nhanh trong DevTools: `focused === true` khi overlay `.ebook-focus` có trên DOM; tắt thì `spread` nằm trực tiếp trong `.ebook-reader`.
