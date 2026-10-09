import { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  UserRound, X,
  Check
} from "lucide-react";
import { POLICIES, policyFromPath } from "./policies";
import { adminLogout,
  adminLogin,
  cancelOrder,
  createProduct,
  deleteProduct,
  fetchAdminReportSummary,
  fetchCurrentUser,
  asListResponse,
  fetchProducts,
  retryPayment,
  verifyPayment,
  updateProduct,
  adjustAdminInventory,
  updateAdminDeliverySettings,
  fetchAdminNotifications,
  fetchAdminDashboard,
  fetchAdminOrders,
  fetchAdminOrderDetail,
  updateAdminOrderStatus,
  cancelAdminOrder,
  refundAdminOrder,
  fetchAdminPayments,
  fetchAdminRefunds,
  fetchAdminCustomers,
  fetchAdminCustomerDetail,
  updateAdminCustomerStatus,
  fetchAdminEmployees,
  assignAdminDelivery,
  unassignAdminDelivery,
  fetchAdminActiveDeliveries,
  fetchAdminReviews,
  approveAdminReview,
  rejectAdminReview,
  fetchAdminSettingsStatus,
  updateAdminSettingsStatus,
  fetchAdminInventory,
  downloadAdminExport,
} from "./services/authService";
import { appConfig, getMapsUrl } from "./config";
import {
  BAKERY_LOCATION,
  BRAND_NAME,
  CAKE_CATEGORY_OPTIONS,
  CATEGORY_IMAGE_FALLBACKS,
  CONTACT_EMAIL,
  STICKY_HEADER_OFFSET,
  WHATSAPP_NUMBER,
  cartQtyCap,
  cartUnitPrice,
  formatCurrency,
  getNextOrderStatuses,
} from "./appConstants";
import { isOutOfStock, normalizeProduct } from "./productUtils";
import useCatalog from "./hooks/useCatalog";
import useProductRoute from "./hooks/useProductRoute";
import usePageMetadata from "./hooks/usePageMetadata";
import useCart from "./hooks/useCart";
import useBakeryLocation from "./hooks/useBakeryLocation";
import useAuthFlow from "./hooks/useAuthFlow";
import useAdminEmployees from "./hooks/useAdminEmployees";
import useCustomerAccount from "./hooks/useCustomerAccount";
import useCheckoutFlow from "./hooks/useCheckoutFlow";
import useAdminCommerceConfig from "./hooks/useAdminCommerceConfig";
import useChatAssistant from "./hooks/useChatAssistant";
import ProductModal from "./components/ProductModal";
import PolicyPage from "./components/PolicyPage";
import AdminDashboardPanel from "./components/AdminDashboardPanel";
import AdminDialogs from "./components/AdminDialogs";
import AdminCustomerDrawer from "./components/AdminCustomerDrawer";
import ProductCatalog from "./components/ProductCatalog";
import AuthDialog from "./components/AuthDialog";
import CheckoutForm from "./components/CheckoutForm";
import UserOrdersDialog from "./components/UserOrdersDialog";
import ChatbotDock from "./components/ChatbotDock";
import { BenefitStrip, CelebrationGallery, CustomerReviews } from "./components/HomeSections";
import SiteFooter from "./components/SiteFooter";
import CustomCakeSection from "./components/CustomCakeSection";
import ContactStrip from "./components/ContactStrip";
import SiteHeader from "./components/SiteHeader";
import HeroSection from "./components/HeroSection";
import CategorySection from "./components/CategorySection";
import CartDrawer from "./components/CartDrawer";
import ProductNotFoundDialog from "./components/ProductNotFoundDialog";
import BakeryLocationDialog from "./components/BakeryLocationDialog";
import OrderSuccessDialog from "./components/OrderSuccessDialog";
import "./styles.css";

/** Lazy-load 3D viewer so its chunk is fetched only when opened. */
const Product3DViewer = lazy(() => import("./components/Product3DViewer.jsx"));


