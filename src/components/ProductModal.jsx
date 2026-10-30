import { useCallback, useEffect, useRef, useState } from "react";
import { Heart, Rotate3d, ShieldCheck, ShoppingBag, Star, X, ZoomIn } from "lucide-react";
import { fetchProductDetail } from "../services/authService";
import ProductReviews from "./ProductReviews";
import { hasCakeContent, normalizeProduct } from "../productUtils";
import { CAKE_MESSAGE_MAX_LENGTH, CAKE_SIZE_OPTIONS, discountedUnitPrice, formatCurrency, isEgglessProduct, localIsoDate, pricedSizes, sizeListPrice, sizePriceFor } from "../appConstants";

function ProductModal({product,onClose,onAdd,stockLabel,isOutOfStock,isWishlisted=false,onToggleWishlist}) {
  const [detail, setDetail] = useState(() => normalizeProduct(product));
  const [image,setImage] = useState(product.gallery?.[0] || product.image || "");
  const [zoom,setZoom] = useState(false);
  const [threeD,setThreeD] = useState(false);
  const [size,setSize] = useState("1 kg");
  const [eggless,setEggless] = useState(false);
  const [cakeMessage,setCakeMessage] = useState("");
  // Defaults to today in the customer's local time zone; they can pick a later day.
  const [deliveryDate,setDeliveryDate] = useState(() => localIsoDate());
  const [optionError,setOptionError] = useState("");
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
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

  }, [product]);

  useEffect(() => {
    refreshDetail();
    return () => {
      detailRequestRef.current += 1;
      detailAbortRef.current?.abort();
    };
  }, [refreshDetail]);

  // BUG-026: when admin set per-size prices, only those sizes are offered and the
  // price shown follows the selected size (the server recomputes it at checkout).
  const sizeChoices = pricedSizes(detail).length ? pricedSizes(detail) : CAKE_SIZE_OPTIONS;
  const activeSize = sizeChoices.includes(size) ? size : (sizeChoices.includes("1 kg") ? "1 kg" : sizeChoices[0]);
  const sizeList = sizeListPrice(detail, activeSize);
  const currentPrice = sizePriceFor(detail, activeSize) ?? Number(detail.discounted_price ?? discountedUnitPrice(detail.price, detail.discount));
  const listPrice = sizeList ?? detail.price;
  const egglessProduct = isEgglessProduct(detail);

  function handleAdd() {
    if (deliveryDate && deliveryDate < localIsoDate()) {
      setOptionError("Delivery date cannot be in the past.");
      return;
    }
    onAdd(detail, {
      size: activeSize,
      eggless: egglessProduct ? undefined : eggless,
      message: cakeMessage,
      delivery_date: deliveryDate,
    });
  }
  const gallery = detail.gallery && detail.gallery.length ? detail.gallery : [detail.image || ""];

  return <div className="modal-backdrop" onClick={onClose}>
    <div className="product-modal" onClick={e=>e.stopPropagation()}>
      <button className="modal-close" onClick={onClose} aria-label="Close"><X/></button>
      <div className="modal-gallery">
        <div className={zoom ? "modal-main zoomed" : "modal-main"}><img src={image || detail.image} alt={(detail.name || "Cake") + " cake"} width="800" height="800" /></div>
        <div className="thumbs">{gallery.map(src=><button className={src===image?"selected":""} key={src} onClick={()=>setImage(src)}><img src={src} alt={(detail.name || "Cake") + " photo"} loading="lazy" width="120" height="120" /></button>)}</div>
        <div className="viewer-buttons"><button onClick={()=>setZoom(!zoom)}><ZoomIn/> {zoom?"Reset Zoom":"Zoom"}</button><button onClick={()=>setThreeD(!threeD)}><Rotate3d/> {threeD?"Exit 3D":"3D Preview"}</button></div>
        {threeD && <div className="mini-3d"><div className="cake-3d-shape"></div><span>Drag-ready 3D preview</span></div>}
        {product?.id != null && product.id !== "" && (
          <ProductReviews productId={product.id} />
        )}
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
            <div className="rating"><Star size={14} fill="currentColor"/>{Number(detail.average_rating ?? detail.rating ?? 0).toFixed(1)} * {detail.review_count || 0} reviews</div>
            <div className="product-title-row">
              <h1 className="product-title">{detail.name}</h1>
              {onToggleWishlist && (
                <button
                  type="button"
                  className={isWishlisted ? "heart detail-heart active" : "heart detail-heart"}
                  aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                  aria-pressed={isWishlisted}
                  onClick={(e) => onToggleWishlist(e, detail)}
                >
                  <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
                </button>
              )}
            </div>
            {(detail.description || detail.short_description) && <p className="modal-desc">{detail.description || detail.short_description}</p>}
            <div className="modal-price-row">
              <span className="modal-price">{formatCurrency(currentPrice, 2)}</span>
              {Number(detail.discount || 0) > 0 && <span className="strike">{formatCurrency(listPrice, 2)}</span>}
            </div>
            {Number(detail.discount || 0) > 0 && <small className="discount-badge">{detail.discount}% OFF</small>}
            <label>Choose Size</label><div className="option-row">{sizeChoices.map(x=><button className={activeSize===x?"selected-option":""} key={x} onClick={()=>setSize(x)} aria-pressed={activeSize===x}>{x}</button>)}</div>
            {egglessProduct
              ? <><label>Preference</label><div className="option-row"><button type="button" className="selected-option" disabled>Eggless</button></div><small className="option-note">This cake is already eggless.</small></>
              : <><label>Preference</label><div className="option-row"><button className={!eggless?"selected-option":""} onClick={()=>setEggless(false)}>Regular</button><button className={eggless?"selected-option":""} onClick={()=>setEggless(true)}>Eggless</button></div></>}
            <label htmlFor="cake-message-input">Message on Cake</label><input id="cake-message-input" className="cake-message" placeholder="Happy Birthday..." maxLength={CAKE_MESSAGE_MAX_LENGTH} value={cakeMessage} onChange={e => setCakeMessage(e.target.value)}/>
            <label htmlFor="cake-delivery-date">Delivery Date</label><input id="cake-delivery-date" className="cake-message" type="date" min={localIsoDate()} value={deliveryDate} onChange={e => { setDeliveryDate(e.target.value); setOptionError(""); }}/>
            {optionError && <div className="auth-error" role="alert">{optionError}</div>}
            <button className="btn primary full" disabled={isOutOfStock ? isOutOfStock(detail) : false} onClick={handleAdd}>{(isOutOfStock && isOutOfStock(detail)) ? "Out of Stock" : <>Add to Cart <ShoppingBag size={17}/></>}</button>
            <div className="secure"><ShieldCheck/> Freshly made * Secure checkout * Delivery support</div>

          </>
        )}
      </div>
    </div>
  </div>
}

export default ProductModal;
