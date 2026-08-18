import { Component, useEffect, useState } from "react";
import StarRating from "./StarRating.jsx";
import ReviewForm from "./ReviewForm.jsx";
import { fetchReviews, formatRating } from "../services/api.js";

class ReviewErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <section className="review-section">
          <h2>Đánh giá</h2>
          <p className="muted">Đánh giá tạm thời không khả dụng.</p>
        </section>
      );
    }
    return this.props.children;
  }
}

function ReviewPanel({ gameId }) {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    if (reload === 0) setUnavailable(false);
    fetchReviews(gameId)
      .then((data) => {
        if (cancelled) return;
        const list = Array.isArray(data?.reviews) ? data.reviews : [];
        const count = Number(data?.reviewCount ?? list.length);
        const parsedAverage = Number(data?.averageRating);
        const fromList = count
          ? list.reduce((sum, item) => sum + Number(item.rating || 0), 0) / count
          : 0;
        setReviews(list);
        setReviewCount(Number.isFinite(count) ? count : list.length);
        setAverageRating(Number.isFinite(parsedAverage) ? parsedAverage : fromList);
        setUnavailable(false);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setLoading(false);
        if (reload > 0) return;
        setReviews([]);
        setReviewCount(0);
        setAverageRating(0);
        setUnavailable(true);
      });
    return () => {
      cancelled = true;
    };
  }, [gameId, reload]);

  const count = Number.isFinite(Number(reviewCount)) ? Number(reviewCount) : 0;
  const average = Number.isFinite(Number(averageRating)) ? Number(averageRating) : 0;

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
        {reviews.map((item, index) => (
          <li key={item.id ?? `${item.reviewerName || item.displayName}-${index}`} className="review-item">
            <div className="review-head">
              <strong>{item.reviewerName || item.displayName}</strong>
              <StarRating value={Number(item.rating) || 0} readOnly />
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

export default function ReviewSection({ gameId }) {
  return (
    <ReviewErrorBoundary>
      <ReviewPanel gameId={gameId} />
    </ReviewErrorBoundary>
  );
}
