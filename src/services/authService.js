import { appConfig } from "../config";

const API_BASE_URL = appConfig.apiBaseUrl;

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const detailOrMessage =
      (typeof data.detail === "string" && data.detail)
      || (Array.isArray(data.detail) && data.detail[0])
      || (typeof data.message === "string" && data.message)
      || (Array.isArray(data.message) && data.message[0])
      || null;
    const firstError = Object.values(data)[0];
    const message = detailOrMessage
      || (Array.isArray(firstError)
        ? firstError[0]
        : typeof firstError === "string"
          ? firstError
          : "Request failed");

    const error = new Error(message || "Request failed");
    error.status = response.status;
    throw error;
  }

  return data;
}



/** Client TTL cache for stable public catalog data only.
 * Never used for checkout, payment, inventory mutations, coupons, or auth.
 * Invalidated on admin product create/update/delete.
 */
const _catalogCache = new Map();
const CATALOG_TTL_MS = 30_000;

function _cacheGet(key) {
  const hit = _catalogCache.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expires) {
    _catalogCache.delete(key);
    return null;
  }
  return hit.value;
}

function _cacheSet(key, value, ttlMs = CATALOG_TTL_MS) {
  _catalogCache.set(key, { value, expires: Date.now() + ttlMs });
  return value;
}

export function invalidateCatalogClientCache() {
  _catalogCache.clear();
}

/** Normalize list API responses: bare array or paginated { results: [...] }. */
export function asListResponse(data) {
  return Array.isArray(data) ? data : (data?.results || []);
}

/** Public catalog reads only. One retry on timeout, network, or 5xx. 4xx is returned as-is. */
const CATALOG_TIMEOUT_MS = 8000;
const CATALOG_RETRIES = 1;

function isAbortError(error) {
  return error?.name === "AbortError";
}

function delay(ms, signal) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    if (!signal) return;
    const onAbort = () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    };
    if (signal.aborted) {
      onAbort();
      return;
    }
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

async function requestCatalogJson(url, options = {}) {
  const {
    timeoutMs = CATALOG_TIMEOUT_MS,
    retries = CATALOG_RETRIES,
    signal: externalSignal,
    ...rest
  } = options;
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    if (externalSignal?.aborted) {
      throw lastError || new DOMException("Aborted", "AbortError");
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const onExternalAbort = () => controller.abort();
    externalSignal?.addEventListener("abort", onExternalAbort, { once: true });

    try {
      return await requestJson(url, { ...rest, signal: controller.signal });
    } catch (error) {
      lastError = error;
      if (externalSignal?.aborted) throw error;

      const timedOut = isAbortError(error) || controller.signal.aborted;
      const status = error?.status;
      const retryable = timedOut || !status || status >= 500;
      if (!retryable || attempt === retries) {
        if (timedOut) {
          const timeoutError = new Error("Request timed out. Please try again.");
          timeoutError.status = 0;
          timeoutError.timeout = true;
          throw timeoutError;
        }
        throw error;
      }
      await delay(350 * (attempt + 1), externalSignal);
    } finally {
      clearTimeout(timer);
      externalSignal?.removeEventListener("abort", onExternalAbort);
    }
  }

  throw lastError;
}

function buildQuery(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") query.append(key, value);
  });
  return query.toString();
}

