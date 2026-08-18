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

function asReviewList(data) {
  if (Array.isArray(data)) {
    return { reviews: data, averageRating: null, reviewCount: data.length };
  }
  const reviews = Array.isArray(data?.reviews) ? data.reviews : [];
  return {
    reviews,
    averageRating: data?.averageRating ?? null,
    reviewCount: Number(data?.reviewCount ?? reviews.length),
  };
}

export async function fetchReviews(gameId, { timeoutMs = 8000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(apiUrl(`/api/reviews/${gameId}`), { signal: controller.signal });
    if (!response.ok) throw new Error(await parseError(response));
    return asReviewList(await response.json());
  } catch (err) {
    if (err?.name === "AbortError") throw new Error("Không kết nối được máy chủ đánh giá.");
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export async function createReview(gameId, payload, { timeoutMs = 8000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(apiUrl(`/api/reviews/${gameId}`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(await parseError(response));
    return response.json();
  } catch (err) {
    if (err?.name === "AbortError") throw new Error("Không kết nối được máy chủ đánh giá.");
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export function formatRating(averageRating, reviewCount) {
  if (!reviewCount) return "Chưa có đánh giá";
  return `⭐ ${Number(averageRating).toFixed(1)} (${reviewCount} reviews)`;
}
