import { useState } from "react";
import {
  createAddress,
  createPaymentSession,
  fetchAddresses,
  quoteDelivery,
  validateCoupon,
} from "../services/authService";

export default function useCheckoutFlow({
  user,
  cart,
  setPendingCheckout,
  setAuthOpen,
  setAuthMode,
  setAuthMessage,
  notify,
  openRazorpayForPayment,
}) {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponMessage, setCouponMessage] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
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
      .then(data => {
        setDeliveryQuote(data);
        setDeliveryQuoteMessage(data.message || "");
      })
      .catch(error => {
        setDeliveryQuote(null);
        setDeliveryQuoteMessage(error.message || "Unable to quote delivery.");
      });
  }

  function applyAddressToCheckout(address) {
    if (!address) return;
    setSelectedAddressId(address.id);
    setShowNewAddressForm(false);
    setCheckoutForm(previous => ({
      ...previous,
      customer_name: address.full_name || previous.customer_name,
      customer_mobile: address.mobile_number || previous.customer_mobile,
      shipping_address: address.address_line_1 || "",
      shipping_address_2: address.address_line_2 || "",
      landmark: address.landmark || "",
      city: address.city || "",
      state: address.state || "",
      postal_code: address.postal_code || "",
      country: address.country || "India",
      shipping_latitude: address.latitude != null ? String(address.latitude) : "",
      shipping_longitude: address.longitude != null ? String(address.longitude) : "",
    }));
    refreshDeliveryQuote(address.postal_code, address.id, address.latitude, address.longitude);
  }

  function loadSavedAddresses() {
    const token = localStorage.getItem("pinkbakes_token");
    if (!token) return;
    fetchAddresses(token)
      .then(data => {
        const list = data.results || [];
        setSavedAddresses(list);
        const defaultAddress = list.find(address => address.is_default) || list[0];
        if (defaultAddress) applyAddressToCheckout(defaultAddress);
      })
      .catch(() => setSavedAddresses([]));
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
      .then(data => {
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
      .catch(error => {
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
      .then(address => {
        setSavedAddresses(previous => [address, ...previous.filter(item => item.id !== address.id)]);
        applyAddressToCheckout(address);
        notify("Address saved");
      })
      .catch(error => setCheckoutMessage(error.message || "Unable to save address."));
  }

  function openCheckout(authedOverride) {
    if (!(authedOverride || user)) {
      setPendingCheckout(true);
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

  function handleCheckoutSubmit(event) {
    event.preventDefault();
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
      .then(async paymentInfo => {
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
      .catch(error => setCheckoutMessage(error.message || "Unable to start payment right now."))
      .finally(() => setCheckoutLoading(false));
  }

  return {
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
    loadSavedAddresses,
    handleApplyCoupon,
    handleRemoveCoupon,
    handleSaveNewAddress,
    openCheckout,
    handleCheckoutSubmit,
  };
}
