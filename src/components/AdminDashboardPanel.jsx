import { Trash2 } from "lucide-react";
import AdminEmployeesPanel from "./AdminEmployeesPanel";
import { buildRefundTableRows } from "../adminRefundUtils";

function AdminDashboardPanel({
  BRAND_NAME,
  CAKE_CATEGORY_OPTIONS,
  adminActiveDeliveries,
  adminCouponForm,
  adminCouponMessage,
  adminCoupons,
  adminCouponsView,
  adminCustomerDetail,
  adminCustomerSearch,
  adminCustomers,
  adminDashPreset,
  adminDashboard,
  adminDeliveryMessage,
  adminDeliverySettings,
  adminDeliveryView,
  adminEmployeeCategories,
  adminEmployeeCategoryEditingId,
  adminEmployeeCategoryForm,
  adminEmployeeCategoryMessage,
  adminEmployeeDetail,
  adminEmployeeEditingId,
  adminEmployeeFilter,
  adminEmployeeForm,
  adminEmployeeMessage,
  adminEmployeeStats,
  adminEmployeeView,
  adminEmployees,
  adminEmployeesMeta,
  adminInventory,
  adminLoadingSection,
  adminMessage,
  adminNotifications,
  adminOpsMessage,
  adminOrderDetail,
  adminOrderFilter,
  adminOrders,
  adminPayments,
  adminRefundFilter,
  adminRefunds,
  adminReportsView,
  adminReviewFilter,
  adminReviews,
  adminSection,
  adminSettings,
  adminZoneForm,
  adminZones,
  approveAdminReview,
  asListResponse,
  cakeForm,
  catalog,
  closeAdminReports,
  createAdminCoupon,
  downloadAdminExport,
  editEmployeeCategory,
  editingCakeId,
  fetchAdminOrderDetail,
  fetchAdminRefunds,
  fetchAdminReviews,
  getNextOrderStatuses,
  goAdminSection,
  handleAdminLogout,
  handleCreateAdminZone,
  handleEmployeeCategorySubmit,
  handleEmployeeFormSubmit,
  handleUnassignDelivery,
  loadAdminCoupons,
  loadAdminEmployeeData,
  loadAdminSectionData,
  openAssignPicker,
  openCancelModal,
  openCustomerDetail,
  openRefundModal,
  openRestockModal,
  populateCakeForm,
  rejectAdminReview,
  removeCake,
  reportActivity,
  reportPerformance,
  reportSummary,
  reportsError,
  reportsLoading,
  resetCakeForm,
  resetEmployeeCategoryForm,
  resetEmployeeForm,
  setAdminCouponForm,
  setAdminCouponMessage,
  setAdminCustomerSearch,
  setAdminDashPreset,
  setAdminDeliveryMessage,
  setAdminDeliverySettings,
  setAdminDeliveryView,
  setAdminEmployeeCategoryForm,
  setAdminEmployeeCategoryMessage,
  setAdminEmployeeDetail,
  setAdminEmployeeFilter,
  setAdminEmployeeForm,
  setAdminEmployeeView,
  setAdminLoadingSection,
  setAdminOpsMessage,
  setAdminOrderDetail,
  setAdminOrderFilter,
  setAdminRefundFilter,
  setAdminRefunds,
  setAdminReviewFilter,
  setAdminReviews,
  setAdminSettings,
  setAdminZoneForm,
  setCakeForm,
  startEditEmployee,
  submitCakeForm,
  toggleAdminZone,
  updateAdminCoupon,
  updateAdminCustomerStatus,
  updateAdminDeliverySettings,
  updateAdminOrderStatus,
  updateAdminSettingsStatus,
  viewEmployeeDetails,
}) {
  return (
    <aside className="admin-panel">
              <div className="admin-panel-head">
                <div>
                  <span className="eyebrow">ADMIN PANEL</span>
                  <h2>{BRAND_NAME} Dashboard</h2>
                </div>
                <div className="admin-panel-actions admin-nav-wrap">
                  {[
                    ["dashboard", "Dashboard"],
                    ["orders", "Orders"],
                    ["payments", "Payments"],
                    ["refunds", "Refunds"],
                    ["products", "Products"],
                    ["inventory", "Inventory"],
                    ["coupons", "Coupons"],
                    ["customers", "Customers"],
                    ["employees", "Delivery"],
                    ["reviews", "Reviews"],
                    ["notifications", "Notifications"],
                    ["reports", "Reports"],
                    ["settings", "Settings"],
                    ["delivery", "Zones"],
                  ].map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      className={`btn secondary small${adminSection === id || (id === "reports" && adminReportsView) || (id === "delivery" && adminDeliveryView) || (id === "coupons" && adminCouponsView) ? " active" : ""}`}
                      onClick={() => goAdminSection(id)}
                    >{label}</button>
                  ))}
                  <button className="btn secondary small" onClick={handleAdminLogout}>Logout</button>
                </div>
              </div>
    
              <div className="admin-content">
                {adminOpsMessage && <div className="admin-error" style={{ marginBottom: 12 }}>{adminOpsMessage}</div>}
                {adminLoadingSection && <div className="empty">Loading...</div>}
    
                {!adminReportsView && !adminDeliveryView && !adminCouponsView && adminSection === "dashboard" && (
                  <div className="admin-reports-page">
                    <div className="report-topbar">
                      <div><span className="eyebrow">OVERVIEW</span><h3>Operations Dashboard</h3></div>
                      <select value={adminDashPreset} onChange={(e) => { setAdminDashPreset(e.target.value); loadAdminSectionData("dashboard", e.target.value); }}>
                        <option value="today">Today</option>
                        <option value="yesterday">Yesterday</option>
                        <option value="last_7_days">Last 7 days</option>
                        <option value="last_30_days">Last 30 days</option>
                        <option value="this_month">This month</option>
                      </select>
                    </div>
                    <div className="report-summary-grid">
                      <div className="report-card" role="button" onClick={() => goAdminSection("orders")}><span>Orders today</span><strong>{adminDashboard?.orders?.today ?? 0}</strong></div>
                      <div className="report-card" role="button" onClick={() => goAdminSection("orders")}><span>Pending</span><strong>{adminDashboard?.pending_orders ?? 0}</strong></div>
                      <div className="report-card"><span>Preparing</span><strong>{adminDashboard?.orders?.preparing ?? 0}</strong></div>
                      <div className="report-card" role="button" onClick={() => goAdminSection("employees")}><span>Out for delivery</span><strong>{adminDashboard?.orders?.out_for_delivery ?? 0}</strong></div>
                      <div className="report-card"><span>Delivered</span><strong>{adminDashboard?.orders?.delivered ?? 0}</strong></div>
                      <div className="report-card"><span>Cancelled</span><strong>{adminDashboard?.orders?.cancelled ?? 0}</strong></div>
                      <div className="report-card" role="button" onClick={() => goAdminSection("reports")}><span>Net revenue</span><strong>Rs.{Number(adminDashboard?.revenue ?? 0).toLocaleString("en-IN")}</strong></div>
                      <div className="report-card" role="button" onClick={() => goAdminSection("payments")}><span>Payments OK</span><strong>{adminDashboard?.payments?.successful ?? 0}</strong></div>
                      <div className="report-card" role="button" onClick={() => goAdminSection("refunds")}><span>Refunds pending</span><strong>{adminDashboard?.payments?.refunds_pending ?? 0}</strong></div>
                      <div className="report-card" role="button" onClick={() => goAdminSection("inventory")}><span>Low stock</span><strong>{adminDashboard?.low_stock ?? 0}</strong></div>
                      <div className="report-card" role="button" onClick={() => goAdminSection("coupons")}><span>Active coupons</span><strong>{adminDashboard?.active_coupons ?? 0}</strong></div>
                      <div className="report-card" role="button" onClick={() => goAdminSection("reviews")}><span>Reviews pending</span><strong>{adminDashboard?.reviews?.pending ?? 0}</strong></div>
                      <div className="report-card" role="button" onClick={() => goAdminSection("customers")}><span>Customers</span><strong>{adminDashboard?.customers?.total ?? 0}</strong></div>
                      <div className="report-card"><span>Gross sales</span><strong>Rs.{Number(adminDashboard?.sales_summary?.gross_sales ?? 0).toLocaleString("en-IN")}</strong></div>
                      <div className="report-card"><span>Refunds</span><strong>Rs.{Number(adminDashboard?.sales_summary?.refunds ?? 0).toLocaleString("en-IN")}</strong></div>
                      <div className="report-card"><span>Delivery fees</span><strong>Rs.{Number(adminDashboard?.sales_summary?.delivery_charges ?? 0).toLocaleString("en-IN")}</strong></div>
                    </div>
                  </div>
                )}
    
                {!adminReportsView && !adminDeliveryView && adminSection === "orders" && (
                  <div className="admin-reports-page">
                    <div className="report-topbar"><div><span className="eyebrow">ORDERS</span><h3>Order management</h3></div>
                      <button type="button" className="btn secondary small" onClick={() => downloadAdminExport("orders").catch((e) => setAdminOpsMessage(e.message))}>Export CSV</button>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                      <input placeholder="Search" value={adminOrderFilter.search} onChange={(e) => setAdminOrderFilter((p) => ({ ...p, search: e.target.value }))} />
                      <select value={adminOrderFilter.status} onChange={(e) => setAdminOrderFilter((p) => ({ ...p, status: e.target.value }))}>
                        <option value="">All statuses</option>
                        {["PENDING","ORDER_CONFIRMED","PREPARING","PACKING","READY_FOR_DELIVERY","DELIVERY_BOY_ASSIGNED","OUT_FOR_DELIVERY","DELIVERED","CANCELLED"].map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <select value={adminOrderFilter.payment_status} onChange={(e) => setAdminOrderFilter((p) => ({ ...p, payment_status: e.target.value }))}>
                        <option value="">All payments</option>
                        {["pending","paid","failed","refunded"].map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <button type="button" className="btn primary small" onClick={() => loadAdminSectionData("orders")}>Filter</button>
                    </div>
                    {adminOrderDetail ? (
                      <div className="report-section">
                        <button type="button" className="btn secondary small" onClick={() => setAdminOrderDetail(null)}>Back</button>
                        <h4>{adminOrderDetail.order_number} - {adminOrderDetail.status}</h4>
                        <p>{adminOrderDetail.customer_name} | {adminOrderDetail.customer_email} | {adminOrderDetail.customer_mobile}</p>
                        <p>{adminOrderDetail.shipping_address}, {adminOrderDetail.city} {adminOrderDetail.postal_code}</p>
                        <p>Payment: {adminOrderDetail.payment_status} | Total Rs.{Number(adminOrderDetail.total_amount || 0).toLocaleString("en-IN")} | Coupon {adminOrderDetail.coupon_code || "-"}</p>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "12px 0" }}>
                          <select id="admin-next-status" key={adminOrderDetail.status} defaultValue="">
                            <option value="">Next status...</option>
                            {getNextOrderStatuses(adminOrderDetail.status).map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                          {getNextOrderStatuses(adminOrderDetail.status).length === 0 && (
                            <span className="admin-muted">No further status transitions (use Cancel if needed).</span>
                          )}
                          <button type="button" className="btn primary small" onClick={() => {
                            const el = document.getElementById("admin-next-status");
                            const st = el && el.value;
                            if (!st) return;
                            updateAdminOrderStatus(adminOrderDetail.id, { status: st })
                              .then((d) => { setAdminOrderDetail(d); setAdminOpsMessage("Status updated"); loadAdminSectionData("orders"); })
                              .catch((e) => setAdminOpsMessage(e.message || "Status update failed"));
                          }}>Apply</button>
                          <button type="button" className="btn secondary small" onClick={openCancelModal}>Cancel order</button>
                          <button type="button" className="btn secondary small" onClick={openRefundModal}>Refund</button>
                          <button type="button" className="btn secondary small" onClick={openAssignPicker}>
                            {adminOrderDetail.delivery_employee ? "Reassign delivery" : "Assign delivery"}
                          </button>
                          <button
                            type="button"
                            className="btn secondary small"
                            disabled={!adminOrderDetail.delivery_employee}
                            onClick={handleUnassignDelivery}
                          >
                            Unassign
                          </button>
                        </div>
                        <p className="admin-muted" style={{ marginTop: 4 }}>
                          Delivery: {adminOrderDetail.delivery_employee
                            ? `${adminOrderDetail.delivery_employee.name} (#${adminOrderDetail.delivery_employee.id} / ${adminOrderDetail.delivery_employee.employee_id || "-"} / ${adminOrderDetail.delivery_employee.status || ""})`
                            : "Not assigned"}
                        </p>
                        <div className="table-wrap"><table className="report-table"><thead><tr><th>Item</th><th>Qty</th><th>Price</th></tr></thead><tbody>
                          {(adminOrderDetail.items || []).map((it) => <tr key={it.id}><td>{it.product_name}</td><td>{it.quantity}</td><td>Rs.{Number(it.subtotal || 0).toLocaleString("en-IN")}</td></tr>)}
                        </tbody></table></div>
                        <h4>History</h4>
                        <ul>{(adminOrderDetail.status_history || []).map((h) => <li key={h.id}>{h.status} - {h.message} <small>{new Date(h.created_at).toLocaleString()}</small></li>)}</ul>
                      </div>
                    ) : (
                      <div className="table-wrap"><table className="report-table"><thead><tr><th>Order</th><th>Customer</th><th>Status</th><th>Payment</th><th>Total</th><th></th></tr></thead><tbody>
                        {adminOrders.length === 0 && (<tr><td colSpan={6}><div className="admin-empty">No orders match filters.</div></td></tr>)}{adminOrders.map((o) => (
                          <tr key={o.id}>
                            <td>{o.order_number}</td><td>{o.customer_name}</td><td>{o.status}</td><td>{o.payment_status}</td>
                            <td>Rs.{Number(o.total_amount || 0).toLocaleString("en-IN")}</td>
                            <td><button type="button" className="btn secondary small" onClick={() => fetchAdminOrderDetail(o.id).then(setAdminOrderDetail).catch((e) => setAdminOpsMessage(e.message))}>Open</button></td>
                          </tr>
                        ))}
                      </tbody></table></div>
                    )}
                  </div>
                )}
    
                {!adminReportsView && !adminDeliveryView && adminSection === "payments" && (
                  <div className="admin-reports-page">
                    <div className="report-topbar"><div><span className="eyebrow">PAYMENTS</span><h3>Payments</h3></div>
                      <button type="button" className="btn secondary small" onClick={() => downloadAdminExport("payments").catch((e) => setAdminOpsMessage(e.message))}>Export CSV</button>
                    </div>
                    <div className="table-wrap"><table className="report-table"><thead><tr><th>Order</th><th>Customer</th><th>Amount</th><th>Status</th><th>Method</th><th>Gateway order</th><th>Failure</th></tr></thead><tbody>
                      {adminPayments.length === 0 && (<tr><td colSpan={7}><div className="admin-empty">No payments yet.</div></td></tr>)}{adminPayments.map((p) => <tr key={p.id != null ? `pay-${p.id}` : `order-${p.order_id}`}><td>{p.order_number || "-"}</td><td>{p.customer_name || "-"}</td><td>Rs.{Number(p.amount || 0).toLocaleString("en-IN")}</td><td>{p.status}{p.source === "order_derived" ? " (from order)" : ""}</td><td>{p.payment_method || "-"}</td><td>{p.gateway_order_id || "-"}</td><td>{p.failure_reason || "-"}</td></tr>)}
                    </tbody></table></div>
                  </div>
                )}
    
                {!adminReportsView && !adminDeliveryView && adminSection === "refunds" && (
                  <div className="admin-reports-page">
                    <div className="report-topbar"><div><span className="eyebrow">REFUNDS</span><h3>Refunds</h3></div>
                      <select
                        value={adminRefundFilter}
                        onChange={(e) => {
                          const v = e.target.value;
                          setAdminRefundFilter(v);
                          setAdminLoadingSection(true);
                          const params = { page: 1, page_size: 25 };
                          if (v) params.status = v;
                          fetchAdminRefunds(params)
                            .then((d) => setAdminRefunds(asListResponse(d)))
                            .catch((err) => { setAdminRefunds([]); setAdminOpsMessage(err.message || "Refunds failed"); })
                            .finally(() => setAdminLoadingSection(false));
                        }}
                      >
                        <option value="">All</option>
                        <option value="pending_group">Pending group</option>
                        <option value="requested">Requested</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="failed">Failed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <button type="button" className="btn secondary small" onClick={() => downloadAdminExport("refunds").catch((e) => setAdminOpsMessage(e.message))}>Export CSV</button>
                    </div>
                    <div className="table-wrap"><table className="report-table"><thead><tr><th>ID</th><th>Order</th><th>Amount</th><th>Status</th><th>By</th><th>Reason</th><th>Gateway refund</th></tr></thead><tbody>
                      {buildRefundTableRows(adminRefunds, adminRefundFilter)}
                    </tbody></table></div>
                  </div>
                )}
    
                {!adminReportsView && !adminDeliveryView && adminSection === "inventory" && (
                  <div className="admin-reports-page">
                    <div className="report-topbar"><div><span className="eyebrow">INVENTORY</span><h3>Stock control</h3></div>
                      <button type="button" className="btn secondary small" onClick={() => downloadAdminExport("inventory").catch((e) => setAdminOpsMessage(e.message))}>Export CSV</button>
                    </div>
                    <div className="table-wrap"><table className="report-table"><thead><tr><th>Product</th><th>Available</th><th>Reserved</th><th>Sold</th><th>Availability</th><th></th></tr></thead><tbody>
                      {adminInventory.length === 0 && (<tr><td colSpan={6}><div className="admin-empty">No inventory rows.</div></td></tr>)}{adminInventory.map((item) => (
                        <tr key={item.id}>
                          <td>{item.name}</td><td>{item.available_quantity}</td><td>{item.reserved_quantity}</td><td>{item.sold_quantity}</td><td>{item.availability}</td>
                          <td><button type="button" className="btn secondary small" onClick={() => openRestockModal(item, "inventory")}>Restock</button></td>
                        </tr>
                      ))}
                    </tbody></table></div>
                  </div>
                )}
    
                {!adminReportsView && !adminDeliveryView && (adminSection === "coupons" || adminCouponsView) && (
                  <div className="admin-reports-page">
                    <div className="report-topbar"><div><span className="eyebrow">COUPONS</span><h3>Promo codes</h3></div></div>
                    {adminCouponMessage && <div className="admin-error">{adminCouponMessage}</div>}
                    <form className="admin-form" onSubmit={(e) => { e.preventDefault(); createAdminCoupon({
                      code: adminCouponForm.code, name: adminCouponForm.name, discount_type: adminCouponForm.discount_type,
                      discount_value: adminCouponForm.discount_value, is_active: !!adminCouponForm.is_active,
                    }).then(() => { setAdminCouponMessage("Coupon created."); setAdminCouponForm({ code: "", name: "", discount_type: "percentage", discount_value: "10", is_active: true }); loadAdminCoupons(); }).catch((err) => setAdminCouponMessage(err.message)); }}>
                      <label>Code<input value={adminCouponForm.code} onChange={(e) => setAdminCouponForm((p) => ({ ...p, code: e.target.value }))} /></label>
                      <label>Name<input value={adminCouponForm.name} onChange={(e) => setAdminCouponForm((p) => ({ ...p, name: e.target.value }))} /></label>
                      <label>Type<select value={adminCouponForm.discount_type} onChange={(e) => setAdminCouponForm((p) => ({ ...p, discount_type: e.target.value }))}><option value="percentage">Percentage</option><option value="fixed_amount">Fixed</option></select></label>
                      <label>Value<input type="number" value={adminCouponForm.discount_value} onChange={(e) => setAdminCouponForm((p) => ({ ...p, discount_value: e.target.value }))} /></label>
                      <label><input type="checkbox" checked={!!adminCouponForm.is_active} onChange={(e) => setAdminCouponForm((p) => ({ ...p, is_active: e.target.checked }))} /> Active</label>
                      <button type="submit" className="btn primary small">Create coupon</button>
                    </form>
                    <div className="table-wrap"><table className="report-table"><thead><tr><th>Code</th><th>Type</th><th>Value</th><th>Used</th><th>Active</th><th></th></tr></thead><tbody>
                      {adminCoupons.map((c) => (
                        <tr key={c.id}><td>{c.code}</td><td>{c.discount_type}</td><td>{c.discount_value}</td><td>{c.total_used}</td><td>{c.is_active ? "Yes" : "No"}</td>
                          <td><button type="button" className="btn secondary small" onClick={() => updateAdminCoupon(c.id, { is_active: !c.is_active }).then(() => loadAdminCoupons())}>{c.is_active ? "Disable" : "Enable"}</button></td>
                        </tr>
                      ))}
                    </tbody></table></div>
                  </div>
                )}
    
                {!adminReportsView && !adminDeliveryView && adminSection === "customers" && (
                  <div className="admin-reports-page">
                    <div className="report-topbar"><div><span className="eyebrow">CUSTOMERS</span><h3>Customer accounts</h3></div>
                      <button type="button" className="btn secondary small" onClick={() => downloadAdminExport("customers").catch((e) => setAdminOpsMessage(e.message))}>Export CSV</button>
                    </div>
                    <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                      <input placeholder="Search name/email/mobile" value={adminCustomerSearch} onChange={(e) => setAdminCustomerSearch(e.target.value)} />
                      <button type="button" className="btn primary small" onClick={() => loadAdminSectionData("customers")}>Search</button>
                    </div>
                    <div className="table-wrap"><table className="report-table"><thead><tr><th>User</th><th>Email</th><th>Mobile</th><th>Orders</th><th>Purchase</th><th>Active</th><th></th></tr></thead><tbody>
                      {adminCustomers.length === 0 && (
                        <tr><td colSpan={7}><div className="admin-empty">No customers found.</div></td></tr>
                      )}
                      {adminCustomers.map((c) => (
                        <tr key={c.id}><td>{c.username}</td><td>{c.email}</td><td>{c.mobile_number || "-"}</td><td>{c.order_count}</td><td>Rs.{Number(c.total_purchase || 0).toLocaleString("en-IN")}</td><td>{c.is_active ? "Yes" : "No"}</td>
                          <td style={{ display: "flex", gap: 6 }}>
                            <button type="button" className="btn secondary small" onClick={() => openCustomerDetail(c.id)}>View</button>
                            <button type="button" className="btn secondary small" onClick={() => updateAdminCustomerStatus(c.id, !c.is_active).then(() => { loadAdminSectionData("customers"); if (adminCustomerDetail?.id === c.id) openCustomerDetail(c.id); }).catch((e) => setAdminOpsMessage(e.message))}>{c.is_active ? "Deactivate" : "Activate"}</button>
                          </td>
                        </tr>
                      ))}
                    </tbody></table></div>
                  </div>
                )}
    
                {!adminReportsView && !adminDeliveryView && adminSection === "employees" && (
                  <AdminEmployeesPanel {...{
                    adminEmployeeView,
                    setAdminEmployeeView,
                    adminEmployeeStats,
                    loadAdminEmployeeData,
                    adminEmployeeFilter,
                    setAdminEmployeeFilter,
                    adminEmployeeCategories,
                    adminEmployeeMessage,
                    handleEmployeeFormSubmit,
                    adminEmployeeEditingId,
                    resetEmployeeForm,
                    adminEmployeeForm,
                    setAdminEmployeeForm,
                    adminEmployeeDetail,
                    setAdminEmployeeDetail,
                    adminEmployees,
                    viewEmployeeDetails,
                    startEditEmployee,
                    adminEmployeesMeta,
                    setAdminOpsMessage,
                    adminActiveDeliveries,
                    adminEmployeeCategoryMessage,
                    setAdminEmployeeCategoryMessage,
                    handleEmployeeCategorySubmit,
                    adminEmployeeCategoryEditingId,
                    adminEmployeeCategoryForm,
                    setAdminEmployeeCategoryForm,
                    resetEmployeeCategoryForm,
                    editEmployeeCategory,
                  }} />
                )}
    
                {!adminReportsView && !adminDeliveryView && adminSection === "reviews" && (
                  <div className="admin-reports-page">
                    <div className="report-topbar"><div><span className="eyebrow">REVIEWS</span><h3>Moderation</h3></div>
                      <select value={adminReviewFilter} onChange={(e) => { const v = e.target.value; setAdminReviewFilter(v); setAdminLoadingSection(true); fetchAdminReviews({ status: v, page: 1, page_size: 25 }).then((d) => setAdminReviews(Array.isArray(d) ? d : (d.results || []))).catch((err) => setAdminOpsMessage(err.message || "Reviews failed")).finally(() => setAdminLoadingSection(false)); }}>
                        <option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="">All</option>
                      </select>
                    </div>
                    <div className="table-wrap"><table className="report-table"><thead><tr><th>Product</th><th>User</th><th>Rating</th><th>Comment</th><th>Status</th><th></th></tr></thead><tbody>
                      {adminReviews.map((r) => (
                        <tr key={r.id}><td>{r.product_name || r.product}</td><td>{r.user_name || r.name}</td><td>{r.rating}</td><td>{r.comment}</td><td>{r.status}</td>
                          <td style={{ display: "flex", gap: 6 }}>
                            {r.status === "pending" && <>
                              <button type="button" className="btn primary small" onClick={() => approveAdminReview(r.id).then(() => loadAdminSectionData("reviews"))}>Approve</button>
                              <button type="button" className="btn secondary small" onClick={() => rejectAdminReview(r.id, "Rejected by admin").then(() => loadAdminSectionData("reviews"))}>Reject</button>
                            </>}
                          </td>
                        </tr>
                      ))}
                    </tbody></table></div>
                  </div>
                )}
    
                {!adminReportsView && !adminDeliveryView && adminSection === "notifications" && (
                  <div className="admin-reports-page">
                    <div className="report-topbar"><div><span className="eyebrow">NOTIFICATIONS</span><h3>Admin alerts</h3></div>
                      <button type="button" className="btn secondary small" onClick={() => loadAdminSectionData("notifications")}>Refresh</button>
                    </div>
                    <div style={{ display: "grid", gap: 8 }}>
                      {(adminNotifications || []).length === 0 ? <div className="empty">No admin alerts.</div> : adminNotifications.map((n) => (
                        <div key={n.id} className="report-card" style={{ textAlign: "left" }}>
                          <strong>{n.title}</strong>
                          <div>{n.body}</div>
                          <small>{n.event} | {n.reference_type} {n.reference_id} | {new Date(n.created_at).toLocaleString()} | {n.is_read ? "Read" : "Unread"}</small>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
    
                {!adminReportsView && !adminDeliveryView && adminSection === "settings" && (
                  <div className="admin-reports-page">
                    <div className="report-topbar"><div><span className="eyebrow">SETTINGS</span><h3>Business & integrations</h3></div></div>
                    {adminSettings && (
                      <>
                        <div className="report-summary-grid">
                          <div className="report-card"><span>SMTP</span><strong>{adminSettings.integrations?.smtp_configured ? "Configured" : "Not configured"}</strong></div>
                          <div className="report-card"><span>SMS</span><strong>{adminSettings.integrations?.sms_configured ? "Configured" : "Not configured"}</strong></div>
                          <div className="report-card"><span>WhatsApp</span><strong>{adminSettings.integrations?.whatsapp_configured ? "Configured" : "Not configured"}</strong></div>
                          <div className="report-card"><span>Payments</span><strong>{adminSettings.integrations?.payment_configured ? "Configured" : "Not configured"}</strong></div>
                        </div>
                        <form className="admin-form" onSubmit={(e) => {
                          e.preventDefault();
                          updateAdminSettingsStatus({
                            bakery_latitude: adminSettings.business?.bakery_latitude,
                            bakery_longitude: adminSettings.business?.bakery_longitude,
                            delivery_enabled: !!adminSettings.business?.delivery_enabled,
                            default_delivery_charge: adminSettings.business?.default_delivery_charge,
                            free_delivery_threshold: adminSettings.business?.free_delivery_threshold,
                            max_delivery_radius_km: adminSettings.business?.max_delivery_radius_km,
                            per_km_charge: adminSettings.business?.per_km_charge,
                          }).then((d) => { setAdminSettings(d); setAdminOpsMessage("Settings saved"); }).catch((err) => setAdminOpsMessage(err.message));
                        }}>
                          <label>Bakery latitude<input value={adminSettings.business?.bakery_latitude || ""} onChange={(e) => setAdminSettings((p) => ({ ...p, business: { ...p.business, bakery_latitude: e.target.value } }))} /></label>
                          <label>Bakery longitude<input value={adminSettings.business?.bakery_longitude || ""} onChange={(e) => setAdminSettings((p) => ({ ...p, business: { ...p.business, bakery_longitude: e.target.value } }))} /></label>
                          <label>Default delivery charge<input value={adminSettings.business?.default_delivery_charge || ""} onChange={(e) => setAdminSettings((p) => ({ ...p, business: { ...p.business, default_delivery_charge: e.target.value } }))} /></label>
                          <label><input type="checkbox" checked={!!adminSettings.business?.delivery_enabled} onChange={(e) => setAdminSettings((p) => ({ ...p, business: { ...p.business, delivery_enabled: e.target.checked } }))} /> Delivery enabled</label>
                          <p><small>Contact: {adminSettings.business?.contact_email || "-"} | Secrets are never shown or accepted here.</small></p>
                          <button type="submit" className="btn primary small">Save operational settings</button>
                        </form>
                      </>
                    )}
                  </div>
                )}
    
                {adminReportsView ? (
                  <div className="admin-reports-page">
                    <div className="report-topbar">
                      <div>
                        <span className="eyebrow">REPORTS</span>
                        <h3>Admin Reporting Dashboard</h3>
                      </div>
                      <button className="btn primary small" onClick={closeAdminReports}>Close</button>
                    </div>
    
                    {reportsLoading ? (
                      <div className="empty">Loading report...</div>
                    ) : reportsError ? (
                      <div className="empty">{reportsError}</div>
                    ) : (
                      <>
                        <div className="report-summary-grid">
                          <div className="report-card"><span>Customers</span><strong>{reportSummary.user_stats?.total_users ?? 0}</strong></div>
                          <div className="report-card"><span>Verified users</span><strong>{reportSummary.user_stats?.verified_users ?? 0}</strong></div>
                          <div className="report-card"><span>Unverified users</span><strong>{reportSummary.user_stats?.unverified_users ?? 0}</strong></div>
                          <div className="report-card"><span>New this week</span><strong>{reportSummary.user_stats?.new_users_this_week ?? 0}</strong></div>
                          <div className="report-card"><span>Total products</span><strong>{reportSummary.product_stats?.total_products ?? 0}</strong></div>
                          <div className="report-card"><span>Active products</span><strong>{reportSummary.product_stats?.active_products ?? 0}</strong></div>
                          <div className="report-card"><span>Discounted products</span><strong>{reportSummary.product_stats?.products_with_discounts ?? 0}</strong></div>
                          <div className="report-card"><span>3D assets</span><strong>{reportSummary.product_stats?.products_with_3d_assets ?? 0}</strong></div>
                          <div className="report-card"><span>Total reviews</span><strong>{reportSummary.review_stats?.total_reviews ?? 0}</strong></div>
                          <div className="report-card"><span>Average rating</span><strong>{Number(reportSummary.review_stats?.average_rating ?? 0).toFixed(1)}</strong></div>
                          <div className="report-card"><span>Pending reviews</span><strong>{reportSummary.review_stats?.pending_reviews ?? 0}</strong></div>
                          <div className="report-card"><span>Revenue</span><strong>Rs.{Number(reportSummary.sales_stats?.total_sales ?? 0).toLocaleString("en-IN")}</strong></div>
                          <div className="report-card"><span>Successful payments</span><strong>{reportSummary.sales_stats?.successful_payments ?? 0}</strong></div>
                          <div className="report-card"><span>Failed payments</span><strong>{reportSummary.sales_stats?.failed_payments ?? 0}</strong></div>
                          <div className="report-card"><span>Pending payments</span><strong>{reportSummary.sales_stats?.pending_payments ?? 0}</strong></div>
                          <div className="report-card"><span>Orders</span><strong>{reportSummary.sales_stats?.total_orders ?? 0}</strong></div>
                          <div className="report-card"><span>Orders with coupon</span><strong>{reportSummary.sales_stats?.orders_with_coupon ?? 0}</strong></div>
                          <div className="report-card"><span>Coupon discount</span><strong>Rs.{Number(reportSummary.sales_stats?.total_coupon_discount ?? 0).toLocaleString("en-IN")}</strong></div>
                          <div className="report-card"><span>Coupons used</span><strong>{reportSummary.sales_stats?.coupons_used_count ?? 0}</strong></div>
                        </div>
    
                        <div className="report-section">
                          <h4>Sales overview</h4>
                          <div className="report-note">
                            {reportSummary.sales_stats?.note || "No order or payment module is active yet. Sales data will appear here when that feature is added."}
                          </div>
                        </div>
    
                        <div className="report-section">
                          <h4>Product performance</h4>
                          {reportPerformance.length ? (
                            <div className="table-wrap">
                              <table className="report-table">
                                <thead>
                                  <tr><th>Product</th><th>Views</th><th>Avg rating</th><th>Reviews</th><th>Availability</th></tr>
                                </thead>
                                <tbody>
                                  {reportPerformance.slice(0, 10).map(item => (
                                    <tr key={item.id}>
                                      <td>{item.name}</td>
                                      <td>{item.view_count ?? 0}</td>
                                      <td>{Number(item.avg_rating ?? 0).toFixed(1)}</td>
                                      <td>{item.review_count ?? 0}</td>
                                      <td>{item.availability || "in_stock"}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="empty">No product performance data is available for the selected period.</div>
                          )}
                        </div>
    
                        <div className="report-section">
                          <h4>Recent admin activity</h4>
                          {reportActivity.length ? (
                            <div className="table-wrap">
                              <table className="report-table">
                                <thead>
                                  <tr><th>Admin</th><th>Action</th><th>Entity</th><th>Time</th></tr>
                                </thead>
                                <tbody>
                                  {reportActivity.slice(0, 10).map(item => (
                                    <tr key={item.id}>
                                      <td>{item.admin_user__username}</td>
                                      <td>{item.action}</td>
                                      <td>{item.entity_type || "-"}</td>
                                      <td>{new Date(item.created_at).toLocaleString()}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="empty">No admin activity recorded yet.</div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ) : adminDeliveryView ? (
                  <div className="admin-reports-page">
                    <div className="report-topbar">
                      <div>
                        <span className="eyebrow">DELIVERY</span>
                        <h3>Delivery Zones & Settings</h3>
                      </div>
                      <button type="button" className="btn primary small" onClick={() => setAdminDeliveryView(false)}>Close</button>
                    </div>
                    {adminDeliveryMessage && <div className="admin-error">{adminDeliveryMessage}</div>}
                    {adminDeliverySettings && (
                      <form className="admin-form" style={{ marginBottom: 16 }} onSubmit={(e) => {
                        e.preventDefault();
                        updateAdminDeliverySettings({
                          delivery_enabled: !!adminDeliverySettings.delivery_enabled,
                          default_delivery_charge: adminDeliverySettings.default_delivery_charge,
                          free_delivery_threshold: adminDeliverySettings.free_delivery_threshold || null,
                          bakery_latitude: adminDeliverySettings.bakery_latitude || null,
                          bakery_longitude: adminDeliverySettings.bakery_longitude || null,
                          max_delivery_radius_km: adminDeliverySettings.max_delivery_radius_km || null,
                          per_km_charge: adminDeliverySettings.per_km_charge || null,
                        })
                          .then((data) => { setAdminDeliverySettings(data); setAdminDeliveryMessage("Settings saved."); })
                          .catch((err) => setAdminDeliveryMessage(err.message || "Could not save settings."));
                      }}>
                        <h4>Global settings</h4>
                        <div className="auth-row">
                          <label>Default charge<input type="number" value={adminDeliverySettings.default_delivery_charge ?? ""} onChange={e => setAdminDeliverySettings(prev => ({ ...prev, default_delivery_charge: e.target.value }))} /></label>
                          <label>Free threshold<input type="number" value={adminDeliverySettings.free_delivery_threshold ?? ""} onChange={e => setAdminDeliverySettings(prev => ({ ...prev, free_delivery_threshold: e.target.value }))} /></label>
                        </div>
                        <div className="auth-row">
                          <label>Bakery lat<input value={adminDeliverySettings.bakery_latitude ?? ""} onChange={e => setAdminDeliverySettings(prev => ({ ...prev, bakery_latitude: e.target.value }))} /></label>
                          <label>Bakery lng<input value={adminDeliverySettings.bakery_longitude ?? ""} onChange={e => setAdminDeliverySettings(prev => ({ ...prev, bakery_longitude: e.target.value }))} /></label>
                        </div>
                        <div className="auth-row">
                          <label>Max radius km<input type="number" value={adminDeliverySettings.max_delivery_radius_km ?? ""} onChange={e => setAdminDeliverySettings(prev => ({ ...prev, max_delivery_radius_km: e.target.value }))} /></label>
                          <label>Per-km charge<input type="number" value={adminDeliverySettings.per_km_charge ?? ""} onChange={e => setAdminDeliverySettings(prev => ({ ...prev, per_km_charge: e.target.value }))} /></label>
                        </div>
                        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <input type="checkbox" checked={!!adminDeliverySettings.delivery_enabled} onChange={e => setAdminDeliverySettings(prev => ({ ...prev, delivery_enabled: e.target.checked }))} />
                          Delivery enabled
                        </label>
                        <button type="submit" className="btn primary">Save settings</button>
                      </form>
                    )}
                    <form className="admin-form" onSubmit={handleCreateAdminZone}>
                      <h4>Add zone</h4>
                      <label>Name<input value={adminZoneForm.name} onChange={e => setAdminZoneForm(prev => ({ ...prev, name: e.target.value }))} required /></label>
                      <label>PIN codes (comma-separated)<input value={adminZoneForm.postal_codes} onChange={e => setAdminZoneForm(prev => ({ ...prev, postal_codes: e.target.value }))} placeholder="400001, 400002" required /></label>
                      <div className="auth-row">
                        <label>Charge<input type="number" value={adminZoneForm.delivery_charge} onChange={e => setAdminZoneForm(prev => ({ ...prev, delivery_charge: e.target.value }))} /></label>
                        <label>Min order<input type="number" value={adminZoneForm.minimum_order_amount} onChange={e => setAdminZoneForm(prev => ({ ...prev, minimum_order_amount: e.target.value }))} /></label>
                        <label>Free above<input type="number" value={adminZoneForm.free_delivery_threshold} onChange={e => setAdminZoneForm(prev => ({ ...prev, free_delivery_threshold: e.target.value }))} /></label>
                      </div>
                      <button type="submit" className="btn primary">Create zone</button>
                    </form>
                    <div className="admin-cake-list" style={{ marginTop: 16 }}>
                      <h3>Zones</h3>
                      {adminZones.map(zone => (
                        <div className="admin-cake-item" key={zone.id}>
                          <div className="admin-cake-details">
                            <div>
                              <strong>{zone.name}</strong>
                              <span>{(zone.postal_codes || []).join(' | ')}</span>
                              <small>Charge {String.fromCharCode(8377)}{Number(zone.delivery_charge || 0)} | Min {String.fromCharCode(8377)}{Number(zone.minimum_order_amount || 0)}</small>
                            </div>
                          </div>
                          <div className="admin-item-actions">
                            <button type="button" className="btn secondary small" onClick={() => toggleAdminZone(zone)}>{zone.is_active ? "Disable" : "Enable"}</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (adminSection === "products" || (!["dashboard","orders","payments","refunds","inventory","coupons","customers","employees","reviews","notifications","settings"].includes(adminSection))) ? (
                  <>
                    <form className="admin-form add-cake-form" onSubmit={submitCakeForm}>
                      <div className="admin-form-head">
                        <h3>{editingCakeId != null ? "Edit Cake" : "Add New Cake"}</h3>
                        {editingCakeId != null && (
                          <button type="button" className="btn secondary small" onClick={resetCakeForm}>Cancel</button>
                        )}
                      </div>
                      <label>
                        Cake Name
                        <input value={cakeForm.name} onChange={e => setCakeForm(prev => ({ ...prev, name: e.target.value }))} placeholder="Strawberry Delight" />
                      </label>
                      <label>
                        Price (Rs.)
                        <input type="number" value={cakeForm.price} onChange={e => setCakeForm(prev => ({ ...prev, price: e.target.value }))} placeholder="1299" />
                      </label>
                      <label>
                        Discount (%)
                        <input type="number" min="0" max="100" value={cakeForm.discount} onChange={e => setCakeForm(prev => ({ ...prev, discount: e.target.value }))} placeholder="10" />
                      </label>
                      <label>
                        Category
                        <select value={cakeForm.category} onChange={e => setCakeForm(prev => ({ ...prev, category: e.target.value }))}>
                          {CAKE_CATEGORY_OPTIONS.map(categoryName => <option key={categoryName} value={categoryName}>{categoryName}</option>)}
                        </select>
                      </label>
                      <label>
                        Availability
                        <select value={cakeForm.availability} onChange={e => setCakeForm(prev => ({ ...prev, availability: e.target.value }))}>
                          <option value="in_stock">In Stock</option>
                          <option value="low_stock">Low Stock</option>
                          <option value="out_of_stock">Out of Stock</option>
                        </select>
                      </label>
                      <label>
                        Status
                        <select value={cakeForm.status} onChange={e => setCakeForm(prev => ({ ...prev, status: e.target.value }))}>
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                          <option value="archived">Archived</option>
                        </select>
                      </label>
                      <label>
                        Stock quantity
                        <input type="number" min="0" value={cakeForm.available_quantity} onChange={e => setCakeForm(prev => ({ ...prev, available_quantity: e.target.value }))} placeholder="50" />
                      </label>
                      <label>
                        Low stock threshold
                        <input type="number" min="0" value={cakeForm.low_stock_threshold} onChange={e => setCakeForm(prev => ({ ...prev, low_stock_threshold: e.target.value }))} placeholder="5" />
                      </label>
                      <label>
                        Description
                        <textarea value={cakeForm.description} onChange={e => setCakeForm(prev => ({ ...prev, description: e.target.value }))} placeholder="Rich chocolate sponge with smooth cream..." />
                      </label>
                      <label>
                        Image URL
                        <input value={cakeForm.image} onChange={e => setCakeForm(prev => ({ ...prev, image: e.target.value }))} placeholder="https://..." />
                      </label>
                      {adminMessage && <span className="admin-error">{adminMessage}</span>}
                      <button type="submit" className="btn primary full">{editingCakeId != null ? "Save Changes" : "Add Cake"}</button>
                    </form>
    
                    <div className="admin-cake-list">
                      <h3>Current Cakes</h3>
                      {catalog.map(item => (
                        <div className="admin-cake-item" key={item.id}>
                          <div className="admin-cake-details">
                            <img src={item.image} alt={item.name} />
                            <div>
                              <strong>{item.name}</strong>
                              <span>{item.category}</span>
                              <small className="stock-meta">Stock: {item.available_quantity ?? item.stock_remaining ?? 0} ({item.availability || "in_stock"})</small>
                              <small>Rs.{item.price.toLocaleString("en-IN")}</small>
                            </div>
                          </div>
                          <div className="admin-item-actions">
                            <button className="btn secondary small" onClick={() => populateCakeForm(item)}>Edit</button>
                            <button className="btn secondary small" type="button" onClick={() => openRestockModal(item, "products")}>Restock</button>
                            <button className="admin-remove" onClick={() => removeCake(item.id)}><Trash2 size={15}/> Remove</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : null}
              </div>
            </aside>
  );
}

export default AdminDashboardPanel;