function App() {
  const checkoutFlowRef = useRef(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [category, setCategory] = useState("All Cakes");
  const [search, setSearch] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [bakeryLocationOpen, setBakeryLocationOpen] = useState(false);
  const [policySlug, setPolicySlug] = useState(() => policyFromPath(window.location.pathname)?.slug || null);
  const [newsletter, setNewsletter] = useState("");
  const [newsletterDone, setNewsletterDone] = useState(false);
  const {
    catalog,
    setCatalog,
    catalogLoading,
    categoriesLoading,
    catalogError,
    shopCategories,
    loadCatalog,
  } = useCatalog();
  const { product, productNotFound, openProduct, closeProduct } = useProductRoute(catalog, catalogLoading);
  const [adminOpen, setAdminOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminReportsView, setAdminReportsView] = useState(false);
  const [adminCredentials, setAdminCredentials] = useState({ username: "", password: "" });
  const [adminMessage, setAdminMessage] = useState("");
  const [reportSummary, setReportSummary] = useState({
    user_stats: {},
    product_stats: {},
    review_stats: {},
    sales_stats: {}
  });
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState("");
  const [reportPerformance, setReportPerformance] = useState([]);
  const [reportActivity, setReportActivity] = useState([]);
  const [adminDeliverySettings, setAdminDeliverySettings] = useState(null);
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
  const [adminOpsMessage, setAdminOpsMessage] = useState("");
  const [adminInventory, setAdminInventory] = useState([]);
  const [adminLoadingSection, setAdminLoadingSection] = useState(false);
  const [adminCustomerDetail, setAdminCustomerDetail] = useState(null);
  const [adminCustomerDetailLoading, setAdminCustomerDetailLoading] = useState(false);
  const [assignPickerOpen, setAssignPickerOpen] = useState(false);
  const [assignPickerLoading, setAssignPickerLoading] = useState(false);
  const [assignPickerError, setAssignPickerError] = useState("");
  const [assignPickerEmployees, setAssignPickerEmployees] = useState([]);
  const [assignPickerSelectedId, setAssignPickerSelectedId] = useState("");
  const [assignPickerSubmitting, setAssignPickerSubmitting] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelModalReason, setCancelModalReason] = useState("");
  const [cancelModalError, setCancelModalError] = useState("");
  const [cancelModalSubmitting, setCancelModalSubmitting] = useState(false);
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [refundModalAmount, setRefundModalAmount] = useState("");
  const [refundModalReason, setRefundModalReason] = useState("Admin refund");
  const [refundModalError, setRefundModalError] = useState("");
  const [refundModalSubmitting, setRefundModalSubmitting] = useState(false);
  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [restockModalItem, setRestockModalItem] = useState(null);
  const [restockModalAction, setRestockModalAction] = useState("restock");
  const [restockModalQty, setRestockModalQty] = useState("10");
  const [restockModalReason, setRestockModalReason] = useState("Restock");
  const [restockModalError, setRestockModalError] = useState("");
  const [restockModalSubmitting, setRestockModalSubmitting] = useState(false);
  const [restockModalSource, setRestockModalSource] = useState("inventory");
  const scrollRoomRef = useRef(null);
  const [trackingOrder, setTrackingOrder] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelMessage, setCancelMessage] = useState("");
  const [paymentRetryLoading, setPaymentRetryLoading] = useState(false);
  const [wishlist, setWishlist] = useState(() => {
    try {
      const raw = localStorage.getItem("pinkbakes_wishlist");
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr.map(String) : [];
    } catch {
      return [];
    }
  });
  const [product3d, setProduct3d] = useState(null);
  const {
    authOpen, setAuthOpen,
    authMode, setAuthMode,
    authStage, setAuthStage,
    authLoading,
    pendingCheckout, setPendingCheckout,
    authMessage, setAuthMessage,
    authFlow, setAuthFlow,
    forgotEmail, setForgotEmail,
    resetToken, setResetToken,
    resetPasswordForm, setResetPasswordForm,
    verificationMethod, setVerificationMethod,
    verificationCode, setVerificationCode,
    verificationData, setVerificationData,
    user, setUser,
    authForm, setAuthForm,
    handleAuthSubmit,
    handleOtpLoginRequest,
    handleOtpLoginSubmit,
    handleForgotPassword,
    handleVerifyResetToken,
    handleResetPasswordSubmit,
    handleVerificationAction,
  } = useAuthFlow({ notify, openCheckout });
  const {
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
  } = useAdminEmployees({ setAdminLoadingSection, setAdminOpsMessage });
  const {
    adminCouponsView,
    setAdminCouponsView,
    adminCoupons,
    adminCouponForm,
    setAdminCouponForm,
    adminCouponMessage,
    setAdminCouponMessage,
    adminDeliveryView,
    setAdminDeliveryView,
    adminZones,
    adminZoneForm,
    setAdminZoneForm,
    adminDeliveryMessage,
    setAdminDeliveryMessage,
    loadAdminCoupons,
    handleCreateAdminCoupon,
    handleToggleAdminCoupon,
    createAdminCoupon,
    updateAdminCoupon,
    loadAdminDeliveryZones,
    handleCreateAdminZone,
    toggleAdminZone,
  } = useAdminCommerceConfig({ setAdminDeliverySettings });
  const {
    chatOpen,
    setChatOpen,
    chatInput,
    setChatInput,
    chatMessagesRef,
    chatMessages,
    sendChatMessage,
    handleChatSubmit,
    openHelpDesk,
    openHelpDeskTopic,
  } = useChatAssistant(catalog);
  const {
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
  } = useCustomerAccount({
    setUser,
    setAuthOpen,
    setAuthMode,
    setAuthMessage,
    setTrackingOrder,
    notify,
  });

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
      if (!response.ok) {
        throw new Error(data.detail || "Unable to load tracking details.");
      }
      setTrackingOrder(data);
    } catch (error) {
      setTrackingError(error.message || "Unable to load tracking details.");
    } finally {
      setTrackingLoading(false);
    }
  }

  useEffect(() => {
    if (user) {
      setCheckoutForm(prev => ({
        ...prev,
        customer_name: prev.customer_name || `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.username || "",
        customer_email: prev.customer_email || user.email || "",
        customer_mobile: prev.customer_mobile || user.mobile_number || "",
      }));
    }
  }, [user]);
  const [cakeForm, setCakeForm] = useState({
    name: "",
    price: "",
    discount: "",
    category: "Birthday Cakes",
    description: "",
    image: "",
    availability: "in_stock",
    status: "published",
    available_quantity: 50,
    low_stock_threshold: 5
  });
  const [editingCakeId, setEditingCakeId] = useState(null);
  const [customBrief, setCustomBrief] = useState({
    occasion: "",
    servings: "",
    flavor: "",
    theme: "",
    preferredDate: "",
    name: "",
    phone: ""
  });

  function resetCakeForm() {
    setCakeForm({
      name: "",
      price: "",
      discount: "",
      category: "Birthday Cakes",
      description: "",
      image: "",
      availability: "in_stock",
      status: "published",
      available_quantity: 50,
      low_stock_threshold: 5
    });
    setEditingCakeId(null);
    setAdminMessage("");
  }

  useEffect(() => {
    const token = localStorage.getItem("pinkbakes_token");
    if (!token) return;

    fetchCurrentUser(token)
      .then(data => setUser(data))
      .catch(() => {
        localStorage.removeItem("pinkbakes_token");
      });
  }, []);

  useEffect(() => {
    const adminToken = localStorage.getItem("pinkbakes_admin_token");
    const path = window.location.pathname || "";
    const wantsAdmin = path.startsWith("/admin");
    if (adminToken) {
      setIsAdminLoggedIn(true);
      setAdminOpen(true);
      setAdminSection("dashboard");
      fetchAdminDashboard({ preset: "today" }).then(setAdminDashboard).catch(() => {});
    } else if (wantsAdmin) {
      setAdminOpen(true);
    }
  }, []);

  useEffect(() => {
    const pathToken = window.location.pathname.match(/\/reset-password\/([^/?#]+)/)?.[1];
    const queryToken = new URLSearchParams(window.location.search).get("token");
    const tokenValue = pathToken || queryToken;

    if (!tokenValue) return;

    const decodedToken = decodeURIComponent(tokenValue);
    setResetToken(decodedToken);
    setAuthOpen(true);
    setAuthFlow("reset");
    setAuthMode("signin");
    setAuthMessage("Create a new password to finish resetting your account.");

    handleVerifyResetToken(decodedToken).then((isValid) => {
      if (!isValid) {
        setAuthMessage("This password reset link is invalid or has expired.");
      }
    });
  }, []);

  useEffect(() => {
    const syncPolicy = () => {
      setPolicySlug(policyFromPath(window.location.pathname)?.slug || null);
    };
    window.addEventListener("popstate", syncPolicy);
    return () => window.removeEventListener("popstate", syncPolicy);
  }, []);

  const filtered = useMemo(() => {
    const needle = (search || "").toLowerCase();
    const selected = (category || "").trim().toLowerCase();
    return catalog.filter((p) => {
      const pc = String(p.category || "").trim().toLowerCase();
      const catOk = category === "All Cakes" || pc === selected;
      return catOk && String(p.name || "").toLowerCase().includes(needle);
    });
  }, [category, search, catalog]);

  const { cart, setCart, cartCount, cartTotal, addToCart, changeQty } = useCart(notify);
  const {
    checkoutOpen,
    setCheckoutOpen,
    checkoutLoading,
    checkoutMessage,
    setCheckoutMessage,
    couponCodeInput,
    setCouponCodeInput,
    appliedCoupon,
    setAppliedCoupon,
    couponMessage,
    setCouponMessage,
    couponLoading,
    savedAddresses,
    selectedAddressId,
    setSelectedAddressId,
    showNewAddressForm,
    setShowNewAddressForm,
    deliveryQuote,
    setDeliveryQuote,
    deliveryQuoteMessage,
    setDeliveryQuoteMessage,
    checkoutForm,
    setCheckoutForm,
    refreshDeliveryQuote,
    applyAddressToCheckout,
    handleApplyCoupon,
    handleRemoveCoupon,
    handleSaveNewAddress,
    openCheckout: startCheckout,
    handleCheckoutSubmit,
  } = useCheckoutFlow({
    user,
    cart,
    setPendingCheckout,
    setAuthOpen,
    setAuthMode,
    setAuthMessage,
    notify,
    openRazorpayForPayment,
  });
  checkoutFlowRef.current = startCheckout;
  usePageMetadata({
    product,
    productNotFound,
    adminOpen,
    authOpen,
    cartOpen,
    checkoutOpen,
    orderHistoryOpen,
    catalogLoading,
    policySlug,
  });
  const couponDiscountPreview = Number(appliedCoupon?.discount_amount || 0);
  const deliveryFeePreview = deliveryQuote?.eligible ? Number(deliveryQuote.delivery_fee || 0) : 0;
  const checkoutPayable = Math.max(0, cartTotal - couponDiscountPreview + (deliveryQuote?.eligible ? deliveryFeePreview : 0));

  function notify(message) {
    setToast(message);
    setTimeout(() => setToast(""), 2200);
  }

  function openCheckout(...args) {
    return checkoutFlowRef.current(...args);
  }

  const { shareBakeryLocationOnWhatsApp, openBakeryInGoogleMaps } = useBakeryLocation(
    notify,
    () => setBakeryLocationOpen(false)
  );

  useEffect(() => {
    try {
      localStorage.setItem("pinkbakes_wishlist", JSON.stringify(wishlist));
    } catch (_) {}
  }, [wishlist]);

  function toggleWishlist(e, p) {
    e.stopPropagation();
    const id = String(p.id);
    const has = wishlist.includes(id);
    setWishlist(has ? wishlist.filter((x) => x !== id) : [...wishlist, id]);
    notify(has ? `Removed "${p.name}" from wishlist` : `Added "${p.name}" to wishlist`);
  }

  function sendCustomBrief() {
    const brief = customBrief;
    const hasOccasion = Boolean(brief.occasion?.trim());
    const hasTheme = Boolean(brief.theme?.trim());
    const hasServings = Boolean(brief.servings?.trim());
    if (!hasOccasion || (!hasTheme && !hasServings)) {
      notify("Please add occasion and either theme or servings");
      return;
    }
    const lines = [
      "Hi PinkBakes! Custom cake brief:",
      `* Name: ${brief.name?.trim() || "-"}`,
      `* Occasion: ${brief.occasion.trim()}`,
      `* Servings: ${brief.servings?.trim() || "-"}`,
      `* Flavor: ${brief.flavor?.trim() || "-"}`,
      `* Theme: ${brief.theme?.trim() || "-"}`,
      `* Preferred date: ${brief.preferredDate || "-"}`,
      `* Phone: ${brief.phone?.trim() || "-"}`
    ];
    const msg = lines.join(' | ');
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
    notify("Opening WhatsApp with your cake brief");
  }

  function stockLabel(p) {
    const available = Number(p?.available_quantity ?? p?.stock_remaining ?? 0);
    const availability = p?.availability || "in_stock";
    if (availability === "out_of_stock" || available <= 0) return "Out of Stock";
    if (available <= 5 || p?.is_low_stock || availability === "low_stock") return `Only ${available} left`;
    return "In stock";
  }

  function scrollTo(id) {
    setMobileOpen(false);
    const el = document.getElementById(id);
    if (!el) return;
    // Contact is the last in-page section. Without extra room below the footer,
    // the browser is already at max scroll and scrollIntoView cannot move it.
    const room = scrollRoomRef.current;
    if (room) room.style.height = "0px";
    const absTop = el.getBoundingClientRect().top + window.scrollY;
    const target = Math.max(0, absTop - STICKY_HEADER_OFFSET);
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const extra = Math.ceil(target - maxScroll);
    if (room && extra > 1) room.style.height = `${extra}px`;
    window.scrollTo({ top: target, behavior: "smooth" });
  }

  function subscribe(e) {
    e.preventDefault();
    if (newsletter.trim()) {
      setNewsletterDone(true);
      setNewsletter("");
    }
  }

  function handleAdminLogin(e) {
    e.preventDefault();

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
      .catch(error => {
        setAdminMessage(error.message || "Invalid admin username or password.");
      });
  }

  function handleAdminLogout() {
    const token = localStorage.getItem("pinkbakes_admin_token");
    if (token) {
      adminLogout(token).catch(() => {});
    }
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
      .then((data) => setReportSummary(data || {}))
      .catch((error) => setReportsError(error.message || "Unable to load reports."))
      .finally(() => setReportsLoading(false));
  }


  function closeAdminReports() {
    setAdminReportsView(false);
    setAdminOpen(false);
    window.history.pushState({}, "", "/");
  }

  function goAdminSection(section) {
    setAdminSection(section);
    setAdminReportsView(false);
    setAdminCouponsView(false);
    setAdminDeliveryView(false);
    setAdminOpsMessage("");
    setAdminOrderDetail(null);
    if (section === "coupons") {
      setAdminCouponsView(true);
      loadAdminCoupons();
      return;
    }
    if (section === "delivery") {
      setAdminDeliveryView(true);
      loadAdminDeliveryZones();
      return;
    }
    if (section === "reports") {
      setAdminReportsView(true);
      openAdminReports();
      return;
    }
    if (section === "products") {
      return;
    }
    loadAdminSectionData(section);
  }


  function loadAdminSectionData(section, preset) {
    const token = localStorage.getItem("pinkbakes_admin_token");
    if (!token) return;
    setAdminLoadingSection(true);
    const p = preset || adminDashPreset;
    const tasks = [];
    if (section === "dashboard") {
      tasks.push(fetchAdminDashboard({ preset: p }).then(setAdminDashboard).catch((e) => setAdminOpsMessage(e.message || "Dashboard failed")));
    } else if (section === "orders") {
      tasks.push(fetchAdminOrders({ ...adminOrderFilter, page: 1, page_size: 20 }).then((d) => {
        setAdminOrders(d.results || []);
        setAdminOrdersMeta({ count: d.count || 0, page: d.page || 1 });
      }).catch((e) => setAdminOpsMessage(e.message || "Orders failed")));
    } else if (section === "payments") {
      tasks.push(fetchAdminPayments({ page: 1, page_size: 25 }).then((d) => setAdminPayments(asListResponse(d))).catch((e) => { setAdminPayments([]); setAdminOpsMessage(e.message || "Payments failed"); }));
    } else if (section === "refunds") {
      const refundParams = { page: 1, page_size: 25 };
      if (adminRefundFilter) refundParams.status = adminRefundFilter;
      tasks.push(fetchAdminRefunds(refundParams).then((d) => setAdminRefunds(asListResponse(d))).catch((e) => { setAdminRefunds([]); setAdminOpsMessage(e.message || "Refunds failed"); }));
    } else if (section === "inventory") {
      tasks.push(fetchAdminInventory().then((d) => setAdminInventory(Array.isArray(d) ? d : (d.results || []))).catch((e) => setAdminOpsMessage(e.message || "Inventory failed")));
    } else if (section === "customers") {
      tasks.push(fetchAdminCustomers({ search: adminCustomerSearch, page: 1, page_size: 25 }).then((d) => setAdminCustomers(d.results || [])).catch((e) => setAdminOpsMessage(e.message || "Customers failed")));
    } else if (section === "employees") {
      tasks.push(Promise.all([
        loadEmployeeRecords(1, adminEmployeeFilter),
        fetchAdminActiveDeliveries().then((d) => setAdminActiveDeliveries(d.results || [])),
      ]).catch((e) => setAdminOpsMessage(e.message || "Delivery failed")));
    } else if (section === "reviews") {
      tasks.push(fetchAdminReviews({ status: adminReviewFilter, page: 1, page_size: 25 }).then((d) => {
        const rows = Array.isArray(d) ? d : (d.results || []);
        setAdminReviews(rows);
      }).catch((e) => setAdminOpsMessage(e.message || "Reviews failed")));
    } else if (section === "notifications") {
      tasks.push(fetchAdminNotifications(token).then((d) => setAdminNotifications(Array.isArray(d?.results) ? d.results : [])).catch(() => setAdminNotifications([])));
    } else if (section === "settings") {
      tasks.push(fetchAdminSettingsStatus().then(setAdminSettings).catch((e) => setAdminOpsMessage(e.message || "Settings failed")));
    }
    Promise.all(tasks).finally(() => setAdminLoadingSection(false));
  }

  function closeAssignPicker() {
    setAssignPickerOpen(false);
    setAssignPickerLoading(false);
    setAssignPickerError("");
    setAssignPickerEmployees([]);
    setAssignPickerSelectedId("");
    setAssignPickerSubmitting(false);
  }

  function openAssignPicker() {
    if (!adminOrderDetail?.id) return;
    setAssignPickerOpen(true);
    setAssignPickerLoading(true);
    setAssignPickerError("");
    setAssignPickerEmployees([]);
    setAssignPickerSelectedId("");
    setAssignPickerSubmitting(false);
    // Assign API accepts ACTIVE or AVAILABLE; list endpoint filters one status at a time.
    fetchAdminEmployees()
      .then((d) => {
        const list = Array.isArray(d) ? d : (d.results || []);
        setAdminEmployees(list);
        const assignable = list.filter((e) =>
          e.employment_status === "ACTIVE" && (e.status === "ACTIVE" || e.status === "AVAILABLE")
        );
        setAssignPickerEmployees(assignable);
        const currentId = adminOrderDetail?.delivery_employee?.id;
        if (currentId && assignable.some((e) => e.id === currentId)) {
          setAssignPickerSelectedId(String(currentId));
        } else if (assignable.length === 1) {
          setAssignPickerSelectedId(String(assignable[0].id));
        }
      })
      .catch((err) => setAssignPickerError(err.message || "Could not load employees."))
      .finally(() => setAssignPickerLoading(false));
  }

  function confirmAssignPicker() {
    if (!adminOrderDetail?.id || !assignPickerSelectedId) {
      setAssignPickerError("Select an employee to assign.");
      return;
    }
    setAssignPickerSubmitting(true);
    setAssignPickerError("");
    const isReassign = Boolean(adminOrderDetail?.delivery_employee?.id);
    assignAdminDelivery(adminOrderDetail.id, Number(assignPickerSelectedId))
      .then((ord) => {
        setAdminOrderDetail(ord);
        setAdminOpsMessage(isReassign ? "Delivery reassigned." : "Delivery assigned.");
        closeAssignPicker();
        loadAdminSectionData("orders");
      })
      .catch((err) => setAssignPickerError(err.message || "Assign failed."))
      .finally(() => setAssignPickerSubmitting(false));
  }

  function handleUnassignDelivery() {
    if (!adminOrderDetail?.id) return;
    if (!adminOrderDetail?.delivery_employee) {
      setAdminOpsMessage("No delivery employee assigned.");
      return;
    }
    setAdminOpsMessage("Unassigning...");
    unassignAdminDelivery(adminOrderDetail.id)
      .then((ord) => {
        setAdminOrderDetail(ord);
        setAdminOpsMessage("Delivery unassigned.");
        loadAdminSectionData("orders");
      })
      .catch((e) => setAdminOpsMessage(e.message || "Unassign failed."));
  }

  function getAdminRefundableInfo(order) {
    if (!order) return { paymentAmount: null, maxRefundable: null, paymentStatus: null };
    const payments = Array.isArray(order.payments) ? order.payments : [];
    const refundableStatuses = ["paid", "refund_pending", "partially_refunded"];
    const paid = payments.find((p) => refundableStatuses.includes(p.status)) || payments[0] || null;
    const paymentAmount = paid ? Number(paid.amount) : (order.total_amount != null ? Number(order.total_amount) : null);
    const completedRefunded = Number(order.refunds_summary?.completed_amount ?? 0);
    let maxRefundable = null;
    if (paymentAmount != null && !Number.isNaN(paymentAmount)) {
      maxRefundable = Math.max(0, Math.round((paymentAmount - completedRefunded) * 100) / 100);
    }
    return { paymentAmount, maxRefundable, paymentStatus: paid?.status || order.payment_status || null };
  }

  function closeCancelModal() {
    setCancelModalOpen(false);
    setCancelModalReason("");
    setCancelModalError("");
    setCancelModalSubmitting(false);
  }

  function openCancelModal() {
    if (!adminOrderDetail?.id) return;
    setCancelModalReason("");
    setCancelModalError("");
    setCancelModalSubmitting(false);
    setCancelModalOpen(true);
  }

  function confirmCancelModal() {
    if (!adminOrderDetail?.id) return;
    setCancelModalSubmitting(true);
    setCancelModalError("");
    cancelAdminOrder(adminOrderDetail.id, cancelModalReason.trim())
      .then((d) => {
        setAdminOrderDetail(d);
        setAdminOpsMessage("Order cancelled.");
        closeCancelModal();
        loadAdminSectionData("orders");
      })
      .catch((e) => setCancelModalError(e.message || "Cancel failed."))
      .finally(() => setCancelModalSubmitting(false));
  }

  function closeRefundModal() {
    setRefundModalOpen(false);
    setRefundModalAmount("");
    setRefundModalReason("Admin refund");
    setRefundModalError("");
    setRefundModalSubmitting(false);
  }

  function openRefundModal() {
    if (!adminOrderDetail?.id) return;
    setRefundModalAmount("");
    setRefundModalReason("Admin refund");
    setRefundModalError("");
    setRefundModalSubmitting(false);
    setRefundModalOpen(true);
  }

  function confirmRefundModal() {
    if (!adminOrderDetail?.id) return;
    const { maxRefundable } = getAdminRefundableInfo(adminOrderDetail);
    const amountStr = String(refundModalAmount || "").trim();
    const payload = { reason: (refundModalReason || "").trim() || "Admin refund" };
    if (amountStr) {
      const amountNum = Number(amountStr);
      if (!Number.isFinite(amountNum) || amountNum <= 0) {
        setRefundModalError("Enter a valid refund amount greater than zero, or leave blank for full refund.");
        return;
      }
      if (maxRefundable != null && amountNum > maxRefundable + 1e-9) {
        setRefundModalError(`Amount cannot exceed max refundable (Rs.${maxRefundable.toLocaleString("en-IN")}).`);
        return;
      }
      payload.amount = amountStr;
    }
    setRefundModalSubmitting(true);
    setRefundModalError("");
    refundAdminOrder(adminOrderDetail.id, payload)
      .then(() => {
        setAdminOpsMessage("Refund initiated");
        closeRefundModal();
        return fetchAdminOrderDetail(adminOrderDetail.id).then(setAdminOrderDetail);
      })
      .catch((e) => setRefundModalError(e.message || "Refund failed."))
      .finally(() => setRefundModalSubmitting(false));
  }

  function closeRestockModal() {
    setRestockModalOpen(false);
    setRestockModalItem(null);
    setRestockModalAction("restock");
    setRestockModalQty("10");
    setRestockModalReason("Restock");
    setRestockModalError("");
    setRestockModalSubmitting(false);
    setRestockModalSource("inventory");
  }

  function openRestockModal(item, source = "inventory") {
    if (!item?.id) return;
    setRestockModalItem(item);
    setRestockModalAction("restock");
    setRestockModalQty("10");
    setRestockModalReason("Restock");
    setRestockModalError("");
    setRestockModalSubmitting(false);
    setRestockModalSource(source);
    setRestockModalOpen(true);
  }

  function confirmRestockModal() {
    if (!restockModalItem?.id) return;
    const qtyNum = Number(restockModalQty);
    if (!Number.isFinite(qtyNum) || !Number.isInteger(qtyNum)) {
      setRestockModalError("Quantity must be a whole number.");
      return;
    }
    if (restockModalAction === "restock" || restockModalAction === "remove" || restockModalAction === "set") {
      if (qtyNum < 0) {
        setRestockModalError("Quantity must be zero or greater for this action.");
        return;
      }
    }
    if (restockModalAction === "restock" && qtyNum === 0) {
      setRestockModalError("Restock quantity must be greater than zero.");
      return;
    }
    setRestockModalSubmitting(true);
    setRestockModalError("");
    const reason = (restockModalReason || "").trim() || "Restock";
    adjustAdminInventory(restockModalItem.id, {
      action: restockModalAction,
      quantity: qtyNum,
      reason,
    })
      .then(() => {
        setAdminOpsMessage("Stock updated.");
        const source = restockModalSource;
        closeRestockModal();
        if (source === "products") {
          return fetchProducts().then((data) => {
            const list = asListResponse(data);
            setCatalog(list.map(normalizeProduct));
            notify("Stock updated");
          });
        }
        return loadAdminSectionData("inventory");
      })
      .catch((e) => setRestockModalError(e.message || "Unable to adjust stock."))
      .finally(() => setRestockModalSubmitting(false));
  }


  function openAdminLogin() {
    setAdminOpen(true);
    setAdminMessage("");
    try {
      window.history.pushState({}, "", "/admin-login");
    } catch (_) { /* ignore */ }
  }

  function openCustomerDetail(userId) {
    setAdminCustomerDetailLoading(true);
    setAdminCustomerDetail(null);
    fetchAdminCustomerDetail(userId)
      .then((d) => setAdminCustomerDetail(d))
      .catch((e) => setAdminOpsMessage(e.message || "Could not load customer"))
      .finally(() => setAdminCustomerDetailLoading(false));
  }

  function openPolicy(slug) {
    const policy = POLICIES[slug];
    if (!policy) return;
    setChatOpen(false);
    setPolicySlug(slug);
    try {
      if ((policyFromPath(window.location.pathname)?.slug || null) !== slug) {
        window.history.pushState({ policy: slug }, "", policy.path);
      }
    } catch (_) { /* ignore */ }
  }

  function closePolicy() {
    setPolicySlug(null);
    try {
      if (policyFromPath(window.location.pathname)) {
        window.history.pushState({}, "", "/");
      }
    } catch (_) { /* ignore */ }
  }

  function openFooterAdmin() {
    if (isAdminLoggedIn) {
      setAdminOpen(true);
      setAdminSection("dashboard");
      try { window.history.pushState({}, "", "/admin"); } catch (_) { /* ignore */ }
    } else {
      openAdminLogin();
    }
  }

  function openRazorpayForPayment(paymentInfo, token, { orderId, amountLabel, successSummary } = {}) {
    const loadRazorpay = () => new Promise((resolve, reject) => {
      if (window.Razorpay) {
        resolve(window.Razorpay);
        return;
      }

      const existing = document.getElementById("razorpay-sdk");
      if (existing) {
        existing.addEventListener("load", () => resolve(window.Razorpay), { once: true });
        existing.addEventListener("error", () => reject(new Error("Unable to load Razorpay checkout.")), { once: true });
        return;
      }

      const script = document.createElement("script");
      script.id = "razorpay-sdk";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(window.Razorpay);
      script.onerror = () => reject(new Error("Unable to load Razorpay checkout."));
      document.body.appendChild(script);
    });

    return loadRazorpay().then((Razorpay) => {
      const options = {
        key: paymentInfo.key_id || appConfig.razorpayKeyId,
        amount: Number(paymentInfo.amount || 0),
        currency: paymentInfo.currency || "INR",
        order_id: paymentInfo.payment_order_id,
        name: "PinkBakes",
        description: `Payment for ${amountLabel || "order"}`,
        handler: function (response) {
          verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            amount: Number(paymentInfo.amount || 0),
            payment_method: "razorpay",
          }, token)
            .then((result) => {
              if (successSummary) {
                setOrderSuccess({
                  orderNumber: successSummary.orderNumber,
                  amount: successSummary.amount,
                  paymentId: result.payment_id,
                });
              }
              setCart([]);
              setCheckoutOpen(false);
              if (orderId) {
                setSelectedOrder(prev => ({ ...(prev || {}), id: orderId, payment_status: "paid", status: "ORDER_CONFIRMED" }));
              }
              notify("Payment successful. Your order has been confirmed.");
            })
            .catch((error) => setCheckoutMessage(error.message || "Payment verification failed. Please contact support."));
        },
        theme: { color: "#d62f7b" },
        modal: {
          ondismiss: () => {
            setCheckoutMessage("Payment cancelled. Your cart is still intact.");
          },
        },
      };

      const rzp = new Razorpay(options);
      rzp.open();
    });
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
      .then((order) => {
        setSelectedOrder(order);
        setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, ...order } : o)));
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
      .catch((err) => {
        setCancelMessage(err?.detail || err?.message || "Unable to cancel this order.");
      })
      .finally(() => setCancelLoading(false));
  }

  function handleRetryPayment(orderId) {
    const token = localStorage.getItem("pinkbakes_token");
    if (!token) return;

    setPaymentRetryLoading(true);
    setCheckoutMessage("");

    retryPayment(orderId, token)
      .then((paymentInfo) => openRazorpayForPayment(paymentInfo, token, {
        orderId,
        amountLabel: `Order #${orderId}`,
        successSummary: {
          orderNumber: `PB-${orderId}`,
          amount: Number((paymentInfo.amount || 0) / 100),
        },
      }))
      .catch((error) => setCheckoutMessage(error.message || "Unable to retry payment."))
      .finally(() => setPaymentRetryLoading(false));
  }

  function populateCakeForm(item) {
    setEditingCakeId(item.id);
    setCakeForm({
      name: item.name || "",
      price: String(item.price ?? ""),
      discount: String(item.discount ?? 0),
      category: item.category || "Birthday Cakes",
      description: item.description || item.short_description || "",
      image: item.image || "",
      availability: item.availability || "in_stock",
      available_quantity: item.available_quantity ?? item.stock_remaining ?? 50,
      low_stock_threshold: item.low_stock_threshold ?? 5,
      status: item.status || "published"
    });
    setAdminMessage("");
  }

  function submitCakeForm(e) {
    e.preventDefault();

    if (!cakeForm.name.trim() || !cakeForm.price || !cakeForm.description.trim()) {
      setAdminMessage("Please fill in the cake name, price, and description.");
      return;
    }

    const token = localStorage.getItem("pinkbakes_admin_token");
    const baseImage = cakeForm.image || catalog[0]?.image || "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1000&q=85";
    const existingCake = editingCakeId != null ? catalog.find(item => item.id === editingCakeId) : null;
    const payload = {
      name: cakeForm.name.trim(),
      price: Number(cakeForm.price),
      discount: Number(cakeForm.discount || 0),
      category: cakeForm.category,
      description: cakeForm.description.trim(),
      short_description: cakeForm.description.trim(),
      main_image: baseImage,
      image: baseImage,
      gallery: [baseImage, baseImage],
      images: [baseImage, baseImage],
      badge: Number(cakeForm.discount || 0) > 0 ? `${Number(cakeForm.discount || 0)}% OFF` : "New",
      rating: Number(existingCake?.rating ?? 4.8),
      featured: false,
      delivery_time: "24-48 hours",
      availability: cakeForm.availability || "in_stock",
      status: cakeForm.status || "published",
      available_quantity: Number(cakeForm.available_quantity ?? 50),
      low_stock_threshold: Number(cakeForm.low_stock_threshold ?? 5),
      is_active: true,
    };

    const request = editingCakeId != null
      ? updateProduct(editingCakeId, payload, token)
      : createProduct(payload, token);

    request
      .then(product => {
        const nextCake = normalizeProduct(product);
        if (editingCakeId != null) {
          setCatalog(prev => prev.map(item => item.id === editingCakeId ? nextCake : item));
          setAdminMessage("Cake updated successfully.");
          notify(`${nextCake.name} updated`);
        } else {
          setCatalog(prev => [nextCake, ...prev]);
          setAdminMessage("Cake added successfully.");
          notify(`${nextCake.name} added to the catalog`);
        }
        resetCakeForm();
      })
      .catch(error => {
        setAdminMessage(error.message || (editingCakeId != null ? "Could not update cake." : "Could not add cake."));
      });
  }

  function removeCake(id) {
    const token = localStorage.getItem("pinkbakes_admin_token");
    deleteProduct(id, token)
      .then(() => {
        setCatalog(prev => prev.filter(p => p.id !== id));
        if (editingCakeId === id) {
          resetCakeForm();
        }
        setAdminMessage("Cake removed successfully.");
        notify("Cake removed from catalog");
      })
      .catch(error => {
        setAdminMessage(error.message || "Could not remove cake.");
      });
  }

  return (
    <div className="site">
      <SiteHeader {...{
        mobileOpen,
        setMobileOpen,
        brandName: BRAND_NAME,
        scrollTo,
        user,
        loadUserOrders,
        setAuthMode,
        setAuthStage,
        setAuthMessage,
        setAuthOpen,
        cartCount,
        setCartOpen,
        openCheckout,
      }} />

      <main>
        <HeroSection scrollTo={scrollTo} openCheckout={openCheckout} />
        <CategorySection
          categoriesLoading={categoriesLoading}
          shopCategories={shopCategories}
          catalogError={catalogError}
          catalogLoading={catalogLoading}
          loadCatalog={loadCatalog}
          categoryImageFallbacks={CATEGORY_IMAGE_FALLBACKS}
          setCategory={setCategory}
          scrollTo={scrollTo}
        />

        <ProductCatalog {...{
          category,
          setCategory,
          shopCategories,
          search,
          setSearch,
          catalogLoading,
          catalog,
          filtered,
          wishlist,
          toggleWishlist,
          openProduct,
          setProduct3d,
          formatCurrency,
          isOutOfStock,
          stockLabel,
          addToCart,
          catalogError,
          loadCatalog,
        }} />

        <BenefitStrip />

        <CustomCakeSection {...{
          customBrief,
          setCustomBrief,
          sendCustomBrief,
          setCategory,
          scrollTo,
        }} />

        <CustomerReviews />
        <CelebrationGallery whatsappNumber={WHATSAPP_NUMBER} />

        <ContactStrip
          bakeryHours={BAKERY_LOCATION.hours}
          whatsappNumber={WHATSAPP_NUMBER}
          contactEmail={CONTACT_EMAIL}
          onVisit={() => setBakeryLocationOpen(true)}
          bakeryLocationOpen={bakeryLocationOpen}
        />
      </main>

      <SiteFooter {...{
        brandName: BRAND_NAME,
        whatsappNumber: WHATSAPP_NUMBER,
        scrollTo,
        subscribe,
        newsletter,
        setNewsletter,
        newsletterDone,
        openPolicy,
        openHelpDesk,
        openFooterAdmin,
        isAdminLoggedIn,
        scrollRoomRef,
      }} />

      {policySlug && POLICIES[policySlug] && (
        <PolicyPage
          policy={POLICIES[policySlug]}
          onClose={closePolicy}
          onOpen={openPolicy}
          brandName={BRAND_NAME}
          contactEmail={CONTACT_EMAIL}
          whatsappNumber={WHATSAPP_NUMBER}
        />
      )}

      
      {bakeryLocationOpen && (
        <BakeryLocationDialog
          location={BAKERY_LOCATION}
          onClose={() => setBakeryLocationOpen(false)}
          onShare={shareBakeryLocationOnWhatsApp}
          onOpenMaps={openBakeryInGoogleMaps}
        />
      )}

      {product && <ProductModal key={product.id || product.slug || product.name} product={product} onClose={closeProduct} onAdd={(item) => {addToCart(item || product); closeProduct()}} stockLabel={stockLabel} isOutOfStock={isOutOfStock}/>}
      {product3d && (
        <Suspense fallback={null}>
          <Product3DViewer product={product3d} onClose={() => setProduct3d(null)} />
        </Suspense>
      )}

      {productNotFound && (
        <ProductNotFoundDialog
          onClose={closeProduct}
          onBrowse={() => { closeProduct(); scrollTo("cakes"); }}
        />
      )}

      <AdminDialogs {...{
            X,
            adminCredentials,
            adminMessage,
            adminNotifications,
            adminOpen,
            adminOrderDetail,
            assignPickerEmployees,
            assignPickerError,
            assignPickerLoading,
            assignPickerOpen,
            assignPickerSelectedId,
            assignPickerSubmitting,
            cancelModalError,
            cancelModalOpen,
            cancelModalReason,
            cancelModalSubmitting,
            closeAssignPicker,
            closeCancelModal,
            closeRefundModal,
            closeRestockModal,
            confirmAssignPicker,
            confirmCancelModal,
            confirmRefundModal,
            confirmRestockModal,
            getAdminRefundableInfo,
            handleAdminLogin,
            isAdminLoggedIn,
            refundModalAmount,
            refundModalError,
            refundModalOpen,
            refundModalReason,
            refundModalSubmitting,
            restockModalAction,
            restockModalError,
            restockModalItem,
            restockModalOpen,
            restockModalQty,
            restockModalReason,
            restockModalSubmitting,
            setAdminCredentials,
            setAdminOpen,
            setAssignPickerSelectedId,
            setCancelModalReason,
            setRefundModalAmount,
            setRefundModalReason,
            setRestockModalAction,
            setRestockModalQty,
            setRestockModalReason,
          }} />
      {isAdminLoggedIn && (
        <AdminDashboardPanel {...{
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
          }} />
      )}

      <AdminCustomerDrawer
        customer={adminCustomerDetail}
        loading={adminCustomerDetailLoading}
        onClose={() => { setAdminCustomerDetail(null); setAdminCustomerDetailLoading(false); }}
        onToggleStatus={() => updateAdminCustomerStatus(adminCustomerDetail.id, !adminCustomerDetail.is_active).then(() => {
          openCustomerDetail(adminCustomerDetail.id);
          loadAdminSectionData("customers");
          setAdminOpsMessage(adminCustomerDetail.is_active ? "Customer deactivated" : "Customer activated");
        }).catch(error => setAdminOpsMessage(error.message))}
      />

      <CartDrawer
        cartOpen={cartOpen}
        setCartOpen={setCartOpen}
        cart={cart}
        changeQty={changeQty}
        cartUnitPrice={cartUnitPrice}
        cartQtyCap={cartQtyCap}
        cartTotal={cartTotal}
        openCheckout={openCheckout}
        scrollTo={scrollTo}
      />

      {checkoutOpen && (
        <CheckoutForm {...{
          setCheckoutOpen,
          handleCheckoutSubmit,
          savedAddresses,
          selectedAddressId,
          applyAddressToCheckout,
          setSelectedAddressId,
          setShowNewAddressForm,
          showNewAddressForm,
          checkoutForm,
          setCheckoutForm,
          refreshDeliveryQuote,
          handleSaveNewAddress,
          couponCodeInput,
          setCouponCodeInput,
          appliedCoupon,
          handleApplyCoupon,
          couponLoading,
          handleRemoveCoupon,
          couponMessage,
          cartTotal,
          couponDiscountPreview,
          deliveryQuote,
          deliveryFeePreview,
          deliveryQuoteMessage,
          checkoutPayable,
          checkoutMessage,
          checkoutLoading,
        }} />
      )}

      {orderSuccess && (
        <OrderSuccessDialog orderSuccess={orderSuccess} onDismiss={() => setOrderSuccess(null)} />
      )}

      {orderHistoryOpen && (
        <UserOrdersDialog {...{
          setOrderHistoryOpen,
          selectedOrder,
          notifUnreadCount,
          handleMarkAllNotificationsRead,
          inAppNotifications,
          handleMarkNotificationRead,
          notificationPrefs,
          handleNotificationPreferenceChange,
          notificationPrefsMessage,
          setCancelConfirmOpen,
          setCancelMessage,
          paymentRetryLoading,
          handleRetryPayment,
          cancelConfirmOpen,
          cancelReason,
          setCancelReason,
          handleCancelOrder,
          cancelLoading,
          cancelMessage,
          setSelectedOrder,
          fetchTracking,
          trackingLoading,
          trackingError,
          trackingOrder,
          getMapsUrl,
          orders,
          handleOpenOrder,
        }} />
      )}

      {!authOpen && (
        <div className="auth-float" onClick={() => setAuthOpen(true)}>
          <div className="auth-float-badge">
            <UserRound size={16}/>
            <span>{user ? `Hi, ${user.first_name || user.username}` : "Sign in"}</span>
          </div>
        </div>
      )}

      {authOpen && (
        <AuthDialog {...{
          brandName: BRAND_NAME,
          authStage,
          authFlow,
          authMode,
          setAuthMode,
          setAuthOpen,
          authMessage,
          authLoading,
          handleForgotPassword,
          forgotEmail,
          setForgotEmail,
          setAuthFlow,
          resetPasswordForm,
          setResetPasswordForm,
          handleResetPasswordSubmit,
          setAuthMessage,
          setResetToken,
          verificationMethod,
          setVerificationMethod,
          verificationData,
          verificationCode,
          setVerificationCode,
          handleVerificationAction,
          setAuthStage,
          setPendingCheckout,
          notify,
          authForm,
          setAuthForm,
          handleOtpLoginSubmit,
          handleOtpLoginRequest,
          handleAuthSubmit,
          user,
          handleSignOut,
        }} />
      )}

      <ChatbotDock {...{
        chatOpen,
        setChatOpen,
        chatMessagesRef,
        chatMessages,
        sendChatMessage,
        handleChatSubmit,
        chatInput,
        setChatInput,
      }} />

      {toast && <div className="toast"><Check size={17}/>{toast}</div>}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
