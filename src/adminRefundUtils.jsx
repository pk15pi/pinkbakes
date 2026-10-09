const PENDING_STATUSES = ["requested", "pending", "processing"];

function isRefundPendingStatus(status) {
  return PENDING_STATUSES.includes(String(status || "").toLowerCase());
}

function refundOrderLabel(refund) {
  if (!refund) return "-";
  if (refund.order_number) return refund.order_number;
  if (refund.order_id != null && refund.order_id !== "") return String(refund.order_id);
  if (refund.order && typeof refund.order === "object" && refund.order.order_number) return refund.order.order_number;
  if (refund.order != null && refund.order !== "") return String(refund.order);
  return "-";
}

export function buildRefundTableRows(refunds, refundFilter) {
  const list = Array.isArray(refunds) ? refunds : [];
  if (list.length === 0) {
    return (
      <tr key="empty"><td colSpan={7}><div className="admin-empty">No refunds yet.</div></td></tr>
    );
  }
  const groupClientSide = !refundFilter;
  const pending = groupClientSide ? list.filter(refund => isRefundPendingStatus(refund.status)) : [];
  const other = groupClientSide ? list.filter(refund => !isRefundPendingStatus(refund.status)) : list;
  const renderRow = refund => (
    <tr key={refund.id}>
      <td>{refund.id}</td>
      <td>{refundOrderLabel(refund)}</td>
      <td>Rs.{Number(refund.amount || 0).toLocaleString("en-IN")}</td>
      <td>{refund.status}</td>
      <td>{refund.initiated_by_type || "-"}</td>
      <td>{refund.reason || "-"}</td>
      <td>{refund.gateway_refund_id || "-"}</td>
    </tr>
  );
  if (!groupClientSide) return other.map(renderRow);
  const rows = [];
  if (pending.length) {
    rows.push(
      <tr key="pending-group-hdr">
        <td colSpan={7}><strong>Pending</strong> <span className="eyebrow">(requested / pending / processing)</span></td>
      </tr>
    );
    pending.forEach(refund => rows.push(renderRow(refund)));
  }
  if (other.length) {
    rows.push(
      <tr key="other-group-hdr">
        <td colSpan={7}><strong>{pending.length ? "Completed / other" : "Refunds"}</strong></td>
      </tr>
    );
    other.forEach(refund => rows.push(renderRow(refund)));
  }
  return rows;
}
