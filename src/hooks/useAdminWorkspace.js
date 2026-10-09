import { useState } from "react";
import {
  asListResponse,
  fetchAdminActiveDeliveries,
  fetchAdminCustomers,
  fetchAdminCustomerDetail,
  fetchAdminDashboard,
  fetchAdminInventory,
  fetchAdminNotifications,
  fetchAdminOrders,
  fetchAdminPayments,
  fetchAdminRefunds,
  fetchAdminReviews,
  fetchAdminSettingsStatus,
} from "../services/authService";

export default function useAdminWorkspace({ loadEmployeeRecords, adminEmployeeFilter, setAdminLoadingSection, setAdminOpsMessage }) {
  const [adminNotifications, setAdminNotifications] = useState([]);
  const [adminSection, setAdminSection] = useState("dashboard");
  const [adminDashboard, setAdminDashboard] = useState(null);
  const [adminDashPreset, setAdminDashPreset] = useState("today");
  const [adminOrders, setAdminOrders] = useState([]);
  const [adminOrdersMeta, setAdminOrdersMeta] = useState({ count: 0, page: 1 });
  const [adminOrderFilter, setAdminOrderFilter] = useState({ status: "", payment_status: "", search: "" });
  const [adminOrderDetail, setAdminOrderDetail] = useState(null);
  const [adminPayments, setAdminPayments] = useState([]);
  const [adminRefunds, setAdminRefunds] = useState([]);
  const [adminRefundFilter, setAdminRefundFilter] = useState("");
  const [adminCustomers, setAdminCustomers] = useState([]);
  const [adminCustomerSearch, setAdminCustomerSearch] = useState("");
  const [adminActiveDeliveries, setAdminActiveDeliveries] = useState([]);
  const [adminReviews, setAdminReviews] = useState([]);
  const [adminReviewFilter, setAdminReviewFilter] = useState("pending");
  const [adminSettings, setAdminSettings] = useState(null);
  const [adminInventory, setAdminInventory] = useState([]);
  const [adminCustomerDetail, setAdminCustomerDetail] = useState(null);
  const [adminCustomerDetailLoading, setAdminCustomerDetailLoading] = useState(false);

  function loadAdminSectionData(section, preset) {
    const token = localStorage.getItem("pinkbakes_admin_token");
    if (!token) return;
    setAdminLoadingSection(true);
    const selectedPreset = preset || adminDashPreset;
    const tasks = [];
    if (section === "dashboard") {
      tasks.push(fetchAdminDashboard({ preset: selectedPreset }).then(setAdminDashboard).catch(error => setAdminOpsMessage(error.message || "Dashboard failed")));
    } else if (section === "orders") {
      tasks.push(fetchAdminOrders({ ...adminOrderFilter, page: 1, page_size: 20 }).then(data => {
        setAdminOrders(data.results || []);
        setAdminOrdersMeta({ count: data.count || 0, page: data.page || 1 });
      }).catch(error => setAdminOpsMessage(error.message || "Orders failed")));
    } else if (section === "payments") {
      tasks.push(fetchAdminPayments({ page: 1, page_size: 25 })
        .then(data => setAdminPayments(asListResponse(data)))
        .catch(error => {
          setAdminPayments([]);
          setAdminOpsMessage(error.message || "Payments failed");
        }));
    } else if (section === "refunds") {
      const refundParams = { page: 1, page_size: 25 };
      if (adminRefundFilter) refundParams.status = adminRefundFilter;
      tasks.push(fetchAdminRefunds(refundParams)
        .then(data => setAdminRefunds(asListResponse(data)))
        .catch(error => {
          setAdminRefunds([]);
          setAdminOpsMessage(error.message || "Refunds failed");
        }));
    } else if (section === "inventory") {
      tasks.push(fetchAdminInventory()
        .then(data => setAdminInventory(Array.isArray(data) ? data : (data.results || [])))
        .catch(error => setAdminOpsMessage(error.message || "Inventory failed")));
    } else if (section === "customers") {
      tasks.push(fetchAdminCustomers({ search: adminCustomerSearch, page: 1, page_size: 25 })
        .then(data => setAdminCustomers(data.results || []))
        .catch(error => setAdminOpsMessage(error.message || "Customers failed")));
    } else if (section === "employees") {
      tasks.push(Promise.all([
        loadEmployeeRecords(1, adminEmployeeFilter),
        fetchAdminActiveDeliveries().then(data => setAdminActiveDeliveries(data.results || [])),
      ]).catch(error => setAdminOpsMessage(error.message || "Delivery failed")));
    } else if (section === "reviews") {
      tasks.push(fetchAdminReviews({ status: adminReviewFilter, page: 1, page_size: 25 })
        .then(data => setAdminReviews(Array.isArray(data) ? data : (data.results || [])))
        .catch(error => setAdminOpsMessage(error.message || "Reviews failed")));
    } else if (section === "notifications") {
      tasks.push(fetchAdminNotifications(token)
        .then(data => setAdminNotifications(Array.isArray(data?.results) ? data.results : []))
        .catch(() => setAdminNotifications([])));
    } else if (section === "settings") {
      tasks.push(fetchAdminSettingsStatus()
        .then(setAdminSettings)
        .catch(error => setAdminOpsMessage(error.message || "Settings failed")));
    }
    Promise.all(tasks).finally(() => setAdminLoadingSection(false));
  }

  function openCustomerDetail(userId) {
    setAdminCustomerDetailLoading(true);
    setAdminCustomerDetail(null);
    fetchAdminCustomerDetail(userId)
      .then(setAdminCustomerDetail)
      .catch(error => setAdminOpsMessage(error.message || "Could not load customer"))
      .finally(() => setAdminCustomerDetailLoading(false));
  }

  return {
    adminNotifications,
    adminSection,
    setAdminSection,
    adminDashboard,
    setAdminDashboard,
    adminDashPreset,
    setAdminDashPreset,
    adminOrders,
    setAdminOrders,
    adminOrdersMeta,
    setAdminOrdersMeta,
    adminOrderFilter,
    setAdminOrderFilter,
    adminOrderDetail,
    setAdminOrderDetail,
    adminPayments,
    setAdminPayments,
    adminRefunds,
    setAdminRefunds,
    adminRefundFilter,
    setAdminRefundFilter,
    adminCustomers,
    setAdminCustomers,
    adminCustomerSearch,
    setAdminCustomerSearch,
    adminActiveDeliveries,
    setAdminActiveDeliveries,
    adminReviews,
    setAdminReviews,
    adminReviewFilter,
    setAdminReviewFilter,
    adminSettings,
    setAdminSettings,
    adminInventory,
    setAdminInventory,
    adminCustomerDetail,
    setAdminCustomerDetail,
    adminCustomerDetailLoading,
    setAdminCustomerDetailLoading,
    loadAdminSectionData,
    openCustomerDetail,
  };
}
