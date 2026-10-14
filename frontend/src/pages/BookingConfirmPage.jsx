import { useEffect, useState } from "react";
import { Check, Landmark, CreditCard } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { bookingsApi } from "../lib/api";

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });
const dateFormat = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

export default function BookingConfirmPage() {
  const { code } = useParams();
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Xác nhận đặt tour | BookTours";
    bookingsApi.get(code).then(setBooking).catch((err) => setError(err.message));
  }, [code]);

  if (error) {
    return (
      <div className="container error-state">
        <h2>Không tìm thấy booking</h2>
        <p>{error}</p>
        <Link className="button" to="/tours">Tiếp tục xem tour</Link>
      </div>
    );
  }

  if (!booking) {
    return <div className="page-loader"><span /></div>;
  }

  return (
    <section className="section confirm-section">
      <div className="container confirm-card">
        <div className="confirm-badge"><Check /></div>
        <span className="eyebrow">Đặt tour thành công</span>
        <h1>Đã nhận yêu cầu của bạn</h1>
        <p>Mã booking <strong>{booking.code}</strong>. BookTours sẽ liên hệ qua số {booking.contactPhone} để xác nhận chuyến đi.</p>
        <div className="confirm-summary">
          <img src={booking.coverImage} alt="" />
          <div>
            <span className="tour-code">{booking.tourCode}</span>
            <h2>{booking.tourName}</h2>
            <p>{booking.route}</p>
            <p>Khởi hành {dateFormat.format(new Date(`${booking.startDate}T00:00:00`))}</p>
            <p>{booking.adults} người lớn{booking.children ? `, ${booking.children} trẻ em` : ""}</p>
            <p>{booking.paymentMethod === "credit_card" ? <><CreditCard size={16} /> Thẻ tín dụng (mô phỏng)</> : <><Landmark size={16} /> Chuyển khoản ngân hàng</>}</p>
            <strong>{money.format(booking.totalPrice)}</strong>
          </div>
        </div>
        <h3>Người liên hệ</h3>
        <ul className="passenger-confirm">
          <li>Họ tên<span>{booking.contactName}</span></li>
          <li>Số điện thoại<span>{booking.contactPhone}</span></li>
          <li>Email<span>{booking.contactEmail}</span></li>
          <li>Địa chỉ<span>{booking.contactAddress}</span></li>
        </ul>
        <h3>Hành khách</h3>
        <ul className="passenger-confirm">
          {booking.passengers.map((passenger, index) => (
            <li key={`${passenger.fullName}-${index}`}>
              {passenger.fullName}
              <span>{passenger.type === "adult" ? "Người lớn" : "Trẻ em"}</span>
            </li>
          ))}
        </ul>
        <Link className="button" to="/tours">Tiếp tục xem tour</Link>
      </div>
    </section>
  );
}
