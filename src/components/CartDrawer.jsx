import { useEffect } from "react";
import { ArrowRight, Heart, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { describeCartOptions, formatCurrency } from "../appConstants";

function WishlistSection({ wishlistItems, onMoveToCart, onView, onRemove, isOutOfStock }) {
  return (
    <section className="cart-wishlist" id="cart-wishlist" aria-labelledby="cart-wishlist-title">
      <h3 id="cart-wishlist-title"><Heart size={16} aria-hidden="true" /> Wishlist {wishlistItems.length ? <small>({wishlistItems.length})</small> : null}</h3>
      {wishlistItems.length === 0 ? (
        <p className="cart-wishlist-empty">Tap the heart on any cake to save it here.</p>
      ) : (
        <ul className="cart-wishlist-list">
          {wishlistItems.map(item => {
            const unavailable = isOutOfStock ? isOutOfStock(item) : false;
            return (
              <li className="cart-wishlist-item" key={item.id}>
                <img src={item.image} alt={(item.name || "Cake") + " cake"} loading="lazy" width="56" height="56" />
                <div className="cart-wishlist-info">
                  <b>{item.name}</b>
                  <small>{unavailable ? "Out of stock" : formatCurrency(Number(item.discounted_price ?? item.price ?? 0), 2)}</small>
                  <div className="cart-wishlist-actions">
                    <button type="button" className="btn primary small" disabled={unavailable} onClick={() => onMoveToCart(item)} aria-label={`Move ${item.name} to cart`}>Move to cart</button>
                    <button type="button" className="btn secondary small" onClick={() => onView(item)} aria-label={`View ${item.name}`}>View</button>
                    <button type="button" className="cart-wishlist-remove" onClick={() => onRemove(item)} aria-label={`Remove ${item.name} from wishlist`}><X size={15} /></button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function CartDrawer({
  cartOpen,
  setCartOpen,
  cart,
  changeQty,
  cartUnitPrice,
  cartQtyCap,
  cartTotal,
  openCheckout,
  scrollTo,
  wishlistItems = [],
  onMoveWishlistToCart,
  onViewWishlistItem,
  onRemoveWishlistItem,
  onMoveCartItemToWishlist,
  isOutOfStock,
  focusWishlist = false,
  onWishlistFocused,
}) {
  useEffect(() => {
    if (!cartOpen || !focusWishlist) return undefined;
    const timer = setTimeout(() => {
      const target = document.getElementById("cart-wishlist");
      target?.scrollIntoView({ block: "start", behavior: "smooth" });
      target?.querySelector("h3")?.setAttribute("tabindex", "-1");
      target?.querySelector("h3")?.focus({ preventScroll: true });
      onWishlistFocused?.();
    }, 80);
    return () => clearTimeout(timer);
  }, [cartOpen, focusWishlist]); // eslint-disable-line react-hooks/exhaustive-deps

  const wishlist = (
    <WishlistSection
      wishlistItems={wishlistItems}
      onMoveToCart={onMoveWishlistToCart}
      onView={onViewWishlistItem}
      onRemove={onRemoveWishlistItem}
      isOutOfStock={isOutOfStock}
    />
  );
  return (
    <>
      <aside className={cartOpen ? "cart-drawer open" : "cart-drawer"}>
        <div className="drawer-head"><h2>Your Cart</h2><button onClick={() => setCartOpen(false)} aria-label="Close cart"><X/></button></div>
        {cart.length === 0 ? <div className="cart-scroll"><div className="empty-cart"><ShoppingBag size={38}/><h3>Your cart is empty</h3><p>Pick a beautiful cake for your next celebration.</p><button className="btn primary" onClick={() => { setCartOpen(false); scrollTo("cakes"); }}>Explore Cakes</button></div>{wishlist}</div> :
          <>
            <div className="cart-scroll">
              <div className="cart-items">{cart.map(item => <div className="cart-item" key={item.lineId || item.id}><img src={item.image} alt={item.name}/><div><b>{item.name}</b>{item.options && <small className="cart-options">{describeCartOptions(item.options)}</small>}<strong>{formatCurrency(cartUnitPrice(item)*item.qty, 2)}</strong><div className="qty"><button onClick={()=>changeQty(item.lineId || item.id,-1)} aria-label={`Decrease ${item.name} quantity`}><Minus/></button><span>{item.qty}</span><button onClick={()=>changeQty(item.lineId || item.id,1)} disabled={item.qty >= cartQtyCap(item)} title={item.qty >= cartQtyCap(item) ? `Maximum quantity is ${cartQtyCap(item)}` : undefined} aria-label={`Increase ${item.name} quantity`}><Plus/></button>{onMoveCartItemToWishlist && <button type="button" className="move-to-wishlist" onClick={()=>onMoveCartItemToWishlist(item)} aria-label={`Move ${item.name} to wishlist`} title="Move to wishlist"><Heart/><span>Save for later</span></button>}<button className="delete" onClick={()=>changeQty(item.lineId || item.id,-item.qty)} aria-label={`Remove ${item.name}`} title="Remove from cart"><Trash2/></button></div></div></div>)}</div>
              <div className="cart-summary"><div><span>Subtotal</span><b>{formatCurrency(cartTotal, 2)}</b></div><small>Taxes and delivery calculated at checkout.</small><button className="btn primary checkout" onClick={openCheckout}>Proceed to Checkout <ArrowRight/></button></div>
              {wishlist}
            </div>
          </>
        }
      </aside>
      {cartOpen && <div className="backdrop" onClick={() => setCartOpen(false)}></div>}
    </>
  );
}

export default CartDrawer;
