const CART_KEY = "booktours_cart";

export function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function readCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "null");
  } catch {
    return null;
  }
}

export function clearCart() {
  localStorage.removeItem(CART_KEY);
}
