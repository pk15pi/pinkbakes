import { useState } from "react";
import {
  fetchInAppNotifications,
  fetchNotificationPreferences,
  fetchOrder,
  fetchOrders,
  logout,
  markAllNotificationsRead,
  markNotificationRead,
  updateNotificationPreferences,
} from "../services/authService";

export default function useCustomerAccount({
  setUser,
  setAuthOpen,
  setAuthMode,
  setAuthMessage,
  setTrackingOrder,
  notify,
}) {
  const [orderHistoryOpen, setOrderHistoryOpen] = useState(false);
  const [notificationPrefs, setNotificationPrefs] = useState(null);
  const [notificationPrefsMessage, setNotificationPrefsMessage] = useState("");
  const [inAppNotifications, setInAppNotifications] = useState([]);
  const [notifUnreadCount, setNotifUnreadCount] = useState(0);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

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
    handleSignOut,
    loadUserOrders,
    handleMarkAllNotificationsRead,
    handleMarkNotificationRead,
    handleNotificationPreferenceChange,
    handleOpenOrder,
  };
}
