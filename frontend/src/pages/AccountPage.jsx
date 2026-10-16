import { useEffect, useState } from "react";
import { CalendarDays, Mail, MapPin, Phone, RefreshCw, Ticket, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { bookingsApi } from "../lib/api";

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });
const dateFormat = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

export default function AccountPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState(null);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    document.title = "Tài khoản của tôi | BookTours";
    setError("");
    setBookings(null);
    bookingsApi
      .list()
      .then((response) => setBookings(response.data))
      .catch((err) => setError(err.message));
  }, [reloadKey]);

  return (
    <>
      <section className="page-hero auth-hero">
        <div className="container">
          <span className="eyebrow eyebrow-light">Thành viên BookTours</span>
          <h1>Tài khoản của tôi</h1>
          <p>Thông tin cá nhân và các tour bạn đã đặt.</p>
        </div>
      </section>
      <div className="container account-layout">
        <section className="checkout-card account-profile">
          <h2>Thông tin cá nhân</h2>
          <p><UserRound size={16} /> <span>Họ và tên</span><strong>{user.fullName}</strong></p>
          <p><Mail size={16} /> <span>Email</span><strong>{user.email}</strong></p>
          <p><Phone size={16} /> <span>Số điện thoại</span><strong>{user.phone}</strong></p>
          <p><MapPin size={16} /> <span>Địa chỉ</span><strong>{user.address || "Chưa có. Địa chỉ được lưu khi bạn đặt tour."}</strong></p>
        </section>

        <section className="checkout-card">
          <div className="account-heading">
            <h2>Lịch sử booking</h2>
            {bookings?.length ? <span>{bookings.length} đơn</span> : null}
          </div>
          {error ? (
            <div className="error-state account-state">
              <h2>Không tải được lịch sử</h2>
              <p>{error}</p>
              <button className="button" type="button" onClick={() => setReloadKey((value) => value + 1)}>
                <RefreshCw size={17} /> Thử lại
              </button>
            </div>
          ) : !bookings ? (
            <div className="page-loader"><span /></div>
          ) : bookings.length ? (
            <div className="booking-history">
              {bookings.map((booking) => (
                <Link className="history-card" key={booking.code} to={`/xac-nhan/${booking.code}`}>
                  <img src={booking.coverImage} alt="" />
                  <div>
                    <span className="tour-code">{booking.code}</span>
                    <h3>{booking.tourName}</h3>
                    <p><CalendarDays size={15} /> Khởi hành {dateFormat.format(new Date(`${booking.startDate}T00:00:00`))}</p>
                  </div>
                  <strong>{money.format(booking.totalPrice)}</strong>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-state account-state">
              <Ticket />
              <h2>Bạn chưa đặt tour nào</h2>
              <p>Các booking sau khi thanh toán sẽ hiện ở đây.</p>
              <Link className="button" to="/tours">Xem tour</Link>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
