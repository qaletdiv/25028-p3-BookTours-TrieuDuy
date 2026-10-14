import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../lib/api";

const emptyForm = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

function fieldMessage(errors, field) {
  return errors.find((item) => item.field === field)?.message || "";
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState([]);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Đăng ký | BookTours";
  }, []);

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function submit(event) {
    event.preventDefault();
    setErrors([]);
    setMessage("");
    setSubmitting(true);
    try {
      const result = await authApi.register(form);
      navigate("/dang-nhap", { state: { notice: result.message } });
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
          <span className="eyebrow eyebrow-light">Tài khoản BookTours</span>
          <h1>Đăng ký</h1>
          <p>Tạo tài khoản để đặt tour và theo dõi hành trình của bạn.</p>
        </div>
      </section>
      <section className="section auth-section">
        <form className="auth-card" noValidate onSubmit={submit}>
          {message && <p className="form-banner">{message}</p>}
          <label>
            Họ và tên
            <input name="fullName" value={form.fullName} onChange={updateField} placeholder="Nguyễn Văn A" />
            {fieldMessage(errors, "fullName") && <small>{fieldMessage(errors, "fullName")}</small>}
          </label>
          <label>
            Email
            <input name="email" type="email" value={form.email} onChange={updateField} placeholder="ban@email.com" />
            {fieldMessage(errors, "email") && <small>{fieldMessage(errors, "email")}</small>}
          </label>
          <label>
            Số điện thoại
            <input name="phone" value={form.phone} onChange={updateField} placeholder="0901234567" />
            {fieldMessage(errors, "phone") && <small>{fieldMessage(errors, "phone")}</small>}
          </label>
          <label>
            Mật khẩu
            <input name="password" type="password" value={form.password} onChange={updateField} placeholder="Ít nhất 6 ký tự" />
            {fieldMessage(errors, "password") && <small>{fieldMessage(errors, "password")}</small>}
          </label>
          <label>
            Nhập lại mật khẩu
            <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={updateField} />
            {fieldMessage(errors, "confirmPassword") && <small>{fieldMessage(errors, "confirmPassword")}</small>}
          </label>
          <button className="button" type="submit" disabled={submitting}>
            {submitting ? "Đang tạo tài khoản..." : "Đăng ký"}
          </button>
          <p className="auth-switch">
            Đã có tài khoản? <Link to="/dang-nhap">Đăng nhập</Link>
          </p>
        </form>
      </section>
    </>
  );
}
