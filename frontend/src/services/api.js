function normalizeApiBase(raw) {
  if (raw == null) return "";
  return String(raw).trim().replace(/\/+$/, "");
}

const API_BASE = normalizeApiBase(import.meta.env.VITE_API_URL);

function apiUrl(path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${normalizedPath}`;
}

async function parseError(response) {
  const text = await response.text();
  try {
    const body = JSON.parse(text);
    if (body?.message) return body.message;
  } catch {
    /* ignore */
  }
  if (response.status === 404) return "Không tìm thấy đánh giá.";
  if (response.status === 400) return "Dữ liệu gửi lên chưa hợp lệ.";
  return `Không tải được đánh giá (HTTP ${response.status}).`;
}

export async function fetchReviews(gameId, { timeoutMs = 8000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(apiUrl(`/api/games/${gameId}/reviews`), { signal: controller.signal });
    if (!response.ok) throw new Error(await parseError(response));
    return await response.json();
  } catch (err) {
    if (err?.name === "AbortError") throw new Error("Không kết nối được máy chủ đánh giá.");
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export async function createReview(gameId, payload) {
  const response = await fetch(apiUrl(`/api/games/${gameId}/reviews`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}

export function formatRating(averageRating, reviewCount) {
  if (!reviewCount) return "Chưa có đánh giá";
  return `⭐ ${Number(averageRating).toFixed(1)} (${reviewCount} reviews)`;
}
