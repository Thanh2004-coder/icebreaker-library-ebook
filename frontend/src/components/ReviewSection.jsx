import { useEffect, useState } from "react";
import StarRating from "./StarRating.jsx";
import ReviewForm from "./ReviewForm.jsx";
import { fetchReviews, formatRating } from "../services/api.js";

export default function ReviewSection({ gameId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setUnavailable(false);
    fetchReviews(gameId)
      .then((data) => {
        if (cancelled) return;
        setReviews(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setReviews([]);
        setUnavailable(true);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [gameId, reload]);

  const count = reviews.length;
  const average = count ? reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0) / count : 0;

  return (
    <section className="review-section">
      <h2>Đánh giá</h2>
      {loading ? <p className="muted">Đang tải đánh giá…</p> : null}
      {unavailable ? <p className="muted">Đánh giá tạm thời không khả dụng.</p> : null}
      {!loading && !unavailable ? (
        <div className="rating-row">
          {count ? <StarRating value={Math.round(average)} readOnly /> : null}
          <strong>{count ? `${average.toFixed(1)}/5` : "Chưa có đánh giá"}</strong>
          <span>{formatRating(average, count)}</span>
        </div>
      ) : null}

      <h2>Các review</h2>
      {!loading && !unavailable && reviews.length === 0 ? (
        <p className="empty">Chưa có review. Hãy là người đầu tiên.</p>
      ) : null}
      <ul className="review-list">
        {reviews.map((item) => (
          <li key={item.id} className="review-item">
            <div className="review-head">
              <strong>{item.displayName}</strong>
              <StarRating value={item.rating} readOnly />
            </div>
            <p>{item.comment}</p>
            {item.createdAt ? <time>{new Date(item.createdAt).toLocaleString("vi-VN")}</time> : null}
          </li>
        ))}
      </ul>

      {unavailable ? null : <ReviewForm gameId={gameId} onCreated={() => setReload((n) => n + 1)} />}
    </section>
  );
}
