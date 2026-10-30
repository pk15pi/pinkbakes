import { ArrowRight, Heart, Rotate3d, Search, Star, ZoomIn } from "lucide-react";
import { normalizeProduct } from "../productUtils";
import { discountedUnitPrice, fromSizePrice, responsiveImageSrcSet } from "../appConstants";

function ProductCatalog({
  category,
  setCategory,
  shopCategories,
  search,
  setSearch,
  catalogLoading,
  catalog,
  filtered,
  wishlist,
  toggleWishlist,
  openProduct,
  setProduct3d,
  formatCurrency,
  isOutOfStock,
  stockLabel,
  addToCart,
  catalogError,
  loadCatalog,
}) {
  return (
    <section className="cakes-section section" id="cakes">
      <div className="section-head">
        <div><span className="eyebrow">OUR SIGNATURE CAKES</span><h2>Customer Favorites</h2></div>
        <button className="text-link" onClick={() => setCategory("All Cakes")}>View All Cakes <ArrowRight size={16}/></button>
      </div>

      <div className="catalog-toolbar">
        <div className="chips">
          {(["All Cakes", ...shopCategories.map((c) => c.name)].filter((c, i, arr) => arr.indexOf(c) === i)).map(c =>
            <button className={category === c ? "chip active" : "chip"} key={c} onClick={() => setCategory(c)}>{c}</button>
          )}
        </div>
        <div className="searchbox">
          <Search size={16}/><input id="search" aria-label="Search cakes" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search cakes..."/>
        </div>
      </div>

      <div className="product-grid">
        {catalogLoading && catalog.length === 0 ? <div className="empty">Loading cakes...</div> : filtered.map(p => {
          const priceAfterDiscount = p.discounted_price || discountedUnitPrice(p.price, p.discount);
          // BUG-026: cakes with per-size prices show the lowest size price and need a size picked.
          const fromPrice = fromSizePrice(p);
          return (
            <article className="product-card" key={p.id}>
              <div className="product-media">
                <img src={p.image || "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1000&q=85"} srcSet={responsiveImageSrcSet(p.image, [360, 600, 900])} sizes="(max-width: 640px) 50vw, (max-width: 1100px) 33vw, 300px" alt={(p.name || "Cake") + " cake"} loading="lazy" decoding="async" width="600" height="750" />
                {p.badge && <span className="badge">{p.badge}</span>}
                <button
                  type="button"
                  className={wishlist.includes(String(p.id)) ? "heart active" : "heart"}
                  aria-label={wishlist.includes(String(p.id)) ? "Remove from wishlist" : "Add to wishlist"}
                  onClick={(e) => toggleWishlist(e, p)}
                >
                  <Heart size={17} fill={wishlist.includes(String(p.id)) ? "currentColor" : "none"} />
                </button>
                <div className="product-media-actions">
                  <button type="button" className="quick-view" onClick={() => openProduct(p)}><ZoomIn size={15}/> Quick View</button>
                  <button type="button" className="view-3d" onClick={(e) => { e.stopPropagation(); setProduct3d(p); }}><Rotate3d size={15}/> 3D View</button>
                </div>
              </div>
              <div className="product-body">
                <div className="rating"><Star size={13} fill="currentColor"/>{Number(p.rating || 0).toFixed(1)}</div>
                <h3>{p.name}</h3>
                {(p.short_description || p.description) && <p>{p.short_description || p.description}</p>}
                <div className="price-row">
                  <strong>{fromPrice != null ? <>from {formatCurrency(fromPrice)}</> : formatCurrency(priceAfterDiscount)}</strong>
                  {p.discount > 0 && fromPrice == null && <span className="strike">{formatCurrency(p.price)}</span>}
                </div>
                {p.discount > 0 && <small className="discount-badge">{p.discount}% OFF</small>}
                <div className="sizes"><span className={isOutOfStock(p) ? "stock-out" : (p.is_low_stock || p.availability === "low_stock" ? "stock-low" : "stock-ok")}>{stockLabel(p)}</span></div>
                <div className="product-actions">
                  <button className="btn secondary small" onClick={() => openProduct(p)}>View Cake</button>
                  <button className="btn primary small" disabled={isOutOfStock(p)} onClick={() => (fromPrice != null ? openProduct(p) : addToCart(normalizeProduct(p)))}>{isOutOfStock(p) ? "Out of Stock" : (fromPrice != null ? "Order" : "Add to Cart")}</button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      {!catalogLoading && filtered.length === 0 && !catalogError && (
        <div className="empty">
          {catalog.length === 0
            ? "No cakes are currently available."
            : search.trim() && category !== "All Cakes"
              ? `No ${category} match "${search.trim()}". Try "All Cakes" to search every category.`
              : category === "All Cakes"
                ? "No cakes match your search."
                : `No cakes match "${category}" right now.`}
        </div>
      )}
      {catalogError && !catalogLoading && (
        <div className="empty">
          <p>{catalogError}</p>
          <button type="button" className="btn secondary" onClick={loadCatalog}>Retry</button>
        </div>
      )}
    </section>
  );
}

export default ProductCatalog;
