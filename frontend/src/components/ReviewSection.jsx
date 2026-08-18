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
        <section className="review-section" id="reviews">
          <h2>Đánh giá</h2>
          <p className="error" role="alert">
            Không hiển thị được đánh giá. Máy chủ có thể đang lỗi. Không dùng dữ liệu giả.
          </p>
        </section>
      );
    }
    return this.props.children;
  }
}

function ReviewPanel({ gameId }) {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(null);
  const [reviewCount, setReviewCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    fetchReviews(gameId)
      .then((data) => {
        if (cancelled) return;
        const list = Array.isArray(data?.reviews) ? data.reviews : [];
        const count = Number(data?.reviewCount ?? list.length);
        const parsedAverage = Number(data?.averageRating);
        setReviews(list);
        setReviewCount(Number.isFinite(count) ? count : list.length);
        setAverageRating(Number.isFinite(parsedAverage) ? parsedAverage : null);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setReviews([]);
        setReviewCount(0);
        setAverageRating(null);
        setError(err.message || "Không kết nối được máy chủ đánh giá. Không dùng dữ liệu giả.");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [gameId, reload]);

  const count = Number.isFinite(Number(reviewCount)) ? Number(reviewCount) : 0;
  const average = Number.isFinite(Number(averageRating)) ? Number(averageRating) : null;

  return (
    <section className="review-section" id="reviews">
      <h2>Đánh giá</h2>
      {loading ? <p className="muted">Đang tải đánh giá…</p> : null}
      {error ? (
        <p className="error" role="alert">
          {error}
        </p>
      ) : null}

      {!loading && !error ? (
        <div className="rating-row">
          {count > 0 && average != null ? <StarRating value={Math.round(average)} readOnly /> : null}
          <strong>{count > 0 && average != null ? `${average.toFixed(1)}/5` : "Chưa có đánh giá"}</strong>
          <span>{formatRating(average, count)}</span>
        </div>
      ) : null}

      <h2>Các review</h2>
      {!loading && !error && reviews.length === 0 ? (
        <p className="empty">Chưa có review. Hãy là người đầu tiên.</p>
      ) : null}
      {!error ? (
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
      ) : null}

      <ReviewForm gameId={gameId} onCreated={() => setReload((n) => n + 1)} />
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
