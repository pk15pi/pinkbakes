import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";

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
}) {
  return (
    <>
      <aside className={cartOpen ? "cart-drawer open" : "cart-drawer"}>
        <div className="drawer-head"><h2>Your Cart</h2><button onClick={() => setCartOpen(false)} aria-label="Close cart"><X/></button></div>
        {cart.length === 0 ? <div className="empty-cart"><ShoppingBag size={38}/><h3>Your cart is empty</h3><p>Pick a beautiful cake for your next celebration.</p><button className="btn primary" onClick={() => { setCartOpen(false); scrollTo("cakes"); }}>Explore Cakes</button></div> :
          <>
            <div className="cart-items">{cart.map(item => <div className="cart-item" key={item.id}><img src={item.image} alt={item.name}/><div><b>{item.name}</b><small>{item.size}</small><strong>Rs.{(cartUnitPrice(item)*item.qty).toLocaleString("en-IN")}</strong><div className="qty"><button onClick={()=>changeQty(item.id,-1)} aria-label={`Decrease ${item.name} quantity`}><Minus/></button><span>{item.qty}</span><button onClick={()=>changeQty(item.id,1)} disabled={item.qty >= cartQtyCap(item)} title={item.qty >= cartQtyCap(item) ? `Maximum quantity is ${cartQtyCap(item)}` : undefined} aria-label={`Increase ${item.name} quantity`}><Plus/></button><button className="delete" onClick={()=>changeQty(item.id,-item.qty)} aria-label={`Remove ${item.name}`}><Trash2/></button></div></div></div>)}</div>
            <div className="cart-summary"><div><span>Subtotal</span><b>Rs.{cartTotal.toLocaleString("en-IN")}</b></div><small>Taxes and delivery calculated at checkout.</small><button className="btn primary checkout" onClick={openCheckout}>Proceed to Checkout <ArrowRight/></button></div>
          </>
        }
      </aside>
      {cartOpen && <div className="backdrop" onClick={() => setCartOpen(false)}></div>}
    </>
  );
}

export default CartDrawer;
