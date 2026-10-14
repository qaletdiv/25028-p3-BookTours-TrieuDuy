import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function safeNext(value) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

function fieldMessage(errors, field) {
  return errors.find((item) => item.field === field)?.message || "";
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState([]);
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState(location.state?.notice || "");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Đăng nhập | BookTours";
  }, []);

  async function submit(event) {
    event.preventDefault();
    setErrors([]);
    setMessage("");
    setNotice("");
    setSubmitting(true);
    try {
      await login(form);
      navigate(safeNext(searchParams.get("next")), { replace: true });
    } catch (error) {
      setMessage(error.message);
      setErrors(error.errors || []);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <section className="page-hero auth-hero">
        <div className="container">
          <span className="eyebrow eyebrow-light">Chào mừng trở lại</span>
          <h1>Đăng nhập</h1>
          <p>Đăng nhập để tiếp tục đặt tour và hoàn tất thanh toán.</p>
        </div>
      </section>
      <section className="section auth-section">
        <form className="auth-card" noValidate onSubmit={submit}>
          {notice && <p className="form-banner form-banner-success">{notice}</p>}
          {message && <p className="form-banner">{message}</p>}
          <label>
            Email
            <input name="email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="ban@email.com" />
            {fieldMessage(errors, "email") && <small>{fieldMessage(errors, "email")}</small>}
          </label>
          <label>
            Mật khẩu
            <input name="password" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
            {fieldMessage(errors, "password") && <small>{fieldMessage(errors, "password")}</small>}
          </label>
          <button className="button" type="submit" disabled={submitting}>
            {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
          <p className="auth-switch">
            Chưa có tài khoản? <Link to="/dang-ky">Đăng ký</Link>
          </p>
        </form>
      </section>
    </>
  );
}
