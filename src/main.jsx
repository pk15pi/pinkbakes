import React, { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Search, UserRound, ShoppingBag, Menu, X,
  Star, Heart, ZoomIn, Rotate3d, Plus, Minus, Trash2, ArrowRight,
  CakeSlice, Sparkles, Leaf, CalendarDays, ShieldCheck, Instagram,
  MessageCircle, Mail, MapPin, Check, Send,
  ChevronLeft, ChevronRight, ChevronUp, ChevronDown
} from "lucide-react";
import { CHATBOT_QUICK_PROMPTS, matchChatbotFaq } from "./chatbotFaq";
import { POLICIES, POLICY_SLUGS, policyFromPath } from "./policies";
import { logout, adminLogout,
  adminLogin,
  cancelOrder,
  createPaymentSession,
  createAdminCoupon,
  createProduct,
  deleteProduct,
  fetchAdminReportSummary,
  fetchAdminCoupons,
  fetchCurrentUser,
  fetchOrder,
  fetchOrders,
  fetchProduct,
  fetchProductBySlug,
  fetchProductReviews,
  asListResponse,
  fetchCategories,
  fetchProducts,
  forgotPassword,
  requestLoginOtp,
  resetPassword,
  retryPayment,
  sendVerification,
  signIn,
  verifyPayment,
  signUp,
  submitReview,
  updateProduct,
  updateAdminCoupon,
  validateCoupon,
  validateCart,
  adjustAdminInventory,
  fetchAddresses,
  createAddress,
  quoteDelivery,
  fetchAdminDeliveryZones,
  createAdminDeliveryZone,
  updateAdminDeliveryZone,
  fetchAdminDeliverySettings,
  updateAdminDeliverySettings,
  verifyEmail,
  verifyLoginOtp,
  verifyOtp,
  verifyResetToken,
  fetchNotificationPreferences,
  updateNotificationPreferences,
  fetchInAppNotifications,
  markNotificationRead,
  markAllNotificationsRead,
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
  createAdminEmployee,
  updateAdminEmployee,
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
  SITE_URL,
  setPageMeta,
  productPath,
  buildProductJsonLd,
  buildOrganizationJsonLd,
  buildWebSiteJsonLd,
  buildBreadcrumbJsonLd,
  parseProductPath,
  isPrivatePath,
  plainText,
} from "./seo";
import "./styles.css";

/** Lazy-load 3D viewer so its chunk is fetched only when opened. */
const Product3DViewer = lazy(() => import("./components/Product3DViewer.jsx"));


/** Decorative category card images - local public cakes (Collab 3D uses product.image). Labels come from the API. */
const CATEGORY_IMAGE_FALLBACKS = {
  "Birthday Cakes": "/products/cakes/BirthdayCakes_BerryMedley.jpg",
  "Anniversary Cakes": "/products/cakes/AnniversaryCakes_BlackForest.jpg",
  "Wedding Cakes": "/products/cakes/WeddingCakes_AlmondMarzipan.jpg",
  "Chocolate Cakes": "/products/cakes/ChocolateCakes_BlackForest2.jpg",
  "Designer Cakes": "/products/cakes/DesignerCakes_BerryMedley.jpg",
  "Photo Cakes": "/products/cakes/PhotoCakes_AlmondMarzipan.jpg",
  "Custom Cakes": "/products/cakes/CustomCakes_BerryMedley.jpg",
  "Eggless Cakes": "/products/cakes/EgglessCakes_BerryMedley.jpg",
};

/** Canonical category names for the admin cake form (aligned with backend catalog.constants). */
const CAKE_CATEGORY_OPTIONS = Object.keys(CATEGORY_IMAGE_FALLBACKS);


const reviews = [
  ["Priya Sharma", "The cake was beyond beautiful and tasted amazing! Everyone loved it.", "Birthday Cake"],
  ["Rohit Mehta", "Perfect experience from ordering to delivery. The cake looked exactly like the picture.", "Anniversary Cake"],
  ["Neha Verma", "I ordered a custom cake for my daughter's birthday and it was absolutely perfect.", "Custom Cake"]
];

/** Mirrors backend catalog.admin_ops.ORDER_STATUS_TRANSITIONS (cancel via cancel endpoint). */
const ORDER_STATUS_TRANSITIONS = {
  PENDING: ["ORDER_CONFIRMED"],
  ORDER_CONFIRMED: ["PREPARING"],
  PREPARING: ["PACKING"],
  PACKING: ["READY_FOR_DELIVERY"],
  READY_FOR_DELIVERY: ["DELIVERY_BOY_ASSIGNED"],
  DELIVERY_BOY_ASSIGNED: ["OUT_FOR_DELIVERY"],
  OUT_FOR_DELIVERY: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

function getNextOrderStatuses(current) {
  return ORDER_STATUS_TRANSITIONS[current] || [];
}
const BRAND_NAME = "pinkbakes";
const WHATSAPP_NUMBER = "6033430700";
const CONTACT_EMAIL = "pinkbakes@pinkbakes.com";
const BAKERY_LOCATION = {
  label: "pinkbakes Bakery",
  hours: "Open daily | 10 AM - 9 PM",
};
const STICKY_HEADER_OFFSET = 80;

function PolicyPage({ policy, onClose, onOpen }) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") onCloseRef.current();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className="policy-page" role="dialog" aria-modal="true" aria-labelledby="policy-page-title">
      <div className="policy-page-bar">
        <button type="button" className="policy-page-brand" onClick={onClose}>{BRAND_NAME}</button>
        <button type="button" className="policy-page-close" onClick={onClose} aria-label="Close policy">
          <X size={18}/>
        </button>
      </div>
      <article className="policy-page-sheet">
        <p className="policy-page-kicker">pinkbakes</p>
        <h1 id="policy-page-title">{policy.title}</h1>
        <p className="policy-page-updated">Updated {policy.updated}</p>
        <p className="policy-page-summary">{policy.summary}</p>
        {policy.sections.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </section>
        ))}
        <p className="policy-page-contact">
          Email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          {" "}or WhatsApp <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer">+91 {WHATSAPP_NUMBER}</a>.
        </p>
        <nav className="policy-page-nav" aria-label="Other policies">
          {POLICY_SLUGS.map((slug) => (
            <button
              key={slug}
              type="button"
              className={slug === policy.slug ? "is-current" : ""}
              onClick={() => onOpen(slug)}
            >
              {POLICIES[slug].title}
            </button>
          ))}
        </nav>
      </article>
    </div>
  );
}

const normalizeProduct = (product) => {
  const base = product || {};
  const price = Number(base.price ?? 0);
  const discount = Number(base.discount ?? 0);
  const discounted = Number(base.discounted_price ?? (price * (100 - discount) / 100 || price));
  const image = base.main_image || base.image || base.images?.[0] || "";
  const gallery = Array.isArray(base.gallery) && base.gallery.length
    ? base.gallery
    : Array.isArray(base.images) && base.images.length
      ? base.images
      : image
        ? [image]
        : [];

  return {
    ...base,
    id: base.id,
    slug: base.slug || "",
    name: base.name || "Cake",
    price,
    discount,
    discounted_price: discounted,
    rating: Number(base.average_rating ?? base.rating ?? 0),
    review_count: Number(base.review_count ?? 0),
    image,
    gallery,
    description: base.description || base.short_description || "",
    short_description: base.short_description || base.description || "",
    availability: base.availability || "in_stock",
    available_quantity: Number(base.available_quantity ?? base.stock_remaining ?? 0),
    stock_remaining: Number(base.stock_remaining ?? base.available_quantity ?? 0),
    is_low_stock: Boolean(base.is_low_stock),
    low_stock_threshold: Number(base.low_stock_threshold ?? 5),
    category: typeof base.category === "object" && base.category
      ? String(base.category.name || base.category.slug || "").trim()
      : String(base.category || "").trim(),
    status: base.status || "published",
    badge: base.badge || (discount ? `${discount}% OFF` : ""),
    main_image: image,
    images: gallery,
  };
};

const formatCurrency = (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value || 0));

