import { useState } from "react";
import {
  createAdminEmployee,
  createAdminEmployeeCategory,
  fetchAdminEmployee,
  fetchAdminEmployeeCategories,
  fetchAdminEmployees,
  fetchAdminEmployeeStats,
  updateAdminEmployee,
  updateAdminEmployeeCategory,
} from "../services/authService";

const EMPTY_EMPLOYEE_FORM = {
  employee_id: "",
  name: "",
  category: "",
  designation: "",
  contact_number: "",
  email: "",
  photo: "",
  status: "ACTIVE",
  employment_status: "ACTIVE",
  date_of_joining: "",
  address: "",
  emergency_contact: "",
};

export default function useAdminEmployees({ setAdminLoadingSection, setAdminOpsMessage }) {
  const [adminEmployees, setAdminEmployees] = useState([]);
  const [adminEmployeesMeta, setAdminEmployeesMeta] = useState({ count: 0, page: 1, page_size: 20, total_pages: 0 });
  const [adminEmployeeStats, setAdminEmployeeStats] = useState(null);
  const [adminEmployeeCategories, setAdminEmployeeCategories] = useState([]);
  const [adminEmployeeView, setAdminEmployeeView] = useState("employees");
  const [adminEmployeeFilter, setAdminEmployeeFilter] = useState({
    search: "",
    category: "",
    employment_status: "",
    date_from: "",
    date_to: "",
    sort: "name",
  });
  const [adminEmployeeDetail, setAdminEmployeeDetail] = useState(null);
  const [adminEmployeeCategoryForm, setAdminEmployeeCategoryForm] = useState({ name: "", is_active: true });
  const [adminEmployeeCategoryEditingId, setAdminEmployeeCategoryEditingId] = useState(null);
  const [adminEmployeeCategoryMessage, setAdminEmployeeCategoryMessage] = useState("");
  const [adminEmployeeForm, setAdminEmployeeForm] = useState(EMPTY_EMPLOYEE_FORM);
  const [adminEmployeeEditingId, setAdminEmployeeEditingId] = useState(null);
  const [adminEmployeeMessage, setAdminEmployeeMessage] = useState("");

  function loadEmployeeRecords(page = 1, filters = adminEmployeeFilter) {
    return Promise.all([
      fetchAdminEmployees({ ...filters, page, page_size: 20 }).then(data => {
        setAdminEmployees(Array.isArray(data) ? data : (data.results || []));
        setAdminEmployeesMeta({
          count: data.count || 0,
          page: data.page || 1,
          page_size: data.page_size || 20,
          total_pages: data.total_pages || 0,
        });
      }),
      fetchAdminEmployeeStats().then(setAdminEmployeeStats),
      fetchAdminEmployeeCategories().then(setAdminEmployeeCategories),
    ]);
  }

  function loadAdminEmployeeData(page = 1, filters = adminEmployeeFilter) {
    setAdminLoadingSection(true);
    setAdminOpsMessage("");
    return loadEmployeeRecords(page, filters)
      .catch(error => setAdminOpsMessage(error.message || "Could not load employee management data."))
      .finally(() => setAdminLoadingSection(false));
  }

  function resetEmployeeForm() {
    setAdminEmployeeForm(EMPTY_EMPLOYEE_FORM);
    setAdminEmployeeEditingId(null);
    setAdminEmployeeMessage("");
  }

  function resetEmployeeCategoryForm() {
    setAdminEmployeeCategoryForm({ name: "", is_active: true });
    setAdminEmployeeCategoryEditingId(null);
    setAdminEmployeeCategoryMessage("");
  }

  function handleEmployeeCategorySubmit(event) {
    event.preventDefault();
    setAdminEmployeeCategoryMessage("");
    const payload = {
      name: adminEmployeeCategoryForm.name.trim(),
      is_active: Boolean(adminEmployeeCategoryForm.is_active),
    };
    const request = adminEmployeeCategoryEditingId
      ? updateAdminEmployeeCategory(adminEmployeeCategoryEditingId, payload)
      : createAdminEmployeeCategory(payload);
    request
      .then(() => {
        const message = adminEmployeeCategoryEditingId ? "Category updated." : "Category created.";
        resetEmployeeCategoryForm();
        setAdminEmployeeCategoryMessage(message);
        loadAdminEmployeeData(1);
      })
      .catch(error => setAdminEmployeeCategoryMessage(`Could not save category: ${error.message || "request failed"}`));
  }

  function editEmployeeCategory(category) {
    setAdminEmployeeCategoryEditingId(category.id);
    setAdminEmployeeCategoryForm({ name: category.name, is_active: category.is_active });
    setAdminEmployeeCategoryMessage("");
  }

  function viewEmployeeDetails(employeeId) {
    setAdminEmployeeDetail(null);
    fetchAdminEmployee(employeeId)
      .then(setAdminEmployeeDetail)
      .catch(error => setAdminOpsMessage(error.message || "Could not load employee details."));
  }

  function handleEmployeeFormSubmit(event) {
    event.preventDefault();
    setAdminEmployeeMessage("");
    const payload = {
      employee_id: adminEmployeeForm.employee_id.trim(),
      name: adminEmployeeForm.name.trim(),
      category: Number(adminEmployeeForm.category),
      designation: adminEmployeeForm.designation.trim(),
      contact_number: adminEmployeeForm.contact_number.trim(),
      email: (adminEmployeeForm.email || "").trim(),
      photo: (adminEmployeeForm.photo || "").trim(),
      status: adminEmployeeForm.status || "ACTIVE",
      employment_status: adminEmployeeForm.employment_status || "ACTIVE",
      date_of_joining: adminEmployeeForm.date_of_joining || null,
      address: adminEmployeeForm.address.trim(),
      emergency_contact: adminEmployeeForm.emergency_contact.trim(),
    };
    const request = adminEmployeeEditingId
      ? updateAdminEmployee(adminEmployeeEditingId, payload)
      : createAdminEmployee(payload);
    request
      .then(() => {
        const message = adminEmployeeEditingId ? "Employee updated." : "Employee created.";
        resetEmployeeForm();
        setAdminEmployeeMessage(message);
        loadAdminEmployeeData(1);
      })
      .catch(error => setAdminEmployeeMessage(`Could not save employee: ${error.message || "request failed"}`));
  }

  function startEditEmployee(employee) {
    setAdminEmployeeEditingId(employee.id);
    setAdminEmployeeForm({
      employee_id: employee.employee_id || "",
      name: employee.name || "",
      category: String(employee.category || ""),
      designation: employee.designation || "",
      contact_number: employee.contact_number || "",
      email: employee.email || "",
      photo: employee.photo || "",
      status: employee.status || "ACTIVE",
      employment_status: employee.employment_status || "ACTIVE",
      date_of_joining: employee.date_of_joining || "",
      address: employee.address || "",
      emergency_contact: employee.emergency_contact || "",
    });
    setAdminEmployeeMessage("");
  }

  return {
    adminEmployees,
    setAdminEmployees,
    adminEmployeesMeta,
    adminEmployeeStats,
    adminEmployeeCategories,
    adminEmployeeView,
    setAdminEmployeeView,
    adminEmployeeFilter,
    setAdminEmployeeFilter,
    adminEmployeeDetail,
    setAdminEmployeeDetail,
    adminEmployeeCategoryForm,
    setAdminEmployeeCategoryForm,
    adminEmployeeCategoryEditingId,
    adminEmployeeCategoryMessage,
    setAdminEmployeeCategoryMessage,
    adminEmployeeForm,
    setAdminEmployeeForm,
    adminEmployeeEditingId,
    adminEmployeeMessage,
    loadEmployeeRecords,
    loadAdminEmployeeData,
    resetEmployeeForm,
    resetEmployeeCategoryForm,
    handleEmployeeCategorySubmit,
    editEmployeeCategory,
    viewEmployeeDetails,
    handleEmployeeFormSubmit,
    startEditEmployee,
  };
}
