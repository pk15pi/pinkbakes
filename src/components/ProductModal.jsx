import { useCallback, useEffect, useRef, useState } from "react";
import { Rotate3d, ShieldCheck, ShoppingBag, Star, X, ZoomIn } from "lucide-react";
import {
  fetchProductDetail,
  fetchProductReviews,
  submitReview,
} from "../services/authService";
import { hasCakeContent, normalizeProduct } from "../productUtils";

function ProductModal({product,onClose,onAdd,stockLabel,isOutOfStock}) {
  const [detail, setDetail] = useState(() => normalizeProduct(product));
  const [reviews, setReviews] = useState([]);
  const [image,setImage] = useState(product.gallery?.[0] || product.image || "");
  const [zoom,setZoom] = useState(false);
  const [threeD,setThreeD] = useState(false);
  const [size,setSize] = useState("1 kg");
  const [eggless,setEggless] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [reviewForm,setReviewForm] = useState({ rating: 5, comment: "" });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const detailRequestRef = useRef(0);
  const detailAbortRef = useRef(null);

  const refreshDetail = useCallback(() => {
    detailAbortRef.current?.abort();
    const controller = new AbortController();
    detailAbortRef.current = controller;
    const requestId = ++detailRequestRef.current;
    const seeded = normalizeProduct(product);
    const seededReady = hasCakeContent(seeded);
    setDetail(seeded);
    setImage(seeded.gallery?.[0] || seeded.image || "");
    setDetailError("");
    setDetailLoading(!seededReady);

    const watchdog = setTimeout(() => {
      if (detailRequestRef.current !== requestId || seededReady) return;
      setDetailLoading(false);
      setDetailError((current) => current || "Loading cake details took too long.");
    }, 10000);

    fetchProductDetail(product, { signal: controller.signal })
      .then((data) => {
        if (detailRequestRef.current !== requestId) return;
        const normalized = normalizeProduct(data);
        setDetail(normalized);
        setImage(normalized.gallery?.[0] || normalized.image || "");
        setDetailError("");
      })
      .catch((error) => {
        if (detailRequestRef.current !== requestId || error?.name === "AbortError") return;
        setDetailError(
          error?.timeout
            ? "Loading cake details took too long."
            : error?.status === 404
              ? "Latest cake details are unavailable."
              : "Couldn't load the latest cake details."
        );
      })
      .finally(() => {
        clearTimeout(watchdog);
        if (detailRequestRef.current === requestId) setDetailLoading(false);
      });

    if (product?.id == null || product.id === "") return;
    fetchProductReviews(product.id)
      .then((data) => {
        if (detailRequestRef.current !== requestId) return;
        setReviews(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (detailRequestRef.current === requestId) setReviews([]);
      });
  }, [product]);

  useEffect(() => {
    refreshDetail();
    return () => {
      detailRequestRef.current += 1;
      detailAbortRef.current?.abort();
    };
  }, [refreshDetail]);

  function handleReviewSubmit(e) {
    e.preventDefault();
    const token = localStorage.getItem("pinkbakes_token");
    if (!token) {
      setReviewError("Authentication required to submit a review.");
      return;
    }

    if (!reviewForm.comment.trim()) {
      setReviewError("Please write a review before submitting.");
      return;
    }

    setReviewSubmitting(true);
    setReviewError("");

    submitReview(product.id, {
      rating: Number(reviewForm.rating),
      comment: reviewForm.comment.trim(),
    }, token)
      .then((response) => {
        setReviewForm({ rating: 5, comment: "" });
        setDetail(prev => ({ ...prev, rating: Number(response.rating || prev.rating || 0), review_count: Number(prev.review_count || 0) + 1 }));
        return fetchProductReviews(product.id);
      })
      .then((data) => setReviews(Array.isArray(data) ? data : []))
      .catch(() => setReviewError("Unable to submit your review. Please try again."))
      .finally(() => setReviewSubmitting(false));
  }

  const currentPrice = Number(detail.discounted_price ?? ((detail.price * (100 - (detail.discount || 0))) / 100 || detail.price));
  const gallery = detail.gallery && detail.gallery.length ? detail.gallery : [detail.image || ""];

  return <div className="modal-backdrop" onClick={onClose}>
    <div className="product-modal" onClick={e=>e.stopPropagation()}>
      <button className="modal-close" onClick={onClose}><X/></button>
      <div className="modal-gallery">
        <div className={zoom ? "modal-main zoomed" : "modal-main"}><img src={image || detail.image} alt={(detail.name || "Cake") + " cake"} width="800" height="800" /></div>
        <div className="thumbs">{gallery.map(src=><button className={src===image?"selected":""} key={src} onClick={()=>setImage(src)}><img src={src} alt={(detail.name || "Cake") + " photo"} loading="lazy" width="120" height="120" /></button>)}</div>
        <div className="viewer-buttons"><button onClick={()=>setZoom(!zoom)}><ZoomIn/> {zoom?"Reset Zoom":"Zoom"}</button><button onClick={()=>setThreeD(!threeD)}><Rotate3d/> {threeD?"Exit 3D":"3D Preview"}</button></div>
        {threeD && <div className="mini-3d"><div className="cake-3d-shape"></div><span>Drag-ready 3D preview</span></div>}
      </div>
      <div className="modal-info">
        {!hasCakeContent(detail) ? (
          detailLoading ? <div className="empty">Loading cake details...</div> : (
            <div className="empty">
              <p>{detailError || "Couldn't load cake details."}</p>
              <button type="button" className="btn secondary" onClick={refreshDetail}>Retry</button>
            </div>
          )
        ) : (
          <>
            {detailError && (
              <div className="detail-status" role="alert">
                <span>{detailError}</span>
                <button type="button" onClick={refreshDetail}>Retry</button>
              </div>
            )}
            <nav className="product-breadcrumbs" aria-label="Breadcrumb" style={{fontSize: "0.85rem", marginBottom: "0.75rem", opacity: 0.85}}>
              <a href="/" onClick={(e) => { e.preventDefault(); onClose(); }}>Home</a>
              <span aria-hidden="true"> / </span>
              <a href="/#cakes" onClick={(e) => { e.preventDefault(); onClose(); document.getElementById("cakes")?.scrollIntoView({behavior: "smooth"}); }}>{detail.category || "Cakes"}</a>
              <span aria-hidden="true"> / </span>
              <span aria-current="page">{detail.name}</span>
            </nav>
            <span className="eyebrow">{(detail.category || "CAKE").toUpperCase()}</span>
            <div className="rating"><Star size={14} fill="currentColor"/>{Number(detail.average_rating ?? detail.rating ?? 0).toFixed(1)} * {detail.review_count || reviews.length || 0} reviews</div>
            <h1 className="product-title">{detail.name}</h1>
            {(detail.description || detail.short_description) && <p className="modal-desc">{detail.description || detail.short_description}</p>}
            <div className="modal-price-row">
              <span className="modal-price">Rs.{Number(currentPrice || 0).toLocaleString("en-IN")}</span>
              {Number(detail.discount || 0) > 0 && <span className="strike">Rs.{Number(detail.price || 0).toLocaleString("en-IN")}</span>}
            </div>
            {Number(detail.discount || 0) > 0 && <small className="discount-badge">{detail.discount}% OFF</small>}
            <label>Choose Size</label><div className="option-row">{["0.5 kg","1 kg","1.5 kg","2 kg"].map(x=><button className={size===x?"selected-option":""} key={x} onClick={()=>setSize(x)}>{x}</button>)}</div>
            <label>Preference</label><div className="option-row"><button className={!eggless?"selected-option":""} onClick={()=>setEggless(false)}>Regular</button><button className={eggless?"selected-option":""} onClick={()=>setEggless(true)}>Eggless</button></div>
            <label>Message on Cake</label><input className="cake-message" placeholder="Happy Birthday..."/>
            <label>Delivery Date</label><input className="cake-message" type="date"/>
            <button className="btn primary full" disabled={isOutOfStock ? isOutOfStock(detail) : false} onClick={() => onAdd(detail)}>{(isOutOfStock && isOutOfStock(detail)) ? "Out of Stock" : <>Add to Cart <ShoppingBag size={17}/></>}</button>
            <div className="secure"><ShieldCheck/> Freshly made * Secure checkout * Delivery support</div>

            <div className="review-panel">
              <h3>Customer Reviews</h3>
              <div className="review-form-wrap">
                <form onSubmit={handleReviewSubmit} className="review-form">
                  <label>
                    Your rating
                    <select value={reviewForm.rating} onChange={e => setReviewForm(prev => ({ ...prev, rating: Number(e.target.value) }))}>
                      {[5,4,3,2,1].map(value => <option key={value} value={value}>{value} star{value > 1 ? "s" : ""}</option>)}
                    </select>
                  </label>
                  <label>
                    Your review
                    <textarea value={reviewForm.comment} onChange={e => setReviewForm(prev => ({ ...prev, comment: e.target.value }))} placeholder="Beautiful cake and excellent taste." rows={4} />
                  </label>
                  {reviewError && <div className="auth-error">{reviewError}</div>}
                  <button type="submit" className="btn primary" disabled={reviewSubmitting}>{reviewSubmitting ? "Submitting..." : "Submit review"}</button>
                </form>
              </div>

              <div className="review-list">
                {reviews.length === 0 ? <div className="empty">No reviews yet. Be the first to rate this cake.</div> : reviews.map(review => (
                  <div className="review-item" key={review.id || `${review.user || review.name}-${review.created_at}`}>
                    <div className="stars">{'*'.repeat(review.rating || 0)}{'-'.repeat(5 - (review.rating || 0))} <small>{review.rating}/5</small></div>
                    <p>"{review.comment || review.text}"</p>
                    <small>- {review.user_name || review.name || 'Customer'} * {new Date(review.created_at).toLocaleDateString()}</small>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  </div>
}

export default ProductModal;
