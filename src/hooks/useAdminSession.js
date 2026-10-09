import { useState } from "react";
import {
  adminLogin,
  adminLogout,
  fetchAdminDashboard,
  fetchAdminReportSummary,
} from "../services/authService";

export default function useAdminSession({
  setAdminOpen,
  setAdminSection,
  setAdminDashboard,
  loadAdminSectionData,
  notify,
  setAdminMessage,
}) {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminReportsView, setAdminReportsView] = useState(false);
  const [adminCredentials, setAdminCredentials] = useState({ username: "", password: "" });
  const [reportSummary, setReportSummary] = useState({
    user_stats: {},
    product_stats: {},
    review_stats: {},
    sales_stats: {},
  });
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState("");
  const [reportPerformance, setReportPerformance] = useState([]);
  const [reportActivity, setReportActivity] = useState([]);

  function handleAdminLogin(event) {
    event.preventDefault();
    adminLogin({
      username: adminCredentials.username,
      password: adminCredentials.password,
    })
      .then(data => {
        localStorage.setItem("pinkbakes_admin_token", data.token);
        setIsAdminLoggedIn(true);
        setAdminOpen(true);
        setAdminSection("dashboard");
        setAdminCredentials({ username: "", password: "" });
        setAdminMessage("");
        notify("Admin login successful");
        try { window.history.pushState({}, "", "/admin"); } catch (_) { /* ignore */ }
        fetchAdminDashboard({ preset: "today" }).then(setAdminDashboard).catch(() => {});
        loadAdminSectionData("dashboard");
      })
      .catch(error => setAdminMessage(error.message || "Invalid admin username or password."));
  }

  function handleAdminLogout() {
    const token = localStorage.getItem("pinkbakes_admin_token");
    if (token) adminLogout(token).catch(() => {});
    localStorage.removeItem("pinkbakes_admin_token");
    setIsAdminLoggedIn(false);
    setAdminReportsView(false);
    setAdminOpen(false);
    setAdminMessage("");
    setAdminCredentials({ username: "", password: "" });
    window.history.pushState({}, "", "/");
  }

  function openAdminReports() {
    setAdminReportsView(true);
    setAdminOpen(true);
    window.history.pushState({}, "", "/admin/reports");
    setReportsLoading(true);
    setReportsError("");
    fetchAdminReportSummary()
      .then(data => setReportSummary(data || {}))
      .catch(error => setReportsError(error.message || "Unable to load reports."))
      .finally(() => setReportsLoading(false));
  }

  function closeAdminReports() {
    setAdminReportsView(false);
    setAdminOpen(false);
    window.history.pushState({}, "", "/");
  }

  function openAdminLogin() {
    setAdminOpen(true);
    setAdminMessage("");
    try { window.history.pushState({}, "", "/admin-login"); } catch (_) { /* ignore */ }
  }

  return {
    isAdminLoggedIn,
    setIsAdminLoggedIn,
    adminReportsView,
    setAdminReportsView,
    adminCredentials,
    setAdminCredentials,
    reportSummary,
    reportsLoading,
    reportsError,
    reportPerformance,
    setReportPerformance,
    reportActivity,
    setReportActivity,
    handleAdminLogin,
    handleAdminLogout,
    openAdminReports,
    closeAdminReports,
    openAdminLogin,
  };
}
