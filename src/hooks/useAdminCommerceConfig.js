import { useState } from "react";
import {
  createAdminCoupon,
  createAdminDeliveryZone,
  fetchAdminCoupons,
  fetchAdminDeliverySettings,
  fetchAdminDeliveryZones,
  updateAdminCoupon,
  updateAdminDeliveryZone,
} from "../services/authService";

export default function useAdminCommerceConfig({ setAdminDeliverySettings }) {
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

  function loadAdminCoupons() {
    fetchAdminCoupons()
      .then(data => setAdminCoupons(data.results || []))
      .catch(error => setAdminCouponMessage(error.message || "Unable to load coupons."));
  }

  function handleCreateAdminCoupon(event) {
    event.preventDefault();
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
      .catch(error => setAdminCouponMessage(error.message || "Could not create coupon."));
  }

  function handleToggleAdminCoupon(coupon) {
    updateAdminCoupon(coupon.id, { is_active: !coupon.is_active })
      .then(() => loadAdminCoupons())
      .catch(error => setAdminCouponMessage(error.message || "Could not update coupon."));
  }

  function loadAdminDeliveryZones() {
    fetchAdminDeliveryZones()
      .then(data => setAdminZones(data.results || []))
      .catch(error => setAdminDeliveryMessage(error.message || "Unable to load zones."));
    fetchAdminDeliverySettings()
      .then(setAdminDeliverySettings)
      .catch(() => {});
  }

  function handleCreateAdminZone(event) {
    event.preventDefault();
    setAdminDeliveryMessage("");
    const postalCodes = (adminZoneForm.postal_codes || "").split(/[,\s]+/).map(value => value.trim()).filter(Boolean);
    createAdminDeliveryZone({
      name: adminZoneForm.name,
      postal_codes: postalCodes,
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
      .catch(error => setAdminDeliveryMessage(error.message || "Could not create zone."));
  }

  function toggleAdminZone(zone) {
    updateAdminDeliveryZone(zone.id, { is_active: !zone.is_active })
      .then(() => loadAdminDeliveryZones())
      .catch(error => setAdminDeliveryMessage(error.message || "Could not update zone."));
  }

  return {
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
  };
}
