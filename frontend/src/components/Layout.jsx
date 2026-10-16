import { useState } from "react";
import { Facebook, Instagram, Mail, MapPin, Menu, Phone, X } from "lucide-react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { label: "Trang chủ", to: "/" },
  { label: "Tour trong nước", to: "/tours?region=domestic" },
  { label: "Tour nước ngoài", to: "/tours?region=international" },
  { label: "Liên hệ", to: "/#contact" },
];

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  function isNavActive(to) {
    if (to === "/") return location.pathname === "/";
    if (to.includes("region=domestic")) return location.pathname === "/tours" && new URLSearchParams(location.search).get("region") === "domestic";
    if (to.includes("region=international")) return location.pathname === "/tours" && new URLSearchParams(location.search).get("region") === "international";
    if (to.includes("#contact")) return location.hash === "#contact";
    return false;
  }

  return (
    <div className="site-shell">
      <div className="topbar">
        <div className="container topbar-inner">
          <span><Phone size={14} /> 1900 636 832</span>
          <span><Mail size={14} /> hello@booktours.vn</span>
          <span className="topbar-note">Tư vấn miễn phí 08:00 – 22:00</span>
        </div>
      </div>

      <header className="header">
        <div className="container header-inner">
          <Link className="brand" to="/" onClick={() => setMenuOpen(false)}>
            <span className="brand-mark">B</span>
            <span>Book<span>Tours</span></span>
          </Link>
          <button className="menu-button" aria-label="Mở menu" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X /> : <Menu />}
          </button>
          <nav className={menuOpen ? "nav open" : "nav"}>
            {navItems.map((item) => (
              <Link className={isNavActive(item.to) ? "active" : ""} key={item.label} to={item.to} onClick={() => setMenuOpen(false)}>
                {item.label}
              </Link>
            ))}
            <div className="auth-actions">
              {user ? (
                <>
                  <Link className={location.pathname === "/tai-khoan" ? "login-link active" : "login-link"} to="/tai-khoan" onClick={() => setMenuOpen(false)}>{user.fullName}</Link>
                  <button
                    className="text-button"
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                      navigate("/", { replace: true });
                    }}
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <Link className="login-link" to="/dang-nhap" onClick={() => setMenuOpen(false)}>Đăng nhập</Link>
                  <Link className="button button-sm" to="/dang-ky" onClick={() => setMenuOpen(false)}>Đăng ký</Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>

      <main><Outlet /></main>

      <footer className="footer" id="contact">
        <div className="container footer-grid">
          <div>
            <Link className="brand brand-light" to="/"><span className="brand-mark">B</span><span>Book<span>Tours</span></span></Link>
            <p>Đồng hành cùng bạn trên mọi hành trình, mang đến những trải nghiệm đáng nhớ với dịch vụ tận tâm.</p>
            <div className="socials"><a href="#facebook" aria-label="Facebook"><Facebook /></a><a href="#instagram" aria-label="Instagram"><Instagram /></a></div>
          </div>
          <div><h4>Khám phá</h4><Link to="/tours?region=domestic">Tour trong nước</Link><Link to="/tours?region=international">Tour nước ngoài</Link><Link to="/tours?sort=price_asc">Tour ưu đãi</Link></div>
          <div><h4>Hỗ trợ</h4><a href="#guide">Hướng dẫn đặt tour</a><a href="#policy">Chính sách bảo mật</a><a href="#terms">Điều khoản sử dụng</a></div>
          <div><h4>Liên hệ</h4><p><MapPin size={17} /> 123 Nguyễn Huệ, Quận 1, TP.HCM</p><p><Phone size={17} /> 1900 636 832</p><p><Mail size={17} /> hello@booktours.vn</p></div>
        </div>
        <div className="container copyright">© 2026 BookTours. All rights reserved.</div>
      </footer>
    </div>
  );
}
