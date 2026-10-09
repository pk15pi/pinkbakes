function OrderSuccessDialog({ orderSuccess, onDismiss }) {
  return (
    <div className="auth-page-shell" onClick={onDismiss}>
      <div className="auth-page-card" onClick={(event) => event.stopPropagation()} style={{ maxWidth: 560 }}>
        <div className="auth-form-panel" style={{ width: "100%" }}>
          <div className="auth-header">
            <span className="eyebrow">PAYMENT SUCCESSFUL</span>
            <h3>Order Confirmed</h3>
          </div>
          <div className="auth-form" style={{ gap: 14 }}>
            <div className="cart-summary" style={{ marginTop: 0, padding: 0, border: "none" }}>
              <div><span>Order</span><b>{orderSuccess.orderNumber || "PinkBakes Order"}</b></div>
              <div><span>Amount</span><b>Rs.{Number(orderSuccess.amount || 0).toLocaleString("en-IN")}</b></div>
            </div>
            <div className="empty">Payment ID: {orderSuccess.paymentId || "-"}</div>
            <div className="auth-row">
              <button type="button" className="btn primary full" onClick={onDismiss}>View Orders</button>
              <button type="button" className="btn secondary full" onClick={onDismiss}>Continue Shopping</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccessDialog;
