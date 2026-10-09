import { X } from "lucide-react";

function UserOrdersDialog({
  setOrderHistoryOpen,
  selectedOrder,
  notifUnreadCount,
  handleMarkAllNotificationsRead,
  inAppNotifications,
  handleMarkNotificationRead,
  notificationPrefs,
  handleNotificationPreferenceChange,
  notificationPrefsMessage,
  setCancelConfirmOpen,
  setCancelMessage,
  paymentRetryLoading,
  handleRetryPayment,
  cancelConfirmOpen,
  cancelReason,
  setCancelReason,
  handleCancelOrder,
  cancelLoading,
  cancelMessage,
  setSelectedOrder,
  fetchTracking,
  trackingLoading,
  trackingError,
  trackingOrder,
  getMapsUrl,
  orders,
  handleOpenOrder,
}) {
  return (
    <div className="auth-page-shell" onClick={() => setOrderHistoryOpen(false)}>
      <div className="auth-page-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 820 }}>
        <div className="auth-form-panel" style={{ width: "100%" }}>
          <button type="button" className="auth-close" onClick={() => setOrderHistoryOpen(false)} aria-label="Close order history">
            <X size={18} />
          </button>

          <div className="auth-header">
            <span className="eyebrow">MY ORDERS</span>
            <h3>{selectedOrder ? selectedOrder.order_number : "Order history"}</h3>
          </div>

          {!selectedOrder && (
            <div className="cart-summary" style={{ marginTop: 0, marginBottom: 12, padding: "12px 0", borderBottom: "1px solid #f2dfe8" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <strong>Notifications{notifUnreadCount > 0 ? ` (${notifUnreadCount} unread)` : ""}</strong>
                <button type="button" className="btn secondary small" onClick={handleMarkAllNotificationsRead}>
                  Mark all read
                </button>
              </div>
              {inAppNotifications.length === 0 ? (
                <div className="empty" style={{ padding: 8 }}>No notifications yet.</div>
              ) : (
                <ul className="tracking-history" style={{ maxHeight: 160, overflow: "auto" }}>
                  {inAppNotifications.slice(0, 8).map((n) => (
                    <li key={n.id} style={{ opacity: n.is_read ? 0.65 : 1 }}>
                      <span>{n.title}</span>
                      <small>{n.created_at ? new Date(n.created_at).toLocaleString() : ""}</small>
                      {!n.is_read && (
                        <button type="button" className="btn secondary small" style={{ marginLeft: 8 }} onClick={() => handleMarkNotificationRead(n.id)}>
                          Read
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              {notificationPrefs && (
                <div style={{ marginTop: 12 }}>
                  <strong>Email preferences</strong>
                  <p style={{ fontSize: 12, color: "#7b6070", margin: "4px 0 8px" }}>
                    Verification, password reset, payment, and order confirmation emails cannot be turned off.
                  </p>
                  {[
                    ["email_order_updates", "Order & refund updates"],
                    ["email_delivery_updates", "Delivery updates"],
                    ["email_review_updates", "Review updates"],
                    ["email_promotional", "Promotional emails"],
                    ["sms_order_updates", "SMS order updates"],
                  ].map(([key, label]) => (
                    <label key={key} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, fontSize: 14 }}>
                      <input
                        type="checkbox"
                        checked={!!notificationPrefs[key]}
                        onChange={(e) => handleNotificationPreferenceChange(key, e.target.checked)}
                      />
                      {label}
                    </label>
                  ))}
                  {notificationPrefsMessage && <div className="auth-error" style={{ color: "#5d4753" }}>{notificationPrefsMessage}</div>}
                </div>
              )}
            </div>
          )}

          {selectedOrder ? (
            <div className="auth-form" style={{ gap: 14 }}>
              <div className="cart-summary" style={{ marginTop: 0, padding: 0, border: "none" }}>
                <div><span>Status</span><b>{selectedOrder.status}</b></div>
                <div><span>Payment</span><b>{selectedOrder.payment_status || "pending"}</b></div>
                {selectedOrder.coupon_code ? <div><span>Coupon</span><b>{selectedOrder.coupon_code}</b></div> : null}
                {Number(selectedOrder.coupon_discount_amount || selectedOrder.discount_amount || 0) > 0 ? (
                  <div><span>Coupon discount</span><b>-Rs.{Number(selectedOrder.coupon_discount_amount || selectedOrder.discount_amount || 0).toLocaleString("en-IN")}</b></div>
                ) : null}
                <div><span>Total</span><b>Rs.{Number(selectedOrder.total_amount || 0).toLocaleString("en-IN")}</b></div>
                {Number(selectedOrder.delivery_fee || 0) > 0 ? (
                  <div><span>Delivery fee</span><b>{String.fromCharCode(8377)}{Number(selectedOrder.delivery_fee || 0).toLocaleString("en-IN")}</b></div>
                ) : (
                  <div><span>Delivery fee</span><b>Free / {String.fromCharCode(8377)}0</b></div>
                )}
                <div style={{ marginTop: 8 }}>
                  <span>Deliver to</span>
                  <b style={{ display: "block", fontWeight: 500 }}>
                    {selectedOrder.shipping_address}
                    {selectedOrder.shipping_address_2 ? `, ${selectedOrder.shipping_address_2}` : ""}
                    {selectedOrder.landmark ? ` (${selectedOrder.landmark})` : ""}
                    <br />
                    {selectedOrder.city}, {selectedOrder.state} {selectedOrder.postal_code}
                    <br />
                    {selectedOrder.country}
                  </b>
                </div>
              </div>

              {selectedOrder.payment_status !== "paid" && selectedOrder.payment_status !== "refunded" && selectedOrder.status !== "CANCELLED" && (
                <button type="button" className="btn primary full" onClick={() => handleRetryPayment(selectedOrder.id)} disabled={paymentRetryLoading}>
                  {paymentRetryLoading ? "Processing payment..." : "Complete Payment"}
                </button>
              )}

              {selectedOrder.cancellable && !cancelConfirmOpen && (
                <button type="button" className="btn secondary full" onClick={() => { setCancelConfirmOpen(true); setCancelMessage(""); }}>
                  Cancel Order
                </button>
              )}

              {cancelConfirmOpen && selectedOrder.cancellable && (
                <div className="auth-form" style={{ gap: 10, border: "1px solid #f2dfe8", borderRadius: 12, padding: 12 }}>
                  <strong>Cancel this order?</strong>
                  <textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} rows={3} placeholder="Optional reason" />
                  <button type="button" className="btn primary full" onClick={handleCancelOrder} disabled={cancelLoading}>
                    {cancelLoading ? "Cancelling..." : "Confirm cancellation"}
                  </button>
                  <button type="button" className="btn secondary full" onClick={() => setCancelConfirmOpen(false)} disabled={cancelLoading}>
                    Keep order
                  </button>
                </div>
              )}

              {cancelMessage && <div className="auth-error" style={{ color: "#5d4753" }}>{cancelMessage}</div>}

              {selectedOrder.status === "CANCELLED" && (
                <div className="cart-summary" style={{ marginTop: 0, padding: 0, border: "none" }}>
                  <div><span>Cancelled</span><b>{selectedOrder.cancelled_at ? new Date(selectedOrder.cancelled_at).toLocaleString() : "Yes"}</b></div>
                  {selectedOrder.cancellation_reason ? <div><span>Reason</span><b>{selectedOrder.cancellation_reason}</b></div> : null}
                  {selectedOrder.refunds_summary?.latest_status ? (
                    <div>
                      <span>Refund</span>
                      <b>
                        {selectedOrder.refunds_summary.latest_status === "completed"
                          ? "Completed"
                          : selectedOrder.refunds_summary.latest_status === "failed"
                            ? "Failed - contact support"
                            : "Processing"}
                      </b>
                    </div>
                  ) : null}
                </div>
              )}

              {selectedOrder.status_history?.length ? (
                <div className="delivery-tracker-panel">
                  <div className="delivery-tracker-header"><strong>Order timeline</strong></div>
                  <ul className="tracking-history">
                    {selectedOrder.status_history.map((event) => (
                      <li key={`${event.status}-${event.created_at || event.timestamp}`}>
                        <span>{event.status}</span>
                        <small>{new Date(event.created_at || event.timestamp).toLocaleString()}</small>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {(selectedOrder.items || []).map(item => (
                <div key={item.id} className="cart-item" style={{ marginBottom: 12 }}>
                  <img src={item.product_image || item.product?.main_image || ""} alt={item.product_name} />
                  <div>
                    <b>{item.product_name}</b>
                    <small>Qty: {item.quantity}</small>
                    <strong>Rs.{Number(item.subtotal || 0).toLocaleString("en-IN")}</strong>
                  </div>
                </div>
              ))}

              <div className="delivery-tracker-panel">
                <div className="delivery-tracker-header">
                  <strong>Live delivery</strong>
                  <button type="button" className="btn secondary small" onClick={() => fetchTracking(selectedOrder.id)}>
                    {trackingLoading ? "Loading..." : "Track order"}
                  </button>
                </div>

                {trackingError && <div className="auth-error">{trackingError}</div>}

                {trackingOrder ? (
                  <div className="tracking-card">
                    <div className="tracking-status-row"><span>Status</span><b>{trackingOrder.status}</b></div>
                    <div className="tracking-status-row"><span>Delivery executive</span><b>{trackingOrder.delivery_employee?.name || "Awaiting assignment"}</b></div>
                    {trackingOrder.location && (
                      <a href={getMapsUrl(trackingOrder.location.latitude, trackingOrder.location.longitude)} target="_blank" rel="noreferrer" className="btn secondary full">
                        Open map
                      </a>
                    )}
                    {trackingOrder.status_history?.length ? (
                      <ul className="tracking-history">
                        {trackingOrder.status_history.map((event) => (
                          <li key={`${event.status}-${event.timestamp}`}>
                            <span>{event.status}</span>
                            <small>{new Date(event.timestamp).toLocaleString()}</small>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ) : (
                  <div className="empty">Track an order to see live status and delivery updates.</div>
                )}
              </div>

              <button type="button" className="btn secondary full" onClick={() => { setSelectedOrder(null); setCancelConfirmOpen(false); setCancelReason(""); setCancelMessage(""); }}>
                Back to orders
              </button>
            </div>
          ) : (
            <div className="auth-form" style={{ gap: 12 }}>
              {orders.length === 0 ? (
                <div className="empty">No orders yet. Start with one of our signature cakes.</div>
              ) : (
                orders.map(order => (
                  <button type="button" key={order.id} className="admin-cake-item" style={{ textAlign: "left", width: "100%", cursor: "pointer" }} onClick={() => handleOpenOrder(order.id)}>
                    <div className="admin-cake-details">
                      <div>
                        <strong>{order.order_number}</strong>
                        <span>{new Date(order.created_at).toLocaleDateString()}</span>
                        <small>{order.items?.length || 0} item(s)</small>
                      </div>
                    </div>
                    <div className="admin-item-actions">
                      <strong>Rs.{Number(order.total_amount || 0).toLocaleString("en-IN")}</strong>
                      <span>{order.payment_status || "pending"}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserOrdersDialog;
