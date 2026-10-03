import { ArrowRight, Clock3, MapPin, Star } from "lucide-react";
import { Link } from "react-router-dom";

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=85";

function useFallbackImage(event) {
  event.currentTarget.onerror = null;
  event.currentTarget.src = FALLBACK_IMAGE;
}

export default function TourCard({ tour }) {
  return (
    <article className="tour-card">
      <Link className="tour-image-wrap" to={`/tours/${tour.slug}`}>
        <img className="tour-image" src={tour.cover_image} alt={tour.name} loading="lazy" onError={useFallbackImage} />
        {tour.is_hot && <span className="hot-badge">Nổi bật</span>}
        {tour.original_price && (
          <span className="discount-badge">
            -{Math.round((1 - tour.price / tour.original_price) * 100)}%
          </span>
        )}
      </Link>
      <div className="tour-card-body">
        <div className="tour-location"><MapPin size={15} /> {tour.destination}</div>
        <Link to={`/tours/${tour.slug}`}><h3>{tour.name}</h3></Link>
        <div className="tour-meta">
          <span><Clock3 size={16} /> {tour.duration_days} ngày {tour.duration_nights} đêm</span>
          <span><Star size={16} fill="currentColor" /> {tour.rating || "4.9"}</span>
        </div>
        <div className="tour-card-footer">
          <div>
            <small>Từ</small>
            <strong>{money.format(tour.price)}</strong>
            {tour.original_price && <del>{money.format(tour.original_price)}</del>}
          </div>
          <Link className="circle-link" to={`/tours/${tour.slug}`} aria-label={`Xem ${tour.name}`}><ArrowRight /></Link>
        </div>
      </div>
    </article>
  );
}
