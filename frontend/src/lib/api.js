const API_URL = import.meta.env.VITE_API_URL || "/api";

async function request(path) {
  const response = await fetch(`${API_URL}${path}`);
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || "Không thể tải dữ liệu.");
  }
  return response.json();
}

export const toursApi = {
  getHome: () => request("/tours/home"),
  getFilters: () => request("/tours/filters"),
  getSuggestions: (keyword) => request(`/tours/suggestions?q=${encodeURIComponent(keyword)}`),
  getTours: (searchParams) => request(`/tours?${searchParams.toString()}`),
  getTour: (slug) => request(`/tours/${slug}`),
};
