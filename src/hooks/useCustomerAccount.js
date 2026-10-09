import { useState } from "react";
import {
  fetchInAppNotifications,
  fetchNotificationPreferences,
  fetchOrder,
  fetchOrders,
  logout,
  cancelOrder,
  markAllNotificationsRead,
  markNotificationRead,
  updateNotificationPreferences,
} from "../services/authService";
import { appConfig } from "../config";

export default function useCustomerAccount({
  setUser,
  setAuthOpen,
  setAuthMode,
  setAuthMessage,
  notify,
}) {
  const [orderHistoryOpen, setOrderHistoryOpen] = useState(false);
  const [notificationPrefs, setNotificationPrefs] = useState(null);
  const [notificationPrefsMessage, setNotificationPrefsMessage] = useState("");
  const [inAppNotifications, setInAppNotifications] = useState([]);
  const [notifUnreadCount, setNotifUnreadCount] = useState(0);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingOrder, setTrackingOrder] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelMessage, setCancelMessage] = useState("");

  function handleSignOut() {
    const token = localStorage.getItem("pinkbakes_token");
    if (token) {
      logout(token).catch(() => {});
    }
    localStorage.removeItem("pinkbakes_token");
    setUser(null);
    setOrderHistoryOpen(false);
    setSelectedOrder(null);
    notify("Signed out successfully");
  }

  function loadUserOrders() {
    const token = localStorage.getItem("pinkbakes_token");
    if (!token) {
      setAuthOpen(true);
      setAuthMode("signin");
      setAuthMessage("Please sign in to view your order history.");
      return;
    }

    fetchOrders(token)
      .then(response => {
        const items = Array.isArray(response?.results) ? response.results : Array.isArray(response) ? response : [];
        setOrders(items);
        setOrderHistoryOpen(true);
      })
      .catch(() => { setOrders([]); setOrderHistoryOpen(true); });

    fetchNotificationPreferences(token)
      .then(data => setNotificationPrefs(data))
      .catch(() => {});
    fetchInAppNotifications(token, { limit: 20 })
      .then(data => {
        setInAppNotifications(Array.isArray(data?.results) ? data.results : []);
        setNotifUnreadCount(data?.unread_count || 0);
      })
      .catch(() => {});
  }

  function refreshNotifications(token) {
    return fetchInAppNotifications(token, { limit: 20 }).then(data => {
      setInAppNotifications(Array.isArray(data?.results) ? data.results : []);
      setNotifUnreadCount(data?.unread_count || 0);
    });
  }

  function handleMarkAllNotificationsRead() {
    const token = localStorage.getItem("pinkbakes_token");
    if (!token) return;
    markAllNotificationsRead(token)
      .then(() => refreshNotifications(token))
      .catch(() => {});
  }

  function handleMarkNotificationRead(notificationId) {
    const token = localStorage.getItem("pinkbakes_token");
    if (!token) return;
    markNotificationRead(token, notificationId)
      .then(() => refreshNotifications(token))
      .catch(() => {});
  }

  function handleNotificationPreferenceChange(key, checked) {
    const next = { ...notificationPrefs, [key]: checked };
    setNotificationPrefs(next);
    const token = localStorage.getItem("pinkbakes_token");
    if (!token) return;
    updateNotificationPreferences(token, { [key]: checked })
      .then(data => {
        setNotificationPrefs(data);
        setNotificationPrefsMessage("Preferences saved.");
      })
      .catch(error => setNotificationPrefsMessage(error.message || "Could not save preferences."));
  }

  function handleOpenOrder(orderId) {
    const token = localStorage.getItem("pinkbakes_token");
    if (!token) return;

    fetchOrder(orderId, token)
      .then(order => {
        setSelectedOrder(order);
        setTrackingOrder(null);
      })
      .catch(() => setSelectedOrder(null));
  }

  async function fetchTracking(orderId) {
    const token = localStorage.getItem("pinkbakes_token");
    if (!token) {
      setTrackingError("Please sign in to view live delivery tracking.");
      setAuthOpen(true);
      setAuthMode("signin");
      return;
    }

    setTrackingLoading(true);
    setTrackingError("");
    try {
      const response = await fetch(`${appConfig.apiBaseUrl}/api/orders/${orderId}/tracking/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail || "Unable to load tracking details.");
      setTrackingOrder(data);
    } catch (error) {
      setTrackingError(error.message || "Unable to load tracking details.");
    } finally {
      setTrackingLoading(false);
    }
  }

  function handleCancelOrder() {
    const token = localStorage.getItem("pinkbakes_token");
    if (!token || !selectedOrder?.id) {
      setAuthMessage("Please sign in to cancel an order.");
      return;
    }
    setCancelLoading(true);
    setCancelMessage("");
    cancelOrder(selectedOrder.id, token, cancelReason)
      .then(order => {
        setSelectedOrder(order);
        setOrders(previous => previous.map(item => item.id === order.id ? { ...item, ...order } : item));
        setCancelConfirmOpen(false);
        setCancelReason("");
        const refundStatus = order.refund?.status || order.refunds_summary?.latest_status;
        if (order.status === "CANCELLED" && refundStatus && refundStatus !== "completed") {
          setCancelMessage("Order cancelled. Refund is processing - we will email you when it completes.");
          notify("Order cancelled. Refund processing.");
        } else if (order.status === "CANCELLED" && refundStatus === "completed") {
          setCancelMessage("Order cancelled and refund completed.");
          notify("Order cancelled. Refund completed.");
        } else {
          setCancelMessage("Order cancelled.");
          notify("Order cancelled.");
        }
      })
      .catch(error => setCancelMessage(error?.detail || error?.message || "Unable to cancel this order."))
      .finally(() => setCancelLoading(false));
  }

  return {
    orderHistoryOpen,
    setOrderHistoryOpen,
    notificationPrefs,
    notificationPrefsMessage,
    inAppNotifications,
    notifUnreadCount,
    orders,
    setOrders,
    selectedOrder,
    setSelectedOrder,
    trackingOrder,
    trackingLoading,
    trackingError,
    cancelReason,
    setCancelReason,
    cancelConfirmOpen,
    setCancelConfirmOpen,
    cancelLoading,
    cancelMessage,
    setCancelMessage,
    handleSignOut,
    loadUserOrders,
    handleMarkAllNotificationsRead,
    handleMarkNotificationRead,
    handleNotificationPreferenceChange,
    handleOpenOrder,
    fetchTracking,
    handleCancelOrder,
  };
}
