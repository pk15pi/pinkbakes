import {
  updateAdminEmployee,
  updateAdminEmployeeCategory,
} from "../services/authService";

function AdminEmployeesPanel({
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
}) {
  return (
    <div className="admin-reports-page employee-admin">
      <div className="report-topbar"><div><span className="eyebrow">STAFF MANAGEMENT</span><h3>Employees & delivery</h3></div></div>
      <div className="employee-admin-tabs" role="tablist" aria-label="Employee administration">
        <button type="button" className={`btn secondary small${adminEmployeeView === "employees" ? " active" : ""}`} onClick={() => setAdminEmployeeView("employees")}>Employees</button>
        <button type="button" className={`btn secondary small${adminEmployeeView === "categories" ? " active" : ""}`} onClick={() => setAdminEmployeeView("categories")}>Categories</button>
      </div>

      {adminEmployeeView === "employees" ? (
        <>
          <div className="employee-stat-grid">
            {[
              ["Total employees", adminEmployeeStats?.total ?? 0],
              ["Active", adminEmployeeStats?.active ?? 0],
              ["Inactive", adminEmployeeStats?.inactive ?? 0],
              ["On leave", adminEmployeeStats?.on_leave ?? 0],
            ].map(([label, value]) => <div className="employee-stat-card" key={label}><span>{label}</span><strong>{value}</strong></div>)}
          </div>
          <form className="employee-filter-form" onSubmit={(event) => { event.preventDefault(); loadAdminEmployeeData(1); }}>
            <label>Search<input value={adminEmployeeFilter.search} onChange={(e) => setAdminEmployeeFilter((p) => ({ ...p, search: e.target.value }))} placeholder="Name, ID, phone or email" /></label>
            <label>Category<select value={adminEmployeeFilter.category} onChange={(e) => setAdminEmployeeFilter((p) => ({ ...p, category: e.target.value }))}><option value="">All categories</option>{adminEmployeeCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
            <label>Employment status<select value={adminEmployeeFilter.employment_status} onChange={(e) => setAdminEmployeeFilter((p) => ({ ...p, employment_status: e.target.value }))}><option value="">All statuses</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option><option value="ON_LEAVE">On leave</option><option value="TERMINATED">Terminated</option></select></label>
            <label>Joined from<input type="date" value={adminEmployeeFilter.date_from} onChange={(e) => setAdminEmployeeFilter((p) => ({ ...p, date_from: e.target.value }))} /></label>
            <label>Joined to<input type="date" value={adminEmployeeFilter.date_to} onChange={(e) => setAdminEmployeeFilter((p) => ({ ...p, date_to: e.target.value }))} /></label>
            <label>Sort by<select value={adminEmployeeFilter.sort} onChange={(e) => setAdminEmployeeFilter((p) => ({ ...p, sort: e.target.value }))}><option value="name">Name (A-Z)</option><option value="-name">Name (Z-A)</option><option value="-date_of_joining">Joining date (newest)</option><option value="date_of_joining">Joining date (oldest)</option><option value="employee_id">Employee ID</option></select></label>
            <div className="employee-filter-actions"><button type="submit" className="btn primary small">Apply filters</button><button type="button" className="btn secondary small" onClick={() => { const filters = { search: "", category: "", employment_status: "", date_from: "", date_to: "", sort: "name" }; setAdminEmployeeFilter(filters); loadAdminEmployeeData(1, filters); }}>Clear</button></div>
          </form>
          <div className="employee-category-counts">{(adminEmployeeStats?.by_category || []).map((category) => <span key={category.id}>{category.name}<b>{category.employee_count}</b></span>)}</div>

          {adminEmployeeMessage && <div className={adminEmployeeMessage.includes("Could") ? "admin-error" : "admin-success"}>{adminEmployeeMessage}</div>}
          <form className="admin-form employee-form" onSubmit={handleEmployeeFormSubmit}>
            <div className="admin-form-head">
              <strong>{adminEmployeeEditingId ? "Edit employee" : "Add employee"}</strong>
              {adminEmployeeEditingId && <button type="button" className="btn secondary small" onClick={resetEmployeeForm}>Cancel edit</button>}
            </div>
            <div className="admin-form-row">
              <label>Employee ID<input value={adminEmployeeForm.employee_id} onChange={(e) => setAdminEmployeeForm((p) => ({ ...p, employee_id: e.target.value }))} required disabled={!!adminEmployeeEditingId} /></label>
              <label>Full name<input value={adminEmployeeForm.name} onChange={(e) => setAdminEmployeeForm((p) => ({ ...p, name: e.target.value }))} required /></label>
              <label>Category<select value={adminEmployeeForm.category} onChange={(e) => setAdminEmployeeForm((p) => ({ ...p, category: e.target.value }))} required><option value="">Choose a category</option>{adminEmployeeCategories.filter((c) => c.is_active || String(c.id) === adminEmployeeForm.category).map((c) => <option key={c.id} value={c.id}>{c.name}{c.is_active ? "" : " (Inactive)"}</option>)}</select></label>
            </div>
            <div className="admin-form-row">
              <label>Designation<input value={adminEmployeeForm.designation} onChange={(e) => setAdminEmployeeForm((p) => ({ ...p, designation: e.target.value }))} /></label>
              <label>Mobile number<input type="tel" value={adminEmployeeForm.contact_number} onChange={(e) => setAdminEmployeeForm((p) => ({ ...p, contact_number: e.target.value }))} required /></label>
              <label>Email<input type="email" value={adminEmployeeForm.email} onChange={(e) => setAdminEmployeeForm((p) => ({ ...p, email: e.target.value }))} /></label>
            </div>
            <div className="admin-form-row">
              <label>Joining date<input type="date" value={adminEmployeeForm.date_of_joining} onChange={(e) => setAdminEmployeeForm((p) => ({ ...p, date_of_joining: e.target.value }))} /></label>
              <label>Employment status<select value={adminEmployeeForm.employment_status} onChange={(e) => setAdminEmployeeForm((p) => ({ ...p, employment_status: e.target.value }))}><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option><option value="ON_LEAVE">On leave</option><option value="TERMINATED">Terminated</option></select></label>
              <label>Delivery availability<select value={adminEmployeeForm.status} onChange={(e) => setAdminEmployeeForm((p) => ({ ...p, status: e.target.value }))}>{["ACTIVE","AVAILABLE","BUSY","ON_LEAVE","INACTIVE"].map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}</select></label>
            </div>
            <div className="admin-form-row">
              <label>Emergency contact<input type="tel" value={adminEmployeeForm.emergency_contact} onChange={(e) => setAdminEmployeeForm((p) => ({ ...p, emergency_contact: e.target.value }))} /></label>
              <label>Profile photo URL<input type="url" value={adminEmployeeForm.photo} onChange={(e) => setAdminEmployeeForm((p) => ({ ...p, photo: e.target.value }))} /></label>
            </div>
            <label>Address<textarea rows={2} value={adminEmployeeForm.address} onChange={(e) => setAdminEmployeeForm((p) => ({ ...p, address: e.target.value }))} /></label>
            <button type="submit" className="btn primary small">{adminEmployeeEditingId ? "Save employee" : "Create employee"}</button>
          </form>

          {adminEmployeeDetail && (
            <section className="employee-detail-card">
              <div className="employee-detail-head"><div><span className="eyebrow">EMPLOYEE PROFILE</span><h4>{adminEmployeeDetail.name}</h4></div><button type="button" className="btn secondary small" onClick={() => setAdminEmployeeDetail(null)}>Close</button></div>
              <dl>
                <div><dt>Employee ID</dt><dd>{adminEmployeeDetail.employee_id}</dd></div>
                <div><dt>Category</dt><dd>{adminEmployeeDetail.category_name}</dd></div>
                <div><dt>Designation</dt><dd>{adminEmployeeDetail.designation || "—"}</dd></div>
                <div><dt>Employment status</dt><dd>{adminEmployeeDetail.employment_status.replace("_", " ")}</dd></div>
                <div><dt>Delivery availability</dt><dd>{adminEmployeeDetail.status.replace("_", " ")}</dd></div>
                <div><dt>Date joined</dt><dd>{adminEmployeeDetail.date_of_joining || "—"}</dd></div>
                <div><dt>Mobile</dt><dd>{adminEmployeeDetail.contact_number}</dd></div>
                <div><dt>Email</dt><dd>{adminEmployeeDetail.email || "—"}</dd></div>
                <div><dt>Emergency contact</dt><dd>{adminEmployeeDetail.emergency_contact || "—"}</dd></div>
                <div><dt>Address</dt><dd>{adminEmployeeDetail.address || "—"}</dd></div>
              </dl>
            </section>
          )}
          <div className="table-wrap"><table className="report-table"><thead><tr><th>ID</th><th>Name</th><th>Category</th><th>Designation</th><th>Contact</th><th>Employment</th><th>Delivery</th><th>Actions</th></tr></thead><tbody>
            {adminEmployees.length === 0 ? (
              <tr><td colSpan={8}><div className="admin-empty">No employees match these filters.</div></td></tr>
            ) : adminEmployees.map((e) => (
              <tr key={e.id}>
                <td>{e.employee_id}</td><td>{e.name}</td><td>{e.category_name}</td><td>{e.designation || "—"}</td><td>{e.contact_number}</td><td>{e.employment_status.replace("_", " ")}</td><td>{e.status.replace("_", " ")}</td>
                <td className="employee-row-actions">
                  <button type="button" className="btn secondary small" onClick={() => viewEmployeeDetails(e.id)}>View</button>
                  <button type="button" className="btn secondary small" onClick={() => startEditEmployee(e)}>Edit</button>
                  <button type="button" className="btn secondary small" disabled={e.employment_status === "TERMINATED"} onClick={() => updateAdminEmployee(e.id, { employment_status: e.employment_status === "ACTIVE" ? "INACTIVE" : "ACTIVE", ...(e.employment_status === "ACTIVE" ? {} : { status: "ACTIVE" }) }).then(() => loadAdminEmployeeData(adminEmployeesMeta.page)).catch((error) => setAdminOpsMessage(error.message || "Could not update employee status."))}>{e.employment_status === "ACTIVE" ? "Deactivate" : "Activate"}</button>
                </td>
              </tr>
            ))}
          </tbody></table></div>
          <div className="employee-pagination"><span>{adminEmployeesMeta.count} employees · page {adminEmployeesMeta.page} of {Math.max(1, adminEmployeesMeta.total_pages)}</span><div><button type="button" className="btn secondary small" disabled={adminEmployeesMeta.page <= 1} onClick={() => loadAdminEmployeeData(adminEmployeesMeta.page - 1)}>Previous</button><button type="button" className="btn secondary small" disabled={adminEmployeesMeta.page >= adminEmployeesMeta.total_pages} onClick={() => loadAdminEmployeeData(adminEmployeesMeta.page + 1)}>Next</button></div></div>

          <h4>Active deliveries</h4>
          <div className="table-wrap"><table className="report-table"><thead><tr><th>Order</th><th>Status</th><th>Employee</th><th>Duration</th><th>Delayed</th><th>Location</th></tr></thead><tbody>
            {adminActiveDeliveries.length === 0 ? <tr><td colSpan={6}><div className="admin-empty">No active deliveries.</div></td></tr> : adminActiveDeliveries.map((d) => (
              <tr key={d.id}><td>{d.order_number}</td><td>{d.status}</td><td>{d.delivery_employee?.name || "—"}</td><td>{d.duration_minutes ?? "—"}{d.duration_minutes == null ? "" : "m"}</td><td>{d.delayed ? "Yes" : "No"}</td><td>{d.last_known_location ? `${d.last_known_location.latitude}, ${d.last_known_location.longitude}` : "—"}</td></tr>
            ))}
          </tbody></table></div>
        </>
      ) : (
        <div className="employee-category-admin">
          {adminEmployeeCategoryMessage && <div className={adminEmployeeCategoryMessage.includes("Could") ? "admin-error" : "admin-success"}>{adminEmployeeCategoryMessage}</div>}
          <form className="employee-category-form" onSubmit={handleEmployeeCategorySubmit}>
            <strong>{adminEmployeeCategoryEditingId ? "Edit category" : "Add category"}</strong>
            <label>Category name<input value={adminEmployeeCategoryForm.name} onChange={(e) => setAdminEmployeeCategoryForm((p) => ({ ...p, name: e.target.value }))} required maxLength={80} /></label>
            <label className="employee-category-active"><input type="checkbox" checked={adminEmployeeCategoryForm.is_active} onChange={(e) => setAdminEmployeeCategoryForm((p) => ({ ...p, is_active: e.target.checked }))} /> Active</label>
            <div className="employee-filter-actions"><button type="submit" className="btn primary small">{adminEmployeeCategoryEditingId ? "Save category" : "Create category"}</button>{adminEmployeeCategoryEditingId && <button type="button" className="btn secondary small" onClick={resetEmployeeCategoryForm}>Cancel</button>}</div>
          </form>
          <div className="table-wrap"><table className="report-table"><thead><tr><th>Category</th><th>Employees</th><th>Status</th><th>Updated</th><th></th></tr></thead><tbody>
            {adminEmployeeCategories.map((category) => <tr key={category.id}><td>{category.name}</td><td>{category.employee_count}</td><td>{category.is_active ? "Active" : "Inactive"}</td><td>{new Date(category.updated_at).toLocaleDateString()}</td><td><button type="button" className="btn secondary small" onClick={() => editEmployeeCategory(category)}>Edit</button><button type="button" className="btn secondary small" onClick={() => updateAdminEmployeeCategory(category.id, { is_active: !category.is_active }).then(() => loadAdminEmployeeData(1)).catch((error) => setAdminEmployeeCategoryMessage(error.message || "Could not update category."))}>{category.is_active ? "Deactivate" : "Activate"}</button></td></tr>)}
          </tbody></table></div>
        </div>
      )}
    </div>
  );
}

export default AdminEmployeesPanel;