function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [category, setCategory] = useState("All Cakes");
  const [search, setSearch] = useState("");
  const [product, setProduct] = useState(null);
  const [productNotFound, setProductNotFound] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [bakeryLocationOpen, setBakeryLocationOpen] = useState(false);
  const [policySlug, setPolicySlug] = useState(() => policyFromPath(window.location.pathname)?.slug || null);
  const [newsletter, setNewsletter] = useState("");
  const [newsletterDone, setNewsletterDone] = useState(false);
  const [catalog, setCatalog] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState("");
  const [shopCategories, setShopCategories] = useState([]);
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
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("signin");
  const [authStage, setAuthStage] = useState("form");
  const [authLoading, setAuthLoading] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponMessage, setCouponMessage] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [adminCouponsView, setAdminCouponsView] = useState(false);
  const [adminCoupons, setAdminCoupons] = useState([]);
  const [adminCouponForm, setAdminCouponForm] = useState({ code: "", name: "", discount_type: "percentage", discount_value: "10", is_active: true });
  const [adminCouponMessage, setAdminCouponMessage] = useState("");
  const [adminDeliveryView, setAdminDeliveryView] = useState(false);
  const [adminZones, setAdminZones] = useState([]);
  const [adminZoneForm, setAdminZoneForm] = useState({
    name: "", postal_codes: "", delivery_charge: "50", minimum_order_amount: "0",
    free_delivery_threshold: "", is_active: true,
  });
  const [adminDeliveryMessage, setAdminDeliveryMessage] = useState("");
  const [adminDeliverySettings, setAdminDeliverySettings] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [deliveryQuote, setDeliveryQuote] = useState(null);
  const [deliveryQuoteMessage, setDeliveryQuoteMessage] = useState("");
  const [checkoutForm, setCheckoutForm] = useState({
    customer_name: "",
    customer_email: "",
    customer_mobile: "",
    shipping_address: "",
    shipping_address_2: "",
    landmark: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India",
    notes: "",
    shipping_latitude: "",
    shipping_longitude: "",
  });
  const [orderHistoryOpen, setOrderHistoryOpen] = useState(false);
  const [notificationPrefs, setNotificationPrefs] = useState(null);
  const [notificationPrefsMessage, setNotificationPrefsMessage] = useState("");
  const [inAppNotifications, setInAppNotifications] = useState([]);
  const [notifUnreadCount, setNotifUnreadCount] = useState(0);
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
  const [adminEmployees, setAdminEmployees] = useState([]);
  const [adminActiveDeliveries, setAdminActiveDeliveries] = useState([]);
  const [adminReviews, setAdminReviews] = useState([]);
  const [adminReviewFilter, setAdminReviewFilter] = useState("pending");
  const [adminSettings, setAdminSettings] = useState(null);
  const [adminOpsMessage, setAdminOpsMessage] = useState("");
  const [adminInventory, setAdminInventory] = useState([]);
  const [adminLoadingSection, setAdminLoadingSection] = useState(false);
  const [adminCustomerDetail, setAdminCustomerDetail] = useState(null);
  const [adminCustomerDetailLoading, setAdminCustomerDetailLoading] = useState(false);
  const [adminEmployeeForm, setAdminEmployeeForm] = useState({
    employee_id: "",
    name: "",
    contact_number: "",
    email: "",
    photo: "",
    status: "ACTIVE",
  });
  const [adminEmployeeEditingId, setAdminEmployeeEditingId] = useState(null);
  const [adminEmployeeMessage, setAdminEmployeeMessage] = useState("");
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
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [authMessage, setAuthMessage] = useState("");
  const [authFlow, setAuthFlow] = useState("signin");
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [resetPasswordForm, setResetPasswordForm] = useState({ password: "", confirm_password: "" });
  const [verificationMethod, setVerificationMethod] = useState("email");
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationData, setVerificationData] = useState(null);
  const [user, setUser] = useState(null);
  const [authForm, setAuthForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    mobile_number: "",
    password: ""
  });
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const chatMessagesRef = useRef(null);
  const scrollRoomRef = useRef(null);
  const [chatMessages, setChatMessages] = useState([
    {
      sender: "bot",
      text: "Hi! I'm PinkBakes Assistant — your free Help Desk. Ask about ordering, delivery, cancel/refund, eggless & custom cakes, coupons, or payments. Tap a quick question below anytime."
    }
  ]);
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
    let cancelled = false;
    setCatalogLoading(true);
    Promise.all([
      fetchProducts(),
      fetchCategories().catch(() => []),
    ])
      .then(([data, categoriesData]) => {
        if (cancelled) return;
        const items = asListResponse(data);
        setCatalog(items.map(normalizeProduct));
        const fromApi = asListResponse(categoriesData);
        if (fromApi.length) {
          setShopCategories(fromApi.map((c) => ({
            name: c.name,
            product_count: Number(c.product_count || 0),
            image: c.image || CATEGORY_IMAGE_FALLBACKS[c.name] || CATEGORY_IMAGE_FALLBACKS["Birthday Cakes"],
          })));
        } else {
          // Derive categories from loaded products if categories endpoint is empty/unavailable
          const seen = new Map();
          items.forEach((raw) => {
            const p = normalizeProduct(raw);
            const name = (p.category || "").trim();
            if (!name) return;
            if (!seen.has(name)) {
              seen.set(name, {
                name,
                product_count: 1,
                image: p.image || CATEGORY_IMAGE_FALLBACKS[name] || CATEGORY_IMAGE_FALLBACKS["Birthday Cakes"],
              });
            } else {
              seen.get(name).product_count += 1;
            }
          });
          setShopCategories(Array.from(seen.values()));
        }
        setCatalogError("");
      })
      .catch(() => {
        if (cancelled) return;
        setCatalog([]);
        setShopCategories([]);
        setCatalogError("Unable to load cakes. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setCatalogLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const openProduct = (p, { pushUrl = true } = {}) => {
    if (!p) return;
    setProductNotFound(false);
    setProduct(p);
    if (pushUrl) {
      const next = productPath(p);
      try {
        if ((window.location.pathname || "") !== next) {
          window.history.pushState({ product: true }, "", next);
        }
      } catch (_) { /* ignore */ }
    }
  };

  const closeProduct = () => {
    setProduct(null);
    setProductNotFound(false);
    try {
      const path = window.location.pathname || "";
      if (parseProductPath(path)) {
        window.history.pushState({}, "", "/");
      }
    } catch (_) { /* ignore */ }
  };

  // Deep-link: /products/:slugOrId opens product modal (or not-found).
  useEffect(() => {
    if (catalogLoading) return;

    const resolveFromPath = () => {
      const key = parseProductPath(window.location.pathname || "");
      if (!key) {
        setProductNotFound(false);
        return;
      }
      const bySlug = catalog.find((p) => p.slug && p.slug === key);
      const byId = catalog.find((p) => String(p.id) === String(key));
      const found = bySlug || byId;
      if (found) {
        openProduct(found, { pushUrl: false });
        return;
      }
      const loader = /^\d+$/.test(key)
        ? fetchProduct(key)
        : fetchProductBySlug(key);
      loader
        .then((data) => openProduct(normalizeProduct(data), { pushUrl: false }))
        .catch(() => {
          setProduct(null);
          setProductNotFound(true);
        });
    };

    resolveFromPath();
    const onPop = () => {
      const key = parseProductPath(window.location.pathname || "");
      if (!key) {
        setProduct(null);
        setProductNotFound(false);
        return;
      }
      resolveFromPath();
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [catalogLoading, catalog]);

  useEffect(() => {
    const syncPolicy = () => {
      setPolicySlug(policyFromPath(window.location.pathname)?.slug || null);
    };
    window.addEventListener("popstate", syncPolicy);
    return () => window.removeEventListener("popstate", syncPolicy);
  }, []);

  // Document head: public vs private surfaces + product detail.
  useEffect(() => {
    const path = window.location.pathname || "/";
    const privateUi = Boolean(
      adminOpen || authOpen || cartOpen || checkoutOpen || orderHistoryOpen || productNotFound || isPrivatePath(path)
    );

    if (product && !privateUi) {
      const desc = plainText(
        product.short_description || product.description || `${product.name} from pinkbakes.`,
        160
      );
      const crumbs = [
        { name: "Home", path: "/" },
        { name: product.category || "Cakes", path: "/#cakes" },
        { name: product.name, path: productPath(product) },
      ];
      setPageMeta({
        title: `${product.name} | pinkbakes`,
        description: desc,
        canonical: productPath(product),
        robots: "index,follow",
        image: product.main_image || product.image || "",
        type: "product",
        jsonLd: [
          buildOrganizationJsonLd({ email: CONTACT_EMAIL, telephone: WHATSAPP_NUMBER }),
          buildWebSiteJsonLd(),
          buildBreadcrumbJsonLd(crumbs),
          buildProductJsonLd(product),
        ],
      });
      return;
    }

    if (productNotFound) {
      setPageMeta({
        title: "Cake not found | pinkbakes",
        description: "This cake is unavailable or no longer listed.",
        canonical: path,
        robots: "noindex,follow",
        jsonLd: [],
      });
      return;
    }

    const policy = POLICIES[policySlug] || policyFromPath(path);
    if (policy && !privateUi) {
      setPageMeta({
        title: `${policy.title} | pinkbakes`,
        description: policy.summary,
        canonical: policy.path,
        robots: "index,follow",
        jsonLd: [
          buildOrganizationJsonLd({ email: CONTACT_EMAIL, telephone: WHATSAPP_NUMBER }),
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: policy.title, path: policy.path },
          ]),
        ],
      });
      return;
    }

    if (privateUi) {
      setPageMeta({
        title: adminOpen ? "Admin | pinkbakes" : "pinkbakes",
        description: "pinkbakes - handcrafted cakes for birthdays, anniversaries, weddings, and custom celebrations.",
        canonical: SITE_URL + "/",
        robots: "noindex,nofollow",
        jsonLd: [],
      });
      return;
    }

    setPageMeta({
      title: "pinkbakes - Cakes for Every Moment",
      description: "pinkbakes - handcrafted cakes for birthdays, anniversaries, weddings, and custom celebrations.",
      canonical: "/",
      robots: "index,follow",
      image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&q=85",
      jsonLd: [
        buildOrganizationJsonLd({ email: CONTACT_EMAIL, telephone: WHATSAPP_NUMBER }),
        buildWebSiteJsonLd(),
      ],
    });
  }, [product, productNotFound, adminOpen, authOpen, cartOpen, checkoutOpen, orderHistoryOpen, catalogLoading, policySlug]);

  const filtered = useMemo(() => {
    const needle = (search || "").toLowerCase();
    const selected = (category || "").trim().toLowerCase();
    return catalog.filter((p) => {
      const pc = String(p.category || "").trim().toLowerCase();
      const catOk = category === "All Cakes" || pc === selected;
      return catOk && String(p.name || "").toLowerCase().includes(needle);
    });
  }, [category, search, catalog]);

  const cartCount = cart.reduce((n, item) => n + item.qty, 0);
  const cartTotal = cart.reduce((n, item) => n + item.price * item.qty, 0);
  const couponDiscountPreview = Number(appliedCoupon?.discount_amount || 0);
  const deliveryFeePreview = deliveryQuote?.eligible ? Number(deliveryQuote.delivery_fee || 0) : 0;
  const checkoutPayable = Math.max(0, cartTotal - couponDiscountPreview + (deliveryQuote?.eligible ? deliveryFeePreview : 0));

  function notify(message) {
    setToast(message);
    setTimeout(() => setToast(""), 2200);
  }

  function resolveBakeryCoords() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Location is not supported on this device."));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => reject(new Error(err.message || "Unable to read your current location.")),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
      );
    });
  }

  async function shareBakeryLocationOnWhatsApp() {
    try {
      const { lat, lng } = await resolveBakeryCoords();
      const mapsUrl = getMapsUrl(lat, lng);
      const msg = "Visit " + BAKERY_LOCATION.label + " - my current location: " + mapsUrl;
      window.open("https://wa.me/?text=" + encodeURIComponent(msg), "_blank", "noopener,noreferrer");
      setBakeryLocationOpen(false);
    } catch (e) {
      notify(e.message || "Location permission is required to share.");
    }
  }

  async function openBakeryInGoogleMaps() {
    try {
      const { lat, lng } = await resolveBakeryCoords();
      window.open(getMapsUrl(lat, lng), "_blank", "noopener,noreferrer");
      setBakeryLocationOpen(false);
    } catch (e) {
      notify(e.message || "Location permission is required to open Maps.");
    }
  }


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

  function isOutOfStock(p) {
    const available = Number(p?.available_quantity ?? p?.stock_remaining ?? 0);
    return (p?.availability === "out_of_stock") || available <= 0;
  }

  function addToCart(p) {
    if (isOutOfStock(p)) {
      notify("This cake is currently out of stock.");
      return;
    }
    const available = Number(p.available_quantity ?? p.stock_remaining ?? 0);
    setCart(prev => {
      const found = prev.find(x => x.id === p.id);
      const nextQty = found ? found.qty + 1 : 1;
      if (available > 0 && nextQty > available) {
        notify(`Only ${available} units of "${p.name}" are currently available.`);
        return prev;
      }
      if (found) return prev.map(x => x.id === p.id ? {...x, qty: nextQty} : x);
      return [...prev, {...p, qty: 1, size: "1 kg"}];
    });
    notify(`${p.name} added to your cart`);
  }

  async function changeQty(id, delta) {
    const current = cart.find(x => x.id === id);
    if (!current) return;
    const nextQty = current.qty + delta;
    if (nextQty <= 0) {
      setCart(prev => prev.filter(x => x.id !== id));
      return;
    }
    try {
      const result = await validateCart({ items: [{ id, quantity: nextQty }] });
      if (!result.valid) {
        notify(result.detail || "Not enough stock for that quantity.");
        return;
      }
      const available = result.items?.[0]?.available ?? current.available_quantity;
      setCart(prev => prev.map(x => x.id === id ? {...x, qty: nextQty, available_quantity: available} : x));
    } catch (error) {
      notify(error.message || "Unable to validate cart quantity.");
    }
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


  const REFUND_PENDING_STATUSES = ["requested", "pending", "processing"];

  function isRefundPendingStatus(status) {
    return REFUND_PENDING_STATUSES.includes(String(status || "").toLowerCase());
  }

  function refundOrderLabel(r) {
    if (!r) return "-";
    if (r.order_number) return r.order_number;
    if (r.order_id != null && r.order_id !== "") return String(r.order_id);
    if (r.order && typeof r.order === "object" && r.order.order_number) return r.order.order_number;
    if (r.order != null && r.order !== "") return String(r.order);
    return "-";
  }

  function buildRefundTableRows(refunds) {
    const list = Array.isArray(refunds) ? refunds : [];
    if (list.length === 0) {
      return (
        <tr key="empty"><td colSpan={7}><div className="admin-empty">No refunds yet.</div></td></tr>
      );
    }
    // When showing all, group pending (requested|pending|processing) above the rest.
    const groupClientSide = !adminRefundFilter;
    const pending = groupClientSide ? list.filter((r) => isRefundPendingStatus(r.status)) : [];
    const other = groupClientSide ? list.filter((r) => !isRefundPendingStatus(r.status)) : list;
    const renderRow = (r) => (
      <tr key={r.id}>
        <td>{r.id}</td>
        <td>{refundOrderLabel(r)}</td>
        <td>Rs.{Number(r.amount || 0).toLocaleString("en-IN")}</td>
        <td>{r.status}</td>
        <td>{r.initiated_by_type || "-"}</td>
        <td>{r.reason || "-"}</td>
        <td>{r.gateway_refund_id || "-"}</td>
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
      pending.forEach((r) => rows.push(renderRow(r)));
    }
    if (other.length) {
      rows.push(
        <tr key="other-group-hdr">
          <td colSpan={7}><strong>{pending.length ? "Completed / other" : "Refunds"}</strong></td>
        </tr>
      );
      other.forEach((r) => rows.push(renderRow(r)));
    }
    return rows;
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
        fetchAdminEmployees().then((d) => setAdminEmployees(Array.isArray(d) ? d : (d.results || []))),
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

  function resetEmployeeForm() {
    setAdminEmployeeForm({
      employee_id: "",
      name: "",
      contact_number: "",
      email: "",
      photo: "",
      status: "ACTIVE",
    });
    setAdminEmployeeEditingId(null);
    setAdminEmployeeMessage("");
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
        const assignable = list.filter((e) => e.status === "ACTIVE" || e.status === "AVAILABLE");
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

  function handleEmployeeFormSubmit(e) {
    e.preventDefault();
    setAdminEmployeeMessage("");
    const payload = {
      employee_id: adminEmployeeForm.employee_id.trim(),
      name: adminEmployeeForm.name.trim(),
      contact_number: adminEmployeeForm.contact_number.trim(),
      email: (adminEmployeeForm.email || "").trim(),
      photo: (adminEmployeeForm.photo || "").trim(),
      status: adminEmployeeForm.status || "ACTIVE",
    };
    const req = adminEmployeeEditingId
      ? updateAdminEmployee(adminEmployeeEditingId, payload)
      : createAdminEmployee(payload);
    req
      .then(() => {
        setAdminEmployeeMessage(adminEmployeeEditingId ? "Employee updated." : "Employee created.");
        resetEmployeeForm();
        loadAdminSectionData("employees");
      })
      .catch((err) => setAdminEmployeeMessage(err.message || "Could not save employee."));
  }

  function startEditEmployee(emp) {
    setAdminEmployeeEditingId(emp.id);
    setAdminEmployeeForm({
      employee_id: emp.employee_id || "",
      name: emp.name || "",
      contact_number: emp.contact_number || "",
      email: emp.email || "",
      photo: emp.photo || "",
      status: emp.status || "ACTIVE",
    });
    setAdminEmployeeMessage("");
  }


  function resetAuthForm() {
    setAuthForm({
      first_name: "",
      last_name: "",
      username: "",
      email: "",
      mobile_number: "",
      password: ""
    });
    setVerificationCode("");
    setVerificationData(null);
    setAuthMessage("");
  }

  function handleAuthSubmit(e) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthMessage("");

    const payload = authMode === "signup"
      ? {
          first_name: authForm.first_name,
          last_name: authForm.last_name,
          username: authForm.username,
          email: authForm.email,
          mobile_number: authForm.mobile_number,
          password: authForm.password
        }
      : {
          username: authForm.username,
          password: authForm.password
        };

    const request = authMode === "signup" ? signUp(payload) : signIn(payload);

    request
      .then(data => {
        if (authMode === "signup") {
          setVerificationData({
            email: authForm.email,
            token: "",
            link: "",
            otp: "",
            user: data.user || null
          });
          setVerificationMethod("email");
          setVerificationCode("");
          setAuthStage("verification");
          setAuthMessage(data.message || "Your account was created. Check your email for the verification link and code.");
          setAuthForm(prev => ({ ...prev, password: "" }));
          return;
        }

        localStorage.setItem("pinkbakes_token", data.token);
        setUser(data.user);
        setAuthOpen(false);
        resetAuthForm();
        notify("Welcome back!");
      })
      .catch(error => {
        setAuthMessage(error.message || "Something went wrong.");
      })
      .finally(() => setAuthLoading(false));
  }

  function handleOtpLoginRequest(e) {
    e.preventDefault();
    const mobile = authForm.mobile_number.trim();
    if (!mobile) {
      setAuthMessage("Please enter your registered mobile number.");
      return;
    }

    setAuthLoading(true);
    setAuthMessage("");
    requestLoginOtp({ mobile })
      .then(data => {
        setAuthMessage(data.message || "OTP sent successfully.");
        setVerificationCode("");
        setAuthMode("otp");
      })
      .catch(error => {
        setAuthMessage(error.message || "Unable to send OTP right now.");
      })
      .finally(() => setAuthLoading(false));
  }

  function handleOtpLoginSubmit(e) {
    e.preventDefault();
    const mobile = authForm.mobile_number.trim();
    if (!mobile) {
      setAuthMessage("Please enter your registered mobile number.");
      return;
    }
    if (!verificationCode.trim()) {
      setAuthMessage("Please enter the OTP sent to your mobile number.");
      return;
    }

    setAuthLoading(true);
    setAuthMessage("");
    verifyLoginOtp({ mobile, otp: verificationCode })
      .then(data => {
        localStorage.setItem("pinkbakes_token", data.token);
        setUser(data.user);
        setAuthOpen(false);
        resetAuthForm();
        notify("Logged in with OTP!");
      })
      .catch(error => {
        setAuthMessage(error.message || "OTP login failed.");
      })
      .finally(() => setAuthLoading(false));
  }

  function handleForgotPassword(e) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthMessage("");

    forgotPassword({ email: forgotEmail })
      .then((data) => {
        setAuthMessage(data.message || "If an account exists with this email address, a password reset link has been sent.");
        setForgotEmail("");
      })
      .catch((error) => {
        setAuthMessage(error.message || "Unable to send a password reset link right now.");
      })
      .finally(() => setAuthLoading(false));
  }

  function handleVerifyResetToken(tokenValue) {
    return verifyResetToken({ token: tokenValue })
      .then(() => true)
      .catch(() => false);
  }

  function handleResetPasswordSubmit(e) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthMessage("");

    if (!resetToken.trim()) {
      setAuthMessage("This password reset link is invalid or has expired.");
      setAuthLoading(false);
      return;
    }

    if (resetPasswordForm.password.length < 8) {
      setAuthMessage("Password must be at least 8 characters long.");
      setAuthLoading(false);
      return;
    }

    if (resetPasswordForm.password !== resetPasswordForm.confirm_password) {
      setAuthMessage("Passwords do not match.");
      setAuthLoading(false);
      return;
    }

    resetPassword({
      token: resetToken,
      password: resetPasswordForm.password,
      confirm_password: resetPasswordForm.confirm_password,
    })
      .then((data) => {
        setAuthMessage(data.message || "Your password has been reset successfully.");
        setResetPasswordForm({ password: "", confirm_password: "" });
        setAuthFlow("success");
      })
      .catch((error) => {
        setAuthMessage(error.message || "Unable to reset your password.");
      })
      .finally(() => setAuthLoading(false));
  }

  function handleVerificationAction(action) {
    if (!verificationData?.email) {
      setAuthMessage("Please complete signup again to generate a verification request.");
      return;
    }

    if (action === "send") {
      setAuthLoading(true);
      sendVerification({ email: verificationData.email, method: verificationMethod })
        .then(data => {
          setVerificationData({
            email: verificationData.email,
            token: "",
            link: "",
            otp: "",
            user: verificationData.user,
          });
          setVerificationCode("");
          setAuthMessage(data.message || `A new ${verificationMethod === "email" ? "email link" : "OTP"} has been sent. Check your inbox.`);
        })
        .catch(error => setAuthMessage(error.message || "Verification request failed."))
        .finally(() => setAuthLoading(false));
      return;
    }

    if (verificationMethod === "email") {
      const token = (verificationCode || verificationData.token || "").trim();
      if (!token) {
        setAuthMessage("Paste the verification token from your email link, or open the link from your inbox.");
        return;
      }

      setAuthLoading(true);
      verifyEmail({ token })
        .then(() => {
          setAuthMessage("Email verified successfully. You can now sign in.");
          setAuthStage("form");
          setAuthMode("signin");
          setAuthForm(prev => ({ ...prev, username: verificationData.user?.username || prev.username, email: verificationData.email }));
          setVerificationData(null);
        })
        .catch(error => setAuthMessage(error.message || "Email verification failed."))
        .finally(() => setAuthLoading(false));
      return;
    }

    if (!verificationCode.trim()) {
      setAuthMessage("Enter the OTP sent to your mobile number.");
      return;
    }

    setAuthLoading(true);
    verifyOtp({ email: verificationData.email, otp: verificationCode })
      .then(() => {
        setAuthMessage("Mobile verification successful. You can now sign in.");
        setAuthStage("form");
        setAuthMode("signin");
        setAuthForm(prev => ({ ...prev, username: verificationData.user?.username || prev.username, email: verificationData.email }));
        setVerificationData(null);
      })
      .catch(error => setAuthMessage(error.message || "OTP verification failed."))
      .finally(() => setAuthLoading(false));
  }

  function getChatbotReply(inputText) {
    const names = (catalog || []).map((item) => item.name).filter(Boolean);
    return matchChatbotFaq(inputText, names).answer;
  }

  function scrollChatToBottom() {
    const el = chatMessagesRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }

  useEffect(() => {
    if (!chatOpen) return;
    // Scroll .chatbot-messages after open / FAQ reply paint (Shipping, Return, Help Desk).
    const id = requestAnimationFrame(() => {
      scrollChatToBottom();
      requestAnimationFrame(scrollChatToBottom);
    });
    return () => cancelAnimationFrame(id);
  }, [chatOpen, chatMessages]);
  // Escape closes Help Desk while open (same as X); listener removed on close/unmount.
  useEffect(() => {
    if (!chatOpen) return;
    const onKey = (event) => {
      if (event.key === "Escape") setChatOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [chatOpen]);

  function sendChatMessage(text) {
    const trimmed = (text || "").trim();
    if (!trimmed) return;
    setChatMessages((prev) => [...prev, { sender: "user", text: trimmed }]);
    setChatInput("");
    const response = getChatbotReply(trimmed);
    setTimeout(() => {
      setChatMessages((prev) => [...prev, { sender: "bot", text: response }]);
      // After bot reply paints, scroll .chatbot-messages so the latest answer is visible.
      requestAnimationFrame(() => {
        scrollChatToBottom();
        requestAnimationFrame(scrollChatToBottom);
      });
    }, 220);
  }

  function openHelpDesk() {
    setChatOpen(true);
    // Open alone (no seeded FAQ): still show the latest messages at the bottom.
    requestAnimationFrame(() => {
      scrollChatToBottom();
      requestAnimationFrame(scrollChatToBottom);
    });
  }

  /** Open the same Help Desk / PinkBakes Assistant and optionally seed an FAQ question. */
  function openHelpDeskTopic(prompt) {
    setChatOpen(true);
    const trimmed = (prompt || "").trim();
    if (trimmed) {
      // Defer so the dock opens before the seeded message lands.
      setTimeout(() => sendChatMessage(trimmed), 0);
    } else {
      requestAnimationFrame(() => {
        scrollChatToBottom();
        requestAnimationFrame(scrollChatToBottom);
      });
    }
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

  function handleChatSubmit(e) {
    e.preventDefault();
    sendChatMessage(chatInput);
  }

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
      .then((response) => {
        const items = Array.isArray(response?.results) ? response.results : Array.isArray(response) ? response : [];
        setOrders(items);
        setOrderHistoryOpen(true);
      })
      .catch(() => { setOrders([]); setOrderHistoryOpen(true); });

    // loadUserOrders prefs + in-app notifications
    fetchNotificationPreferences(token)
      .then((data) => setNotificationPrefs(data))
      .catch(() => {});
    fetchInAppNotifications(token, { limit: 20 })
      .then((data) => {
        setInAppNotifications(Array.isArray(data?.results) ? data.results : []);
        setNotifUnreadCount(data?.unread_count || 0);
      })
      .catch(() => {});
  }


  function handleApplyCoupon() {
    const token = localStorage.getItem("pinkbakes_token");
    if (!token || !user) {
      setCouponMessage("Please sign in to apply a coupon.");
      return;
    }
    const code = (couponCodeInput || "").trim();
    if (!code) {
      setCouponMessage("Enter a coupon code.");
      return;
    }
    if (!cart.length) {
      setCouponMessage("Your cart is empty.");
      return;
    }
    setCouponLoading(true);
    setCouponMessage("");
    validateCoupon({
      code,
      items: cart.map(item => ({ id: item.id, quantity: item.qty || 1 })),
    }, token)
      .then((data) => {
        if (!data?.valid) {
          setAppliedCoupon(null);
          setCouponMessage(data?.message || "Invalid coupon.");
          return;
        }
        setAppliedCoupon({
          code: data.code,
          discount_type: data.discount_type,
          discount_amount: Number(data.discount_amount || 0),
        });
        setCouponMessage(data.message || "Coupon applied.");
        refreshDeliveryQuote(checkoutForm.postal_code, selectedAddressId, checkoutForm.shipping_latitude, checkoutForm.shipping_longitude);
      })
      .catch((error) => {
        setAppliedCoupon(null);
        setCouponMessage(error.message || "Unable to validate coupon.");
      })
      .finally(() => setCouponLoading(false));
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null);
    setCouponCodeInput("");
    setCouponMessage("");
  }

  function loadAdminCoupons() {
    fetchAdminCoupons()
      .then((data) => setAdminCoupons(data.results || []))
      .catch((error) => setAdminCouponMessage(error.message || "Unable to load coupons."));
  }

  function handleCreateAdminCoupon(e) {
    e.preventDefault();
    setAdminCouponMessage("");
    createAdminCoupon({
      code: adminCouponForm.code,
      name: adminCouponForm.name,
      discount_type: adminCouponForm.discount_type,
      discount_value: adminCouponForm.discount_value,
      is_active: !!adminCouponForm.is_active,
      applies_to: "all",
    })
      .then(() => {
        setAdminCouponMessage("Coupon created.");
        setAdminCouponForm({ code: "", name: "", discount_type: "percentage", discount_value: "10", is_active: true });
        loadAdminCoupons();
      })
      .catch((error) => setAdminCouponMessage(error.message || "Could not create coupon."));
  }

  function handleToggleAdminCoupon(coupon) {
    updateAdminCoupon(coupon.id, { is_active: !coupon.is_active })
      .then(() => loadAdminCoupons())
      .catch((error) => setAdminCouponMessage(error.message || "Could not update coupon."));
  }

  function loadSavedAddresses() {
    const token = localStorage.getItem("pinkbakes_token");
    if (!token) return;
    fetchAddresses(token)
      .then((data) => {
        const list = data.results || [];
        setSavedAddresses(list);
        const def = list.find(a => a.is_default) || list[0];
        if (def) {
          applyAddressToCheckout(def);
        }
      })
      .catch(() => setSavedAddresses([]));
  }

  function applyAddressToCheckout(addr) {
    if (!addr) return;
    setSelectedAddressId(addr.id);
    setShowNewAddressForm(false);
    setCheckoutForm(prev => ({
      ...prev,
      customer_name: addr.full_name || prev.customer_name,
      customer_mobile: addr.mobile_number || prev.customer_mobile,
      shipping_address: addr.address_line_1 || "",
      shipping_address_2: addr.address_line_2 || "",
      landmark: addr.landmark || "",
      city: addr.city || "",
      state: addr.state || "",
      postal_code: addr.postal_code || "",
      country: addr.country || "India",
      shipping_latitude: addr.latitude != null ? String(addr.latitude) : "",
      shipping_longitude: addr.longitude != null ? String(addr.longitude) : "",
    }));
    refreshDeliveryQuote(addr.postal_code, addr.id, addr.latitude, addr.longitude);
  }

  function refreshDeliveryQuote(postalCode, addressId, lat, lng) {
    const token = localStorage.getItem("pinkbakes_token");
    if (!token) return;
    const pin = (postalCode || checkoutForm.postal_code || "").trim();
    if (!pin || cart.length === 0) {
      setDeliveryQuote(null);
      return;
    }
    const payload = {
      postal_code: pin,
      items: cart.map(item => ({ id: item.id, quantity: item.qty || 1 })),
      ...(appliedCoupon?.code ? { coupon_code: appliedCoupon.code } : {}),
      ...(addressId ? { address_id: addressId } : {}),
      ...(lat != null && lat !== "" ? { shipping_latitude: lat } : {}),
      ...(lng != null && lng !== "" ? { shipping_longitude: lng } : {}),
    };
    quoteDelivery(payload, token)
      .then((data) => {
        setDeliveryQuote(data);
        setDeliveryQuoteMessage(data.message || "");
      })
      .catch((error) => {
        setDeliveryQuote(null);
        setDeliveryQuoteMessage(error.message || "Unable to quote delivery.");
      });
  }

  function handleSaveNewAddress() {
    const token = localStorage.getItem("pinkbakes_token");
    if (!token) return;
    const payload = {
      full_name: checkoutForm.customer_name || `${user?.first_name || ""} ${user?.last_name || ""}`.trim() || user?.username || "Customer",
      mobile_number: checkoutForm.customer_mobile || user?.mobile_number || "",
      address_line_1: checkoutForm.shipping_address,
      address_line_2: checkoutForm.shipping_address_2 || "",
      landmark: checkoutForm.landmark || "",
      city: checkoutForm.city,
      state: checkoutForm.state,
      postal_code: checkoutForm.postal_code,
      country: checkoutForm.country || "India",
      latitude: checkoutForm.shipping_latitude || null,
      longitude: checkoutForm.shipping_longitude || null,
      address_type: "HOME",
      is_default: savedAddresses.length === 0,
    };
    createAddress(payload, token)
      .then((addr) => {
        setSavedAddresses(prev => [addr, ...prev.filter(a => a.id !== addr.id)]);
        applyAddressToCheckout(addr);
        notify("Address saved");
      })
      .catch((error) => setCheckoutMessage(error.message || "Unable to save address."));
  }

  function loadAdminDeliveryZones() {
    fetchAdminDeliveryZones()
      .then((data) => setAdminZones(data.results || []))
      .catch((error) => setAdminDeliveryMessage(error.message || "Unable to load zones."));
    fetchAdminDeliverySettings()
      .then((data) => setAdminDeliverySettings(data))
      .catch(() => {});
  }

  function handleCreateAdminZone(e) {
    e.preventDefault();
    setAdminDeliveryMessage("");
    const pins = (adminZoneForm.postal_codes || "").split(/[,\s]+/).map(s => s.trim()).filter(Boolean);
    createAdminDeliveryZone({
      name: adminZoneForm.name,
      postal_codes: pins,
      delivery_charge: adminZoneForm.delivery_charge,
      minimum_order_amount: adminZoneForm.minimum_order_amount || "0",
      free_delivery_threshold: adminZoneForm.free_delivery_threshold || null,
      is_active: !!adminZoneForm.is_active,
    })
      .then(() => {
        setAdminDeliveryMessage("Zone created.");
        setAdminZoneForm({ name: "", postal_codes: "", delivery_charge: "50", minimum_order_amount: "0", free_delivery_threshold: "", is_active: true });
        loadAdminDeliveryZones();
      })
      .catch((error) => setAdminDeliveryMessage(error.message || "Could not create zone."));
  }

  function toggleAdminZone(zone) {
    updateAdminDeliveryZone(zone.id, { is_active: !zone.is_active })
      .then(() => loadAdminDeliveryZones())
      .catch((error) => setAdminDeliveryMessage(error.message || "Could not update zone."));
  }

  function openCheckout() {
    if (!user) {
      setAuthOpen(true);
      setAuthMode("signin");
      setAuthMessage("Please sign in to continue to checkout.");
      return;
    }

    if (cart.length === 0) {
      notify("Add at least one cake to your cart before checking out.");
      return;
    }

    setCheckoutMessage("");
    setCouponCodeInput("");
    setAppliedCoupon(null);
    setCouponMessage("");
    setDeliveryQuote(null);
    setDeliveryQuoteMessage("");
    setShowNewAddressForm(false);
    setCheckoutOpen(true);
    loadSavedAddresses();
  }

  function handleCheckoutSubmit(e) {
    e.preventDefault();
    const token = localStorage.getItem("pinkbakes_token");
    if (!token || !user) {
      setCheckoutMessage("Please sign in to complete checkout.");
      return;
    }

    if (deliveryQuote && deliveryQuote.eligible === false) {
      setCheckoutMessage(deliveryQuote.message || "Delivery is not available for this address.");
      return;
    }

    const payload = {
      items: cart.map(item => ({ id: item.id, quantity: item.qty || 1 })),
      customer_name: checkoutForm.customer_name || `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.username,
      customer_email: checkoutForm.customer_email || user.email || "",
      customer_mobile: checkoutForm.customer_mobile || user.mobile_number || "",
      notes: checkoutForm.notes || "",
      ...(appliedCoupon?.code ? { coupon_code: appliedCoupon.code } : {}),
      ...(selectedAddressId
        ? { address_id: selectedAddressId }
        : {
            shipping_address: checkoutForm.shipping_address,
            shipping_address_2: checkoutForm.shipping_address_2,
            landmark: checkoutForm.landmark || "",
            city: checkoutForm.city,
            state: checkoutForm.state,
            postal_code: checkoutForm.postal_code,
            country: checkoutForm.country || "India",
            ...(checkoutForm.shipping_latitude ? { shipping_latitude: checkoutForm.shipping_latitude } : {}),
            ...(checkoutForm.shipping_longitude ? { shipping_longitude: checkoutForm.shipping_longitude } : {}),
          }),
    };

    setCheckoutLoading(true);
    setCheckoutMessage("");

    createPaymentSession(payload, token)
      .then(async (paymentInfo) => {
        const orderNumber = `PB-${Date.now()}`;
        await openRazorpayForPayment(paymentInfo, token, {
          orderId: paymentInfo.order_id,
          amountLabel: `Order ${orderNumber}`,
          successSummary: {
            orderNumber,
            amount: Number((paymentInfo.amount || 0) / 100),
          },
        });
      })
      .catch((error) => setCheckoutMessage(error.message || "Unable to start payment right now."))
      .finally(() => setCheckoutLoading(false));
  }

  function handleOpenOrder(orderId) {
    const token = localStorage.getItem("pinkbakes_token");
    if (!token) return;

    fetchOrder(orderId, token)
      .then((order) => {
        setSelectedOrder(order);
        setTrackingOrder(null);
      })
      .catch(() => setSelectedOrder(null));
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
      <header className="header">
        <button className="mobile-menu" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
          {mobileOpen ? <X/> : <Menu/>}
        </button>
        <div className="brand" onClick={() => scrollTo("home")}>
          <div className="brand-mark"><CakeSlice size={21}/></div>
          <div><strong>{BRAND_NAME}</strong><small>CAKES FOR EVERY MOMENT</small></div>
        </div>
        <nav className={mobileOpen ? "nav mobile-visible" : "nav"}>
          <button onClick={() => scrollTo("home")}>Home</button>
          <button onClick={() => scrollTo("cakes")}>Cakes</button>
          <button onClick={() => scrollTo("categories")}>Categories</button>
          <button onClick={() => scrollTo("custom")}>Custom Cakes</button>
          <button onClick={() => scrollTo("about")}>About Us</button>
          <button onClick={() => scrollTo("gallery")}>Gallery</button>
          <button onClick={() => scrollTo("contact")}>Contact</button>
        </nav>
        <div className="header-actions">
          <button type="button" className="icon-btn search-toggle" onClick={() => document.getElementById("search")?.focus()} aria-label="Search cakes" title="Search cakes">
            <Search/>
          </button>

          <button
            type="button"
            className="header-action account-btn"
            onClick={() => {
              if (user) {
                loadUserOrders();
                return;
              }
              setAuthMode("signin");
              setAuthStage("form");
              setAuthMessage("");
              setAuthOpen(true);
            }}
            aria-label="Open account"
            title={user ? `Signed in as ${user.first_name || user.username}` : "Sign in or sign up"}
          >
            <span className="action-icon"><UserRound size={16} /></span>
            <span className="action-label">{user ? "Orders" : "Sign in"}</span>
          </button>

          <button type="button" className="header-action cart-btn" onClick={() => setCartOpen(true)} aria-label="Open cart" title="Open cart">
            <span className="action-icon"><ShoppingBag size={16} /></span>
            <span className="action-label">Cart</span>
            <span className="cart-count">{cartCount}</span>
          </button>

          <button type="button" className="order-top" onClick={() => scrollTo("cakes")}>Order Now</button>
        </div>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-copy reveal">
            <span className="eyebrow">PREMIUM * FRESH * HANDCRAFTED</span>
            <h1>Beautiful Cakes,<br/>Made for Your<br/><em>Beautiful Moments</em></h1>
            <p>From birthdays to anniversaries, we create cakes that make your celebrations sweeter and your memories last longer.</p>
            <div className="hero-buttons">
              <button className="btn primary" onClick={() => scrollTo("cakes")}>Explore Cakes <ArrowRight size={16}/></button>
              <button className="btn secondary" onClick={() => scrollTo("custom")}>Order Your Cake</button>
            </div>
          </div>
          <div className="hero-image">
            <img src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1600&q=90" alt="Premium chocolate cake from pinkbakes" width="1600" height="1200" fetchpriority="high" />
            <div className="hero-note">Life is<br/><em>sweeter</em><br/>with cake</div>
          </div>
        </section>

        <section className="categories section" id="categories">
          <div className="section-head center">
            <span className="eyebrow">SHOP BY CATEGORY</span>
            <h2>Find the Perfect Cake for Every Occasion</h2>
          </div>
          <div className="category-grid">
            {catalogLoading && shopCategories.length === 0 ? (
              <div className="empty">Loading categories...</div>
            ) : shopCategories.length === 0 ? (
              <div className="empty">Categories will appear once cakes are published.</div>
            ) : shopCategories.map(({ name, image: img }) => (
              <button key={name} className="category-card" onClick={() => {setCategory(name); scrollTo("cakes")}}>
                <img src={img || CATEGORY_IMAGE_FALLBACKS[name] || CATEGORY_IMAGE_FALLBACKS["Birthday Cakes"]} alt={name} loading="lazy" width="600" height="400" /><span>{name}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="cakes-section section" id="cakes">
          <div className="section-head">
            <div><span className="eyebrow">OUR SIGNATURE CAKES</span><h2>Customer Favorites</h2></div>
            <button className="text-link" onClick={() => setCategory("All Cakes")}>View All Cakes <ArrowRight size={16}/></button>
          </div>

          <div className="catalog-toolbar">
            <div className="chips">
              {(["All Cakes", ...shopCategories.map((c) => c.name)].filter((c, i, arr) => arr.indexOf(c) === i)).map(c =>
                <button className={category === c ? "chip active" : "chip"} key={c} onClick={() => setCategory(c)}>{c}</button>
              )}
            </div>
            <div className="searchbox">
              <Search size={16}/><input id="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search cakes..."/>
            </div>
          </div>

          <div className="product-grid">
            {catalogLoading && catalog.length === 0 ? <div className="empty">Loading cakes...</div> : filtered.map(p => {
              const priceAfterDiscount = p.discounted_price || Number((p.price * (100 - (p.discount || 0)) / 100).toFixed(2));
              return (
                <article className="product-card" key={p.id}>
                  <div className="product-media">
                    <img src={p.image || "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1000&q=85"} alt={(p.name || "Cake") + " cake"} loading="lazy" width="600" height="750" />
                    {p.badge && <span className="badge">{p.badge}</span>}
                    <button
                      type="button"
                      className={wishlist.includes(String(p.id)) ? "heart active" : "heart"}
                      aria-label={wishlist.includes(String(p.id)) ? "Remove from wishlist" : "Add to wishlist"}
                      onClick={(e) => toggleWishlist(e, p)}
                    >
                      <Heart size={17} fill={wishlist.includes(String(p.id)) ? "currentColor" : "none"} />
                    </button>
                    <div className="product-media-actions">
                      <button type="button" className="quick-view" onClick={() => openProduct(p)}><ZoomIn size={15}/> Quick View</button>
                      <button type="button" className="view-3d" onClick={(e) => { e.stopPropagation(); setProduct3d(p); }}><Rotate3d size={15}/> 3D View</button>
                    </div>
                  </div>
                  <div className="product-body">
                    <div className="rating"><Star size={13} fill="currentColor"/>{Number(p.rating || 0).toFixed(1)}</div>
                    <h3>{p.name}</h3>
                    <p>{p.short_description || p.description || "Freshly baked for your special celebration."}</p>
                    <div className="price-row">
                      <strong>{formatCurrency(priceAfterDiscount)}</strong>
                      {p.discount > 0 && <span className="strike">{formatCurrency(p.price)}</span>}
                    </div>
                    {p.discount > 0 && <small className="discount-badge">{p.discount}% OFF</small>}
                    <div className="sizes"><span className={isOutOfStock(p) ? "stock-out" : (p.is_low_stock || p.availability === "low_stock" ? "stock-low" : "stock-ok")}>{stockLabel(p)}</span></div>
                    <div className="product-actions">
                      <button className="btn secondary small" onClick={() => openProduct(p)}>View Cake</button>
                      <button className="btn primary small" disabled={isOutOfStock(p)} onClick={() => addToCart(normalizeProduct(p))}>{isOutOfStock(p) ? "Out of Stock" : "Add to Cart"}</button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          {!catalogLoading && filtered.length === 0 && (
            <div className="empty">
              {catalog.length === 0
                ? "No cakes are currently available."
                : category === "All Cakes"
                  ? "No cakes match your search."
                  : `No cakes match "${category}" right now.`}
            </div>
          )}
          {catalogError && !catalogLoading && <div className="empty">{catalogError}</div>}
        </section>

        <section className="benefits section" id="about">
          {[
            [CakeSlice,"Freshly Baked","Every Day"],[Sparkles,"Premium","Ingredients"],[Heart,"Custom","Designs"],
            [Leaf,"Eggless","Options"],[CalendarDays,"Same Day / Advance","Ordering"],[ShieldCheck,"Hygienic","Preparation"]
          ].map(([Icon,a,b]) => <div className="benefit" key={a}><Icon/><b>{a}</b><span>{b}</span></div>)}
        </section>

                <section className="custom-banner section" id="custom">
          <div className="custom-image"><img src="https://images.unsplash.com/photo-1557925923-cd4648e211a0?auto=format&fit=crop&w=1100&q=85" alt="Custom celebration cake" loading="lazy" width="1100" height="800" /></div>
          <div className="custom-copy">
            <span className="eyebrow">DREAM IT * WE'LL BAKE IT</span>
            <h2>Create Your Custom Cake</h2>
            <p>Share a quick cake brief - occasion, size, flavor, and theme - and we'll reply on WhatsApp with ideas and pricing.</p>
            <form className="custom-brief" onSubmit={(e) => { e.preventDefault(); sendCustomBrief(); }}>
              <div className="custom-brief-row">
                <label>Occasion
                  <select value={customBrief.occasion} onChange={(e) => setCustomBrief({ ...customBrief, occasion: e.target.value })} required>
                    <option value="">Select occasion</option>
                    <option>Birthday</option>
                    <option>Wedding</option>
                    <option>Anniversary</option>
                    <option>Baby Shower</option>
                    <option>Corporate</option>
                    <option>Other</option>
                  </select>
                </label>
                <label>Servings
                  <select value={customBrief.servings} onChange={(e) => setCustomBrief({ ...customBrief, servings: e.target.value })}>
                    <option value="">Select size</option>
                    <option>6-8</option>
                    <option>10-12</option>
                    <option>15-20</option>
                    <option>25+</option>
                    <option>Not sure yet</option>
                  </select>
                </label>
              </div>
              <div className="custom-brief-row">
                <label>Flavor
                  <input type="text" placeholder="e.g. Chocolate, Red velvet" value={customBrief.flavor} onChange={(e) => setCustomBrief({ ...customBrief, flavor: e.target.value })} />
                </label>
                <label>Preferred date
                  <input type="date" value={customBrief.preferredDate} onChange={(e) => setCustomBrief({ ...customBrief, preferredDate: e.target.value })} />
                </label>
              </div>
              <label>Theme / idea
                <textarea rows={2} placeholder="Colors, character, photo cake, message..." value={customBrief.theme} onChange={(e) => setCustomBrief({ ...customBrief, theme: e.target.value })} />
              </label>
              <div className="custom-brief-row">
                <label>Your name
                  <input type="text" placeholder="Name" value={customBrief.name} onChange={(e) => setCustomBrief({ ...customBrief, name: e.target.value })} />
                </label>
                <label>Phone <span className="optional">(optional)</span>
                  <input type="tel" placeholder="WhatsApp number" value={customBrief.phone} onChange={(e) => setCustomBrief({ ...customBrief, phone: e.target.value })} />
                </label>
              </div>
              <div className="custom-brief-actions">
                <button type="submit" className="btn primary"><MessageCircle size={15}/> Send brief on WhatsApp</button>
                <button type="button" className="btn secondary" onClick={() => { setCategory("Custom Cakes"); scrollTo("cakes"); }}>Browse custom cakes</button>
              </div>
            </form>
          </div>
          <div className="custom-points">
            <span><Check/> Personalized Designs</span><span><Check/> Any Theme</span><span><Check/> Any Size</span><span><Check/> Delicious Flavours</span>
          </div>
        </section>

        <section className="reviews section">
          <div className="section-head center"><span className="eyebrow">KIND WORDS FROM OUR CUSTOMERS</span><h2>What Our Customers Say</h2></div>
          <div className="review-grid">
            {reviews.map(([name,text,tag],i) => <div className="review" key={name}>
              <div className="avatar">{name[0]}</div><p>"{text}"</p><div className="stars">*****</div><b>{name}</b><small>{tag}</small>
            </div>)}
          </div>
        </section>

        <section className="gallery section" id="gallery">
          <div className="section-head">
            <div>
              <span className="eyebrow">REAL CELEBRATION MOMENTS</span>
              <h2>Made to Be Shared</h2>
              <p className="gallery-lead">Birthday tables, wedding sweets, and weekend treats - cakes that look as good in photos as they taste in person. See how customers celebrate with pinkbakes.</p>
            </div>
            <button
              className="outline-pill gallery-cta"
              type="button"
              onClick={() => {
                const msg = "Hi PinkBakes! I want to share a cake moment from my celebration.";
                window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
              }}
            >
              <MessageCircle size={15}/> Share your cake moment
            </button>
          </div>
          <div className="gallery-grid">
            {[
              { src: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=85", alt: "Chocolate drip birthday cake with candles at a celebration table", caption: "Birthday" },
              { src: "https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=600&q=85", alt: "Elegant layered wedding cake with floral decoration", caption: "Wedding" },
              { src: "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=600&q=85", alt: "Assorted frosted cupcakes and cake bites for a party spread", caption: "Party treats" },
              { src: "https://images.unsplash.com/photo-1586788680434-30d324b2d46f?auto=format&fit=crop&w=600&q=85", alt: "Tall celebration cake with fresh berries and cream", caption: "Anniversary" },
              { src: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=600&q=85", alt: "Colorful layered cake slice served for a weekend treat", caption: "Weekend treat" },
              { src: "https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=600&q=85", alt: "Custom decorated cake ready for a special occasion", caption: "Custom order" }
            ].map((item) => (
              <figure className="gallery-item" key={item.src}>
                <img src={item.src} alt={item.alt} loading="lazy" width="600" height="600" />
                <figcaption className="gallery-caption">{item.caption}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="contact-strip section" id="contact">
          <button
            type="button"
            className="contact-card"
            onClick={() => setBakeryLocationOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={bakeryLocationOpen}
          >
            <span className="contact-card-icon contact-card-icon-bakery" aria-hidden="true">
              <MapPin size={22}/>
            </span>
            <span className="contact-card-body">
              <span className="contact-card-eyebrow">Come taste the sweetness</span>
              <b>Visit Our Bakery</b>
              <small>{BAKERY_LOCATION.hours}</small>
              <span className="contact-card-note">Share location or open maps</span>
            </span>
            <span className="contact-card-pill">Visit</span>
          </button>

          <a
            className="contact-card"
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noreferrer"
          >
            <span className="contact-card-icon contact-card-icon-wa" aria-hidden="true">
              <MessageCircle size={22}/>
            </span>
            <span className="contact-card-body">
              <span className="contact-card-eyebrow">Fastest replies</span>
              <b>WhatsApp Orders</b>
              <small>+91 {WHATSAPP_NUMBER}</small>
              <span className="contact-card-note">Custom cakes, status, and help</span>
            </span>
            <span className="contact-card-pill">Chat now</span>
          </a>

          <a
            className="contact-card"
            href={`mailto:${CONTACT_EMAIL}`}
          >
            <span className="contact-card-icon contact-card-icon-mail" aria-hidden="true">
              <Mail size={22}/>
            </span>
            <span className="contact-card-body">
              <span className="contact-card-eyebrow">We write back</span>
              <b>Email Us</b>
              <small>{CONTACT_EMAIL}</small>
              <span className="contact-card-note">Quotes, invoices, and feedback</span>
            </span>
            <span className="contact-card-pill">Send email</span>
          </a>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-top">
          <div className="footer-brand"><div className="brand-mark"><CakeSlice size={21}/></div><strong>{BRAND_NAME}</strong><small>CAKES FOR EVERY MOMENT</small><p>Handcrafted cakes made for life's sweetest celebrations.</p></div>
          <div><h4>Explore</h4><button onClick={() => scrollTo("cakes")}>Cakes</button><button onClick={() => scrollTo("categories")}>Categories</button><button onClick={() => scrollTo("custom")}>Custom Cakes</button><button onClick={() => scrollTo("gallery")}>Gallery</button></div>
          <div><h4>Company</h4><button type="button" onClick={() => scrollTo("about")}>About Us</button><button type="button" onClick={() => scrollTo("contact")}>Contact</button></div>
          <div className="newsletter"><h4>Subscribe for latest updates</h4><form onSubmit={subscribe}><input value={newsletter} onChange={e=>setNewsletter(e.target.value)} placeholder="Your email address" type="email" required/><button aria-label="Subscribe"><ArrowRight/></button></form>{newsletterDone && <span className="subscribed"><Check size={14}/> You're subscribed!</span>}<div className="social"><span className="social-icon" title="Instagram (link not configured)" aria-label="Instagram unavailable"><Instagram/></span><a className="social-icon" href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp PinkBakes" title="WhatsApp"><MessageCircle/></a><span className="social-icon" title="Favorites" aria-hidden="true"><Heart/></span></div></div>
        </div>
        <div className="footer-bottom"><span>(c) 2026 {BRAND_NAME}. All rights reserved.</span><span className="footer-bottom-links"><button type="button" className="footer-help-link" onClick={() => openPolicy("privacy")}>Privacy Policy</button><span className="footer-sep" aria-hidden="true"> | </span><button type="button" className="footer-help-link" onClick={() => openPolicy("terms")}>Terms & Conditions</button><span className="footer-sep" aria-hidden="true"> | </span><button type="button" className="footer-help-link" onClick={() => openPolicy("shipping")}>Shipping & Delivery</button><span className="footer-sep" aria-hidden="true"> | </span><button type="button" className="footer-help-link" onClick={() => openPolicy("refund")}>Refund Policy</button><span className="footer-sep" aria-hidden="true"> | </span><button type="button" className="footer-help-link" onClick={openHelpDesk}>HELP DESK – PinkBakes Assistant</button><span className="footer-sep" aria-hidden="true"> | </span><button type="button" className="footer-admin-link" onClick={openFooterAdmin} aria-label={isAdminLoggedIn ? "Open admin panel" : "Admin Login"} title={isAdminLoggedIn ? "Open admin panel" : "Admin Login"}>{isAdminLoggedIn ? "Admin" : "Admin Login"}</button></span></div>
        <div id="footer-scroll-room" ref={scrollRoomRef} aria-hidden="true" />
      </footer>

      {policySlug && POLICIES[policySlug] && (
        <PolicyPage policy={POLICIES[policySlug]} onClose={closePolicy} onOpen={openPolicy} />
      )}

      
      {bakeryLocationOpen && (
        <div className="bakery-visit-backdrop" onClick={() => setBakeryLocationOpen(false)} role="dialog" aria-modal="true" aria-labelledby="bakery-visit-title">
          <div className="bakery-visit-card" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="bakery-visit-close" onClick={() => setBakeryLocationOpen(false)} aria-label="Close"><X size={18}/></button>
            <div className="bakery-visit-hero">
              <div className="bakery-visit-hero-glow" aria-hidden="true" />
              <div className="bakery-visit-badge"><CakeSlice size={22}/></div>
              <p className="bakery-visit-eyebrow">Come taste the sweetness</p>
              <h3 id="bakery-visit-title">Visit Our Bakery</h3>
              <p className="bakery-visit-place">{BAKERY_LOCATION.label}</p>
            </div>
            <div className="bakery-visit-body">
              <div className="bakery-visit-meta">
                <div className="bakery-visit-chip">
                  <CalendarDays size={15}/>
                  <span>{BAKERY_LOCATION.hours}</span>
                </div>
                <div className="bakery-visit-chip soft">
                  <MapPin size={15}/>
                  <span>Uses your current location</span>
                </div>
              </div>
              <p className="bakery-visit-hint">Share your pin on WhatsApp or open maps so friends can find you near the bakery.</p>
              <div className="bakery-visit-actions">
                <button type="button" className="bakery-visit-tile bakery-visit-wa" onClick={shareBakeryLocationOnWhatsApp}>
                  <span className="bakery-visit-tile-icon"><MessageCircle size={22}/></span>
                  <span className="bakery-visit-tile-copy">
                    <strong>Share on WhatsApp</strong>
                    <small>Send your live location link</small>
                  </span>
                  <ArrowRight size={16} className="bakery-visit-tile-arrow"/>
                </button>
                <button type="button" className="bakery-visit-tile bakery-visit-maps" onClick={openBakeryInGoogleMaps}>
                  <span className="bakery-visit-tile-icon"><MapPin size={22}/></span>
                  <span className="bakery-visit-tile-copy">
                    <strong>Open in Google Maps</strong>
                    <small>Navigate from where you are</small>
                  </span>
                  <ArrowRight size={16} className="bakery-visit-tile-arrow"/>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {product && <ProductModal product={product} onClose={closeProduct} onAdd={() => {addToCart(product); closeProduct()}} stockLabel={stockLabel} isOutOfStock={isOutOfStock}/>}
      {product3d && (
        <Suspense fallback={null}>
          <Product3DViewer product={product3d} onClose={() => setProduct3d(null)} />
        </Suspense>
      )}

      {productNotFound && (
        <div className="modal-backdrop" onClick={closeProduct} role="dialog" aria-label="Cake not found">
          <div className="product-modal" style={{maxWidth: 480, padding: "2rem", textAlign: "center"}} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeProduct} aria-label="Close"><X/></button>
            <h1 style={{fontSize: "1.5rem", marginBottom: "0.75rem"}}>Cake not found</h1>
            <p style={{marginBottom: "1.25rem"}}>This cake is unavailable or no longer listed.</p>
            <button type="button" className="btn primary" onClick={() => { closeProduct(); scrollTo("cakes"); }}>Browse cakes</button>
          </div>
        </div>
      )}

      {adminOpen && !isAdminLoggedIn && (
        <div className="admin-modal-backdrop" onClick={() => { setAdminOpen(false); try { if ((window.location.pathname || "").startsWith("/admin")) window.history.pushState({}, "", "/"); } catch (_) {} }}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-head">
              <h3>Admin Login</h3>
              <button type="button" onClick={() => { setAdminOpen(false); try { if ((window.location.pathname || "").startsWith("/admin")) window.history.pushState({}, "", "/"); } catch (_) {} }}><X/></button>
            </div>
            <form className="admin-form" onSubmit={handleAdminLogin}>
              <label>
                Admin username
                <input value={adminCredentials.username} onChange={e => setAdminCredentials(prev => ({ ...prev, username: e.target.value }))} placeholder="pinkbake" />
              </label>
              <label>
                Password
                <input type="password" value={adminCredentials.password} onChange={e => setAdminCredentials(prev => ({ ...prev, password: e.target.value }))} placeholder="pinkbake" />
              </label>
              {adminNotifications.length > 0 && (
                <div className="cart-summary" style={{ marginBottom: 12 }}>
                  <strong>Admin notification feed</strong>
                  <ul className="tracking-history" style={{ maxHeight: 120, overflow: "auto" }}>
                    {adminNotifications.slice(0, 6).map((n) => (
                      <li key={n.id}><span>{n.title}</span><small>{n.created_at ? new Date(n.created_at).toLocaleString() : ""}</small></li>
                    ))}
                  </ul>
                </div>
              )}
              {adminMessage && <span className="admin-error">{adminMessage}</span>}
              <button type="submit" className="btn primary full">Login</button>
            </form>
          </div>
        </div>
      )}

      {assignPickerOpen && (
        <div className="admin-modal-backdrop admin-assign-backdrop" onClick={closeAssignPicker}>
          <div className="admin-modal admin-assign-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="assign-delivery-title">
            <div className="admin-modal-head">
              <h3 id="assign-delivery-title">{adminOrderDetail?.delivery_employee ? "Reassign delivery" : "Assign delivery"}</h3>
              <button type="button" onClick={closeAssignPicker} aria-label="Close"><X/></button>
            </div>
            <div className="admin-form">
              {adminOrderDetail && (
                <p className="admin-muted" style={{ margin: 0 }}>
                  Order {adminOrderDetail.order_number}
                  {adminOrderDetail.delivery_employee
                    ? ` - currently ${adminOrderDetail.delivery_employee.name}`
                    : " - no employee assigned"}
                </p>
              )}
              {assignPickerLoading && <div className="admin-empty">Loading delivery employees...</div>}
              {!assignPickerLoading && assignPickerError && !assignPickerEmployees.length && (
                <span className="admin-error">{assignPickerError}</span>
              )}
              {!assignPickerLoading && !assignPickerEmployees.length && !assignPickerError && (
                <div className="admin-empty">No active/available delivery employees. Create one under Delivery first.</div>
              )}
              {!assignPickerLoading && assignPickerEmployees.length > 0 && (
                <label>
                  Delivery employee
                  <select
                    value={assignPickerSelectedId}
                    onChange={(e) => setAssignPickerSelectedId(e.target.value)}
                    disabled={assignPickerSubmitting}
                  >
                    <option value="">Select employee...</option>
                    {assignPickerEmployees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name} - #{e.id} ({e.employee_id}) - {e.status}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {assignPickerError && assignPickerEmployees.length > 0 && (
                <span className="admin-error">{assignPickerError}</span>
              )}
              <div className="admin-form-row" style={{ marginTop: 4 }}>
                <button type="button" className="btn secondary small" onClick={closeAssignPicker} disabled={assignPickerSubmitting}>Cancel</button>
                <button
                  type="button"
                  className="btn primary small"
                  onClick={confirmAssignPicker}
                  disabled={assignPickerLoading || assignPickerSubmitting || !assignPickerSelectedId}
                >
                  {assignPickerSubmitting ? "Assigning..." : (adminOrderDetail?.delivery_employee ? "Confirm reassign" : "Confirm assign")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {cancelModalOpen && (
        <div className="admin-modal-backdrop admin-ops-backdrop" onClick={closeCancelModal}>
          <div className="admin-modal admin-ops-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="cancel-order-title">
            <div className="admin-modal-head">
              <h3 id="cancel-order-title">Cancel order</h3>
              <button type="button" onClick={closeCancelModal} aria-label="Close" disabled={cancelModalSubmitting}><X/></button>
            </div>
            <div className="admin-form">
              {adminOrderDetail && (
                <p className="admin-muted" style={{ margin: 0 }}>
                  Order {adminOrderDetail.order_number} (#{adminOrderDetail.id}) - status {adminOrderDetail.status}
                </p>
              )}
              <label>
                Reason <span className="admin-muted">(optional)</span>
                <textarea
                  rows={3}
                  value={cancelModalReason}
                  onChange={(e) => setCancelModalReason(e.target.value)}
                  placeholder="Why is this order being cancelled?"
                  disabled={cancelModalSubmitting}
                />
              </label>
              {cancelModalError && <span className="admin-error">{cancelModalError}</span>}
              <div className="admin-form-row" style={{ marginTop: 4 }}>
                <button type="button" className="btn secondary small" onClick={closeCancelModal} disabled={cancelModalSubmitting}>Cancel</button>
                <button type="button" className="btn primary small" onClick={confirmCancelModal} disabled={cancelModalSubmitting}>
                  {cancelModalSubmitting ? "Cancelling..." : "Confirm cancel"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {refundModalOpen && (() => {
        const info = getAdminRefundableInfo(adminOrderDetail);
        return (
          <div className="admin-modal-backdrop admin-ops-backdrop" onClick={closeRefundModal}>
            <div className="admin-modal admin-ops-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="refund-order-title">
              <div className="admin-modal-head">
                <h3 id="refund-order-title">Refund</h3>
                <button type="button" onClick={closeRefundModal} aria-label="Close" disabled={refundModalSubmitting}><X/></button>
              </div>
              <div className="admin-form">
                {adminOrderDetail && (
                  <div className="admin-ops-summary">
                    <p className="admin-muted" style={{ margin: 0 }}>
                      Order {adminOrderDetail.order_number} (#{adminOrderDetail.id})
                    </p>
                    <p className="admin-muted" style={{ margin: 0 }}>
                      Payment: {info.paymentStatus || "-"}
                      {info.paymentAmount != null ? ` | original Rs.${Number(info.paymentAmount).toLocaleString("en-IN")}` : ""}
                    </p>
                    <p className="admin-muted" style={{ margin: 0 }}>
                      Max refundable (estimate): {info.maxRefundable != null ? `Rs.${Number(info.maxRefundable).toLocaleString("en-IN")}` : "-"}
                      <span className="admin-muted"> - backend is source of truth</span>
                    </p>
                  </div>
                )}
                <label>
                  Amount <span className="admin-muted">(blank = full remaining)</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={refundModalAmount}
                    onChange={(e) => setRefundModalAmount(e.target.value)}
                    placeholder={info.maxRefundable != null ? String(info.maxRefundable) : "Full refund"}
                    disabled={refundModalSubmitting}
                  />
                </label>
                <label>
                  Reason
                  <input
                    type="text"
                    value={refundModalReason}
                    onChange={(e) => setRefundModalReason(e.target.value)}
                    placeholder="Admin refund"
                    disabled={refundModalSubmitting}
                  />
                </label>
                {refundModalError && <span className="admin-error">{refundModalError}</span>}
                <div className="admin-form-row" style={{ marginTop: 4 }}>
                  <button type="button" className="btn secondary small" onClick={closeRefundModal} disabled={refundModalSubmitting}>Cancel</button>
                  <button type="button" className="btn primary small" onClick={confirmRefundModal} disabled={refundModalSubmitting}>
                    {refundModalSubmitting ? "Refunding..." : "Confirm refund"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {restockModalOpen && (
        <div className="admin-modal-backdrop admin-ops-backdrop" onClick={closeRestockModal}>
          <div className="admin-modal admin-ops-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="restock-title">
            <div className="admin-modal-head">
              <h3 id="restock-title">Adjust inventory</h3>
              <button type="button" onClick={closeRestockModal} aria-label="Close" disabled={restockModalSubmitting}><X/></button>
            </div>
            <div className="admin-form">
              {restockModalItem && (
                <p className="admin-muted" style={{ margin: 0 }}>
                  {restockModalItem.name || "Product"} (#{restockModalItem.id})
                  {" - available "}
                  {restockModalItem.available_quantity ?? restockModalItem.stock_remaining ?? "-"}
                </p>
              )}
              <label>
                Action
                <select
                  value={restockModalAction}
                  onChange={(e) => setRestockModalAction(e.target.value)}
                  disabled={restockModalSubmitting}
                >
                  <option value="restock">Restock (add quantity)</option>
                  <option value="remove">Remove (subtract quantity)</option>
                  <option value="set">Set absolute quantity</option>
                  <option value="adjust">Adjust (+/- quantity)</option>
                </select>
              </label>
              <label>
                Quantity
                <input
                  type="number"
                  step="1"
                  value={restockModalQty}
                  onChange={(e) => setRestockModalQty(e.target.value)}
                  disabled={restockModalSubmitting}
                />
              </label>
              <label>
                Note / reason <span className="admin-muted">(optional)</span>
                <input
                  type="text"
                  value={restockModalReason}
                  onChange={(e) => setRestockModalReason(e.target.value)}
                  placeholder="Restock"
                  disabled={restockModalSubmitting}
                />
              </label>
              {restockModalError && <span className="admin-error">{restockModalError}</span>}
              <div className="admin-form-row" style={{ marginTop: 4 }}>
                <button type="button" className="btn secondary small" onClick={closeRestockModal} disabled={restockModalSubmitting}>Cancel</button>
                <button type="button" className="btn primary small" onClick={confirmRestockModal} disabled={restockModalSubmitting || !restockModalItem}>
                  {restockModalSubmitting ? "Saving..." : "Confirm adjust"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isAdminLoggedIn && (
        <aside className="admin-panel">
          <div className="admin-panel-head">
            <div>
              <span className="eyebrow">ADMIN PANEL</span>
              <h2>{BRAND_NAME} Dashboard</h2>
            </div>
            <div className="admin-panel-actions admin-nav-wrap">
              {[
                ["dashboard", "Dashboard"],
                ["orders", "Orders"],
                ["payments", "Payments"],
                ["refunds", "Refunds"],
                ["products", "Products"],
                ["inventory", "Inventory"],
                ["coupons", "Coupons"],
                ["customers", "Customers"],
                ["employees", "Delivery"],
                ["reviews", "Reviews"],
                ["notifications", "Notifications"],
                ["reports", "Reports"],
                ["settings", "Settings"],
                ["delivery", "Zones"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  className={`btn secondary small${adminSection === id || (id === "reports" && adminReportsView) || (id === "delivery" && adminDeliveryView) || (id === "coupons" && adminCouponsView) ? " active" : ""}`}
                  onClick={() => goAdminSection(id)}
                >{label}</button>
              ))}
              <button className="btn secondary small" onClick={handleAdminLogout}>Logout</button>
            </div>
          </div>

          <div className="admin-content">
            {adminOpsMessage && <div className="admin-error" style={{ marginBottom: 12 }}>{adminOpsMessage}</div>}
            {adminLoadingSection && <div className="empty">Loading...</div>}

            {!adminReportsView && !adminDeliveryView && !adminCouponsView && adminSection === "dashboard" && (
              <div className="admin-reports-page">
                <div className="report-topbar">
                  <div><span className="eyebrow">OVERVIEW</span><h3>Operations Dashboard</h3></div>
                  <select value={adminDashPreset} onChange={(e) => { setAdminDashPreset(e.target.value); loadAdminSectionData("dashboard", e.target.value); }}>
                    <option value="today">Today</option>
                    <option value="yesterday">Yesterday</option>
                    <option value="last_7_days">Last 7 days</option>
                    <option value="last_30_days">Last 30 days</option>
                    <option value="this_month">This month</option>
                  </select>
                </div>
                <div className="report-summary-grid">
                  <div className="report-card" role="button" onClick={() => goAdminSection("orders")}><span>Orders today</span><strong>{adminDashboard?.orders?.today ?? 0}</strong></div>
                  <div className="report-card" role="button" onClick={() => goAdminSection("orders")}><span>Pending</span><strong>{adminDashboard?.pending_orders ?? 0}</strong></div>
                  <div className="report-card"><span>Preparing</span><strong>{adminDashboard?.orders?.preparing ?? 0}</strong></div>
                  <div className="report-card" role="button" onClick={() => goAdminSection("employees")}><span>Out for delivery</span><strong>{adminDashboard?.orders?.out_for_delivery ?? 0}</strong></div>
                  <div className="report-card"><span>Delivered</span><strong>{adminDashboard?.orders?.delivered ?? 0}</strong></div>
                  <div className="report-card"><span>Cancelled</span><strong>{adminDashboard?.orders?.cancelled ?? 0}</strong></div>
                  <div className="report-card" role="button" onClick={() => goAdminSection("reports")}><span>Net revenue</span><strong>Rs.{Number(adminDashboard?.revenue ?? 0).toLocaleString("en-IN")}</strong></div>
                  <div className="report-card" role="button" onClick={() => goAdminSection("payments")}><span>Payments OK</span><strong>{adminDashboard?.payments?.successful ?? 0}</strong></div>
                  <div className="report-card" role="button" onClick={() => goAdminSection("refunds")}><span>Refunds pending</span><strong>{adminDashboard?.payments?.refunds_pending ?? 0}</strong></div>
                  <div className="report-card" role="button" onClick={() => goAdminSection("inventory")}><span>Low stock</span><strong>{adminDashboard?.low_stock ?? 0}</strong></div>
                  <div className="report-card" role="button" onClick={() => goAdminSection("coupons")}><span>Active coupons</span><strong>{adminDashboard?.active_coupons ?? 0}</strong></div>
                  <div className="report-card" role="button" onClick={() => goAdminSection("reviews")}><span>Reviews pending</span><strong>{adminDashboard?.reviews?.pending ?? 0}</strong></div>
                  <div className="report-card" role="button" onClick={() => goAdminSection("customers")}><span>Customers</span><strong>{adminDashboard?.customers?.total ?? 0}</strong></div>
                  <div className="report-card"><span>Gross sales</span><strong>Rs.{Number(adminDashboard?.sales_summary?.gross_sales ?? 0).toLocaleString("en-IN")}</strong></div>
                  <div className="report-card"><span>Refunds</span><strong>Rs.{Number(adminDashboard?.sales_summary?.refunds ?? 0).toLocaleString("en-IN")}</strong></div>
                  <div className="report-card"><span>Delivery fees</span><strong>Rs.{Number(adminDashboard?.sales_summary?.delivery_charges ?? 0).toLocaleString("en-IN")}</strong></div>
                </div>
              </div>
            )}

            {!adminReportsView && !adminDeliveryView && adminSection === "orders" && (
              <div className="admin-reports-page">
                <div className="report-topbar"><div><span className="eyebrow">ORDERS</span><h3>Order management</h3></div>
                  <button type="button" className="btn secondary small" onClick={() => downloadAdminExport("orders").catch((e) => setAdminOpsMessage(e.message))}>Export CSV</button>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                  <input placeholder="Search" value={adminOrderFilter.search} onChange={(e) => setAdminOrderFilter((p) => ({ ...p, search: e.target.value }))} />
                  <select value={adminOrderFilter.status} onChange={(e) => setAdminOrderFilter((p) => ({ ...p, status: e.target.value }))}>
                    <option value="">All statuses</option>
                    {["PENDING","ORDER_CONFIRMED","PREPARING","PACKING","READY_FOR_DELIVERY","DELIVERY_BOY_ASSIGNED","OUT_FOR_DELIVERY","DELIVERED","CANCELLED"].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <select value={adminOrderFilter.payment_status} onChange={(e) => setAdminOrderFilter((p) => ({ ...p, payment_status: e.target.value }))}>
                    <option value="">All payments</option>
                    {["pending","paid","failed","refunded"].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button type="button" className="btn primary small" onClick={() => loadAdminSectionData("orders")}>Filter</button>
                </div>
                {adminOrderDetail ? (
                  <div className="report-section">
                    <button type="button" className="btn secondary small" onClick={() => setAdminOrderDetail(null)}>Back</button>
                    <h4>{adminOrderDetail.order_number} - {adminOrderDetail.status}</h4>
                    <p>{adminOrderDetail.customer_name} | {adminOrderDetail.customer_email} | {adminOrderDetail.customer_mobile}</p>
                    <p>{adminOrderDetail.shipping_address}, {adminOrderDetail.city} {adminOrderDetail.postal_code}</p>
                    <p>Payment: {adminOrderDetail.payment_status} | Total Rs.{Number(adminOrderDetail.total_amount || 0).toLocaleString("en-IN")} | Coupon {adminOrderDetail.coupon_code || "-"}</p>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "12px 0" }}>
                      <select id="admin-next-status" key={adminOrderDetail.status} defaultValue="">
                        <option value="">Next status...</option>
                        {getNextOrderStatuses(adminOrderDetail.status).map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      {getNextOrderStatuses(adminOrderDetail.status).length === 0 && (
                        <span className="admin-muted">No further status transitions (use Cancel if needed).</span>
                      )}
                      <button type="button" className="btn primary small" onClick={() => {
                        const el = document.getElementById("admin-next-status");
                        const st = el && el.value;
                        if (!st) return;
                        updateAdminOrderStatus(adminOrderDetail.id, { status: st })
                          .then((d) => { setAdminOrderDetail(d); setAdminOpsMessage("Status updated"); loadAdminSectionData("orders"); })
                          .catch((e) => setAdminOpsMessage(e.message || "Status update failed"));
                      }}>Apply</button>
                      <button type="button" className="btn secondary small" onClick={openCancelModal}>Cancel order</button>
                      <button type="button" className="btn secondary small" onClick={openRefundModal}>Refund</button>
                      <button type="button" className="btn secondary small" onClick={openAssignPicker}>
                        {adminOrderDetail.delivery_employee ? "Reassign delivery" : "Assign delivery"}
                      </button>
                      <button
                        type="button"
                        className="btn secondary small"
                        disabled={!adminOrderDetail.delivery_employee}
                        onClick={handleUnassignDelivery}
                      >
                        Unassign
                      </button>
                    </div>
                    <p className="admin-muted" style={{ marginTop: 4 }}>
                      Delivery: {adminOrderDetail.delivery_employee
                        ? `${adminOrderDetail.delivery_employee.name} (#${adminOrderDetail.delivery_employee.id} / ${adminOrderDetail.delivery_employee.employee_id || "-"} / ${adminOrderDetail.delivery_employee.status || ""})`
                        : "Not assigned"}
                    </p>
                    <div className="table-wrap"><table className="report-table"><thead><tr><th>Item</th><th>Qty</th><th>Price</th></tr></thead><tbody>
                      {(adminOrderDetail.items || []).map((it) => <tr key={it.id}><td>{it.product_name}</td><td>{it.quantity}</td><td>Rs.{Number(it.subtotal || 0).toLocaleString("en-IN")}</td></tr>)}
                    </tbody></table></div>
                    <h4>History</h4>
                    <ul>{(adminOrderDetail.status_history || []).map((h) => <li key={h.id}>{h.status} - {h.message} <small>{new Date(h.created_at).toLocaleString()}</small></li>)}</ul>
                  </div>
                ) : (
                  <div className="table-wrap"><table className="report-table"><thead><tr><th>Order</th><th>Customer</th><th>Status</th><th>Payment</th><th>Total</th><th></th></tr></thead><tbody>
                    {adminOrders.length === 0 && (<tr><td colSpan={6}><div className="admin-empty">No orders match filters.</div></td></tr>)}{adminOrders.map((o) => (
                      <tr key={o.id}>
                        <td>{o.order_number}</td><td>{o.customer_name}</td><td>{o.status}</td><td>{o.payment_status}</td>
                        <td>Rs.{Number(o.total_amount || 0).toLocaleString("en-IN")}</td>
                        <td><button type="button" className="btn secondary small" onClick={() => fetchAdminOrderDetail(o.id).then(setAdminOrderDetail).catch((e) => setAdminOpsMessage(e.message))}>Open</button></td>
                      </tr>
                    ))}
                  </tbody></table></div>
                )}
              </div>
            )}

            {!adminReportsView && !adminDeliveryView && adminSection === "payments" && (
              <div className="admin-reports-page">
                <div className="report-topbar"><div><span className="eyebrow">PAYMENTS</span><h3>Payments</h3></div>
                  <button type="button" className="btn secondary small" onClick={() => downloadAdminExport("payments").catch((e) => setAdminOpsMessage(e.message))}>Export CSV</button>
                </div>
                <div className="table-wrap"><table className="report-table"><thead><tr><th>Order</th><th>Customer</th><th>Amount</th><th>Status</th><th>Method</th><th>Gateway order</th><th>Failure</th></tr></thead><tbody>
                  {adminPayments.length === 0 && (<tr><td colSpan={7}><div className="admin-empty">No payments yet.</div></td></tr>)}{adminPayments.map((p) => <tr key={p.id != null ? `pay-${p.id}` : `order-${p.order_id}`}><td>{p.order_number || "-"}</td><td>{p.customer_name || "-"}</td><td>Rs.{Number(p.amount || 0).toLocaleString("en-IN")}</td><td>{p.status}{p.source === "order_derived" ? " (from order)" : ""}</td><td>{p.payment_method || "-"}</td><td>{p.gateway_order_id || "-"}</td><td>{p.failure_reason || "-"}</td></tr>)}
                </tbody></table></div>
              </div>
            )}

            {!adminReportsView && !adminDeliveryView && adminSection === "refunds" && (
              <div className="admin-reports-page">
                <div className="report-topbar"><div><span className="eyebrow">REFUNDS</span><h3>Refunds</h3></div>
                  <select
                    value={adminRefundFilter}
                    onChange={(e) => {
                      const v = e.target.value;
                      setAdminRefundFilter(v);
                      setAdminLoadingSection(true);
                      const params = { page: 1, page_size: 25 };
                      if (v) params.status = v;
                      fetchAdminRefunds(params)
                        .then((d) => setAdminRefunds(asListResponse(d)))
                        .catch((err) => { setAdminRefunds([]); setAdminOpsMessage(err.message || "Refunds failed"); })
                        .finally(() => setAdminLoadingSection(false));
                    }}
                  >
                    <option value="">All</option>
                    <option value="pending_group">Pending group</option>
                    <option value="requested">Requested</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <button type="button" className="btn secondary small" onClick={() => downloadAdminExport("refunds").catch((e) => setAdminOpsMessage(e.message))}>Export CSV</button>
                </div>
                <div className="table-wrap"><table className="report-table"><thead><tr><th>ID</th><th>Order</th><th>Amount</th><th>Status</th><th>By</th><th>Reason</th><th>Gateway refund</th></tr></thead><tbody>
                  {buildRefundTableRows(adminRefunds)}
                </tbody></table></div>
              </div>
            )}

            {!adminReportsView && !adminDeliveryView && adminSection === "inventory" && (
              <div className="admin-reports-page">
                <div className="report-topbar"><div><span className="eyebrow">INVENTORY</span><h3>Stock control</h3></div>
                  <button type="button" className="btn secondary small" onClick={() => downloadAdminExport("inventory").catch((e) => setAdminOpsMessage(e.message))}>Export CSV</button>
                </div>
                <div className="table-wrap"><table className="report-table"><thead><tr><th>Product</th><th>Available</th><th>Reserved</th><th>Sold</th><th>Availability</th><th></th></tr></thead><tbody>
                  {adminInventory.length === 0 && (<tr><td colSpan={6}><div className="admin-empty">No inventory rows.</div></td></tr>)}{adminInventory.map((item) => (
                    <tr key={item.id}>
                      <td>{item.name}</td><td>{item.available_quantity}</td><td>{item.reserved_quantity}</td><td>{item.sold_quantity}</td><td>{item.availability}</td>
                      <td><button type="button" className="btn secondary small" onClick={() => openRestockModal(item, "inventory")}>Restock</button></td>
                    </tr>
                  ))}
                </tbody></table></div>
              </div>
            )}

            {!adminReportsView && !adminDeliveryView && (adminSection === "coupons" || adminCouponsView) && (
              <div className="admin-reports-page">
                <div className="report-topbar"><div><span className="eyebrow">COUPONS</span><h3>Promo codes</h3></div></div>
                {adminCouponMessage && <div className="admin-error">{adminCouponMessage}</div>}
                <form className="admin-form" onSubmit={(e) => { e.preventDefault(); createAdminCoupon({
                  code: adminCouponForm.code, name: adminCouponForm.name, discount_type: adminCouponForm.discount_type,
                  discount_value: adminCouponForm.discount_value, is_active: !!adminCouponForm.is_active,
                }).then(() => { setAdminCouponMessage("Coupon created."); setAdminCouponForm({ code: "", name: "", discount_type: "percentage", discount_value: "10", is_active: true }); loadAdminCoupons(); }).catch((err) => setAdminCouponMessage(err.message)); }}>
                  <label>Code<input value={adminCouponForm.code} onChange={(e) => setAdminCouponForm((p) => ({ ...p, code: e.target.value }))} /></label>
                  <label>Name<input value={adminCouponForm.name} onChange={(e) => setAdminCouponForm((p) => ({ ...p, name: e.target.value }))} /></label>
                  <label>Type<select value={adminCouponForm.discount_type} onChange={(e) => setAdminCouponForm((p) => ({ ...p, discount_type: e.target.value }))}><option value="percentage">Percentage</option><option value="fixed_amount">Fixed</option></select></label>
                  <label>Value<input type="number" value={adminCouponForm.discount_value} onChange={(e) => setAdminCouponForm((p) => ({ ...p, discount_value: e.target.value }))} /></label>
                  <label><input type="checkbox" checked={!!adminCouponForm.is_active} onChange={(e) => setAdminCouponForm((p) => ({ ...p, is_active: e.target.checked }))} /> Active</label>
                  <button type="submit" className="btn primary small">Create coupon</button>
                </form>
                <div className="table-wrap"><table className="report-table"><thead><tr><th>Code</th><th>Type</th><th>Value</th><th>Used</th><th>Active</th><th></th></tr></thead><tbody>
                  {adminCoupons.map((c) => (
                    <tr key={c.id}><td>{c.code}</td><td>{c.discount_type}</td><td>{c.discount_value}</td><td>{c.total_used}</td><td>{c.is_active ? "Yes" : "No"}</td>
                      <td><button type="button" className="btn secondary small" onClick={() => updateAdminCoupon(c.id, { is_active: !c.is_active }).then(() => loadAdminCoupons())}>{c.is_active ? "Disable" : "Enable"}</button></td>
                    </tr>
                  ))}
                </tbody></table></div>
              </div>
            )}

            {!adminReportsView && !adminDeliveryView && adminSection === "customers" && (
              <div className="admin-reports-page">
                <div className="report-topbar"><div><span className="eyebrow">CUSTOMERS</span><h3>Customer accounts</h3></div>
                  <button type="button" className="btn secondary small" onClick={() => downloadAdminExport("customers").catch((e) => setAdminOpsMessage(e.message))}>Export CSV</button>
                </div>
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  <input placeholder="Search name/email/mobile" value={adminCustomerSearch} onChange={(e) => setAdminCustomerSearch(e.target.value)} />
                  <button type="button" className="btn primary small" onClick={() => loadAdminSectionData("customers")}>Search</button>
                </div>
                <div className="table-wrap"><table className="report-table"><thead><tr><th>User</th><th>Email</th><th>Mobile</th><th>Orders</th><th>Purchase</th><th>Active</th><th></th></tr></thead><tbody>
                  {adminCustomers.length === 0 && (
                    <tr><td colSpan={7}><div className="admin-empty">No customers found.</div></td></tr>
                  )}
                  {adminCustomers.map((c) => (
                    <tr key={c.id}><td>{c.username}</td><td>{c.email}</td><td>{c.mobile_number || "-"}</td><td>{c.order_count}</td><td>Rs.{Number(c.total_purchase || 0).toLocaleString("en-IN")}</td><td>{c.is_active ? "Yes" : "No"}</td>
                      <td style={{ display: "flex", gap: 6 }}>
                        <button type="button" className="btn secondary small" onClick={() => openCustomerDetail(c.id)}>View</button>
                        <button type="button" className="btn secondary small" onClick={() => updateAdminCustomerStatus(c.id, !c.is_active).then(() => { loadAdminSectionData("customers"); if (adminCustomerDetail?.id === c.id) openCustomerDetail(c.id); }).catch((e) => setAdminOpsMessage(e.message))}>{c.is_active ? "Deactivate" : "Activate"}</button>
                      </td>
                    </tr>
                  ))}
                </tbody></table></div>
              </div>
            )}

            {!adminReportsView && !adminDeliveryView && adminSection === "employees" && (
              <div className="admin-reports-page">
                <div className="report-topbar"><div><span className="eyebrow">DELIVERY</span><h3>Employees & active deliveries</h3></div></div>
                {adminEmployeeMessage && <div className={adminEmployeeMessage.includes("Could") ? "admin-error" : "admin-success"}>{adminEmployeeMessage}</div>}
                <form className="admin-form" onSubmit={handleEmployeeFormSubmit} style={{ background: "#fff", border: "1px solid #f0e3d6", borderRadius: 14, paddingBottom: 16 }}>
                  <div className="admin-form-head">
                    <strong>{adminEmployeeEditingId ? "Edit employee" : "Create employee"}</strong>
                    {adminEmployeeEditingId && <button type="button" className="btn secondary small" onClick={resetEmployeeForm}>Cancel edit</button>}
                  </div>
                  <div className="admin-form-row">
                    <label>Employee ID<input value={adminEmployeeForm.employee_id} onChange={(e) => setAdminEmployeeForm((p) => ({ ...p, employee_id: e.target.value }))} required disabled={!!adminEmployeeEditingId} /></label>
                    <label>Name<input value={adminEmployeeForm.name} onChange={(e) => setAdminEmployeeForm((p) => ({ ...p, name: e.target.value }))} required /></label>
                  </div>
                  <div className="admin-form-row">
                    <label>Contact<input value={adminEmployeeForm.contact_number} onChange={(e) => setAdminEmployeeForm((p) => ({ ...p, contact_number: e.target.value }))} required /></label>
                    <label>Email<input type="email" value={adminEmployeeForm.email} onChange={(e) => setAdminEmployeeForm((p) => ({ ...p, email: e.target.value }))} /></label>
                  </div>
                  <div className="admin-form-row">
                    <label>Photo URL<input value={adminEmployeeForm.photo} onChange={(e) => setAdminEmployeeForm((p) => ({ ...p, photo: e.target.value }))} /></label>
                    <label>Status<select value={adminEmployeeForm.status} onChange={(e) => setAdminEmployeeForm((p) => ({ ...p, status: e.target.value }))}>
                      {["ACTIVE","AVAILABLE","BUSY","ON_LEAVE","INACTIVE"].map((s) => <option key={s} value={s}>{s}</option>)}
                    </select></label>
                  </div>
                  <button type="submit" className="btn primary small">{adminEmployeeEditingId ? "Save employee" : "Create employee"}</button>
                </form>
                <h4>Active deliveries</h4>
                <div className="table-wrap"><table className="report-table"><thead><tr><th>Order</th><th>Status</th><th>Employee</th><th>Duration</th><th>Delayed</th><th>Location</th></tr></thead><tbody>
                  {adminActiveDeliveries.length === 0 ? (
                    <tr><td colSpan={6}><div className="admin-empty">No active deliveries.</div></td></tr>
                  ) : adminActiveDeliveries.map((d) => (
                    <tr key={d.id}><td>{d.order_number}</td><td>{d.status}</td><td>{d.delivery_employee?.name || "-"}</td><td>{d.duration_minutes ?? "-"}m</td><td>{d.delayed ? "Yes" : "No"}</td>
                      <td>{d.last_known_location ? `${d.last_known_location.latitude}, ${d.last_known_location.longitude}` : "-"}</td></tr>
                  ))}
                </tbody></table></div>
                <h4>Employees</h4>
                <div className="table-wrap"><table className="report-table"><thead><tr><th>ID</th><th>Name</th><th>Contact</th><th>Email</th><th>Status</th><th></th></tr></thead><tbody>
                  {adminEmployees.length === 0 ? (
                    <tr><td colSpan={6}><div className="admin-empty">No employees yet. Create one above.</div></td></tr>
                  ) : adminEmployees.map((e) => (
                    <tr key={e.id}>
                      <td>{e.employee_id}</td><td>{e.name}</td><td>{e.contact_number}</td><td>{e.email || "-"}</td><td>{e.status}</td>
                      <td><button type="button" className="btn secondary small" onClick={() => startEditEmployee(e)}>Edit</button></td>
                    </tr>
                  ))}
                </tbody></table></div>
              </div>
            )}

            {!adminReportsView && !adminDeliveryView && adminSection === "reviews" && (
              <div className="admin-reports-page">
                <div className="report-topbar"><div><span className="eyebrow">REVIEWS</span><h3>Moderation</h3></div>
                  <select value={adminReviewFilter} onChange={(e) => { const v = e.target.value; setAdminReviewFilter(v); setAdminLoadingSection(true); fetchAdminReviews({ status: v, page: 1, page_size: 25 }).then((d) => setAdminReviews(Array.isArray(d) ? d : (d.results || []))).catch((err) => setAdminOpsMessage(err.message || "Reviews failed")).finally(() => setAdminLoadingSection(false)); }}>
                    <option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="">All</option>
                  </select>
                </div>
                <div className="table-wrap"><table className="report-table"><thead><tr><th>Product</th><th>User</th><th>Rating</th><th>Comment</th><th>Status</th><th></th></tr></thead><tbody>
                  {adminReviews.map((r) => (
                    <tr key={r.id}><td>{r.product_name || r.product}</td><td>{r.user_name || r.name}</td><td>{r.rating}</td><td>{r.comment}</td><td>{r.status}</td>
                      <td style={{ display: "flex", gap: 6 }}>
                        {r.status === "pending" && <>
                          <button type="button" className="btn primary small" onClick={() => approveAdminReview(r.id).then(() => loadAdminSectionData("reviews"))}>Approve</button>
                          <button type="button" className="btn secondary small" onClick={() => rejectAdminReview(r.id, "Rejected by admin").then(() => loadAdminSectionData("reviews"))}>Reject</button>
                        </>}
                      </td>
                    </tr>
                  ))}
                </tbody></table></div>
              </div>
            )}

            {!adminReportsView && !adminDeliveryView && adminSection === "notifications" && (
              <div className="admin-reports-page">
                <div className="report-topbar"><div><span className="eyebrow">NOTIFICATIONS</span><h3>Admin alerts</h3></div>
                  <button type="button" className="btn secondary small" onClick={() => loadAdminSectionData("notifications")}>Refresh</button>
                </div>
                <div style={{ display: "grid", gap: 8 }}>
                  {(adminNotifications || []).length === 0 ? <div className="empty">No admin alerts.</div> : adminNotifications.map((n) => (
                    <div key={n.id} className="report-card" style={{ textAlign: "left" }}>
                      <strong>{n.title}</strong>
                      <div>{n.body}</div>
                      <small>{n.event} | {n.reference_type} {n.reference_id} | {new Date(n.created_at).toLocaleString()} | {n.is_read ? "Read" : "Unread"}</small>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!adminReportsView && !adminDeliveryView && adminSection === "settings" && (
              <div className="admin-reports-page">
                <div className="report-topbar"><div><span className="eyebrow">SETTINGS</span><h3>Business & integrations</h3></div></div>
                {adminSettings && (
                  <>
                    <div className="report-summary-grid">
                      <div className="report-card"><span>SMTP</span><strong>{adminSettings.integrations?.smtp_configured ? "Configured" : "Not configured"}</strong></div>
                      <div className="report-card"><span>SMS</span><strong>{adminSettings.integrations?.sms_configured ? "Configured" : "Not configured"}</strong></div>
                      <div className="report-card"><span>WhatsApp</span><strong>{adminSettings.integrations?.whatsapp_configured ? "Configured" : "Not configured"}</strong></div>
                      <div className="report-card"><span>Payments</span><strong>{adminSettings.integrations?.payment_configured ? "Configured" : "Not configured"}</strong></div>
                    </div>
                    <form className="admin-form" onSubmit={(e) => {
                      e.preventDefault();
                      updateAdminSettingsStatus({
                        bakery_latitude: adminSettings.business?.bakery_latitude,
                        bakery_longitude: adminSettings.business?.bakery_longitude,
                        delivery_enabled: !!adminSettings.business?.delivery_enabled,
                        default_delivery_charge: adminSettings.business?.default_delivery_charge,
                        free_delivery_threshold: adminSettings.business?.free_delivery_threshold,
                        max_delivery_radius_km: adminSettings.business?.max_delivery_radius_km,
                        per_km_charge: adminSettings.business?.per_km_charge,
                      }).then((d) => { setAdminSettings(d); setAdminOpsMessage("Settings saved"); }).catch((err) => setAdminOpsMessage(err.message));
                    }}>
                      <label>Bakery latitude<input value={adminSettings.business?.bakery_latitude || ""} onChange={(e) => setAdminSettings((p) => ({ ...p, business: { ...p.business, bakery_latitude: e.target.value } }))} /></label>
                      <label>Bakery longitude<input value={adminSettings.business?.bakery_longitude || ""} onChange={(e) => setAdminSettings((p) => ({ ...p, business: { ...p.business, bakery_longitude: e.target.value } }))} /></label>
                      <label>Default delivery charge<input value={adminSettings.business?.default_delivery_charge || ""} onChange={(e) => setAdminSettings((p) => ({ ...p, business: { ...p.business, default_delivery_charge: e.target.value } }))} /></label>
                      <label><input type="checkbox" checked={!!adminSettings.business?.delivery_enabled} onChange={(e) => setAdminSettings((p) => ({ ...p, business: { ...p.business, delivery_enabled: e.target.checked } }))} /> Delivery enabled</label>
                      <p><small>Contact: {adminSettings.business?.contact_email || "-"} | Secrets are never shown or accepted here.</small></p>
                      <button type="submit" className="btn primary small">Save operational settings</button>
                    </form>
                  </>
                )}
              </div>
            )}

            {adminReportsView ? (
              <div className="admin-reports-page">
                <div className="report-topbar">
                  <div>
                    <span className="eyebrow">REPORTS</span>
                    <h3>Admin Reporting Dashboard</h3>
                  </div>
                  <button className="btn primary small" onClick={closeAdminReports}>Close</button>
                </div>

                {reportsLoading ? (
                  <div className="empty">Loading report...</div>
                ) : reportsError ? (
                  <div className="empty">{reportsError}</div>
                ) : (
                  <>
                    <div className="report-summary-grid">
                      <div className="report-card"><span>Customers</span><strong>{reportSummary.user_stats?.total_users ?? 0}</strong></div>
                      <div className="report-card"><span>Verified users</span><strong>{reportSummary.user_stats?.verified_users ?? 0}</strong></div>
                      <div className="report-card"><span>Unverified users</span><strong>{reportSummary.user_stats?.unverified_users ?? 0}</strong></div>
                      <div className="report-card"><span>New this week</span><strong>{reportSummary.user_stats?.new_users_this_week ?? 0}</strong></div>
                      <div className="report-card"><span>Total products</span><strong>{reportSummary.product_stats?.total_products ?? 0}</strong></div>
                      <div className="report-card"><span>Active products</span><strong>{reportSummary.product_stats?.active_products ?? 0}</strong></div>
                      <div className="report-card"><span>Discounted products</span><strong>{reportSummary.product_stats?.products_with_discounts ?? 0}</strong></div>
                      <div className="report-card"><span>3D assets</span><strong>{reportSummary.product_stats?.products_with_3d_assets ?? 0}</strong></div>
                      <div className="report-card"><span>Total reviews</span><strong>{reportSummary.review_stats?.total_reviews ?? 0}</strong></div>
                      <div className="report-card"><span>Average rating</span><strong>{Number(reportSummary.review_stats?.average_rating ?? 0).toFixed(1)}</strong></div>
                      <div className="report-card"><span>Pending reviews</span><strong>{reportSummary.review_stats?.pending_reviews ?? 0}</strong></div>
                      <div className="report-card"><span>Revenue</span><strong>Rs.{Number(reportSummary.sales_stats?.total_sales ?? 0).toLocaleString("en-IN")}</strong></div>
                      <div className="report-card"><span>Successful payments</span><strong>{reportSummary.sales_stats?.successful_payments ?? 0}</strong></div>
                      <div className="report-card"><span>Failed payments</span><strong>{reportSummary.sales_stats?.failed_payments ?? 0}</strong></div>
                      <div className="report-card"><span>Pending payments</span><strong>{reportSummary.sales_stats?.pending_payments ?? 0}</strong></div>
                      <div className="report-card"><span>Orders</span><strong>{reportSummary.sales_stats?.total_orders ?? 0}</strong></div>
                      <div className="report-card"><span>Orders with coupon</span><strong>{reportSummary.sales_stats?.orders_with_coupon ?? 0}</strong></div>
                      <div className="report-card"><span>Coupon discount</span><strong>Rs.{Number(reportSummary.sales_stats?.total_coupon_discount ?? 0).toLocaleString("en-IN")}</strong></div>
                      <div className="report-card"><span>Coupons used</span><strong>{reportSummary.sales_stats?.coupons_used_count ?? 0}</strong></div>
                    </div>

                    <div className="report-section">
                      <h4>Sales overview</h4>
                      <div className="report-note">
                        {reportSummary.sales_stats?.note || "No order or payment module is active yet. Sales data will appear here when that feature is added."}
                      </div>
                    </div>

                    <div className="report-section">
                      <h4>Product performance</h4>
                      {reportPerformance.length ? (
                        <div className="table-wrap">
                          <table className="report-table">
                            <thead>
                              <tr><th>Product</th><th>Views</th><th>Avg rating</th><th>Reviews</th><th>Availability</th></tr>
                            </thead>
                            <tbody>
                              {reportPerformance.slice(0, 10).map(item => (
                                <tr key={item.id}>
                                  <td>{item.name}</td>
                                  <td>{item.view_count ?? 0}</td>
                                  <td>{Number(item.avg_rating ?? 0).toFixed(1)}</td>
                                  <td>{item.review_count ?? 0}</td>
                                  <td>{item.availability || "in_stock"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="empty">No product performance data is available for the selected period.</div>
                      )}
                    </div>

                    <div className="report-section">
                      <h4>Recent admin activity</h4>
                      {reportActivity.length ? (
                        <div className="table-wrap">
                          <table className="report-table">
                            <thead>
                              <tr><th>Admin</th><th>Action</th><th>Entity</th><th>Time</th></tr>
                            </thead>
                            <tbody>
                              {reportActivity.slice(0, 10).map(item => (
                                <tr key={item.id}>
                                  <td>{item.admin_user__username}</td>
                                  <td>{item.action}</td>
                                  <td>{item.entity_type || "-"}</td>
                                  <td>{new Date(item.created_at).toLocaleString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="empty">No admin activity recorded yet.</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ) : adminDeliveryView ? (
              <div className="admin-reports-page">
                <div className="report-topbar">
                  <div>
                    <span className="eyebrow">DELIVERY</span>
                    <h3>Delivery Zones & Settings</h3>
                  </div>
                  <button type="button" className="btn primary small" onClick={() => setAdminDeliveryView(false)}>Close</button>
                </div>
                {adminDeliveryMessage && <div className="admin-error">{adminDeliveryMessage}</div>}
                {adminDeliverySettings && (
                  <form className="admin-form" style={{ marginBottom: 16 }} onSubmit={(e) => {
                    e.preventDefault();
                    updateAdminDeliverySettings({
                      delivery_enabled: !!adminDeliverySettings.delivery_enabled,
                      default_delivery_charge: adminDeliverySettings.default_delivery_charge,
                      free_delivery_threshold: adminDeliverySettings.free_delivery_threshold || null,
                      bakery_latitude: adminDeliverySettings.bakery_latitude || null,
                      bakery_longitude: adminDeliverySettings.bakery_longitude || null,
                      max_delivery_radius_km: adminDeliverySettings.max_delivery_radius_km || null,
                      per_km_charge: adminDeliverySettings.per_km_charge || null,
                    })
                      .then((data) => { setAdminDeliverySettings(data); setAdminDeliveryMessage("Settings saved."); })
                      .catch((err) => setAdminDeliveryMessage(err.message || "Could not save settings."));
                  }}>
                    <h4>Global settings</h4>
                    <div className="auth-row">
                      <label>Default charge<input type="number" value={adminDeliverySettings.default_delivery_charge ?? ""} onChange={e => setAdminDeliverySettings(prev => ({ ...prev, default_delivery_charge: e.target.value }))} /></label>
                      <label>Free threshold<input type="number" value={adminDeliverySettings.free_delivery_threshold ?? ""} onChange={e => setAdminDeliverySettings(prev => ({ ...prev, free_delivery_threshold: e.target.value }))} /></label>
                    </div>
                    <div className="auth-row">
                      <label>Bakery lat<input value={adminDeliverySettings.bakery_latitude ?? ""} onChange={e => setAdminDeliverySettings(prev => ({ ...prev, bakery_latitude: e.target.value }))} /></label>
                      <label>Bakery lng<input value={adminDeliverySettings.bakery_longitude ?? ""} onChange={e => setAdminDeliverySettings(prev => ({ ...prev, bakery_longitude: e.target.value }))} /></label>
                    </div>
                    <div className="auth-row">
                      <label>Max radius km<input type="number" value={adminDeliverySettings.max_delivery_radius_km ?? ""} onChange={e => setAdminDeliverySettings(prev => ({ ...prev, max_delivery_radius_km: e.target.value }))} /></label>
                      <label>Per-km charge<input type="number" value={adminDeliverySettings.per_km_charge ?? ""} onChange={e => setAdminDeliverySettings(prev => ({ ...prev, per_km_charge: e.target.value }))} /></label>
                    </div>
                    <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input type="checkbox" checked={!!adminDeliverySettings.delivery_enabled} onChange={e => setAdminDeliverySettings(prev => ({ ...prev, delivery_enabled: e.target.checked }))} />
                      Delivery enabled
                    </label>
                    <button type="submit" className="btn primary">Save settings</button>
                  </form>
                )}
                <form className="admin-form" onSubmit={handleCreateAdminZone}>
                  <h4>Add zone</h4>
                  <label>Name<input value={adminZoneForm.name} onChange={e => setAdminZoneForm(prev => ({ ...prev, name: e.target.value }))} required /></label>
                  <label>PIN codes (comma-separated)<input value={adminZoneForm.postal_codes} onChange={e => setAdminZoneForm(prev => ({ ...prev, postal_codes: e.target.value }))} placeholder="400001, 400002" required /></label>
                  <div className="auth-row">
                    <label>Charge<input type="number" value={adminZoneForm.delivery_charge} onChange={e => setAdminZoneForm(prev => ({ ...prev, delivery_charge: e.target.value }))} /></label>
                    <label>Min order<input type="number" value={adminZoneForm.minimum_order_amount} onChange={e => setAdminZoneForm(prev => ({ ...prev, minimum_order_amount: e.target.value }))} /></label>
                    <label>Free above<input type="number" value={adminZoneForm.free_delivery_threshold} onChange={e => setAdminZoneForm(prev => ({ ...prev, free_delivery_threshold: e.target.value }))} /></label>
                  </div>
                  <button type="submit" className="btn primary">Create zone</button>
                </form>
                <div className="admin-cake-list" style={{ marginTop: 16 }}>
                  <h3>Zones</h3>
                  {adminZones.map(zone => (
                    <div className="admin-cake-item" key={zone.id}>
                      <div className="admin-cake-details">
                        <div>
                          <strong>{zone.name}</strong>
                          <span>{(zone.postal_codes || []).join(' | ')}</span>
                          <small>Charge {String.fromCharCode(8377)}{Number(zone.delivery_charge || 0)} | Min {String.fromCharCode(8377)}{Number(zone.minimum_order_amount || 0)}</small>
                        </div>
                      </div>
                      <div className="admin-item-actions">
                        <button type="button" className="btn secondary small" onClick={() => toggleAdminZone(zone)}>{zone.is_active ? "Disable" : "Enable"}</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (adminSection === "products" || (!["dashboard","orders","payments","refunds","inventory","coupons","customers","employees","reviews","notifications","settings"].includes(adminSection))) ? (
              <>
                <form className="admin-form add-cake-form" onSubmit={submitCakeForm}>
                  <div className="admin-form-head">
                    <h3>{editingCakeId != null ? "Edit Cake" : "Add New Cake"}</h3>
                    {editingCakeId != null && (
                      <button type="button" className="btn secondary small" onClick={resetCakeForm}>Cancel</button>
                    )}
                  </div>
                  <label>
                    Cake Name
                    <input value={cakeForm.name} onChange={e => setCakeForm(prev => ({ ...prev, name: e.target.value }))} placeholder="Strawberry Delight" />
                  </label>
                  <label>
                    Price (Rs.)
                    <input type="number" value={cakeForm.price} onChange={e => setCakeForm(prev => ({ ...prev, price: e.target.value }))} placeholder="1299" />
                  </label>
                  <label>
                    Discount (%)
                    <input type="number" min="0" max="100" value={cakeForm.discount} onChange={e => setCakeForm(prev => ({ ...prev, discount: e.target.value }))} placeholder="10" />
                  </label>
                  <label>
                    Category
                    <select value={cakeForm.category} onChange={e => setCakeForm(prev => ({ ...prev, category: e.target.value }))}>
                      {CAKE_CATEGORY_OPTIONS.map(categoryName => <option key={categoryName} value={categoryName}>{categoryName}</option>)}
                    </select>
                  </label>
                  <label>
                    Availability
                    <select value={cakeForm.availability} onChange={e => setCakeForm(prev => ({ ...prev, availability: e.target.value }))}>
                      <option value="in_stock">In Stock</option>
                      <option value="low_stock">Low Stock</option>
                      <option value="out_of_stock">Out of Stock</option>
                    </select>
                  </label>
                  <label>
                    Status
                    <select value={cakeForm.status} onChange={e => setCakeForm(prev => ({ ...prev, status: e.target.value }))}>
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </label>
                  <label>
                    Stock quantity
                    <input type="number" min="0" value={cakeForm.available_quantity} onChange={e => setCakeForm(prev => ({ ...prev, available_quantity: e.target.value }))} placeholder="50" />
                  </label>
                  <label>
                    Low stock threshold
                    <input type="number" min="0" value={cakeForm.low_stock_threshold} onChange={e => setCakeForm(prev => ({ ...prev, low_stock_threshold: e.target.value }))} placeholder="5" />
                  </label>
                  <label>
                    Description
                    <textarea value={cakeForm.description} onChange={e => setCakeForm(prev => ({ ...prev, description: e.target.value }))} placeholder="Rich chocolate sponge with smooth cream..." />
                  </label>
                  <label>
                    Image URL
                    <input value={cakeForm.image} onChange={e => setCakeForm(prev => ({ ...prev, image: e.target.value }))} placeholder="https://..." />
                  </label>
                  {adminMessage && <span className="admin-error">{adminMessage}</span>}
                  <button type="submit" className="btn primary full">{editingCakeId != null ? "Save Changes" : "Add Cake"}</button>
                </form>

                <div className="admin-cake-list">
                  <h3>Current Cakes</h3>
                  {catalog.map(item => (
                    <div className="admin-cake-item" key={item.id}>
                      <div className="admin-cake-details">
                        <img src={item.image} alt={item.name} />
                        <div>
                          <strong>{item.name}</strong>
                          <span>{item.category}</span>
                          <small className="stock-meta">Stock: {item.available_quantity ?? item.stock_remaining ?? 0} ({item.availability || "in_stock"})</small>
                          <small>Rs.{item.price.toLocaleString("en-IN")}</small>
                        </div>
                      </div>
                      <div className="admin-item-actions">
                        <button className="btn secondary small" onClick={() => populateCakeForm(item)}>Edit</button>
                        <button className="btn secondary small" type="button" onClick={() => openRestockModal(item, "products")}>Restock</button>
                        <button className="admin-remove" onClick={() => removeCake(item.id)}><Trash2 size={15}/> Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        </aside>
      )}

      {(adminCustomerDetail || adminCustomerDetailLoading) && (
        <>
          <div className="admin-drawer-backdrop" onClick={() => { setAdminCustomerDetail(null); setAdminCustomerDetailLoading(false); }} />
          <aside className="admin-drawer" role="dialog" aria-label="Customer detail">
            <div className="drawer-head">
              <h2>Customer</h2>
              <button type="button" onClick={() => { setAdminCustomerDetail(null); setAdminCustomerDetailLoading(false); }}><X /></button>
            </div>
            <div className="admin-drawer-body">
              {adminCustomerDetailLoading && <div className="admin-empty">Loading...</div>}
              {adminCustomerDetail && (
                <>
                  <p><strong>{adminCustomerDetail.first_name || ""} {adminCustomerDetail.last_name || ""}</strong> <span className="admin-muted">@{adminCustomerDetail.username}</span></p>
                  <p className="admin-muted">{adminCustomerDetail.email} | {adminCustomerDetail.mobile_number || "No mobile"}</p>
                  <p>Status: <strong>{adminCustomerDetail.is_active ? "Active" : "Inactive"}</strong>
                    {" | "}Verified: {adminCustomerDetail.is_verified ? "Yes" : "No"}
                    {" | "}Joined: {adminCustomerDetail.date_joined ? new Date(adminCustomerDetail.date_joined).toLocaleDateString() : "-"}
                  </p>
                  <p>Orders: <strong>{adminCustomerDetail.order_count ?? 0}</strong> | Purchase: <strong>Rs.{Number(adminCustomerDetail.total_purchase || 0).toLocaleString("en-IN")}</strong></p>
                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <button type="button" className="btn primary small" onClick={() => updateAdminCustomerStatus(adminCustomerDetail.id, !adminCustomerDetail.is_active).then(() => { openCustomerDetail(adminCustomerDetail.id); loadAdminSectionData("customers"); setAdminOpsMessage(adminCustomerDetail.is_active ? "Customer deactivated" : "Customer activated"); }).catch((e) => setAdminOpsMessage(e.message))}>
                      {adminCustomerDetail.is_active ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                  <h4>Addresses</h4>
                  {(adminCustomerDetail.addresses || []).length === 0 ? <div className="admin-empty">No saved addresses.</div> : (
                    <ul className="tracking-history">
                      {(adminCustomerDetail.addresses || []).map((a) => (
                        <li key={a.id}><span>{a.full_name}{a.is_default ? " (default)" : ""}</span><small>{a.address_line_1}, {a.city} {a.postal_code}</small></li>
                      ))}
                    </ul>
                  )}
                  <h4>Recent orders</h4>
                  {(adminCustomerDetail.orders || []).length === 0 ? <div className="admin-empty">No orders.</div> : (
                    <div className="table-wrap"><table className="report-table"><thead><tr><th>Order</th><th>Status</th><th>Total</th></tr></thead><tbody>
                      {(adminCustomerDetail.orders || []).slice(0, 15).map((o) => (
                        <tr key={o.id}><td>{o.order_number}</td><td>{o.status}</td><td>Rs.{Number(o.total_amount || 0).toLocaleString("en-IN")}</td></tr>
                      ))}
                    </tbody></table></div>
                  )}
                </>
              )}
            </div>
          </aside>
        </>
      )}

      <aside className={cartOpen ? "cart-drawer open" : "cart-drawer"}>
        <div className="drawer-head"><h2>Your Cart</h2><button onClick={() => setCartOpen(false)}><X/></button></div>
        {cart.length === 0 ? <div className="empty-cart"><ShoppingBag size={38}/><h3>Your cart is empty</h3><p>Pick a beautiful cake for your next celebration.</p><button className="btn primary" onClick={() => {setCartOpen(false);scrollTo("cakes")}}>Explore Cakes</button></div> :
          <>
            <div className="cart-items">{cart.map(item => <div className="cart-item" key={item.id}><img src={item.image}/><div><b>{item.name}</b><small>{item.size}</small><strong>Rs.{(item.price*item.qty).toLocaleString("en-IN")}</strong><div className="qty"><button onClick={()=>changeQty(item.id,-1)}><Minus/></button><span>{item.qty}</span><button onClick={()=>changeQty(item.id,1)}><Plus/></button><button className="delete" onClick={()=>changeQty(item.id,-item.qty)}><Trash2/></button></div></div></div>)}</div>
            <div className="cart-summary"><div><span>Subtotal</span><b>Rs.{cartTotal.toLocaleString("en-IN")}</b></div><small>Taxes and delivery calculated at checkout.</small><button className="btn primary checkout" onClick={openCheckout}>Proceed to Checkout <ArrowRight/></button></div>
          </>
        }
      </aside>
      {cartOpen && <div className="backdrop" onClick={() => setCartOpen(false)}></div>}

      {checkoutOpen && (
        <div className="auth-page-shell" onClick={() => setCheckoutOpen(false)}>
          <div className="auth-page-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 720 }}>
            <div className="auth-form-panel" style={{ width: "100%" }}>
              <button type="button" className="auth-close" onClick={() => setCheckoutOpen(false)} aria-label="Close checkout">
                <X size={18} />
              </button>

              <div className="auth-header">
                <span className="eyebrow">CHECKOUT</span>
                <h3>Confirm your order</h3>
              </div>

              <form className="auth-form" onSubmit={handleCheckoutSubmit}>
                {savedAddresses.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <div className="eyebrow" style={{ marginBottom: 8 }}>Saved addresses</div>
                    <div style={{ display: "grid", gap: 8 }}>
                      {savedAddresses.map(addr => (
                        <label key={addr.id} style={{ display: "flex", gap: 8, alignItems: "flex-start", border: "1px solid #ead9e0", borderRadius: 12, padding: 10, cursor: "pointer", background: selectedAddressId === addr.id ? "#fff5f8" : "#fff" }}>
                          <input
                            type="radio"
                            name="saved_address"
                            checked={selectedAddressId === addr.id}
                            onChange={() => applyAddressToCheckout(addr)}
                          />
                          <span>
                            <strong>{addr.full_name}</strong> {addr.is_default ? <em>(default)</em> : null}
                            <br />
                            <small>{addr.address_line_1}{addr.address_line_2 ? `, ${addr.address_line_2}` : ""}, {addr.city}, {addr.state} {addr.postal_code}</small>
                          </span>
                        </label>
                      ))}
                    </div>
                    <button type="button" className="btn secondary small" style={{ marginTop: 8 }} onClick={() => { setSelectedAddressId(null); setShowNewAddressForm(true); }}>
                      Deliver to a new address
                    </button>
                  </div>
                )}

                {(showNewAddressForm || savedAddresses.length === 0 || !selectedAddressId) && (
                <>
                <div className="auth-row">
                  <label>
                    Full name
                    <input value={checkoutForm.customer_name} onChange={e => { setSelectedAddressId(null); setCheckoutForm(prev => ({ ...prev, customer_name: e.target.value })); }} placeholder="Aisha Patel" required />
                  </label>
                  <label>
                    Email
                    <input type="email" value={checkoutForm.customer_email} onChange={e => { setSelectedAddressId(null); setCheckoutForm(prev => ({ ...prev, customer_email: e.target.value })); }} placeholder="you@example.com" required />
                  </label>
                </div>

                <div className="auth-row">
                  <label>
                    Mobile
                    <input value={checkoutForm.customer_mobile} onChange={e => { setSelectedAddressId(null); setCheckoutForm(prev => ({ ...prev, customer_mobile: e.target.value })); }} placeholder="9876543210" required />
                  </label>
                  <label>
                    Postal code
                    <input value={checkoutForm.postal_code} onChange={e => {
                      const postal_code = e.target.value;
                      setSelectedAddressId(null);
                      setCheckoutForm(prev => ({ ...prev, postal_code }));
                    }} onBlur={() => refreshDeliveryQuote(checkoutForm.postal_code, null, checkoutForm.shipping_latitude, checkoutForm.shipping_longitude)} placeholder="400001" required />
                  </label>
                </div>

                <label>
                  Street address
                  <input value={checkoutForm.shipping_address} onChange={e => { setSelectedAddressId(null); setCheckoutForm(prev => ({ ...prev, shipping_address: e.target.value })); }} placeholder="24 Rose Avenue" required />
                </label>

                <label>
                  Apartment / floor
                  <input value={checkoutForm.shipping_address_2} onChange={e => setCheckoutForm(prev => ({ ...prev, shipping_address_2: e.target.value }))} placeholder="Flat 4B" />
                </label>

                <label>
                  Landmark
                  <input value={checkoutForm.landmark || ""} onChange={e => { setSelectedAddressId(null); setCheckoutForm(prev => ({ ...prev, landmark: e.target.value })); }} placeholder="Near Scout Camp" />
                </label>

                <div className="auth-row">
                  <label>
                    City
                    <input value={checkoutForm.city} onChange={e => { setSelectedAddressId(null); setCheckoutForm(prev => ({ ...prev, city: e.target.value })); }} placeholder="Mumbai" required />
                  </label>
                  <label>
                    State
                    <input value={checkoutForm.state} onChange={e => { setSelectedAddressId(null); setCheckoutForm(prev => ({ ...prev, state: e.target.value })); }} placeholder="Maharashtra" required />
                  </label>
                </div>

                <label>
                  Country
                  <input value={checkoutForm.country} onChange={e => { setSelectedAddressId(null); setCheckoutForm(prev => ({ ...prev, country: e.target.value })); }} placeholder="India" required />
                </label>

                {(showNewAddressForm || savedAddresses.length === 0 || !selectedAddressId) && (
                  <button type="button" className="btn secondary" onClick={handleSaveNewAddress}>Save this address</button>
                )}
                </>
                )}

                <label>
                  Order notes
                  <textarea value={checkoutForm.notes} onChange={e => setCheckoutForm(prev => ({ ...prev, notes: e.target.value }))} rows={3} placeholder="Add a note for your order" />
                </label>

                                <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
                  <div className="auth-row" style={{ alignItems: "end" }}>
                    <label style={{ flex: 1 }}>
                      Promo code
                      <input
                        value={couponCodeInput}
                        onChange={e => setCouponCodeInput(e.target.value.toUpperCase())}
                        placeholder="SAVE10"
                        disabled={!!appliedCoupon}
                      />
                    </label>
                    {!appliedCoupon ? (
                      <button type="button" className="btn secondary" onClick={handleApplyCoupon} disabled={couponLoading}>
                        {couponLoading ? "Checking..." : "Apply"}
                      </button>
                    ) : (
                      <button type="button" className="btn secondary" onClick={handleRemoveCoupon}>Remove</button>
                    )}
                  </div>
                  {couponMessage && <div className="auth-error" style={{ color: appliedCoupon ? "#2f6b4f" : undefined }}>{couponMessage}</div>}
                </div>

                <div className="cart-summary" style={{ marginTop: 12, padding: 0, border: "none" }}>
                  <div><span>Subtotal</span><b>Rs.{cartTotal.toLocaleString("en-IN")}</b></div>
                  {appliedCoupon ? (
                    <div><span>Coupon ({appliedCoupon.code})</span><b>-Rs.{couponDiscountPreview.toLocaleString("en-IN")}</b></div>
                  ) : null}
                  <div><span>Delivery</span><b>{deliveryQuote?.eligible ? (String.fromCharCode(8377) + deliveryFeePreview.toLocaleString("en-IN")) : "-"}</b></div>
                  {deliveryQuoteMessage ? <div className="auth-error" style={{ color: deliveryQuote?.eligible ? "#2f6b4f" : undefined }}>{deliveryQuoteMessage}</div> : null}
                  {deliveryQuote?.eta_min_minutes ? <small>ETA {deliveryQuote.eta_min_minutes}-{deliveryQuote.eta_max_minutes || "?"} min</small> : null}
                  <div><span>Total</span><b>Rs.{checkoutPayable.toLocaleString("en-IN")}</b></div>
                </div>

                {checkoutMessage && <div className="auth-error">{checkoutMessage}</div>}

                <button type="submit" className="btn primary full" disabled={checkoutLoading}>
                  {checkoutLoading ? "Placing order..." : "Place Order"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {orderSuccess && (
        <div className="auth-page-shell" onClick={() => setOrderSuccess(null)}>
          <div className="auth-page-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div className="auth-form-panel" style={{ width: "100%" }}>
              <div className="auth-header">
                <span className="eyebrow">PAYMENT SUCCESSFUL</span>
                <h3>Order Confirmed</h3>
              </div>
              <div className="auth-form" style={{ gap: 14 }}>
                <div className="cart-summary" style={{ marginTop: 0, padding: 0, border: "none" }}>
                  <div><span>Order</span><b>{orderSuccess.orderNumber || "PinkBakes Order"}</b></div>
                  <div><span>Amount</span><b>Rs.{Number(orderSuccess.amount || 0).toLocaleString("en-IN")}</b></div>
                </div>
                <div className="empty">Payment ID: {orderSuccess.paymentId || "-"}</div>
                <div className="auth-row">
                  <button type="button" className="btn primary full" onClick={() => setOrderSuccess(null)}>View Orders</button>
                  <button type="button" className="btn secondary full" onClick={() => setOrderSuccess(null)}>Continue Shopping</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {orderHistoryOpen && (
        <div className="auth-page-shell" onClick={() => setOrderHistoryOpen(false)}>
          <div className="auth-page-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 820 }}>
            <div className="auth-form-panel" style={{ width: "100%" }}>
              <button type="button" className="auth-close" onClick={() => setOrderHistoryOpen(false)} aria-label="Close order history">
                <X size={18} />
              </button>

              <div className="auth-header">
                <span className="eyebrow">MY ORDERS</span>
                <h3>{selectedOrder ? selectedOrder.order_number : "Order history"}</h3>
              </div>

              {!selectedOrder && (
                <div className="cart-summary" style={{ marginTop: 0, marginBottom: 12, padding: "12px 0", borderBottom: "1px solid #f2dfe8" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <strong>Notifications{notifUnreadCount > 0 ? ` (${notifUnreadCount} unread)` : ""}</strong>
                    <button
                      type="button"
                      className="btn secondary small"
                      onClick={() => {
                        const token = localStorage.getItem("pinkbakes_token");
                        if (!token) return;
                        markAllNotificationsRead(token)
                          .then(() => fetchInAppNotifications(token, { limit: 20 }))
                          .then((data) => {
                            setInAppNotifications(Array.isArray(data?.results) ? data.results : []);
                            setNotifUnreadCount(data?.unread_count || 0);
                          })
                          .catch(() => {});
                      }}
                    >
                      Mark all read
                    </button>
                  </div>
                  {inAppNotifications.length === 0 ? (
                    <div className="empty" style={{ padding: 8 }}>No notifications yet.</div>
                  ) : (
                    <ul className="tracking-history" style={{ maxHeight: 160, overflow: "auto" }}>
                      {inAppNotifications.slice(0, 8).map((n) => (
                        <li key={n.id} style={{ opacity: n.is_read ? 0.65 : 1 }}>
                          <span>{n.title}</span>
                          <small>{n.created_at ? new Date(n.created_at).toLocaleString() : ""}</small>
                          {!n.is_read && (
                            <button
                              type="button"
                              className="btn secondary small"
                              style={{ marginLeft: 8 }}
                              onClick={() => {
                                const token = localStorage.getItem("pinkbakes_token");
                                if (!token) return;
                                markNotificationRead(token, n.id)
                                  .then(() => fetchInAppNotifications(token, { limit: 20 }))
                                  .then((data) => {
                                    setInAppNotifications(Array.isArray(data?.results) ? data.results : []);
                                    setNotifUnreadCount(data?.unread_count || 0);
                                  })
                                  .catch(() => {});
                              }}
                            >
                              Read
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}

                  {notificationPrefs && (
                    <div style={{ marginTop: 12 }}>
                      <strong>Email preferences</strong>
                      <p style={{ fontSize: 12, color: "#7b6070", margin: "4px 0 8px" }}>
                        Verification, password reset, payment, and order confirmation emails cannot be turned off.
                      </p>
                      {[
                        ["email_order_updates", "Order & refund updates"],
                        ["email_delivery_updates", "Delivery updates"],
                        ["email_review_updates", "Review updates"],
                        ["email_promotional", "Promotional emails"],
                        ["sms_order_updates", "SMS order updates"],
                      ].map(([key, label]) => (
                        <label key={key} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, fontSize: 14 }}>
                          <input
                            type="checkbox"
                            checked={!!notificationPrefs[key]}
                            onChange={(e) => {
                              const next = { ...notificationPrefs, [key]: e.target.checked };
                              setNotificationPrefs(next);
                              const token = localStorage.getItem("pinkbakes_token");
                              if (!token) return;
                              updateNotificationPreferences(token, { [key]: e.target.checked })
                                .then((data) => {
                                  setNotificationPrefs(data);
                                  setNotificationPrefsMessage("Preferences saved.");
                                })
                                .catch((err) => setNotificationPrefsMessage(err.message || "Could not save preferences."));
                            }}
                          />
                          {label}
                        </label>
                      ))}
                      {notificationPrefsMessage && (
                        <div className="auth-error" style={{ color: "#5d4753" }}>{notificationPrefsMessage}</div>
                      )}
                    </div>
                  )}
                </div>
              )}


              {selectedOrder ? (
                <div className="auth-form" style={{ gap: 14 }}>
                  <div className="cart-summary" style={{ marginTop: 0, padding: 0, border: "none" }}>
                    <div><span>Status</span><b>{selectedOrder.status}</b></div>
                    <div><span>Payment</span><b>{selectedOrder.payment_status || "pending"}</b></div>
                    {selectedOrder.coupon_code ? (
                    <div><span>Coupon</span><b>{selectedOrder.coupon_code}</b></div>
                  ) : null}
                  {Number(selectedOrder.coupon_discount_amount || selectedOrder.discount_amount || 0) > 0 ? (
                    <div><span>Coupon discount</span><b>-Rs.{Number(selectedOrder.coupon_discount_amount || selectedOrder.discount_amount || 0).toLocaleString("en-IN")}</b></div>
                  ) : null}
                  <div><span>Total</span><b>Rs.{Number(selectedOrder.total_amount || 0).toLocaleString("en-IN")}</b></div>
              {Number(selectedOrder.delivery_fee || 0) > 0 ? (
                <div><span>Delivery fee</span><b>{String.fromCharCode(8377)}{Number(selectedOrder.delivery_fee || 0).toLocaleString("en-IN")}</b></div>
              ) : (
                <div><span>Delivery fee</span><b>Free / {String.fromCharCode(8377)}0</b></div>
              )}
              <div style={{ marginTop: 8 }}>
                <span>Deliver to</span>
                <b style={{ display: "block", fontWeight: 500 }}>
                  {selectedOrder.shipping_address}
                  {selectedOrder.shipping_address_2 ? `, ${selectedOrder.shipping_address_2}` : ""}
                  {selectedOrder.landmark ? ` (${selectedOrder.landmark})` : ""}
                  <br />
                  {selectedOrder.city}, {selectedOrder.state} {selectedOrder.postal_code}
                  <br />
                  {selectedOrder.country}
                </b>
              </div>
                  </div>

                  {selectedOrder.payment_status !== "paid" && selectedOrder.payment_status !== "refunded" && selectedOrder.status !== "CANCELLED" && (
                    <button type="button" className="btn primary full" onClick={() => handleRetryPayment(selectedOrder.id)} disabled={paymentRetryLoading}>
                      {paymentRetryLoading ? "Processing payment..." : "Complete Payment"}
                    </button>
                  )}

                  {selectedOrder.cancellable && !cancelConfirmOpen && (
                    <button type="button" className="btn secondary full" onClick={() => { setCancelConfirmOpen(true); setCancelMessage(""); }}>
                      Cancel Order
                    </button>
                  )}

                  {cancelConfirmOpen && selectedOrder.cancellable && (
                    <div className="auth-form" style={{ gap: 10, border: "1px solid #f2dfe8", borderRadius: 12, padding: 12 }}>
                      <strong>Cancel this order?</strong>
                      <textarea
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        rows={3}
                        placeholder="Optional reason"
                      />
                      <button type="button" className="btn primary full" onClick={handleCancelOrder} disabled={cancelLoading}>
                        {cancelLoading ? "Cancelling..." : "Confirm cancellation"}
                      </button>
                      <button type="button" className="btn secondary full" onClick={() => setCancelConfirmOpen(false)} disabled={cancelLoading}>
                        Keep order
                      </button>
                    </div>
                  )}

                  {cancelMessage && <div className="auth-error" style={{ color: "#5d4753" }}>{cancelMessage}</div>}

                  {selectedOrder.status === "CANCELLED" && (
                    <div className="cart-summary" style={{ marginTop: 0, padding: 0, border: "none" }}>
                      <div><span>Cancelled</span><b>{selectedOrder.cancelled_at ? new Date(selectedOrder.cancelled_at).toLocaleString() : "Yes"}</b></div>
                      {selectedOrder.cancellation_reason ? <div><span>Reason</span><b>{selectedOrder.cancellation_reason}</b></div> : null}
                      {selectedOrder.refunds_summary?.latest_status ? (
                        <div>
                          <span>Refund</span>
                          <b>
                            {selectedOrder.refunds_summary.latest_status === "completed"
                              ? "Completed"
                              : selectedOrder.refunds_summary.latest_status === "failed"
                                ? "Failed - contact support"
                                : "Processing"}
                          </b>
                        </div>
                      ) : null}
                    </div>
                  )}

                  {selectedOrder.status_history?.length ? (
                    <div className="delivery-tracker-panel">
                      <div className="delivery-tracker-header"><strong>Order timeline</strong></div>
                      <ul className="tracking-history">
                        {selectedOrder.status_history.map((event) => (
                          <li key={`${event.status}-${event.created_at || event.timestamp}`}>
                            <span>{event.status}</span>
                            <small>{new Date(event.created_at || event.timestamp).toLocaleString()}</small>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {(selectedOrder.items || []).map(item => (
                    <div key={item.id} className="cart-item" style={{ marginBottom: 12 }}>
                      <img src={item.product_image || item.product?.main_image || ""} alt={item.product_name} />
                      <div>
                        <b>{item.product_name}</b>
                        <small>Qty: {item.quantity}</small>
                        <strong>Rs.{Number(item.subtotal || 0).toLocaleString("en-IN")}</strong>
                      </div>
                    </div>
                  ))}

                  <div className="delivery-tracker-panel">
                    <div className="delivery-tracker-header">
                      <strong>Live delivery</strong>
                      <button type="button" className="btn secondary small" onClick={() => fetchTracking(selectedOrder.id)}>
                        {trackingLoading ? "Loading..." : "Track order"}
                      </button>
                    </div>

                    {trackingError && <div className="auth-error">{trackingError}</div>}

                    {trackingOrder ? (
                      <div className="tracking-card">
                        <div className="tracking-status-row">
                          <span>Status</span>
                          <b>{trackingOrder.status}</b>
                        </div>
                        <div className="tracking-status-row">
                          <span>Delivery executive</span>
                          <b>{trackingOrder.delivery_employee?.name || "Awaiting assignment"}</b>
                        </div>
                        {trackingOrder.location && (
                          <a href={getMapsUrl(trackingOrder.location.latitude, trackingOrder.location.longitude)} target="_blank" rel="noreferrer" className="btn secondary full">
                            Open map
                          </a>
                        )}
                        {trackingOrder.status_history?.length ? (
                          <ul className="tracking-history">
                            {trackingOrder.status_history.map((event) => (
                              <li key={`${event.status}-${event.timestamp}`}>
                                <span>{event.status}</span>
                                <small>{new Date(event.timestamp).toLocaleString()}</small>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    ) : (
                      <div className="empty">Track an order to see live status and delivery updates.</div>
                    )}
                  </div>

                  <button type="button" className="btn secondary full" onClick={() => { setSelectedOrder(null); setCancelConfirmOpen(false); setCancelReason(""); setCancelMessage(""); }}>
                    Back to orders
                  </button>
                </div>
              ) : (
                <div className="auth-form" style={{ gap: 12 }}>
                  {orders.length === 0 ? (
                    <div className="empty">No orders yet. Start with one of our signature cakes.</div>
                  ) : (
                    orders.map(order => (
                      <button type="button" key={order.id} className="admin-cake-item" style={{ textAlign: "left", width: "100%", cursor: "pointer" }} onClick={() => handleOpenOrder(order.id)}>
                        <div className="admin-cake-details">
                          <div>
                            <strong>{order.order_number}</strong>
                            <span>{new Date(order.created_at).toLocaleDateString()}</span>
                            <small>{order.items?.length || 0} item(s)</small>
                          </div>
                        </div>
                        <div className="admin-item-actions">
                          <strong>Rs.{Number(order.total_amount || 0).toLocaleString("en-IN")}</strong>
                          <span>{order.payment_status || "pending"}</span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
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
        <div className="auth-page-shell" onClick={() => setAuthOpen(false)}>
          <div className="auth-page-card" onClick={e => e.stopPropagation()}>
            <div className="auth-visual-panel">
              <div className="auth-brand-row">
                <div className="brand-mark"><CakeSlice size={20}/></div>
                <div>
                  <strong>{BRAND_NAME}</strong>
                  <small>CAKES FOR EVERY MOMENT</small>
                </div>
              </div>

              <div className="auth-visual-copy">
                <span className="eyebrow">FRESHLY BAKED</span>
                <h2>Celebrate every moment with a sweeter story.</h2>
                <p>Order custom cakes, seasonal favorites, and handcrafted keepsakes made just for your occasion.</p>
              </div>

              <div className="auth-feature-pills">
                <span>Fresh</span>
                <span>Custom</span>
                <span>Delivered</span>
              </div>
            </div>

            <div className="auth-form-panel">
              <button type="button" className="auth-close" onClick={() => setAuthOpen(false)} aria-label="Close auth form">
                <X size={18}/>
              </button>

              <div className="auth-header">
                <span className="eyebrow">ACCOUNT</span>
                <h3>
                  {authStage === "verification" ? "Verify your account"
                    : authFlow === "forgot" ? "Forgot Password"
                    : authFlow === "reset" ? "Reset Your Password"
                    : authMode === "signup" ? "Create your account" : "Welcome back"}
                </h3>
              </div>

              {authStage !== "verification" && authFlow === "signin" && (
                <div className="auth-toggle">
                  <button type="button" className={authMode === "signin" ? "active" : ""} onClick={() => setAuthMode("signin")}>Sign In</button>
                  <button type="button" className={authMode === "signup" ? "active" : ""} onClick={() => setAuthMode("signup")}>Sign Up</button>
                  <button type="button" className={authMode === "otp" ? "active" : ""} onClick={() => setAuthMode("otp")}>OTP</button>
                </div>
              )}

              {authFlow === "forgot" ? (
                <form className="auth-form" onSubmit={handleForgotPassword}>
                  <label>
                    Email Address
                    <input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder="you@example.com" required />
                  </label>
                  {authMessage && <div className="auth-error">{authMessage}</div>}
                  <button type="submit" className="btn primary full" disabled={authLoading}>
                    {authLoading ? "Sending..." : "Send Reset Link"}
                  </button>
                  <button type="button" className="btn secondary full" onClick={() => { setAuthFlow("signin"); setAuthMessage(""); setForgotEmail(""); }}>
                    Back to Login
                  </button>
                </form>
              ) : authFlow === "reset" ? (
                <form className="auth-form" onSubmit={handleResetPasswordSubmit}>
                  <label>
                    New Password
                    <input type="password" value={resetPasswordForm.password} onChange={e => setResetPasswordForm(prev => ({ ...prev, password: e.target.value }))} placeholder="********" required />
                  </label>
                  <label>
                    Confirm New Password
                    <input type="password" value={resetPasswordForm.confirm_password} onChange={e => setResetPasswordForm(prev => ({ ...prev, confirm_password: e.target.value }))} placeholder="********" required />
                  </label>
                  {authMessage && <div className="auth-error">{authMessage}</div>}
                  <button type="submit" className="btn primary full" disabled={authLoading}>
                    {authLoading ? "Resetting..." : "Reset Password"}
                  </button>
                </form>
              ) : authFlow === "success" ? (
                <div className="auth-form">
                  <div className="auth-note">
                    Your password has been reset successfully. You can now sign in with your new password.
                  </div>
                  {authMessage && <div className="auth-error">{authMessage}</div>}
                  <button type="button" className="btn primary full" onClick={() => { setAuthOpen(false); setAuthFlow("signin"); setAuthMode("signin"); setAuthMessage(""); setResetToken(""); setResetPasswordForm({ password: "", confirm_password: "" }); }}>
                    Login
                  </button>
                </div>
              ) : authStage === "verification" ? (
                <div className="auth-form">
                  <div className="auth-toggle" style={{ marginBottom: 18 }}>
                    <button type="button" className={verificationMethod === "email" ? "active" : ""} onClick={() => setVerificationMethod("email")}>Email Link</button>
                    <button type="button" className={verificationMethod === "otp" ? "active" : ""} onClick={() => setVerificationMethod("otp")}>Mobile OTP</button>
                  </div>

                  <div className="auth-note">
                    {verificationMethod === "email"
                      ? "We've created a secure verification link for your email. You can also manually verify by using the generated token or request a fresh link."
                      : "Enter the OTP sent to your mobile number to complete verification."}
                  </div>

                  {verificationMethod === "email" && verificationData?.link && (
                    <a className="btn secondary full" href={verificationData.link} target="_blank" rel="noreferrer" style={{ textAlign: "center", textDecoration: "none" }}>
                      Open verification link
                    </a>
                  )}

                  <label>
                    {verificationMethod === "email" ? "Verification token from email" : "OTP code"}
                    <input
                      value={verificationCode}
                      onChange={e => setVerificationCode(e.target.value)}
                      placeholder={verificationMethod === "email" ? "Paste token from email link" : "Code from email/SMS"}
                    />
                  </label>
                  <div className="auth-note">
                    {verificationMethod === "email"
                      ? "Open the verification link in your email, or paste the token from that link here."
                      : "Enter the one-time code sent to your email/SMS. Codes are never shown in the app."}
                  </div>

                  {authMessage && <div className="auth-error">{authMessage}</div>}

                  <button type="button" className="btn primary full" onClick={() => handleVerificationAction("verify")} disabled={authLoading}>
                    {authLoading ? "Checking..." : verificationMethod === "email" ? "Verify email" : "Verify OTP"}
                  </button>

                  <button type="button" className="btn secondary full" onClick={() => handleVerificationAction("send")} disabled={authLoading}>
                    {authLoading ? "Please wait..." : "Send a new code"}
                  </button>

                  <button type="button" className="btn secondary full" onClick={() => {
                    setAuthOpen(false);
                    setAuthStage("form");
                    setAuthMode("signin");
                    setAuthMessage("");
                  }}>
                    Continue as guest
                  </button>
                </div>
              ) : authMode === "otp" ? (
                <form className="auth-form" onSubmit={verificationCode ? handleOtpLoginSubmit : handleOtpLoginRequest}>
                  <label>
                    Registered mobile number
                    <input value={authForm.mobile_number} onChange={e => setAuthForm(prev => ({ ...prev, mobile_number: e.target.value }))} placeholder="9876543210" required />
                  </label>

                  {authMessage && <div className="auth-error">{authMessage}</div>}

                  {verificationCode || authMessage?.toLowerCase().includes("otp") ? (
                    <label>
                      OTP code
                      <input value={verificationCode} onChange={e => setVerificationCode(e.target.value)} placeholder="123456" required />
                    </label>
                  ) : null}

                  <button type="submit" className="btn primary full" disabled={authLoading}>
                    {authLoading ? "Please wait..." : verificationCode ? "Verify & Sign In" : "Send OTP"}
                  </button>

                  <button type="button" className="btn secondary full" onClick={() => {
                    setAuthOpen(false);
                    setAuthStage("form");
                    setAuthMessage("");
                    setVerificationCode("");
                    setAuthMode("signin");
                  }}>
                    Continue as guest
                  </button>

                  <div className="auth-footer-link">
                    Need a password login?
                    <button type="button" onClick={() => setAuthMode("signin")}>
                      Sign in instead
                    </button>
                  </div>
                </form>
              ) : (
                <form className="auth-form" onSubmit={handleAuthSubmit}>
                  {authMode === "signup" && (
                    <div className="auth-row">
                      <label>
                        First name
                        <input value={authForm.first_name} onChange={e => setAuthForm(prev => ({ ...prev, first_name: e.target.value }))} placeholder="Aisha" />
                      </label>
                      <label>
                        Last name
                        <input value={authForm.last_name} onChange={e => setAuthForm(prev => ({ ...prev, last_name: e.target.value }))} placeholder="Patel" />
                      </label>
                    </div>
                  )}

                  <label>
                    Username
                    <input value={authForm.username} onChange={e => setAuthForm(prev => ({ ...prev, username: e.target.value }))} placeholder="aishapatel" required />
                  </label>

                  {authMode === "signup" && (
                    <>
                      <label>
                        Email
                        <input type="email" value={authForm.email} onChange={e => setAuthForm(prev => ({ ...prev, email: e.target.value }))} placeholder="you@example.com" required />
                      </label>

                      <label>
                        Mobile number
                        <input value={authForm.mobile_number} onChange={e => setAuthForm(prev => ({ ...prev, mobile_number: e.target.value }))} placeholder="9876543210" required />
                      </label>
                    </>
                  )}

                  <label>
                    Password
                    <input type="password" value={authForm.password} onChange={e => setAuthForm(prev => ({ ...prev, password: e.target.value }))} placeholder="********" required />
                  </label>

                  {authMessage && <div className="auth-error">{authMessage}</div>}

                  <button type="submit" className="btn primary full" disabled={authLoading}>
                    {authLoading ? "Please wait..." : authMode === "signup" ? "Create Account" : "Sign In"}
                  </button>

                  <button type="button" className="btn secondary full" onClick={() => {
                    setAuthOpen(false);
                    setAuthStage("form");
                    setAuthMessage("");
                  }}>
                    Continue as guest
                  </button>

                  {authMode === "signin" && (
                    <div className="auth-footer-link" style={{ justifyContent: "space-between" }}>
                      <button type="button" onClick={() => { setAuthFlow("forgot"); setAuthMessage(""); }}>
                        Forgot Password?
                      </button>
                    </div>
                  )}

                  <div className="auth-footer-link">
                    {authMode === "signin" ? "New here?" : "Already have an account?"}
                    <button type="button" onClick={() => setAuthMode(authMode === "signin" ? "signup" : "signin")}>
                      {authMode === "signin" ? "Create account" : "Sign in"}
                    </button>
                  </div>

                  {user && (
                    <button type="button" className="btn secondary full" onClick={handleSignOut}>
                      Sign out
                    </button>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      <div className={`chatbot-dock${chatOpen ? " is-open" : ""}`}>
        {chatOpen && (
          <div className="chatbot-panel" role="dialog" aria-modal="true" aria-label="PinkBakes Help Desk">
            <div className="chatbot-header">
              <div className="chatbot-header-brand">
                <span className="chatbot-avatar" aria-hidden="true"><CakeSlice size={18}/></span>
                <div>
                  <span className="chatbot-eyebrow">HELP DESK</span>
                  <strong>PinkBakes Assistant</strong>
                  <small className="chatbot-online">Online - FAQ answers instantly</small>
                </div>
              </div>
              <button type="button" className="chatbot-close" onClick={() => setChatOpen(false)} aria-label="Close chatbot">
                <X size={16} />
              </button>
            </div>

            <div className="chatbot-messages" ref={chatMessagesRef}>
              {chatMessages.map((message, index) => (
                <div key={`${message.sender}-${index}`} className={`chatbot-message ${message.sender}`}>
                  {message.text}
                </div>
              ))}
            </div>

            <div className="chatbot-quick" aria-label="Quick questions">
              {CHATBOT_QUICK_PROMPTS.map((prompt) => (
                <button key={prompt} type="button" className="chatbot-chip" onClick={() => sendChatMessage(prompt)}>
                  {prompt}
                </button>
              ))}
            </div>

            <form className="chatbot-form" onSubmit={handleChatSubmit}>
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Ask about orders, delivery, refunds..."
                aria-label="Type a message to the chatbot"
              />
              <button type="submit" aria-label="Send message">
                <Send size={16} />
              </button>
            </form>
          </div>
        )}

        <button
          type="button"
          className={`chatbot-launch${chatOpen ? " is-open" : ""}`}
          onClick={() => setChatOpen((open) => !open)}
          aria-label={chatOpen ? "Close bakery chatbot" : "Open PinkBakes Assistant"}
          aria-expanded={chatOpen}
        >
          {chatOpen ? <X size={22} /> : <MessageCircle size={22} />}
          {!chatOpen && <span>Help</span>}
        </button>
      </div>

      {toast && <div className="toast"><Check size={17}/>{toast}</div>}
    </div>
  );
}

function ProductModal({product,onClose,onAdd,stockLabel,isOutOfStock}) {
  const [detail, setDetail] = useState(normalizeProduct(product));
  const [reviews, setReviews] = useState([]);
  const [image,setImage] = useState(product.gallery?.[0] || product.image || "");
  const [zoom,setZoom] = useState(false);
  const [threeD,setThreeD] = useState(false);
  const [size,setSize] = useState("1 kg");
  const [eggless,setEggless] = useState(false);
  const [loading,setLoading] = useState(true);
  const [reviewForm,setReviewForm] = useState({ rating: 5, comment: "" });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");

  useEffect(() => {
    let active = true;

    setLoading(true);
    fetchProduct(product.id)
      .then(data => {
        if (!active) return;
        const normalized = normalizeProduct(data);
        setDetail(normalized);
        setImage(normalized.gallery?.[0] || normalized.image || "");
      })
      .catch(() => {
        if (!active) return;
        setDetail({
          ...normalizeProduct(product),
          description: "This cake is no longer available.",
          short_description: "This cake is no longer available.",
        });
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    fetchProductReviews(product.id)
      .then(data => {
        if (!active) return;
        setReviews(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (active) setReviews([]);
      });

    return () => { active = false; };
  }, [product.id]);

  function handleReviewSubmit(e) {
    e.preventDefault();
    const token = localStorage.getItem("pinkbakes_token");
    if (!token) {
      setReviewError("Authentication required to submit a review.");
      return;
    }

    if (!reviewForm.comment.trim()) {
      setReviewError("Please write a review before submitting.");
      return;
    }

    setReviewSubmitting(true);
    setReviewError("");

    submitReview(product.id, {
      rating: Number(reviewForm.rating),
      comment: reviewForm.comment.trim(),
    }, token)
      .then((response) => {
        setReviewForm({ rating: 5, comment: "" });
        setDetail(prev => ({ ...prev, rating: Number(response.rating || prev.rating || 0), review_count: Number(prev.review_count || 0) + 1 }));
        return fetchProductReviews(product.id);
      })
      .then((data) => setReviews(Array.isArray(data) ? data : []))
      .catch(() => setReviewError("Unable to submit your review. Please try again."))
      .finally(() => setReviewSubmitting(false));
  }

  const currentPrice = Number(detail.discounted_price ?? ((detail.price * (100 - (detail.discount || 0))) / 100 || detail.price));
  const gallery = detail.gallery && detail.gallery.length ? detail.gallery : [detail.image || ""];

  return <div className="modal-backdrop" onClick={onClose}>
    <div className="product-modal" onClick={e=>e.stopPropagation()}>
      <button className="modal-close" onClick={onClose}><X/></button>
      <div className="modal-gallery">
        <div className={zoom ? "modal-main zoomed" : "modal-main"}><img src={image || detail.image} alt={(detail.name || "Cake") + " cake"} width="800" height="800" /></div>
        <div className="thumbs">{gallery.map(src=><button className={src===image?"selected":""} key={src} onClick={()=>setImage(src)}><img src={src} alt={(detail.name || "Cake") + " photo"} loading="lazy" width="120" height="120" /></button>)}</div>
        <div className="viewer-buttons"><button onClick={()=>setZoom(!zoom)}><ZoomIn/> {zoom?"Reset Zoom":"Zoom"}</button><button onClick={()=>setThreeD(!threeD)}><Rotate3d/> {threeD?"Exit 3D":"3D Preview"}</button></div>
        {threeD && <div className="mini-3d"><div className="cake-3d-shape"></div><span>Drag-ready 3D preview</span></div>}
      </div>
      <div className="modal-info">
        {loading ? <div className="empty">Loading cake details...</div> : (
          <>
            <nav className="product-breadcrumbs" aria-label="Breadcrumb" style={{fontSize: "0.85rem", marginBottom: "0.75rem", opacity: 0.85}}>
              <a href="/" onClick={(e) => { e.preventDefault(); onClose(); }}>Home</a>
              <span aria-hidden="true"> / </span>
              <a href="/#cakes" onClick={(e) => { e.preventDefault(); onClose(); document.getElementById("cakes")?.scrollIntoView({behavior: "smooth"}); }}>{detail.category || "Cakes"}</a>
              <span aria-hidden="true"> / </span>
              <span aria-current="page">{detail.name}</span>
            </nav>
            <span className="eyebrow">{(detail.category || "CAKE").toUpperCase()}</span>
            <div className="rating"><Star size={14} fill="currentColor"/>{Number(detail.average_rating ?? detail.rating ?? 0).toFixed(1)} * {detail.review_count || reviews.length || 0} reviews</div>
            <h1 className="product-title">{detail.name}</h1>
            <p className="modal-desc">{detail.description || detail.short_description || "Freshly baked for your special celebration."}</p>
            <div className="modal-price-row">
              <span className="modal-price">Rs.{Number(currentPrice || 0).toLocaleString("en-IN")}</span>
              {Number(detail.discount || 0) > 0 && <span className="strike">Rs.{Number(detail.price || 0).toLocaleString("en-IN")}</span>}
            </div>
            {Number(detail.discount || 0) > 0 && <small className="discount-badge">{detail.discount}% OFF</small>}
            <label>Choose Size</label><div className="option-row">{["0.5 kg","1 kg","1.5 kg","2 kg"].map(x=><button className={size===x?"selected-option":""} key={x} onClick={()=>setSize(x)}>{x}</button>)}</div>
            <label>Preference</label><div className="option-row"><button className={!eggless?"selected-option":""} onClick={()=>setEggless(false)}>Regular</button><button className={eggless?"selected-option":""} onClick={()=>setEggless(true)}>Eggless</button></div>
            <label>Message on Cake</label><input className="cake-message" placeholder="Happy Birthday..."/>
            <label>Delivery Date</label><input className="cake-message" type="date"/>
            <button className="btn primary full" disabled={isOutOfStock ? isOutOfStock(detail) : false} onClick={onAdd}>{(isOutOfStock && isOutOfStock(detail)) ? "Out of Stock" : <>Add to Cart <ShoppingBag size={17}/></>}</button>
            <div className="secure"><ShieldCheck/> Freshly made * Secure checkout * Delivery support</div>

            <div className="review-panel">
              <h3>Customer Reviews</h3>
              <div className="review-form-wrap">
                <form onSubmit={handleReviewSubmit} className="review-form">
                  <label>
                    Your rating
                    <select value={reviewForm.rating} onChange={e => setReviewForm(prev => ({ ...prev, rating: Number(e.target.value) }))}>
                      {[5,4,3,2,1].map(value => <option key={value} value={value}>{value} star{value > 1 ? "s" : ""}</option>)}
                    </select>
                  </label>
                  <label>
                    Your review
                    <textarea value={reviewForm.comment} onChange={e => setReviewForm(prev => ({ ...prev, comment: e.target.value }))} placeholder="Beautiful cake and excellent taste." rows={4} />
                  </label>
                  {reviewError && <div className="auth-error">{reviewError}</div>}
                  <button type="submit" className="btn primary" disabled={reviewSubmitting}>{reviewSubmitting ? "Submitting..." : "Submit review"}</button>
                </form>
              </div>

              <div className="review-list">
                {reviews.length === 0 ? <div className="empty">No reviews yet. Be the first to rate this cake.</div> : reviews.map(review => (
                  <div className="review-item" key={review.id || `${review.user || review.name}-${review.created_at}`}>
                    <div className="stars">{'*'.repeat(review.rating || 0)}{'-'.repeat(5 - (review.rating || 0))} <small>{review.rating}/5</small></div>
                    <p>"{review.comment || review.text}"</p>
                    <small>- {review.user_name || review.name || 'Customer'} * {new Date(review.created_at).toLocaleDateString()}</small>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  </div>
}


createRoot(document.getElementById("root")).render(<App />);
