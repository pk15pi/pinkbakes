import { X } from "lucide-react";

function AdminCustomerDrawer({ customer, loading, onClose, onToggleStatus }) {
  if (!customer && !loading) return null;

  return (
    <>
      <div className="admin-drawer-backdrop" onClick={onClose} />
      <aside className="admin-drawer" role="dialog" aria-label="Customer detail">
        <div className="drawer-head">
          <h2>Customer</h2>
          <button type="button" onClick={onClose} aria-label="Close customer details"><X /></button>
        </div>
        <div className="admin-drawer-body">
          {loading && <div className="admin-empty">Loading...</div>}
          {customer && (
            <>
              <p><strong>{customer.first_name || ""} {customer.last_name || ""}</strong> <span className="admin-muted">@{customer.username}</span></p>
              <p className="admin-muted">{customer.email} | {customer.mobile_number || "No mobile"}</p>
              <p>Status: <strong>{customer.is_active ? "Active" : "Inactive"}</strong>
                {" | "}Verified: {customer.is_verified ? "Yes" : "No"}
                {" | "}Joined: {customer.date_joined ? new Date(customer.date_joined).toLocaleDateString() : "-"}
              </p>
              <p>Orders: <strong>{customer.order_count ?? 0}</strong> | Purchase: <strong>Rs.{Number(customer.total_purchase || 0).toLocaleString("en-IN")}</strong></p>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button type="button" className="btn primary small" onClick={onToggleStatus}>
                  {customer.is_active ? "Deactivate" : "Activate"}
                </button>
              </div>
              <h4>Addresses</h4>
              {(customer.addresses || []).length === 0 ? <div className="admin-empty">No saved addresses.</div> : (
                <ul className="tracking-history">
                  {(customer.addresses || []).map(address => (
                    <li key={address.id}><span>{address.full_name}{address.is_default ? " (default)" : ""}</span><small>{address.address_line_1}, {address.city} {address.postal_code}</small></li>
                  ))}
                </ul>
              )}
              <h4>Recent orders</h4>
              {(customer.orders || []).length === 0 ? <div className="admin-empty">No orders.</div> : (
                <div className="table-wrap"><table className="report-table"><thead><tr><th>Order</th><th>Status</th><th>Total</th></tr></thead><tbody>
                  {(customer.orders || []).slice(0, 15).map(order => (
                    <tr key={order.id}><td>{order.order_number}</td><td>{order.status}</td><td>Rs.{Number(order.total_amount || 0).toLocaleString("en-IN")}</td></tr>
                  ))}
                </tbody></table></div>
              )}
            </>
          )}
        </div>
      </aside>
    </>
  );
}

export default AdminCustomerDrawer;
