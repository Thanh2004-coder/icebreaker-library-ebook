function normalizeApiBase(raw) {
  if (raw == null) return "";
  return String(raw).trim().replace(/\/+$/, "");
}

const API_BASE = normalizeApiBase(import.meta.env.VITE_API_URL);

function apiUrl(path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${normalizedPath}`;
}

function connectionError(err) {
  if (err?.name === "AbortError") {
    return new Error("Không kết nối được máy chủ đánh giá (hết thời gian chờ). Không dùng dữ liệu giả.");
  }
  if (err instanceof TypeError) {
    return new Error("Không kết nối được máy chủ đánh giá. Không dùng dữ liệu giả.");
  }
  return err instanceof Error ? err : new Error("Không kết nối được máy chủ đánh giá.");
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

async function requestJson(path, options = {}) {
  const { timeoutMs = 8000, ...fetchOptions } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(apiUrl(path), { ...fetchOptions, signal: controller.signal });
    if (!response.ok) throw new Error(await parseError(response));
    if (response.status === 204) return null;
    return await response.json();
  } catch (err) {
    throw connectionError(err);
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchReviews(gameId, options) {
  return asReviewList(await requestJson(`/api/reviews/${gameId}`, options));
}

export async function fetchReviewStats(gameId, options) {
  const data = await requestJson(`/api/reviews/${gameId}/stats`, options);
  return {
    gameId: data?.gameId ?? Number(gameId),
    averageRating: data?.averageRating ?? null,
    reviewCount: Number(data?.reviewCount ?? 0),
  };
}

export async function createReview(gameId, payload, options) {
  return requestJson(`/api/reviews/${gameId}`, {
    ...options,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function formatRating(averageRating, reviewCount) {
  if (!reviewCount) return "Chưa có đánh giá";
  return `⭐ ${Number(averageRating).toFixed(1)} (${reviewCount} reviews)`;
}
