const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

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
    const firstError = Object.values(data)[0];
    const message = Array.isArray(firstError)
      ? firstError[0]
      : typeof firstError === "string"
        ? firstError
        : "Request failed";

    throw new Error(message || "Request failed");
  }

  return data;
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
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, value);
    }
  });

  const url = `${API_BASE_URL}/api/catalog/admin/reports/summary/${query.toString() ? `?${query.toString()}` : ""}`;
  return requestJson(url, {
    method: "GET",
    headers: {
      Authorization: `Token ${localStorage.getItem("pinkbakes_admin_token") || ""}`,
    },
  });
}

export async function fetchAdminReportProductPerformance(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, value);
    }
  });

  const url = `${API_BASE_URL}/api/catalog/admin/reports/product-performance/${query.toString() ? `?${query.toString()}` : ""}`;
  return requestJson(url, {
    method: "GET",
    headers: {
      Authorization: `Token ${localStorage.getItem("pinkbakes_admin_token") || ""}`,
    },
  });
}

export async function fetchAdminReportActivity(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, value);
    }
  });

  const url = `${API_BASE_URL}/api/catalog/admin/reports/admin-activity/${query.toString() ? `?${query.toString()}` : ""}`;
  return requestJson(url, {
    method: "GET",
    headers: {
      Authorization: `Token ${localStorage.getItem("pinkbakes_admin_token") || ""}`,
    },
  });
}

export async function fetchProducts(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, value);
    }
  });

  const url = `${API_BASE_URL}/api/catalog/products/${query.toString() ? `?${query.toString()}` : ""}`;
  return requestJson(url, { method: "GET" });
}

export async function fetchProduct(id) {
  return requestJson(`${API_BASE_URL}/api/catalog/products/${id}/`, { method: "GET" });
}

export async function fetchProductReviews(productId) {
  return requestJson(`${API_BASE_URL}/api/catalog/products/${productId}/reviews/`, { method: "GET" });
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

export async function createProduct(payload, token) {
  return requestJson(`${API_BASE_URL}/api/catalog/admin/products/`, {
    method: "POST",
    headers: {
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function updateProduct(id, payload, token) {
  return requestJson(`${API_BASE_URL}/api/catalog/admin/products/${id}/`, {
    method: "PUT",
    headers: {
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function deleteProduct(id, token) {
  return requestJson(`${API_BASE_URL}/api/catalog/admin/products/${id}/`, {
    method: "DELETE",
    headers: {
      Authorization: `Token ${token}`,
    },
  });
}