export async function signUp(payload) {
  return requestJson(`${API_BASE_URL}/api/accounts/signup/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function signIn(payload) {
  return requestJson(`${API_BASE_URL}/api/accounts/signin/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function sendVerification(payload) {
  return requestJson(`${API_BASE_URL}/api/accounts/send-verification/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function verifyEmail(payload) {
  return requestJson(`${API_BASE_URL}/api/accounts/verify-email/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function verifyOtp(payload) {
  return requestJson(`${API_BASE_URL}/api/accounts/verify-otp/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function requestLoginOtp(payload) {
  return requestJson(`${API_BASE_URL}/api/accounts/request-login-otp/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function verifyLoginOtp(payload) {
  return requestJson(`${API_BASE_URL}/api/accounts/verify-login-otp/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function forgotPassword(payload) {
  return requestJson(`${API_BASE_URL}/api/accounts/forgot-password/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function verifyResetToken(payload) {
  return requestJson(`${API_BASE_URL}/api/accounts/verify-reset-token/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function resetPassword(payload) {
  return requestJson(`${API_BASE_URL}/api/accounts/reset-password/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchCurrentUser(token) {
  return requestJson(`${API_BASE_URL}/api/accounts/me/`, {
    method: "GET",
    headers: {
      Authorization: `Token ${token}`,
    },
  });
}

export async function adminLogin(payload) {
  return requestJson(`${API_BASE_URL}/api/catalog/admin/login/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchAdminReportSummary(params = {}) {
  const qs = buildQuery(params);
  const url = `${API_BASE_URL}/api/catalog/admin/reports/summary/${qs ? `?${qs}` : ""}`;
  return requestJson(url, {
    method: "GET",
    headers: {
      Authorization: `Token ${localStorage.getItem("pinkbakes_admin_token") || ""}`,
    },
  });
}

export async function fetchAdminReportProductPerformance(params = {}) {
  const qs = buildQuery(params);
  const url = `${API_BASE_URL}/api/catalog/admin/reports/product-performance/${qs ? `?${qs}` : ""}`;
  return requestJson(url, {
    method: "GET",
    headers: {
      Authorization: `Token ${localStorage.getItem("pinkbakes_admin_token") || ""}`,
    },
  });
}

export async function fetchAdminReportActivity(params = {}) {
  const qs = buildQuery(params);
  const url = `${API_BASE_URL}/api/catalog/admin/reports/admin-activity/${qs ? `?${qs}` : ""}`;
  return requestJson(url, {
    method: "GET",
    headers: {
      Authorization: `Token ${localStorage.getItem("pinkbakes_admin_token") || ""}`,
    },
  });
}


export async function fetchCategories(options = {}) {
  const key = "categories";
  const cached = _cacheGet(key);
  if (cached) return cached;
  const data = await requestCatalogJson(`${API_BASE_URL}/api/catalog/categories/`, { method: "GET", signal: options.signal });
  return _cacheSet(key, asListResponse(data), 60_000);
}

export async function fetchProducts(params = {}, options = {}) {
  const qs = buildQuery(params);
  const url = `${API_BASE_URL}/api/catalog/products/${qs ? `?${qs}` : ""}`;
  const key = `products:${qs || "all"}`;
  const cached = _cacheGet(key);
  if (cached) return cached;
  const data = await requestCatalogJson(url, { method: "GET", signal: options.signal });
  return _cacheSet(key, asListResponse(data), CATALOG_TTL_MS);
}

export async function fetchProduct(id, options = {}) {
  return requestCatalogJson(`${API_BASE_URL}/api/catalog/products/${id}/`, { method: "GET", signal: options.signal });
}

export async function fetchProductBySlug(slug, options = {}) {
  return requestCatalogJson(`${API_BASE_URL}/api/catalog/products/slug/${encodeURIComponent(slug)}/`, { method: "GET", signal: options.signal });
}

/** Detail by numeric id, falling back to slug when the id route 404s. */
export async function fetchProductDetail(product, options = {}) {
  const id = product?.id;
  const slug = String(product?.slug || "").trim();
  const idText = id == null ? "" : String(id).trim();
  const hasId = idText !== "" && idText !== "undefined" && idText !== "null";

  if (hasId) {
    try {
      return await fetchProduct(idText, options);
    } catch (error) {
      if (!(error?.status === 404 && slug)) throw error;
    }
  }

  if (slug) return fetchProductBySlug(slug, options);

  const missing = new Error("Missing product id");
  missing.status = 400;
  throw missing;
}

export async function fetchProductReviews(productId) {
  return requestCatalogJson(`${API_BASE_URL}/api/catalog/products/${productId}/reviews/`, { method: "GET" });
}

export async function submitReview(productId, payload, token) {
  return requestJson(`${API_BASE_URL}/api/catalog/products/${productId}/reviews/`, {
    method: "POST",
    headers: {
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function checkoutOrder(payload, token) {
  return requestJson(`${API_BASE_URL}/api/orders/checkout/`, {
    method: "POST",
    headers: {
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function createPaymentSession(payload, token) {
  return requestJson(`${API_BASE_URL}/api/payments/create/`, {
    method: "POST",
    headers: {
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function verifyPayment(payload, token) {
  return requestJson(`${API_BASE_URL}/api/payments/verify/`, {
    method: "POST",
    headers: {
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function fetchPayment(paymentId, token) {
  return requestJson(`${API_BASE_URL}/api/payments/${paymentId}/`, {
    method: "GET",
    headers: {
      Authorization: `Token ${token}`,
    },
  });
}

export async function fetchOrderPayments(orderId, token) {
  return requestJson(`${API_BASE_URL}/api/orders/${orderId}/payments/`, {
    method: "GET",
    headers: {
      Authorization: `Token ${token}`,
    },
  });
}

export async function retryPayment(orderId, token) {
  return requestJson(`${API_BASE_URL}/api/orders/${orderId}/retry-payment/`, {
    method: "POST",
    headers: {
      Authorization: `Token ${token}`,
    },
  });
}

export async function fetchOrders(token) {
  return requestJson(`${API_BASE_URL}/api/orders/`, {
    method: "GET",
    headers: {
      Authorization: `Token ${token}`,
    },
  });
}


export async function cancelOrder(orderId, token, reason = "") {
  return requestJson(`${API_BASE_URL}/api/orders/${orderId}/cancel/`, {
    method: "POST",
    headers: {
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify({ reason: reason || "" }),
  });
}

export async function fetchOrder(orderId, token) {
  return requestJson(`${API_BASE_URL}/api/orders/${orderId}/`, {
    method: "GET",
    headers: {
      Authorization: `Token ${token}`,
    },
  });
}

export async function createProduct(payload, token) {
  const __data = await requestJson(`${API_BASE_URL}/api/catalog/admin/products/`, {
    method: "POST",
    headers: {
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(payload),
  });

  invalidateCatalogClientCache();
  return __data;
}

export async function updateProduct(id, payload, token) {
  const __data = await requestJson(`${API_BASE_URL}/api/catalog/admin/products/${id}/`, {
    method: "PUT",
    headers: {
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(payload),
  });

  invalidateCatalogClientCache();
  return __data;
}

export async function deleteProduct(id, token) {
  const __data = await requestJson(`${API_BASE_URL}/api/catalog/admin/products/${id}/`, {
    method: "DELETE",
    headers: {
      Authorization: `Token ${token}`,
    },
  });

  invalidateCatalogClientCache();
  return __data;
}

export async function validateCart(payload) {
  return requestJson(`${API_BASE_URL}/api/cart/validate/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchAdminInventory(params = {}) {
  const qs = buildQuery(params);
  const url = `${API_BASE_URL}/api/catalog/admin/inventory/${qs ? `?${qs}` : ""}`;
  return requestJson(url, {
    method: "GET",
    headers: {
      Authorization: `Token ${localStorage.getItem("pinkbakes_admin_token") || ""}`,
    },
  });
}

export async function fetchAdminInventoryLowStock() {
  return requestJson(`${API_BASE_URL}/api/catalog/admin/inventory/low-stock/`, {
    method: "GET",
    headers: {
      Authorization: `Token ${localStorage.getItem("pinkbakes_admin_token") || ""}`,
    },
  });
}

export async function adjustAdminInventory(productId, payload) {
  return requestJson(`${API_BASE_URL}/api/catalog/admin/inventory/${productId}/adjust/`, {
    method: "POST",
    headers: {
      Authorization: `Token ${localStorage.getItem("pinkbakes_admin_token") || ""}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function fetchAdminInventoryHistory(productId) {
  return requestJson(`${API_BASE_URL}/api/catalog/admin/inventory/${productId}/history/`, {
    method: "GET",
    headers: {
      Authorization: `Token ${localStorage.getItem("pinkbakes_admin_token") || ""}`,
    },
  });
}


export async function validateCoupon(payload, token) {
  return requestJson(`${API_BASE_URL}/api/coupons/validate/`, {
    method: "POST",
    headers: {
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function fetchAdminCoupons(params = {}) {
  const qs = buildQuery(params);
  const url = `${API_BASE_URL}/api/admin/coupons/${qs ? `?${qs}` : ""}`;
  return requestJson(url, {
    method: "GET",
    headers: {
      Authorization: `Token ${localStorage.getItem("pinkbakes_admin_token") || ""}`,
    },
  });
}

export async function createAdminCoupon(payload) {
  return requestJson(`${API_BASE_URL}/api/admin/coupons/`, {
    method: "POST",
    headers: {
      Authorization: `Token ${localStorage.getItem("pinkbakes_admin_token") || ""}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function updateAdminCoupon(id, payload) {
  return requestJson(`${API_BASE_URL}/api/admin/coupons/${id}/`, {
    method: "PATCH",
    headers: {
      Authorization: `Token ${localStorage.getItem("pinkbakes_admin_token") || ""}`,
    },
    body: JSON.stringify(payload),
  });
}


export async function fetchAddresses(token) {
  return requestJson(`${API_BASE_URL}/api/addresses/`, {
    method: "GET",
    headers: {
      Authorization: `Token ${token}`,
    },
  });
}

export async function createAddress(payload, token) {
  return requestJson(`${API_BASE_URL}/api/addresses/`, {
    method: "POST",
    headers: {
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function updateAddress(id, payload, token) {
  return requestJson(`${API_BASE_URL}/api/addresses/${id}/`, {
    method: "PATCH",
    headers: {
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function deleteAddress(id, token) {
  return requestJson(`${API_BASE_URL}/api/addresses/${id}/`, {
    method: "DELETE",
    headers: {
      Authorization: `Token ${token}`,
    },
  });
}

export async function setDefaultAddress(id, token) {
  return requestJson(`${API_BASE_URL}/api/addresses/${id}/set-default/`, {
    method: "POST",
    headers: {
      Authorization: `Token ${token}`,
    },
  });
}

export async function quoteDelivery(payload, token) {
  return requestJson(`${API_BASE_URL}/api/delivery/quote/`, {
    method: "POST",
    headers: {
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function fetchAdminDeliveryZones(params = {}) {
  const qs = buildQuery(params);
  const url = `${API_BASE_URL}/api/admin/delivery-zones/${qs ? `?${qs}` : ""}`;
  return requestJson(url, {
    method: "GET",
    headers: {
      Authorization: `Token ${localStorage.getItem("pinkbakes_admin_token") || ""}`,
    },
  });
}

export async function createAdminDeliveryZone(payload) {
  return requestJson(`${API_BASE_URL}/api/admin/delivery-zones/`, {
    method: "POST",
    headers: {
      Authorization: `Token ${localStorage.getItem("pinkbakes_admin_token") || ""}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function updateAdminDeliveryZone(id, payload) {
  return requestJson(`${API_BASE_URL}/api/admin/delivery-zones/${id}/`, {
    method: "PATCH",
    headers: {
      Authorization: `Token ${localStorage.getItem("pinkbakes_admin_token") || ""}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function fetchAdminDeliverySettings() {
  return requestJson(`${API_BASE_URL}/api/admin/delivery-settings/`, {
    method: "GET",
    headers: {
      Authorization: `Token ${localStorage.getItem("pinkbakes_admin_token") || ""}`,
    },
  });
}

export async function updateAdminDeliverySettings(payload) {
  return requestJson(`${API_BASE_URL}/api/admin/delivery-settings/`, {
    method: "PATCH",
    headers: {
      Authorization: `Token ${localStorage.getItem("pinkbakes_admin_token") || ""}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function fetchNotificationPreferences(token) {
  return requestJson(`${API_BASE_URL}/api/accounts/notification-preferences/`, {
    method: "GET",
    headers: { Authorization: `Token ${token}` },
  });
}

export async function updateNotificationPreferences(token, payload) {
  return requestJson(`${API_BASE_URL}/api/accounts/notification-preferences/`, {
    method: "PATCH",
    headers: { Authorization: `Token ${token}` },
    body: JSON.stringify(payload),
  });
}

export async function fetchInAppNotifications(token, params = {}) {
  const query = new URLSearchParams();
  if (params.unread) query.append("unread", "true");
  if (params.limit) query.append("limit", params.limit);
  const qs = query.toString();
  return requestJson(`${API_BASE_URL}/api/accounts/notifications${qs ? `?${qs}` : ""}`, {
    method: "GET",
    headers: { Authorization: `Token ${token}` },
  });
}

export async function markNotificationRead(token, notificationId) {
  return requestJson(`${API_BASE_URL}/api/accounts/notifications/${notificationId}/read/`, {
    method: "POST",
    headers: { Authorization: `Token ${token}` },
  });
}

export async function markAllNotificationsRead(token) {
  return requestJson(`${API_BASE_URL}/api/accounts/notifications/mark-all-read/`, {
    method: "POST",
    headers: { Authorization: `Token ${token}` },
  });
}

export async function fetchAdminNotifications(token) {
  return requestJson(`${API_BASE_URL}/api/admin/notifications/`, {
    method: "GET",
    headers: { Authorization: `Token ${token}` },
  });
}

export async function fetchAdminNotificationLogs(token, params = {}) {
  const qs = buildQuery(params);
  return requestJson(`${API_BASE_URL}/api/admin/notification-logs${qs ? `?${qs}` : ""}`, {
    method: "GET",
    headers: { Authorization: `Token ${token}` },
  });
}

export async function fetchAdminDashboard(params = {}) {
  const qs = buildQuery(params);
  return requestJson(`${API_BASE_URL}/api/admin/dashboard/${qs ? `?${qs}` : ""}`, {
    method: "GET",
    headers: { Authorization: `Token ${localStorage.getItem("pinkbakes_admin_token") || ""}` },
  });
}

export async function fetchAdminOrders(params = {}) {
  const qs = buildQuery(params);
  return requestJson(`${API_BASE_URL}/api/admin/orders/${qs ? `?${qs}` : ""}`, {
    method: "GET",
    headers: { Authorization: `Token ${localStorage.getItem("pinkbakes_admin_token") || ""}` },
  });
}

export async function fetchAdminOrderDetail(orderId) {
  return requestJson(`${API_BASE_URL}/api/admin/orders/${orderId}/`, {
    method: "GET",
    headers: { Authorization: `Token ${localStorage.getItem("pinkbakes_admin_token") || ""}` },
  });
}

export async function updateAdminOrderStatus(orderId, payload) {
  return requestJson(`${API_BASE_URL}/api/admin/orders/${orderId}/status/`, {
    method: "PATCH",
    headers: { Authorization: `Token ${localStorage.getItem("pinkbakes_admin_token") || ""}` },
    body: JSON.stringify(payload),
  });
}

export async function cancelAdminOrder(orderId, reason = "") {
  return requestJson(`${API_BASE_URL}/api/admin/orders/${orderId}/cancel/`, {
    method: "POST",
    headers: { Authorization: `Token ${localStorage.getItem("pinkbakes_admin_token") || ""}` },
    body: JSON.stringify({ reason }),
  });
}

export async function refundAdminOrder(orderId, payload = {}) {
  return requestJson(`${API_BASE_URL}/api/admin/orders/${orderId}/refund/`, {
    method: "POST",
    headers: { Authorization: `Token ${localStorage.getItem("pinkbakes_admin_token") || ""}` },
    body: JSON.stringify(payload),
  });
}

export async function fetchAdminPayments(params = {}) {
  const qs = buildQuery(params);
  const url = qs
    ? `${API_BASE_URL}/api/admin/payments/?${qs}`
    : `${API_BASE_URL}/api/admin/payments/`;
  const data = await requestJson(url, {
    method: "GET",
    headers: { Authorization: `Token ${localStorage.getItem("pinkbakes_admin_token") || ""}` },
  });
  // Normalize so callers always get { results, count } even if shape drifts.
  const results = asListResponse(data);
  return {
    ...(data && typeof data === "object" && !Array.isArray(data) ? data : {}),
    results,
    count: data?.count ?? results.length,
  };
}

export async function fetchAdminRefunds(params = {}) {
  const qs = buildQuery(params);
  const url = qs
    ? `${API_BASE_URL}/api/admin/refunds/?${qs}`
    : `${API_BASE_URL}/api/admin/refunds/`;
  const data = await requestJson(url, {
    method: "GET",
    headers: { Authorization: `Token ${localStorage.getItem("pinkbakes_admin_token") || ""}` },
  });
  const results = asListResponse(data);
  return {
    ...(data && typeof data === "object" && !Array.isArray(data) ? data : {}),
    results,
    count: data?.count ?? results.length,
  };
}

export async function fetchAdminCustomers(params = {}) {
  const qs = buildQuery(params);
  return requestJson(`${API_BASE_URL}/api/admin/customers/${qs ? `?${qs}` : ""}`, {
    method: "GET",
    headers: { Authorization: `Token ${localStorage.getItem("pinkbakes_admin_token") || ""}` },
  });
}

export async function fetchAdminCustomerDetail(userId) {
  return requestJson(`${API_BASE_URL}/api/admin/customers/${userId}/`, {
    method: "GET",
    headers: { Authorization: `Token ${localStorage.getItem("pinkbakes_admin_token") || ""}` },
  });
}

export async function updateAdminCustomerStatus(userId, isActive) {
  return requestJson(`${API_BASE_URL}/api/admin/customers/${userId}/`, {
    method: "PATCH",
    headers: { Authorization: `Token ${localStorage.getItem("pinkbakes_admin_token") || ""}` },
    body: JSON.stringify({ is_active: isActive }),
  });
}

export async function fetchAdminEmployees(params = {}) {
  const qs = buildQuery(params);
  return requestJson(`${API_BASE_URL}/api/admin/employees/${qs ? `?${qs}` : ""}`, {
    method: "GET",
    headers: { Authorization: `Token ${localStorage.getItem("pinkbakes_admin_token") || ""}` },
  });
}

export async function createAdminEmployee(payload) {
  return requestJson(`${API_BASE_URL}/api/admin/employees/`, {
    method: "POST",
    headers: { Authorization: `Token ${localStorage.getItem("pinkbakes_admin_token") || ""}` },
    body: JSON.stringify(payload),
  });
}

export async function updateAdminEmployee(id, payload) {
  return requestJson(`${API_BASE_URL}/api/admin/employees/${id}/`, {
    method: "PATCH",
    headers: { Authorization: `Token ${localStorage.getItem("pinkbakes_admin_token") || ""}` },
    body: JSON.stringify(payload),
  });
}

export async function assignAdminDelivery(orderId, employeeId) {
  return requestJson(`${API_BASE_URL}/api/admin/orders/${orderId}/assign-delivery/`, {
    method: "POST",
    headers: { Authorization: `Token ${localStorage.getItem("pinkbakes_admin_token") || ""}` },
    body: JSON.stringify({ employee_id: employeeId }),
  });
}

export async function unassignAdminDelivery(orderId) {
  return requestJson(`${API_BASE_URL}/api/admin/orders/${orderId}/unassign-delivery/`, {
    method: "POST",
    headers: { Authorization: `Token ${localStorage.getItem("pinkbakes_admin_token") || ""}` },
    body: JSON.stringify({}),
  });
}

export async function fetchAdminActiveDeliveries(params = {}) {
  const qs = buildQuery(params);
  return requestJson(`${API_BASE_URL}/api/admin/deliveries/active/${qs ? `?${qs}` : ""}`, {
    method: "GET",
    headers: { Authorization: `Token ${localStorage.getItem("pinkbakes_admin_token") || ""}` },
  });
}

export async function fetchAdminReviews(params = {}) {
  const qs = buildQuery(params);
  return requestJson(`${API_BASE_URL}/api/admin/reviews/${qs ? `?${qs}` : ""}`, {
    method: "GET",
    headers: { Authorization: `Token ${localStorage.getItem("pinkbakes_admin_token") || ""}` },
  });
}

export async function approveAdminReview(reviewId, adminComment = "") {
  return requestJson(`${API_BASE_URL}/api/admin/reviews/${reviewId}/approve/`, {
    method: "POST",
    headers: { Authorization: `Token ${localStorage.getItem("pinkbakes_admin_token") || ""}` },
    body: JSON.stringify({ admin_comment: adminComment }),
  });
}

export async function rejectAdminReview(reviewId, adminComment = "") {
  return requestJson(`${API_BASE_URL}/api/admin/reviews/${reviewId}/reject/`, {
    method: "POST",
    headers: { Authorization: `Token ${localStorage.getItem("pinkbakes_admin_token") || ""}` },
    body: JSON.stringify({ admin_comment: adminComment }),
  });
}

export async function fetchAdminSettingsStatus() {
  return requestJson(`${API_BASE_URL}/api/admin/settings/status/`, {
    method: "GET",
    headers: { Authorization: `Token ${localStorage.getItem("pinkbakes_admin_token") || ""}` },
  });
}

export async function updateAdminSettingsStatus(payload) {
  return requestJson(`${API_BASE_URL}/api/admin/settings/status/`, {
    method: "PATCH",
    headers: { Authorization: `Token ${localStorage.getItem("pinkbakes_admin_token") || ""}` },
    body: JSON.stringify(payload),
  });
}

export function adminExportUrl(entity, params = {}) {
  const qs = buildQuery(params);
  return `${API_BASE_URL}/api/admin/exports/${entity}/${qs ? `?${qs}` : ""}`;
}

export async function downloadAdminExport(entity, params = {}) {
  const token = localStorage.getItem("pinkbakes_admin_token") || "";
  const url = adminExportUrl(entity, params);
  const response = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Token ${token}` },
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.detail || "Export failed");
  }
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = `${entity}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(objectUrl);
}


export async function logout(token) {
  return requestJson(`${API_BASE_URL}/api/accounts/logout/`, {
    method: "POST",
    headers: {
      Authorization: `Token ${token}`,
    },
  });
}


export async function adminLogout(token) {
  return requestJson(`${API_BASE_URL}/api/catalog/admin/logout/`, {
    method: "POST",
    headers: {
      Authorization: `Token ${token}`,
    },
  });
}
