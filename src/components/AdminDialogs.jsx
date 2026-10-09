function AdminDialogs({
  X,
  adminCredentials,
  adminMessage,
  adminNotifications,
  adminOpen,
  adminOrderDetail,
  assignPickerEmployees,
  assignPickerError,
  assignPickerLoading,
  assignPickerOpen,
  assignPickerSelectedId,
  assignPickerSubmitting,
  cancelModalError,
  cancelModalOpen,
  cancelModalReason,
  cancelModalSubmitting,
  closeAssignPicker,
  closeCancelModal,
  closeRefundModal,
  closeRestockModal,
  confirmAssignPicker,
  confirmCancelModal,
  confirmRefundModal,
  confirmRestockModal,
  getAdminRefundableInfo,
  handleAdminLogin,
  isAdminLoggedIn,
  refundModalAmount,
  refundModalError,
  refundModalOpen,
  refundModalReason,
  refundModalSubmitting,
  restockModalAction,
  restockModalError,
  restockModalItem,
  restockModalOpen,
  restockModalQty,
  restockModalReason,
  restockModalSubmitting,
  setAdminCredentials,
  setAdminOpen,
  setAssignPickerSelectedId,
  setCancelModalReason,
  setRefundModalAmount,
  setRefundModalReason,
  setRestockModalAction,
  setRestockModalQty,
  setRestockModalReason,
}) {
  return (
    <>
      {adminOpen && !isAdminLoggedIn && (
              <div className="admin-modal-backdrop" onClick={() => { setAdminOpen(false); try { if ((window.location.pathname || "").startsWith("/admin")) window.history.pushState({}, "", "/"); } catch (_) {} }}>
                <div className="admin-modal" onClick={e => e.stopPropagation()}>
                  <div className="admin-modal-head">
                    <h3>Admin Login</h3>
                    <button type="button" onClick={() => { setAdminOpen(false); try { if ((window.location.pathname || "").startsWith("/admin")) window.history.pushState({}, "", "/"); } catch (_) {} }}><X/></button>
                  </div>
                  <form className="admin-form" onSubmit={handleAdminLogin}>
                    <label>
                      Admin username
                      <input value={adminCredentials.username} onChange={e => setAdminCredentials(prev => ({ ...prev, username: e.target.value }))} placeholder="pinkbake" />
                    </label>
                    <label>
                      Password
                      <input type="password" value={adminCredentials.password} onChange={e => setAdminCredentials(prev => ({ ...prev, password: e.target.value }))} placeholder="pinkbake" />
                    </label>
                    {adminNotifications.length > 0 && (
                      <div className="cart-summary" style={{ marginBottom: 12 }}>
                        <strong>Admin notification feed</strong>
                        <ul className="tracking-history" style={{ maxHeight: 120, overflow: "auto" }}>
                          {adminNotifications.slice(0, 6).map((n) => (
                            <li key={n.id}><span>{n.title}</span><small>{n.created_at ? new Date(n.created_at).toLocaleString() : ""}</small></li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {adminMessage && <span className="admin-error">{adminMessage}</span>}
                    <button type="submit" className="btn primary full">Login</button>
                  </form>
                </div>
              </div>
            )}
      
            {assignPickerOpen && (
              <div className="admin-modal-backdrop admin-assign-backdrop" onClick={closeAssignPicker}>
                <div className="admin-modal admin-assign-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="assign-delivery-title">
                  <div className="admin-modal-head">
                    <h3 id="assign-delivery-title">{adminOrderDetail?.delivery_employee ? "Reassign delivery" : "Assign delivery"}</h3>
                    <button type="button" onClick={closeAssignPicker} aria-label="Close"><X/></button>
                  </div>
                  <div className="admin-form">
                    {adminOrderDetail && (
                      <p className="admin-muted" style={{ margin: 0 }}>
                        Order {adminOrderDetail.order_number}
                        {adminOrderDetail.delivery_employee
                          ? ` - currently ${adminOrderDetail.delivery_employee.name}`
                          : " - no employee assigned"}
                      </p>
                    )}
                    {assignPickerLoading && <div className="admin-empty">Loading delivery employees...</div>}
                    {!assignPickerLoading && assignPickerError && !assignPickerEmployees.length && (
                      <span className="admin-error">{assignPickerError}</span>
                    )}
                    {!assignPickerLoading && !assignPickerEmployees.length && !assignPickerError && (
                      <div className="admin-empty">No active/available delivery employees. Create one under Delivery first.</div>
                    )}
                    {!assignPickerLoading && assignPickerEmployees.length > 0 && (
                      <label>
                        Delivery employee
                        <select
                          value={assignPickerSelectedId}
                          onChange={(e) => setAssignPickerSelectedId(e.target.value)}
                          disabled={assignPickerSubmitting}
                        >
                          <option value="">Select employee...</option>
                          {assignPickerEmployees.map((e) => (
                            <option key={e.id} value={e.id}>
                              {e.name} - #{e.id} ({e.employee_id}) - {e.status}
                            </option>
                          ))}
                        </select>
                      </label>
                    )}
                    {assignPickerError && assignPickerEmployees.length > 0 && (
                      <span className="admin-error">{assignPickerError}</span>
                    )}
                    <div className="admin-form-row" style={{ marginTop: 4 }}>
                      <button type="button" className="btn secondary small" onClick={closeAssignPicker} disabled={assignPickerSubmitting}>Cancel</button>
                      <button
                        type="button"
                        className="btn primary small"
                        onClick={confirmAssignPicker}
                        disabled={assignPickerLoading || assignPickerSubmitting || !assignPickerSelectedId}
                      >
                        {assignPickerSubmitting ? "Assigning..." : (adminOrderDetail?.delivery_employee ? "Confirm reassign" : "Confirm assign")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
      
            {cancelModalOpen && (
              <div className="admin-modal-backdrop admin-ops-backdrop" onClick={closeCancelModal}>
                <div className="admin-modal admin-ops-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="cancel-order-title">
                  <div className="admin-modal-head">
                    <h3 id="cancel-order-title">Cancel order</h3>
                    <button type="button" onClick={closeCancelModal} aria-label="Close" disabled={cancelModalSubmitting}><X/></button>
                  </div>
                  <div className="admin-form">
                    {adminOrderDetail && (
                      <p className="admin-muted" style={{ margin: 0 }}>
                        Order {adminOrderDetail.order_number} (#{adminOrderDetail.id}) - status {adminOrderDetail.status}
                      </p>
                    )}
                    <label>
                      Reason <span className="admin-muted">(optional)</span>
                      <textarea
                        rows={3}
                        value={cancelModalReason}
                        onChange={(e) => setCancelModalReason(e.target.value)}
                        placeholder="Why is this order being cancelled?"
                        disabled={cancelModalSubmitting}
                      />
                    </label>
                    {cancelModalError && <span className="admin-error">{cancelModalError}</span>}
                    <div className="admin-form-row" style={{ marginTop: 4 }}>
                      <button type="button" className="btn secondary small" onClick={closeCancelModal} disabled={cancelModalSubmitting}>Cancel</button>
                      <button type="button" className="btn primary small" onClick={confirmCancelModal} disabled={cancelModalSubmitting}>
                        {cancelModalSubmitting ? "Cancelling..." : "Confirm cancel"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
      
            {refundModalOpen && (() => {
              const info = getAdminRefundableInfo(adminOrderDetail);
              return (
                <div className="admin-modal-backdrop admin-ops-backdrop" onClick={closeRefundModal}>
                  <div className="admin-modal admin-ops-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="refund-order-title">
                    <div className="admin-modal-head">
                      <h3 id="refund-order-title">Refund</h3>
                      <button type="button" onClick={closeRefundModal} aria-label="Close" disabled={refundModalSubmitting}><X/></button>
                    </div>
                    <div className="admin-form">
                      {adminOrderDetail && (
                        <div className="admin-ops-summary">
                          <p className="admin-muted" style={{ margin: 0 }}>
                            Order {adminOrderDetail.order_number} (#{adminOrderDetail.id})
                          </p>
                          <p className="admin-muted" style={{ margin: 0 }}>
                            Payment: {info.paymentStatus || "-"}
                            {info.paymentAmount != null ? ` | original Rs.${Number(info.paymentAmount).toLocaleString("en-IN")}` : ""}
                          </p>
                          <p className="admin-muted" style={{ margin: 0 }}>
                            Max refundable (estimate): {info.maxRefundable != null ? `Rs.${Number(info.maxRefundable).toLocaleString("en-IN")}` : "-"}
                            <span className="admin-muted"> - backend is source of truth</span>
                          </p>
                        </div>
                      )}
                      <label>
                        Amount <span className="admin-muted">(blank = full remaining)</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={refundModalAmount}
                          onChange={(e) => setRefundModalAmount(e.target.value)}
                          placeholder={info.maxRefundable != null ? String(info.maxRefundable) : "Full refund"}
                          disabled={refundModalSubmitting}
                        />
                      </label>
                      <label>
                        Reason
                        <input
                          type="text"
                          value={refundModalReason}
                          onChange={(e) => setRefundModalReason(e.target.value)}
                          placeholder="Admin refund"
                          disabled={refundModalSubmitting}
                        />
                      </label>
                      {refundModalError && <span className="admin-error">{refundModalError}</span>}
                      <div className="admin-form-row" style={{ marginTop: 4 }}>
                        <button type="button" className="btn secondary small" onClick={closeRefundModal} disabled={refundModalSubmitting}>Cancel</button>
                        <button type="button" className="btn primary small" onClick={confirmRefundModal} disabled={refundModalSubmitting}>
                          {refundModalSubmitting ? "Refunding..." : "Confirm refund"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
      
            {restockModalOpen && (
              <div className="admin-modal-backdrop admin-ops-backdrop" onClick={closeRestockModal}>
                <div className="admin-modal admin-ops-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="restock-title">
                  <div className="admin-modal-head">
                    <h3 id="restock-title">Adjust inventory</h3>
                    <button type="button" onClick={closeRestockModal} aria-label="Close" disabled={restockModalSubmitting}><X/></button>
                  </div>
                  <div className="admin-form">
                    {restockModalItem && (
                      <p className="admin-muted" style={{ margin: 0 }}>
                        {restockModalItem.name || "Product"} (#{restockModalItem.id})
                        {" - available "}
                        {restockModalItem.available_quantity ?? restockModalItem.stock_remaining ?? "-"}
                      </p>
                    )}
                    <label>
                      Action
                      <select
                        value={restockModalAction}
                        onChange={(e) => setRestockModalAction(e.target.value)}
                        disabled={restockModalSubmitting}
                      >
                        <option value="restock">Restock (add quantity)</option>
                        <option value="remove">Remove (subtract quantity)</option>
                        <option value="set">Set absolute quantity</option>
                        <option value="adjust">Adjust (+/- quantity)</option>
                      </select>
                    </label>
                    <label>
                      Quantity
                      <input
                        type="number"
                        step="1"
                        value={restockModalQty}
                        onChange={(e) => setRestockModalQty(e.target.value)}
                        disabled={restockModalSubmitting}
                      />
                    </label>
                    <label>
                      Note / reason <span className="admin-muted">(optional)</span>
                      <input
                        type="text"
                        value={restockModalReason}
                        onChange={(e) => setRestockModalReason(e.target.value)}
                        placeholder="Restock"
                        disabled={restockModalSubmitting}
                      />
                    </label>
                    {restockModalError && <span className="admin-error">{restockModalError}</span>}
                    <div className="admin-form-row" style={{ marginTop: 4 }}>
                      <button type="button" className="btn secondary small" onClick={closeRestockModal} disabled={restockModalSubmitting}>Cancel</button>
                      <button type="button" className="btn primary small" onClick={confirmRestockModal} disabled={restockModalSubmitting || !restockModalItem}>
                        {restockModalSubmitting ? "Saving..." : "Confirm adjust"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
      
            
    </>
  );
}

export default AdminDialogs;
