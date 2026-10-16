const API_URL = import.meta.env.VITE_API_URL || "/api";
const TOKEN_KEY = "booktours_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request(path, { method = "GET", body } = {}) {
  const headers = {};
  const token = getToken();
  if (body) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || "Không thể tải dữ liệu.");
    error.errors = data.errors || [];
    error.status = response.status;
    throw error;
  }
  return data;
}

export const toursApi = {
  getHome: () => request("/tours/home"),
  getFilters: () => request("/tours/filters"),
  getSuggestions: (keyword) => request(`/tours/suggestions?q=${encodeURIComponent(keyword)}`),
  getTours: (searchParams) => request(`/tours?${searchParams.toString()}`),
  getTour: (slug) => request(`/tours/${slug}`),
};

export const authApi = {
  register: (payload) => request("/auth/register", { method: "POST", body: payload }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),
  me: () => request("/auth/me"),
};

export const bookingsApi = {
  create: (payload) => request("/bookings", { method: "POST", body: payload }),
  list: () => request("/bookings"),
  get: (code) => request(`/bookings/${code}`),
};
