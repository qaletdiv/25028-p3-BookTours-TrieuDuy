import { useEffect, useState } from "react";
import { CalendarDays, CreditCard, Landmark, Minus, Plus, Users } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { bookingsApi, toursApi } from "../lib/api";
import { clearCart, readCart } from "../lib/cart";

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });
const dateFormat = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
const CHILD_RATE = 0.7;

function syncPassengers(adults, children, previous) {
  const total = adults + children;
  return Array.from({ length: total }, (_, index) => ({
    fullName: previous[index]?.fullName || "",
    type: index < adults ? "adult" : "child",
  }));
}

function fieldMessage(errors, field) {
  return errors.find((item) => item.field === field || item.field.startsWith(`${field}[`))?.message || "";
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user, updateAddress } = useAuth();
  const [cart] = useState(() => readCart());
  const [tour, setTour] = useState(null);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState([]);
  const [loading, setLoading] = useState(Boolean(cart?.slug));
  const [submitting, setSubmitting] = useState(false);
  const [departureId, setDepartureId] = useState(cart?.departureId ? String(cart.departureId) : "");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [passengers, setPassengers] = useState([{ fullName: "", type: "adult" }]);
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [card, setCard] = useState({ cardName: "", cardNumber: "", cardExpiry: "", cardCvv: "" });
  const [contact, setContact] = useState({ fullName: "", phone: "", email: "", address: "" });

  useEffect(() => {
    document.title = "Thanh toán | BookTours";
  }, []);

  useEffect(() => {
    if (!user) return;
    setContact({
      fullName: user.fullName,
      phone: user.phone,
      email: user.email,
      address: user.address || "",
    });
    setPassengers((current) => {
      if (current[0]?.fullName) return current;
      const next = [...current];
      next[0] = { ...next[0], fullName: user.fullName };
      return next;
    });
  }, [user]);

  useEffect(() => {
    if (!cart?.slug) return undefined;
    let cancelled = false;
    toursApi
      .getTour(cart.slug)
      .then((data) => {
        if (cancelled) return;
        setTour(data);
        const matched = data.departures.some((item) => String(item.id) === String(cart.departureId));
        setDepartureId(matched ? String(cart.departureId) : String(data.departures[0]?.id || ""));
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [cart]);

  const departure = tour?.departures.find((item) => String(item.id) === departureId);
  const adultPrice = Number(tour?.price || 0);
  const childPrice = Math.round(adultPrice * CHILD_RATE);
  const total = adultPrice * adults + childPrice * children;
  const slots = departure?.available_slots ?? 0;
  const tooManyGuests = adults + children > slots;

  function changeCounts(nextAdults, nextChildren) {
    const safeAdults = Math.max(1, nextAdults);
    const safeChildren = Math.max(0, nextChildren);
    setAdults(safeAdults);
    setChildren(safeChildren);
    setPassengers((current) => syncPassengers(safeAdults, safeChildren, current));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setFieldErrors([]);
    if (!tour || !departure || tooManyGuests) return;
    setSubmitting(true);
    try {
      const result = await bookingsApi.create({
        tourSlug: tour.slug,
        departureId: Number(departureId),
        ...contact,
        adults,
        children,
        passengers,
        paymentMethod,
        ...(paymentMethod === "credit_card"
          ? { ...card, cardNumber: card.cardNumber.replace(/\s/g, "") }
          : {}),
      });
      updateAddress(contact.address);
      clearCart();
      navigate(`/xac-nhan/${result.code}`, { replace: true });
    } catch (err) {
      setError(err.message);
      setFieldErrors(err.errors || []);
    } finally {
      setSubmitting(false);
    }
  }

  if (!cart?.slug) {
    return (
      <div className="container error-state">
        <h2>Chưa có tour để thanh toán</h2>
        <p>Hãy chọn một hành trình và bấm Đặt ngay.</p>
        <Link className="button" to="/tours">Xem danh sách tour</Link>
      </div>
    );
  }

  if (loading) {
    return <div className="page-loader"><span /></div>;
  }

  if (!tour) {
    return (
      <div className="container error-state">
        <h2>Không mở được trang thanh toán</h2>
        <p>{error || "Tour đã chọn không còn tồn tại."}</p>
        <Link className="button" to="/tours">Chọn tour khác</Link>
      </div>
    );
  }

  return (
    <>
      <section className="page-hero auth-hero">
        <div className="container">
          <span className="eyebrow eyebrow-light">Hoàn tất đặt chỗ</span>
          <h1>Thanh toán</h1>
          <p>Kiểm tra thông tin liên hệ, hành khách và phương thức thanh toán.</p>
        </div>
      </section>
      <form className="container checkout-layout" noValidate onSubmit={submit}>
        <div className="checkout-main">
          {error && <p className="form-banner">{error}</p>}
          <section className="checkout-card">
            <h2>Thông tin liên lạc</h2>
            <div className="form-grid">
              <label>
                Họ tên
                <input value={contact.fullName} onChange={(event) => setContact({ ...contact, fullName: event.target.value })} />
                {fieldMessage(fieldErrors, "fullName") && <small>{fieldMessage(fieldErrors, "fullName")}</small>}
              </label>
              <label>
                Số điện thoại
                <input value={contact.phone} onChange={(event) => setContact({ ...contact, phone: event.target.value })} />
                {fieldMessage(fieldErrors, "phone") && <small>{fieldMessage(fieldErrors, "phone")}</small>}
              </label>
              <label>
                Email
                <input type="email" value={contact.email} onChange={(event) => setContact({ ...contact, email: event.target.value })} />
                {fieldMessage(fieldErrors, "email") && <small>{fieldMessage(fieldErrors, "email")}</small>}
              </label>
              <label>
                Địa chỉ
                <input value={contact.address} onChange={(event) => setContact({ ...contact, address: event.target.value })} placeholder="Số nhà, đường, quận, thành phố" />
                {fieldMessage(fieldErrors, "address") && <small>{fieldMessage(fieldErrors, "address")}</small>}
              </label>
            </div>
          </section>

          <section className="checkout-card">
            <h2>Hành khách</h2>
            <label>
              <span><CalendarDays size={16} /> Ngày khởi hành</span>
              <select value={departureId} onChange={(event) => setDepartureId(event.target.value)}>
                {tour.departures.map((item) => (
                  <option key={item.id} value={item.id}>
                    {dateFormat.format(new Date(`${item.start_date}T00:00:00`))} — còn {item.available_slots} chỗ
                  </option>
                ))}
              </select>
            </label>
            <div className="counter-row">
              <div>
                <strong>Người lớn</strong>
                <small>{money.format(adultPrice)} / khách</small>
              </div>
              <div className="counter">
                <button type="button" onClick={() => changeCounts(adults - 1, children)} aria-label="Giảm người lớn"><Minus size={16} /></button>
                <span>{adults}</span>
                <button type="button" onClick={() => changeCounts(adults + 1, children)} aria-label="Tăng người lớn"><Plus size={16} /></button>
              </div>
            </div>
            <div className="counter-row">
              <div>
                <strong>Trẻ em</strong>
                <small>{money.format(childPrice)} / khách (70% giá người lớn)</small>
              </div>
              <div className="counter">
                <button type="button" onClick={() => changeCounts(adults, children - 1)} aria-label="Giảm trẻ em"><Minus size={16} /></button>
                <span>{children}</span>
                <button type="button" onClick={() => changeCounts(adults, children + 1)} aria-label="Tăng trẻ em"><Plus size={16} /></button>
              </div>
            </div>
            {tooManyGuests && <p className="form-banner">Ngày này chỉ còn {slots} chỗ.</p>}
            <div className="passenger-list">
              <h3><Users size={18} /> Thông tin hành khách</h3>
              {passengers.map((passenger, index) => (
                <label key={`${passenger.type}-${index}`}>
                  {passenger.type === "adult" ? `Người lớn ${index + 1}` : `Trẻ em ${index - adults + 1}`}
                  <input
                    value={passenger.fullName}
                    onChange={(event) => {
                      const next = [...passengers];
                      next[index] = { ...passenger, fullName: event.target.value };
                      setPassengers(next);
                    }}
                    placeholder="Họ và tên"
                  />
                </label>
              ))}
              {fieldMessage(fieldErrors, "passengers") && <small className="field-error">{fieldMessage(fieldErrors, "passengers")}</small>}
            </div>
          </section>

          <section className="checkout-card">
            <h2>Phương thức thanh toán</h2>
            <div className="payment-options">
              <label className={paymentMethod === "bank_transfer" ? "active" : ""}>
                <input type="radio" name="payment" checked={paymentMethod === "bank_transfer"} onChange={() => setPaymentMethod("bank_transfer")} />
                <Landmark size={18} /> Chuyển khoản ngân hàng
              </label>
              <label className={paymentMethod === "credit_card" ? "active" : ""}>
                <input type="radio" name="payment" checked={paymentMethod === "credit_card"} onChange={() => setPaymentMethod("credit_card")} />
                <CreditCard size={18} /> Thẻ tín dụng (mô phỏng)
              </label>
            </div>
            {paymentMethod === "bank_transfer" ? (
              <p className="payment-note">Sau khi đặt, chuyển khoản theo hướng dẫn trong email xác nhận. Đơn được ghi nhận ngay, chưa trừ tiền thật.</p>
            ) : (
              <div className="form-grid">
                <label>
                  Tên chủ thẻ
                  <input value={card.cardName} onChange={(event) => setCard({ ...card, cardName: event.target.value })} />
                  {fieldMessage(fieldErrors, "cardName") && <small>{fieldMessage(fieldErrors, "cardName")}</small>}
                </label>
                <label>
                  Số thẻ
                  <input inputMode="numeric" value={card.cardNumber} onChange={(event) => setCard({ ...card, cardNumber: event.target.value })} placeholder="16 chữ số" />
                  {fieldMessage(fieldErrors, "cardNumber") && <small>{fieldMessage(fieldErrors, "cardNumber")}</small>}
                </label>
                <label>
                  Hết hạn
                  <input value={card.cardExpiry} onChange={(event) => setCard({ ...card, cardExpiry: event.target.value })} placeholder="MM/YY" />
                  {fieldMessage(fieldErrors, "cardExpiry") && <small>{fieldMessage(fieldErrors, "cardExpiry")}</small>}
                </label>
                <label>
                  CVV
                  <input inputMode="numeric" value={card.cardCvv} onChange={(event) => setCard({ ...card, cardCvv: event.target.value })} placeholder="3 số" />
                  {fieldMessage(fieldErrors, "cardCvv") && <small>{fieldMessage(fieldErrors, "cardCvv")}</small>}
                </label>
              </div>
            )}
          </section>
        </div>

        <aside className="checkout-summary">
          <img src={tour.cover_image} alt="" />
          <span className="tour-code">{tour.code}</span>
          <h2>{tour.name}</h2>
          <p>{tour.route}</p>
          <div className="booking-summary">
            <span>Người lớn<strong>{adults} x {money.format(adultPrice)}</strong></span>
            <span>Trẻ em<strong>{children} x {money.format(childPrice)}</strong></span>
            <span>Tổng tiền<strong>{money.format(total)}</strong></span>
          </div>
          <button className="button book-button" type="submit" disabled={submitting || !departure || tooManyGuests}>
            {submitting ? "Đang ghi nhận..." : "Hoàn tất đặt tour"}
          </button>
          <small>Thông tin thẻ chỉ dùng để mô phỏng và không được lưu.</small>
        </aside>
      </form>
    </>
  );
}
