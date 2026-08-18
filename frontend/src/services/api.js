/**
 * API client for the ebook review backend (Spring Boot).
 *
 * Local: leave VITE_API_URL empty → /api/... is proxied by Vite to localhost:8080.
 * Production (Vercel): VITE_API_URL MUST be the Render Spring Boot origin, no trailing slash.
 * Example: https://your-service.onrender.com
 * Requests become ${VITE_API_URL}/api/reviews/{gameId}
 *
 * Never point VITE_API_URL at the Vercel frontend URL.
 */

function normalizeApiBase(raw) {
  if (raw == null) return "";
  return String(raw).trim().replace(/\/+$/, "");
}

const API_BASE = normalizeApiBase(import.meta.env.VITE_API_URL);
const DEFAULT_TIMEOUT_MS = import.meta.env.PROD ? 60000 : 8000;

function apiUrl(path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${normalizedPath}`;
}

function isHtml(text) {
  const trimmed = String(text || "").trim().toLowerCase();
  return trimmed.startsWith("<!doctype") || trimmed.startsWith("<html") || trimmed.includes("whitelabel error page");
}

function htmlInsteadOfJsonMessage(status) {
  if (!API_BASE && import.meta.env.PROD) {
    return "Thiếu VITE_API_URL. Frontend đang gọi nhầm domain Vercel và nhận HTML thay vì JSON. Trên Vercel hãy set VITE_API_URL=https://<backend>.onrender.com rồi Redeploy.";
  }
  return `API trả về HTML (HTTP ${status}) thay vì JSON. Kiểm tra VITE_API_URL trỏ tới Spring Boot trên Render, không trỏ Vercel.`;
}

function connectionError(err) {
  if (err?.name === "AbortError") {
    return new Error("Không kết nối được máy chủ đánh giá (hết thời gian chờ). Render có thể đang khởi động. Không dùng dữ liệu giả.");
  }
  if (err instanceof TypeError) {
    return new Error("Không kết nối được máy chủ đánh giá. Không dùng dữ liệu giả.");
  }
  return err instanceof Error ? err : new Error("Không kết nối được máy chủ đánh giá.");
}

async function parseError(response) {
  const text = await response.text();
  if (isHtml(text)) return htmlInsteadOfJsonMessage(response.status);
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

function requireProductionApiBase() {
  if (import.meta.env.PROD && !API_BASE) {
    throw new Error(
      "Thiếu VITE_API_URL. Trên Vercel hãy set VITE_API_URL=https://<backend>.onrender.com (Spring Boot), không dùng URL Vercel, rồi Redeploy."
    );
  }
}

async function requestJson(path, options = {}) {
  requireProductionApiBase();
  const { timeoutMs = DEFAULT_TIMEOUT_MS, ...fetchOptions } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(apiUrl(path), { ...fetchOptions, signal: controller.signal });
    if (!response.ok) throw new Error(await parseError(response));
    if (response.status === 204) return null;
    const text = await response.text();
    if (isHtml(text)) throw new Error(htmlInsteadOfJsonMessage(response.status));
    try {
      return JSON.parse(text);
    } catch {
      throw new Error("Phản hồi API không phải JSON hợp lệ. Không dùng dữ liệu giả.");
    }
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

export function getApiBase() {
  return API_BASE;
}
