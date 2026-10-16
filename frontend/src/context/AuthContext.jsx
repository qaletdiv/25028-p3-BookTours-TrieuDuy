import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { authApi, clearToken, getToken, setToken } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const loggingOut = useRef(false);
  const location = useLocation();

  useEffect(() => {
    if (!getToken()) {
      setReady(true);
      return undefined;
    }

    let cancelled = false;
    authApi
      .me()
      .then((currentUser) => {
        if (!cancelled) setUser(currentUser);
      })
      .catch(() => {
        clearToken();
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const protectedPath = ["/thanh-toan", "/tai-khoan"].includes(location.pathname) || location.pathname.startsWith("/xac-nhan/");
    if (!protectedPath) loggingOut.current = false;
  }, [location]);

  const value = useMemo(
    () => ({
      user,
      ready,
      async login(payload) {
        const data = await authApi.login(payload);
        setToken(data.token);
        setUser(data.user);
        return data.user;
      },
      logout() {
        loggingOut.current = true;
        clearToken();
        setUser(null);
      },
      loggingOut,
      updateAddress(address) {
        setUser((current) => (current ? { ...current, address } : current));
      },
    }),
    [user, ready],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth phải nằm trong AuthProvider.");
  }
  return context;
}
