import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { formatCurrency } from "../appConstants";
import { fetchDeliverySlots } from "../services/authService";
import CheckoutSignInPrompt from "./CheckoutSignInPrompt";

const SLOT_DAYS_AHEAD = 30;

function localIsoDate(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Optional delivery date + time slot; hidden when the bakery has not set up any slots. */
function DeliverySlotPicker({ checkoutForm, setCheckoutForm }) {
  const [slots, setSlots] = useState([]);
  useEffect(() => {
    const controller = new AbortController();
    fetchDeliverySlots({ signal: controller.signal }).then(data => setSlots(Array.isArray(data) ? data : [])).catch(() => setSlots([]));
    return () => controller.abort();
  }, []);
  if (!slots.length) return null;
  return (
    <div className="checkout-row">
      <label>
        Delivery date (optional)
        <input
          type="date"
          min={localIsoDate(0)}
          max={localIsoDate(SLOT_DAYS_AHEAD)}
          value={checkoutForm.delivery_date || ""}
          onChange={e => setCheckoutForm(prev => ({ ...prev, delivery_date: e.target.value }))}
        />
      </label>
      <label>
        Time slot (optional)
        <select
          value={checkoutForm.delivery_slot_id || ""}
          onChange={e => setCheckoutForm(prev => ({ ...prev, delivery_slot_id: e.target.value }))}
        >
          <option value="">Any time</option>
          {slots.map(slot => <option key={slot.id} value={slot.id}>{slot.label}</option>)}
        </select>
      </label>
    </div>
  );
}

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
  isSignedIn = true,
  signInPrompt = null,
  confirmSignInPrompt,
  cancelSignInPrompt,
}) {
  const showAddressFields = showNewAddressForm || savedAddresses.length === 0 || !selectedAddressId;
  const edit = (key) => e => { setSelectedAddressId(null); setCheckoutForm(prev => ({ ...prev, [key]: e.target.value })); };
  return (
    <div className="auth-page-shell checkout-shell" onClick={() => setCheckoutOpen(false)}>
      <div className="auth-page-card checkout-card" onClick={e => e.stopPropagation()}>
        <div className="auth-form-panel" style={{ width: "100%" }}>
          <button type="button" className="auth-close" onClick={() => setCheckoutOpen(false)} aria-label="Close checkout">
            <X size={18} />
          </button>

          <div className="auth-header">
            <span className="eyebrow">CHECKOUT</span>
            <h3>Confirm your order</h3>
          </div>

          <form className="auth-form checkout-form" onSubmit={handleCheckoutSubmit}>
            <div className="checkout-grid">
              <div className="checkout-fields">
                {savedAddresses.length > 0 && (
                  <div className="checkout-saved">
                    <div className="eyebrow">Saved addresses</div>
                    <div className="checkout-saved-list">
                      {savedAddresses.map(addr => (
                        <label key={addr.id} className={selectedAddressId === addr.id ? "checkout-address selected" : "checkout-address"}>
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
                    <button type="button" className="btn secondary small" onClick={() => { setSelectedAddressId(null); setShowNewAddressForm(true); }}>
                      Deliver to a new address
                    </button>
                  </div>
                )}

                {showAddressFields && (
                  <>
                    <div className="checkout-row cols-3">
                      <label>
                        Full name
                        <input value={checkoutForm.customer_name} onChange={edit("customer_name")} placeholder="Aisha Patel" autoComplete="name" required />
                      </label>
                      <label>
                        Email
                        <input type="email" value={checkoutForm.customer_email} onChange={edit("customer_email")} placeholder="you@example.com" autoComplete="email" required />
                      </label>
                      <label>
                        Mobile
                        <input value={checkoutForm.customer_mobile} onChange={edit("customer_mobile")} placeholder="9876543210" autoComplete="tel" inputMode="tel" required />
                      </label>
                    </div>

                    <div className="checkout-row">
                      <label>
                        Street address
                        <input value={checkoutForm.shipping_address} onChange={edit("shipping_address")} placeholder="24 Rose Avenue" autoComplete="address-line1" required />
                      </label>
                      <label>
                        Apartment / floor
                        <input value={checkoutForm.shipping_address_2} onChange={e => setCheckoutForm(prev => ({ ...prev, shipping_address_2: e.target.value }))} placeholder="Flat 4B" autoComplete="address-line2" />
                      </label>
                    </div>

                    <div className="checkout-row cols-3">
                      <label>
                        Landmark
                        <input value={checkoutForm.landmark || ""} onChange={edit("landmark")} placeholder="Near Scout Camp" />
                      </label>
                      <label>
                        City
                        <input value={checkoutForm.city} onChange={edit("city")} placeholder="Mumbai" autoComplete="address-level2" required />
                      </label>
                      <label>
                        State
                        <input value={checkoutForm.state} onChange={edit("state")} placeholder="Maharashtra" autoComplete="address-level1" required />
                      </label>
                    </div>

                    <div className="checkout-row">
                      <label>
                        Postal code
                        <input value={checkoutForm.postal_code} onChange={edit("postal_code")} onBlur={() => refreshDeliveryQuote(checkoutForm.postal_code, null, checkoutForm.shipping_latitude, checkoutForm.shipping_longitude)} placeholder="400001" autoComplete="postal-code" inputMode="numeric" required />
                      </label>
                      <label>
                        Country
                        <input value={checkoutForm.country} onChange={edit("country")} placeholder="India" autoComplete="country-name" required />
                      </label>
                    </div>

                    {isSignedIn && (
                      <button type="button" className="btn secondary small checkout-save-address" onClick={handleSaveNewAddress}>Save this address</button>
                    )}
                  </>
                )}

                <DeliverySlotPicker checkoutForm={checkoutForm} setCheckoutForm={setCheckoutForm} />

                <label>
                  Order notes
                  <textarea value={checkoutForm.notes} onChange={e => setCheckoutForm(prev => ({ ...prev, notes: e.target.value }))} rows={2} placeholder="Add a note for your order" />
                </label>
              </div>

              <aside className="checkout-side" aria-label="Order summary">
                <div className="checkout-side-title">Order summary</div>
                <div className="checkout-promo">
                  <div className="checkout-promo-row">
                    <label>
                      Promo code
                      <input
                        value={couponCodeInput}
                        onChange={e => setCouponCodeInput(e.target.value.toUpperCase())}
                        placeholder="SAVE10"
                        disabled={!!appliedCoupon}
                      />
                    </label>
                    {!appliedCoupon ? (
                      <button type="button" className="btn secondary" onClick={() => handleApplyCoupon()} disabled={couponLoading}>
                        {couponLoading ? "Checking..." : "Apply"}
                      </button>
                    ) : (
                      <button type="button" className="btn secondary" onClick={handleRemoveCoupon}>Remove</button>
                    )}
                  </div>
                  {couponMessage && <div className="auth-error" style={{ color: appliedCoupon ? "#2f6b4f" : undefined }}>{couponMessage}</div>}
                </div>

                <div className="cart-summary checkout-summary">
                  <div><span>Subtotal</span><b>{formatCurrency(cartTotal, 2)}</b></div>
                  {appliedCoupon ? (
                    <div><span>Coupon ({appliedCoupon.code})</span><b>-{formatCurrency(couponDiscountPreview, 2)}</b></div>
                  ) : null}
                  <div><span>Delivery</span><b>{deliveryQuote?.eligible ? (String.fromCharCode(8377) + deliveryFeePreview.toLocaleString("en-IN")) : (deliveryQuote ? "Not available" : (isSignedIn ? "Enter address" : "Enter PIN code"))}</b></div>
                  {deliveryQuoteMessage ? <div className="auth-error" style={{ color: deliveryQuote?.eligible ? "#2f6b4f" : undefined }}>{deliveryQuoteMessage}</div> : null}
                  {deliveryQuote?.eta_min_minutes ? <small>ETA {deliveryQuote.eta_min_minutes}-{deliveryQuote.eta_max_minutes || "?"} min</small> : null}
                  <div className="checkout-total"><span>Total</span><b>{formatCurrency(checkoutPayable, 2)}</b></div>
                </div>

                {checkoutMessage && <div className="auth-error">{checkoutMessage}</div>}

                <button type="submit" className="btn primary full" disabled={checkoutLoading}>
                  {checkoutLoading ? "Placing order..." : "Place Order"}
                </button>
              </aside>
            </div>
          </form>
        </div>
      </div>
      {signInPrompt && (
        <CheckoutSignInPrompt reason={signInPrompt.reason} onContinue={confirmSignInPrompt} onCancel={cancelSignInPrompt} />
      )}
    </div>
  );
}

export default CheckoutForm;
