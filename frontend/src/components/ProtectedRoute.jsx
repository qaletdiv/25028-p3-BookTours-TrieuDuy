import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { user, ready, loggingOut } = useAuth();
  const location = useLocation();

  if (!ready) {
    return (
      <div className="page-loader">
        <span />
      </div>
    );
  }

  if (!user) {
    if (loggingOut.current) return null;
    const next = `${location.pathname}${location.search}`;
    return <Navigate to={`/dang-nhap?next=${encodeURIComponent(next)}`} replace />;
  }

  return <Outlet />;
}
