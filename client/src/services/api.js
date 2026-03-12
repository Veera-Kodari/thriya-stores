const API_URL = process.env.REACT_APP_API_URL || '/api';

// ─── Auth helpers ─────────────────────────────────────
const authHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
});

export const registerUser = async (data) => {
  const res = await fetch(`${API_URL}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  return res.json();
};

export const sendOTP = async (data) => {
  const res = await fetch(`${API_URL}/auth/send-otp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  return res.json();
};

export const verifyOTP = async (data) => {
  const res = await fetch(`${API_URL}/auth/verify-otp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  return res.json();
};

export const resendOTP = async (data) => {
  const res = await fetch(`${API_URL}/auth/resend-otp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  return res.json();
};

export const loginUser = async (data) => {
  const res = await fetch(`${API_URL}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  return res.json();
};

export const getMe = async (token) => {
  const res = await fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
  return res.json();
};

export const forgotPassword = async (data) => {
  const res = await fetch(`${API_URL}/auth/forgot-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  return res.json();
};

export const resetPassword = async (data) => {
  const res = await fetch(`${API_URL}/auth/reset-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  return res.json();
};

// ─── Products ─────────────────────────────────────────
export const getProducts = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_URL}/products?${query}`);
  return res.json();
};

export const getFilterOptions = async (category) => {
  const query = category ? `?category=${category}` : '';
  const res = await fetch(`${API_URL}/products/filters${query}`);
  return res.json();
};

export const getProduct = async (id) => {
  const res = await fetch(`${API_URL}/products/${id}`);
  return res.json();
};

export const getSearchSuggestions = async (q) => {
  const res = await fetch(`${API_URL}/products/search-suggestions?q=${encodeURIComponent(q)}`);
  return res.json();
};

export const getProductReviews = async (id) => {
  const res = await fetch(`${API_URL}/products/${id}/reviews`);
  return res.json();
};

export const addProductReview = async (token, productId, data) => {
  const res = await fetch(`${API_URL}/products/${productId}/reviews`, {
    method: 'POST', headers: authHeaders(token), body: JSON.stringify(data),
  });
  return res.json();
};

export const getRelatedProducts = async (id) => {
  const res = await fetch(`${API_URL}/products/${id}/related`);
  return res.json();
};

// ─── Account / Profile ───────────────────────────────
export const getProfile = async (token) => {
  const res = await fetch(`${API_URL}/account/profile`, { headers: authHeaders(token) });
  return res.json();
};

export const updateProfile = async (token, data) => {
  const res = await fetch(`${API_URL}/account/profile`, { method: 'PUT', headers: authHeaders(token), body: JSON.stringify(data) });
  return res.json();
};

export const uploadProfilePic = async (token, profilePic) => {
  const res = await fetch(`${API_URL}/account/profile/pic`, { method: 'PUT', headers: authHeaders(token), body: JSON.stringify({ profilePic }) });
  return res.json();
};

// ─── Addresses ────────────────────────────────────────
export const getAddresses = async (token) => {
  const res = await fetch(`${API_URL}/account/addresses`, { headers: authHeaders(token) });
  return res.json();
};

export const addAddress = async (token, data) => {
  const res = await fetch(`${API_URL}/account/addresses`, { method: 'POST', headers: authHeaders(token), body: JSON.stringify(data) });
  return res.json();
};

export const updateAddress = async (token, id, data) => {
  const res = await fetch(`${API_URL}/account/addresses/${id}`, { method: 'PUT', headers: authHeaders(token), body: JSON.stringify(data) });
  return res.json();
};

export const deleteAddress = async (token, id) => {
  const res = await fetch(`${API_URL}/account/addresses/${id}`, { method: 'DELETE', headers: authHeaders(token) });
  return res.json();
};

// ─── Wishlist ─────────────────────────────────────────
export const getWishlist = async (token) => {
  const res = await fetch(`${API_URL}/account/wishlist`, { headers: authHeaders(token) });
  return res.json();
};

export const toggleWishlistItem = async (token, productId) => {
  const res = await fetch(`${API_URL}/account/wishlist/${productId}`, { method: 'POST', headers: authHeaders(token) });
  return res.json();
};

// ─── Orders ───────────────────────────────────────────
export const getOrders = async (token) => {
  const res = await fetch(`${API_URL}/account/orders`, { headers: authHeaders(token) });
  return res.json();
};

export const placeOrder = async (token, data) => {
  const res = await fetch(`${API_URL}/account/orders`, { method: 'POST', headers: authHeaders(token), body: JSON.stringify(data) });
  return res.json();
};

export const cancelOrder = async (token, orderId) => {
  const res = await fetch(`${API_URL}/account/orders/${orderId}/cancel`, { method: 'PUT', headers: authHeaders(token) });
  return res.json();
};

// ─── Admin ────────────────────────────────────────────
export const getAdminStats = async (token) => {
  const res = await fetch(`${API_URL}/admin/stats`, { headers: authHeaders(token) });
  return res.json();
};

export const getAdminOrders = async (token, params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_URL}/admin/orders?${query}`, { headers: authHeaders(token) });
  return res.json();
};

export const updateOrderStatus = async (token, orderId, data) => {
  const res = await fetch(`${API_URL}/admin/orders/${orderId}/status`, { method: 'PUT', headers: authHeaders(token), body: JSON.stringify(data) });
  return res.json();
};

export const getAdminUsers = async (token) => {
  const res = await fetch(`${API_URL}/admin/users`, { headers: authHeaders(token) });
  return res.json();
};

export const createAdminProduct = async (token, data) => {
  const res = await fetch(`${API_URL}/admin/products`, { method: 'POST', headers: authHeaders(token), body: JSON.stringify(data) });
  return res.json();
};

export const updateAdminProduct = async (token, id, data) => {
  const res = await fetch(`${API_URL}/admin/products/${id}`, { method: 'PUT', headers: authHeaders(token), body: JSON.stringify(data) });
  return res.json();
};

export const deleteAdminProduct = async (token, id) => {
  const res = await fetch(`${API_URL}/admin/products/${id}`, { method: 'DELETE', headers: authHeaders(token) });
  return res.json();
};
