import { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  UserRound, X,
  Check
} from "lucide-react";
import {
 fetchCurrentUser,
  asListResponse,
  fetchProducts,
  adjustAdminInventory,
  updateAdminDeliverySettings,
  fetchAdminNotifications,
  fetchAdminDashboard,
  fetchAdminOrderDetail,
  updateAdminOrderStatus,
  cancelAdminOrder,
  refundAdminOrder,
  fetchAdminCustomers,
  updateAdminCustomerStatus,
  fetchAdminEmployees,
  assignAdminDelivery,
  unassignAdminDelivery,
  fetchAdminReviews,
  approveAdminReview,
  rejectAdminReview,
  updateAdminSettingsStatus,
  downloadAdminExport,
} from "./services/authService";
import { getMapsUrl } from "./config";
import {
  BAKERY_LOCATION,
  BRAND_NAME,
  CAKE_CATEGORY_OPTIONS,
  CATEGORY_IMAGE_FALLBACKS,
  CONTACT_EMAIL,
  STICKY_HEADER_OFFSET,
  WHATSAPP_NUMBER,
  WHATSAPP_LINK_NUMBER,
  cartQtyCap,
  cartUnitPrice,
  formatCurrency,
  getNextOrderStatuses,
} from "./appConstants";
import { isOutOfStock } from "./productUtils";
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
import useAdminActionDialogs from "./hooks/useAdminActionDialogs";
import useAdminProducts from "./hooks/useAdminProducts";
import useAdminWorkspace from "./hooks/useAdminWorkspace";
import useAdminSession from "./hooks/useAdminSession";
import useStorefrontInteractions from "./hooks/useStorefrontInteractions";
import usePolicyRoute from "./hooks/usePolicyRoute";
import { POLICIES } from "./policies";
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
  const {
    cakeForm,
    setCakeForm,
    editingCakeId,
    adminMessage,
    setAdminMessage,
    resetCakeForm,
    populateCakeForm,
    submitCakeForm,
    removeCake,
  } = useAdminProducts({ catalog, setCatalog, notify });
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminDeliverySettings, setAdminDeliverySettings] = useState(null);
  const [adminOpsMessage, setAdminOpsMessage] = useState("");
  const [adminLoadingSection, setAdminLoadingSection] = useState(false);
  const scrollRoomRef = useRef(null);
  const [orderSuccess, setOrderSuccess] = useState(null);
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
  } = useAdminWorkspace({
    loadEmployeeRecords,
    adminEmployeeFilter,
    setAdminLoadingSection,
    setAdminOpsMessage,
  });
  const {
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
  } = useAdminSession({
    setAdminOpen,
    setAdminSection,
    setAdminDashboard,
    loadAdminSectionData,
    notify,
    setAdminMessage,
  });
  const {
    assignPickerOpen, assignPickerLoading, assignPickerError, assignPickerEmployees,
    assignPickerSelectedId, setAssignPickerSelectedId, assignPickerSubmitting,
    cancelModalOpen, cancelModalReason, setCancelModalReason, cancelModalError, cancelModalSubmitting,
    refundModalOpen, refundModalAmount, setRefundModalAmount, refundModalReason, setRefundModalReason,
    refundModalError, refundModalSubmitting,
    restockModalOpen, restockModalItem, restockModalAction, setRestockModalAction,
    restockModalQty, setRestockModalQty, restockModalReason, setRestockModalReason,
    restockModalError, restockModalSubmitting,
    closeAssignPicker, openAssignPicker, confirmAssignPicker, handleUnassignDelivery,
    getAdminRefundableInfo, closeCancelModal, openCancelModal, confirmCancelModal,
    closeRefundModal, openRefundModal, confirmRefundModal,
    closeRestockModal, openRestockModal, confirmRestockModal,
  } = useAdminActionDialogs({
    adminOrderDetail,
    setAdminOrderDetail,
    setAdminEmployees,
    setAdminOpsMessage,
    loadAdminSectionData,
    setCatalog,
    notify,
  });
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
  const { policySlug, openPolicy, closePolicy } = usePolicyRoute(setChatOpen);
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
  } = useCustomerAccount({
    setUser,
    setAuthOpen,
    setAuthMode,
    setAuthMessage,
    notify,
  });

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
    paymentRetryLoading,
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
    openRazorpayForPayment,
    handleRetryPayment,
  } = useCheckoutFlow({
    user,
    cart,
    setPendingCheckout,
    setAuthOpen,
    setAuthMode,
    setAuthMessage,
    setCart,
    setOrderSuccess,
    setSelectedOrder,
    notify,
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

  const {
    newsletter,
    setNewsletter,
    newsletterDone,
    customBrief,
    setCustomBrief,
    wishlist,
    toggleWishlist,
    sendCustomBrief,
    subscribe,
  } = useStorefrontInteractions(notify);

  const { shareBakeryLocationOnWhatsApp, openBakeryInGoogleMaps } = useBakeryLocation(
    notify,
    () => setBakeryLocationOpen(false)
  );

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


  function openFooterAdmin() {
    if (isAdminLoggedIn) {
      setAdminOpen(true);
      setAdminSection("dashboard");
      try { window.history.pushState({}, "", "/admin"); } catch (_) { /* ignore */ }
    } else {
      openAdminLogin();
    }
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
        <CelebrationGallery whatsappLinkNumber={WHATSAPP_LINK_NUMBER} />

        <ContactStrip
          bakeryHours={BAKERY_LOCATION.hours}
          whatsappNumber={WHATSAPP_NUMBER}
          whatsappLinkNumber={WHATSAPP_LINK_NUMBER}
          contactEmail={CONTACT_EMAIL}
          onVisit={() => setBakeryLocationOpen(true)}
          bakeryLocationOpen={bakeryLocationOpen}
        />
      </main>

      <SiteFooter {...{
        brandName: BRAND_NAME,
        whatsappLinkNumber: WHATSAPP_LINK_NUMBER,
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
          whatsappLinkNumber={WHATSAPP_LINK_NUMBER}
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
