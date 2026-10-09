import { X } from "lucide-react";

function CheckoutForm({
  setCheckoutOpen,
  handleCheckoutSubmit,
  savedAddresses,
  selectedAddressId,
  applyAddressToCheckout,
  setSelectedAddressId,
  setShowNewAddressForm,
  showNewAddressForm,
  checkoutForm,
  setCheckoutForm,
  refreshDeliveryQuote,
  handleSaveNewAddress,
  couponCodeInput,
  setCouponCodeInput,
  appliedCoupon,
  handleApplyCoupon,
  couponLoading,
  handleRemoveCoupon,
  couponMessage,
  cartTotal,
  couponDiscountPreview,
  deliveryQuote,
  deliveryFeePreview,
  deliveryQuoteMessage,
  checkoutPayable,
  checkoutMessage,
  checkoutLoading,
}) {
  return (
    <div className="auth-page-shell" onClick={() => setCheckoutOpen(false)}>
      <div className="auth-page-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 720 }}>
        <div className="auth-form-panel" style={{ width: "100%" }}>
          <button type="button" className="auth-close" onClick={() => setCheckoutOpen(false)} aria-label="Close checkout">
            <X size={18} />
          </button>

          <div className="auth-header">
            <span className="eyebrow">CHECKOUT</span>
            <h3>Confirm your order</h3>
          </div>

          <form className="auth-form" onSubmit={handleCheckoutSubmit}>
            {savedAddresses.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div className="eyebrow" style={{ marginBottom: 8 }}>Saved addresses</div>
                <div style={{ display: "grid", gap: 8 }}>
                  {savedAddresses.map(addr => (
                    <label key={addr.id} style={{ display: "flex", gap: 8, alignItems: "flex-start", border: "1px solid #ead9e0", borderRadius: 12, padding: 10, cursor: "pointer", background: selectedAddressId === addr.id ? "#fff5f8" : "#fff" }}>
                      <input
                        type="radio"
                        name="saved_address"
                        checked={selectedAddressId === addr.id}
                        onChange={() => applyAddressToCheckout(addr)}
                      />
                      <span>
                        <strong>{addr.full_name}</strong> {addr.is_default ? <em>(default)</em> : null}
                        <br />
                        <small>{addr.address_line_1}{addr.address_line_2 ? `, ${addr.address_line_2}` : ""}, {addr.city}, {addr.state} {addr.postal_code}</small>
                      </span>
                    </label>
                  ))}
                </div>
                <button type="button" className="btn secondary small" style={{ marginTop: 8 }} onClick={() => { setSelectedAddressId(null); setShowNewAddressForm(true); }}>
                  Deliver to a new address
                </button>
              </div>
            )}

            {(showNewAddressForm || savedAddresses.length === 0 || !selectedAddressId) && (
              <>
                <div className="auth-row">
                  <label>
                    Full name
                    <input value={checkoutForm.customer_name} onChange={e => { setSelectedAddressId(null); setCheckoutForm(prev => ({ ...prev, customer_name: e.target.value })); }} placeholder="Aisha Patel" required />
                  </label>
                  <label>
                    Email
                    <input type="email" value={checkoutForm.customer_email} onChange={e => { setSelectedAddressId(null); setCheckoutForm(prev => ({ ...prev, customer_email: e.target.value })); }} placeholder="you@example.com" required />
                  </label>
                </div>

                <div className="auth-row">
                  <label>
                    Mobile
                    <input value={checkoutForm.customer_mobile} onChange={e => { setSelectedAddressId(null); setCheckoutForm(prev => ({ ...prev, customer_mobile: e.target.value })); }} placeholder="9876543210" required />
                  </label>
                  <label>
                    Postal code
                    <input value={checkoutForm.postal_code} onChange={e => {
                      const postal_code = e.target.value;
                      setSelectedAddressId(null);
                      setCheckoutForm(prev => ({ ...prev, postal_code }));
                    }} onBlur={() => refreshDeliveryQuote(checkoutForm.postal_code, null, checkoutForm.shipping_latitude, checkoutForm.shipping_longitude)} placeholder="400001" required />
                  </label>
                </div>

                <label>
                  Street address
                  <input value={checkoutForm.shipping_address} onChange={e => { setSelectedAddressId(null); setCheckoutForm(prev => ({ ...prev, shipping_address: e.target.value })); }} placeholder="24 Rose Avenue" required />
                </label>

                <label>
                  Apartment / floor
                  <input value={checkoutForm.shipping_address_2} onChange={e => setCheckoutForm(prev => ({ ...prev, shipping_address_2: e.target.value }))} placeholder="Flat 4B" />
                </label>

                <label>
                  Landmark
                  <input value={checkoutForm.landmark || ""} onChange={e => { setSelectedAddressId(null); setCheckoutForm(prev => ({ ...prev, landmark: e.target.value })); }} placeholder="Near Scout Camp" />
                </label>

                <div className="auth-row">
                  <label>
                    City
                    <input value={checkoutForm.city} onChange={e => { setSelectedAddressId(null); setCheckoutForm(prev => ({ ...prev, city: e.target.value })); }} placeholder="Mumbai" required />
                  </label>
                  <label>
                    State
                    <input value={checkoutForm.state} onChange={e => { setSelectedAddressId(null); setCheckoutForm(prev => ({ ...prev, state: e.target.value })); }} placeholder="Maharashtra" required />
                  </label>
                </div>

                <label>
                  Country
                  <input value={checkoutForm.country} onChange={e => { setSelectedAddressId(null); setCheckoutForm(prev => ({ ...prev, country: e.target.value })); }} placeholder="India" required />
                </label>

                {(showNewAddressForm || savedAddresses.length === 0 || !selectedAddressId) && (
                  <button type="button" className="btn secondary" onClick={handleSaveNewAddress}>Save this address</button>
                )}
              </>
            )}

            <label>
              Order notes
              <textarea value={checkoutForm.notes} onChange={e => setCheckoutForm(prev => ({ ...prev, notes: e.target.value }))} rows={3} placeholder="Add a note for your order" />
            </label>

            <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
              <div className="auth-row" style={{ alignItems: "end" }}>
                <label style={{ flex: 1 }}>
                  Promo code
                  <input
                    value={couponCodeInput}
                    onChange={e => setCouponCodeInput(e.target.value.toUpperCase())}
                    placeholder="SAVE10"
                    disabled={!!appliedCoupon}
                  />
                </label>
                {!appliedCoupon ? (
                  <button type="button" className="btn secondary" onClick={handleApplyCoupon} disabled={couponLoading}>
                    {couponLoading ? "Checking..." : "Apply"}
                  </button>
                ) : (
                  <button type="button" className="btn secondary" onClick={handleRemoveCoupon}>Remove</button>
                )}
              </div>
              {couponMessage && <div className="auth-error" style={{ color: appliedCoupon ? "#2f6b4f" : undefined }}>{couponMessage}</div>}
            </div>

            <div className="cart-summary" style={{ marginTop: 12, padding: 0, border: "none" }}>
              <div><span>Subtotal</span><b>Rs.{cartTotal.toLocaleString("en-IN")}</b></div>
              {appliedCoupon ? (
                <div><span>Coupon ({appliedCoupon.code})</span><b>-Rs.{couponDiscountPreview.toLocaleString("en-IN")}</b></div>
              ) : null}
              <div><span>Delivery</span><b>{deliveryQuote?.eligible ? (String.fromCharCode(8377) + deliveryFeePreview.toLocaleString("en-IN")) : "-"}</b></div>
              {deliveryQuoteMessage ? <div className="auth-error" style={{ color: deliveryQuote?.eligible ? "#2f6b4f" : undefined }}>{deliveryQuoteMessage}</div> : null}
              {deliveryQuote?.eta_min_minutes ? <small>ETA {deliveryQuote.eta_min_minutes}-{deliveryQuote.eta_max_minutes || "?"} min</small> : null}
              <div><span>Total</span><b>Rs.{checkoutPayable.toLocaleString("en-IN")}</b></div>
            </div>

            {checkoutMessage && <div className="auth-error">{checkoutMessage}</div>}

            <button type="submit" className="btn primary full" disabled={checkoutLoading}>
              {checkoutLoading ? "Placing order..." : "Place Order"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CheckoutForm;
