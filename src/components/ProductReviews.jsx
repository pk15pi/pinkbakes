import { useCallback, useEffect, useRef, useState } from "react";
import { Star } from "lucide-react";
import { fetchProductReviewsPage, submitReview } from "../services/authService";

const PAGE_SIZE = 10;
// Keep the DOM small: the history panel never renders more than this many reviews.
const MAX_LOADED_REVIEWS = 100;
const RATING_WORDS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

/** Five clickable stars; a radio group with arrow-key support and a roving tab stop. */
export function StarRatingInput({ value, onChange, id = "review-rating" }) {
  const refs = useRef([]);
  function select(next) {
    const clamped = Math.min(5, Math.max(1, next));
    onChange(clamped);
    refs.current[clamped - 1]?.focus();
  }
  function onKeyDown(event) {
    const keys = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 };
    if (event.key in keys) {
      event.preventDefault();
      select((value || 1) + keys[event.key]);
    } else if (event.key === "Home") {
      event.preventDefault();
      select(1);
    } else if (event.key === "End") {
      event.preventDefault();
      select(5);
    }
  }
  return (
    <div className="star-input" role="radiogroup" aria-labelledby={`${id}-label`} onKeyDown={onKeyDown}>
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          role="radio"
          ref={el => { refs.current[n - 1] = el; }}
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          tabIndex={value === n || (!value && n === 1) ? 0 : -1}
          className={n <= value ? "star-btn on" : "star-btn"}
          onClick={() => select(n)}
        >
          <Star size={22} fill={n <= value ? "currentColor" : "none"} aria-hidden="true" />
        </button>
      ))}
      <span className="star-input-word" aria-hidden="true">{RATING_WORDS[value] || ""}</span>
    </div>
  );
}

