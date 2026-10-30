import { useEffect, useRef } from "react";

const COPY = {
  coupon: { title: "Please sign in to use promo codes", body: "Sign in and we'll bring you back to this checkout with your details filled in, then apply your code." },
  order: { title: "Please sign in to place your order", body: "Sign in and we'll bring you back to this checkout with your details filled in." },
};

/** Small confirm dialog shown when a guest uses a promo code (or places the order). */
function CheckoutSignInPrompt({ reason = "coupon", onContinue, onCancel }) {
  const continueRef = useRef(null);
  const copy = COPY[reason] || COPY.coupon;
  useEffect(() => {
    continueRef.current?.focus();
    const onKey = (event) => { if (event.key === "Escape") { event.stopPropagation(); onCancel(); } };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [onCancel]);
  return (
    <div className="signin-prompt-backdrop" onClick={(event) => { event.stopPropagation(); onCancel(); }}>
      <div className="signin-prompt" role="alertdialog" aria-modal="true" aria-labelledby="signin-prompt-title" aria-describedby="signin-prompt-body" onClick={event => event.stopPropagation()}>
        <h4 id="signin-prompt-title">{copy.title}</h4>
        <p id="signin-prompt-body">{copy.body}</p>
        <div className="signin-prompt-actions">
          <button type="button" className="btn secondary" onClick={onCancel}>Cancel</button>
          <button type="button" className="btn primary" ref={continueRef} onClick={onContinue}>Continue</button>
        </div>
      </div>
    </div>
  );
}

export default CheckoutSignInPrompt;
