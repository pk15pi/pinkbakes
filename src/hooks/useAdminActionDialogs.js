import { useState } from "react";
import {
  adjustAdminInventory,
  assignAdminDelivery,
  cancelAdminOrder,
  fetchAdminOrderDetail,
  fetchAdminEmployees,
  fetchProducts,
  refundAdminOrder,
  unassignAdminDelivery,
} from "../services/authService";
import { asListResponse } from "../services/authService";
import { normalizeProduct } from "../productUtils";

export default function useAdminActionDialogs({
  adminOrderDetail,
  setAdminOrderDetail,
  setAdminEmployees,
  setAdminOpsMessage,
  loadAdminSectionData,
  setCatalog,
  notify,
}) {
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
    fetchAdminEmployees()
      .then(data => {
        const list = Array.isArray(data) ? data : (data.results || []);
        setAdminEmployees(list);
        const assignable = list.filter(employee =>
          employee.employment_status === "ACTIVE" && (employee.status === "ACTIVE" || employee.status === "AVAILABLE")
        );
        setAssignPickerEmployees(assignable);
        const currentId = adminOrderDetail?.delivery_employee?.id;
        if (currentId && assignable.some(employee => employee.id === currentId)) {
          setAssignPickerSelectedId(String(currentId));
        } else if (assignable.length === 1) {
          setAssignPickerSelectedId(String(assignable[0].id));
        }
      })
      .catch(error => setAssignPickerError(error.message || "Could not load employees."))
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
      .then(order => {
        setAdminOrderDetail(order);
        setAdminOpsMessage(isReassign ? "Delivery reassigned." : "Delivery assigned.");
        closeAssignPicker();
        loadAdminSectionData("orders");
      })
      .catch(error => setAssignPickerError(error.message || "Assign failed."))
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
      .then(order => {
        setAdminOrderDetail(order);
        setAdminOpsMessage("Delivery unassigned.");
        loadAdminSectionData("orders");
      })
      .catch(error => setAdminOpsMessage(error.message || "Unassign failed."));
  }

  function getAdminRefundableInfo(order) {
    if (!order) return { paymentAmount: null, maxRefundable: null, paymentStatus: null };
    const payments = Array.isArray(order.payments) ? order.payments : [];
    const refundableStatuses = ["paid", "refund_pending", "partially_refunded"];
    const paid = payments.find(payment => refundableStatuses.includes(payment.status)) || payments[0] || null;
    const paymentAmount = paid ? Number(paid.amount) : (order.total_amount != null ? Number(order.total_amount) : null);
    const completedRefunded = Number(order.refunds_summary?.completed_amount ?? 0);
    const maxRefundable = paymentAmount != null && !Number.isNaN(paymentAmount)
      ? Math.max(0, Math.round((paymentAmount - completedRefunded) * 100) / 100)
      : null;
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
      .then(order => {
        setAdminOrderDetail(order);
        setAdminOpsMessage("Order cancelled.");
        closeCancelModal();
        loadAdminSectionData("orders");
      })
      .catch(error => setCancelModalError(error.message || "Cancel failed."))
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
    const amountString = String(refundModalAmount || "").trim();
    const payload = { reason: (refundModalReason || "").trim() || "Admin refund" };
    if (amountString) {
      const amount = Number(amountString);
      if (!Number.isFinite(amount) || amount <= 0) {
        setRefundModalError("Enter a valid refund amount greater than zero, or leave blank for full refund.");
        return;
      }
      if (maxRefundable != null && amount > maxRefundable + 1e-9) {
        setRefundModalError(`Amount cannot exceed max refundable (Rs.${maxRefundable.toLocaleString("en-IN")}).`);
        return;
      }
      payload.amount = amountString;
    }
    setRefundModalSubmitting(true);
    setRefundModalError("");
    refundAdminOrder(adminOrderDetail.id, payload)
      .then(() => {
        setAdminOpsMessage("Refund initiated");
        closeRefundModal();
        return fetchAdminOrderDetail(adminOrderDetail.id).then(setAdminOrderDetail);
      })
      .catch(error => setRefundModalError(error.message || "Refund failed."))
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
    const quantity = Number(restockModalQty);
    if (!Number.isFinite(quantity) || !Number.isInteger(quantity)) {
      setRestockModalError("Quantity must be a whole number.");
      return;
    }
    if (["restock", "remove", "set"].includes(restockModalAction) && quantity < 0) {
      setRestockModalError("Quantity must be zero or greater for this action.");
      return;
    }
    if (restockModalAction === "restock" && quantity === 0) {
      setRestockModalError("Restock quantity must be greater than zero.");
      return;
    }
    setRestockModalSubmitting(true);
    setRestockModalError("");
    const reason = (restockModalReason || "").trim() || "Restock";
    adjustAdminInventory(restockModalItem.id, { action: restockModalAction, quantity, reason })
      .then(() => {
        setAdminOpsMessage("Stock updated.");
        const source = restockModalSource;
        closeRestockModal();
        if (source === "products") {
          return fetchProducts().then(data => {
            setCatalog(asListResponse(data).map(normalizeProduct));
            notify("Stock updated");
          });
        }
        return loadAdminSectionData("inventory");
      })
      .catch(error => setRestockModalError(error.message || "Unable to adjust stock."))
      .finally(() => setRestockModalSubmitting(false));
  }

  return {
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
  };
}