function ReviewStars({ rating }) {
  const n = Math.max(0, Math.min(5, Number(rating) || 0));
  return (
    <span className="stars" aria-label={`${n} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map(i => <Star key={i} size={13} fill={i <= n ? "currentColor" : "none"} aria-hidden="true" />)}
    </span>
  );
}

function ReviewItem({ review, pending = false }) {
  return (
    <li className={pending ? "review-item pending" : "review-item"}>
      <div className="review-item-head">
        <ReviewStars rating={review.rating} />
        {pending && <span className="review-pending-badge">{review.status === "rejected" ? "Not approved" : "Pending approval"}</span>}
      </div>
      <p>"{review.comment || review.text}"</p>
      <small>- {pending ? "You" : (review.user_name || review.name || "Customer")} * {review.created_at ? new Date(review.created_at).toLocaleDateString() : ""}</small>
    </li>
  );
}

/** Review form (visually distinct card) + fixed-height, infinitely-loading review history. */
function ProductReviews({ productId, onSubmitted }) {
  const token = typeof localStorage !== "undefined" ? localStorage.getItem("pinkbakes_token") : null;
  const [reviews, setReviews] = useState([]);
  const [mine, setMine] = useState([]);
  const [canReview, setCanReview] = useState(false);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(true);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [form, setForm] = useState({ rating: 5, comment: "" });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const listRef = useRef(null);
  const sentinelRef = useRef(null);
  const requestRef = useRef(0);
  const loadingRef = useRef(false);

  const loadPage = useCallback((nextPage, { reset = false } = {}) => {
    if (productId == null || productId === "" || loadingRef.current) return;
    const requestId = ++requestRef.current;
    loadingRef.current = true;
    setLoading(true);
    setLoadError("");
    fetchProductReviewsPage(productId, { page: nextPage, pageSize: PAGE_SIZE }, localStorage.getItem("pinkbakes_token"))
      .then(data => {
        if (requestRef.current !== requestId) return;
        const results = Array.isArray(data?.results) ? data.results : [];
        setReviews(prev => {
          const base = reset ? [] : prev;
          const seen = new Set(base.map(r => r.id));
          return [...base, ...results.filter(r => !seen.has(r.id))].slice(0, MAX_LOADED_REVIEWS);
        });
        if (nextPage === 1) {
          setMine(Array.isArray(data?.mine) ? data.mine : []);
          setCanReview(!!data?.can_review);
        }
        setTotal(Number(data?.count || 0));
        setPage(nextPage);
        setHasNext(!!data?.has_next && (nextPage * PAGE_SIZE) < MAX_LOADED_REVIEWS);
      })
      .catch(() => {
        if (requestRef.current === requestId) {
          setLoadError("Couldn't load reviews.");
          setHasNext(false);
        }
      })
      .finally(() => {
        if (requestRef.current === requestId) {
          loadingRef.current = false;
          setLoading(false);
        }
      });
  }, [productId]);

  useEffect(() => {
    setReviews([]);
    setMine([]);
    setPage(0);
    setHasNext(true);
    loadingRef.current = false;
    loadPage(1, { reset: true });
    return () => { requestRef.current += 1; loadingRef.current = false; };
  }, [loadPage]);

  // Infinite scroll inside the fixed-height history box.
  useEffect(() => {
    const root = listRef.current;
    const sentinel = sentinelRef.current;
    if (!root || !sentinel || !hasNext || typeof IntersectionObserver === "undefined") return undefined;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting) && !loadingRef.current) loadPage(page + 1);
    }, { root, rootMargin: "80px" });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNext, page, loadPage, reviews.length]);

  function handleSubmit(event) {
    event.preventDefault();
    const authToken = localStorage.getItem("pinkbakes_token");
    if (!authToken) {
      setFormError("Please sign in to write a review.");
      return;
    }
    if (!form.comment.trim()) {
      setFormError("Please write a review before submitting.");
      return;
    }
    setSubmitting(true);
    setFormError("");
    setFormSuccess("");
    submitReview(productId, { rating: Number(form.rating), comment: form.comment.trim() }, authToken)
      .then(() => {
        setForm({ rating: 5, comment: "" });
        setFormSuccess("Thanks! Your review will appear after approval.");
        onSubmitted?.();
        loadingRef.current = false;
        loadPage(1, { reset: true });
      })
      .catch(error => setFormError(error?.message && error.status !== 500 ? error.message : "Unable to submit your review. Please try again."))
      .finally(() => setSubmitting(false));
  }

  return (
    <div className="review-panel">
      <div className="review-form-card">
        <h3 id="review-form-title">Write a review</h3>
        {!token ? (
          <p className="review-note">Sign in after your cake is delivered to share a review.</p>
        ) : !canReview && !formSuccess ? (
          <p className="review-note">You can review this cake once an order containing it has been delivered.</p>
        ) : (
          <form onSubmit={handleSubmit} className="review-form" aria-labelledby="review-form-title">
            <span className="review-label" id="review-rating-label">Your rating</span>
            <StarRatingInput value={form.rating} onChange={rating => setForm(prev => ({ ...prev, rating }))} />
            <label>
              Your review
              <textarea value={form.comment} maxLength={1000} onChange={e => setForm(prev => ({ ...prev, comment: e.target.value }))} placeholder="Beautiful cake and excellent taste." rows={3} />
            </label>
            {formError && <div className="auth-error" role="alert">{formError}</div>}
            {formSuccess && <div className="review-success" role="status">{formSuccess}</div>}
            <button type="submit" className="btn primary" disabled={submitting || (!canReview && !!formSuccess)}>{submitting ? "Submitting..." : "Submit review"}</button>
          </form>
        )}
        {formSuccess && !canReview && <div className="review-success" role="status">{formSuccess}</div>}
      </div>

      <div className="review-history">
        <h3>Customer Reviews {total ? <small>({total})</small> : null}</h3>
        <ul className="review-list" ref={listRef} aria-label="Customer reviews" tabIndex={0}>
          {mine.map(review => <ReviewItem key={`mine-${review.id}`} review={review} pending />)}
          {reviews.map(review => <ReviewItem key={review.id} review={review} />)}
          {!loading && !loadError && reviews.length === 0 && mine.length === 0 && (
            <li className="empty">No reviews yet. Be the first to rate this cake.</li>
          )}
          {loadError && <li className="empty">{loadError} <button type="button" className="text-link" onClick={() => { setHasNext(true); loadPage(page + 1 || 1); }}>Retry</button></li>}
          {hasNext && <li ref={sentinelRef} className="review-sentinel" aria-hidden="true" />}
          {loading && <li className="review-loading">Loading reviews...</li>}
        </ul>
      </div>
    </div>
  );
}

export default ProductReviews;
