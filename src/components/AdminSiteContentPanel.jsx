import { useCallback, useEffect, useState } from "react";
import { deleteAdminSiteContent, fetchAdminSiteContent, saveAdminSiteContent } from "../services/authService";

const KINDS = {
  gallery: {
    title: "Gallery photos",
    blank: { image_url: "", alt_text: "", caption: "", sort_order: 0, is_active: true },
    fields: [
      ["image_url", "Image URL (https)", "url"],
      ["alt_text", "Alt text", "text"],
      ["caption", "Caption", "text"],
      ["sort_order", "Order", "number"],
    ],
    columns: [["caption", "Caption"], ["alt_text", "Alt text"], ["sort_order", "Order"]],
  },
  testimonials: {
    title: "Testimonials",
    blank: { name: "", text: "", tag: "", rating: 5, sort_order: 0, is_active: true },
    fields: [
      ["name", "Customer name", "text"],
      ["text", "Testimonial", "textarea"],
      ["tag", "Tag (e.g. Birthday Cake)", "text"],
      ["rating", "Rating (1-5)", "number"],
      ["sort_order", "Order", "number"],
    ],
    columns: [["name", "Name"], ["tag", "Tag"], ["rating", "Rating"], ["sort_order", "Order"]],
  },
  slots: {
    title: "Delivery time slots",
    blank: { label: "", start_time: "", end_time: "", sort_order: 0, is_active: true },
    fields: [
      ["label", "Label (e.g. Evening 6-9 PM)", "text"],
      ["start_time", "Starts", "time"],
      ["end_time", "Ends", "time"],
      ["sort_order", "Order", "number"],
    ],
    columns: [["label", "Label"], ["start_time", "Starts"], ["end_time", "Ends"], ["sort_order", "Order"]],
  },
};

function SiteContentSection({ kind }) {
  const config = KINDS[kind];
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(config.blank);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  const load = useCallback(() => {
    fetchAdminSiteContent(kind).then(setRows).catch((err) => setMessage(err.message || "Could not load."));
  }, [kind]);

  useEffect(() => { load(); }, [load]);

  function reset() {
    setForm(config.blank);
    setEditingId(null);
  }

  function submit(event) {
    event.preventDefault();
    setMessage("");
    const payload = { ...form, sort_order: Number(form.sort_order) || 0 };
    if ("rating" in payload) payload.rating = Number(payload.rating) || 5;
    saveAdminSiteContent(kind, payload, editingId)
      .then(() => { setMessage(editingId ? "Saved." : "Added."); reset(); load(); })
      .catch((err) => setMessage(err.message || "Save failed."));
  }

  function startEdit(row) {
    const next = {};
    Object.keys(config.blank).forEach((key) => { next[key] = row[key] ?? config.blank[key]; });
    setForm(next);
    setEditingId(row.id);
  }

  function toggle(row) {
    saveAdminSiteContent(kind, { is_active: !row.is_active }, row.id).then(load).catch((err) => setMessage(err.message));
  }

  function remove(row) {
    if (!window.confirm("Delete this item?")) return;
    deleteAdminSiteContent(kind, row.id).then(load).catch((err) => setMessage(err.message));
  }

  return (
    <div className="admin-reports-page" style={{ marginBottom: 24 }}>
      <div className="report-topbar"><div><h3>{config.title}</h3></div></div>
      {message && <div className="admin-error">{message}</div>}
      <form className="admin-form" onSubmit={submit}>
        {config.fields.map(([key, label, type]) => (
          <label key={key}>{label}
            {type === "textarea" ? (
              <textarea required value={form[key]} onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))} />
            ) : (
              <input
                type={type}
                required={type !== "number" && key !== "caption" && key !== "tag"}
                min={key === "rating" ? 1 : undefined}
                max={key === "rating" ? 5 : undefined}
                value={form[key]}
                onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
              />
            )}
          </label>
        ))}
        <label><input type="checkbox" checked={!!form.is_active} onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))} /> Active</label>
        <button type="submit" className="btn primary small">{editingId ? "Save" : "Add"}</button>
        {editingId && <button type="button" className="btn secondary small" onClick={reset}>Cancel</button>}
      </form>
      <div className="table-wrap"><table className="report-table"><thead><tr>
        {config.columns.map(([, label]) => <th key={label}>{label}</th>)}<th>Active</th><th></th>
      </tr></thead><tbody>
        {rows.length === 0 ? (
          <tr><td colSpan={config.columns.length + 2}>Nothing added yet. The site shows its built-in content until you add some.</td></tr>
        ) : rows.map((row) => (
          <tr key={row.id}>
            {config.columns.map(([key]) => <td key={key}>{String(row[key] ?? "")}</td>)}
            <td>{row.is_active ? "Yes" : "No"}</td>
            <td style={{ whiteSpace: "nowrap" }}>
              <button type="button" className="btn secondary small" onClick={() => startEdit(row)}>Edit</button>{" "}
              <button type="button" className="btn secondary small" onClick={() => toggle(row)}>{row.is_active ? "Hide" : "Show"}</button>{" "}
              <button type="button" className="btn secondary small" onClick={() => remove(row)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody></table></div>
    </div>
  );
}

export default function AdminSiteContentPanel() {
  return (
    <div>
      <div className="report-topbar"><div><span className="eyebrow">SITE CONTENT</span><h3>Gallery, testimonials and delivery slots</h3></div></div>
      <SiteContentSection kind="gallery" />
      <SiteContentSection kind="testimonials" />
      <SiteContentSection kind="slots" />
    </div>
  );
}
