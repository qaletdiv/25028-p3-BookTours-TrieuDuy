import { useEffect, useRef, useState } from "react";
import { CalendarDays, Check, ChevronLeft, ChevronRight, Clock3, MapPin, Minus, Plus, RefreshCw, ShieldCheck, Star, Users, X } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { DetailSkeleton } from "../components/LoadingStates";
import TourCard from "../components/TourCard";
import { useAuth } from "../context/AuthContext";
import { saveCart } from "../lib/cart";
import { toursApi } from "../lib/api";

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });
const date = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=85";

function asArray(value) {
  if (Array.isArray(value)) return value;
  try { return JSON.parse(value || "[]"); } catch { return []; }
}

function useFallbackImage(event) {
  event.currentTarget.onerror = null;
  event.currentTarget.src = FALLBACK_IMAGE;
}

export default function TourDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, ready } = useAuth();
  const [tour, setTour] = useState(null);
  const [activeTab, setActiveTab] = useState("itinerary");
  const [activeImage, setActiveImage] = useState(null);
  const [departure, setDeparture] = useState("");
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [relatedScroll, setRelatedScroll] = useState({ atStart: true, atEnd: false });
  const relatedCarouselRef = useRef(null);
  const images = tour
    ? (tour.images?.length ? tour.images : [{ image_url: tour.cover_image, alt_text: tour.name }])
    : [];

  useEffect(() => {
    window.scrollTo(0, 0);
    setTour(null);
    setError("");
    toursApi.getTour(slug)
      .then((data) => { setTour(data); setDeparture(data.departures[0]?.id ? String(data.departures[0].id) : ""); })
      .catch((err) => setError(err.message));
  }, [slug, reloadKey]);

  useEffect(() => {
    document.title = tour ? `${tour.name} | BookTours` : "Đang tải tour | BookTours";
  }, [tour]);

  useEffect(() => {
    if (activeImage === null) return undefined;
    function handleKeyDown(event) {
      if (event.key === "Escape") setActiveImage(null);
      if (event.key === "ArrowLeft") setActiveImage((current) => (current - 1 + images.length) % images.length);
      if (event.key === "ArrowRight") setActiveImage((current) => (current + 1) % images.length);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeImage, images.length]);

  function bookNow() {
    if (!tour || !departure || !ready) return;
    saveCart({ slug: tour.slug, departureId: departure });
    if (!user) {
      navigate("/dang-nhap?next=/thanh-toan");
      return;
    }
    navigate("/thanh-toan");
  }

  function updateRelatedScroll() {
    const element = relatedCarouselRef.current;
    if (!element) return;
    setRelatedScroll({
      atStart: element.scrollLeft <= 2,
      atEnd: element.scrollLeft + element.clientWidth >= element.scrollWidth - 2,
    });
  }

  function scrollRelated(direction) {
    const element = relatedCarouselRef.current;
    if (!element) return;
    element.scrollBy({ left: direction * element.clientWidth, behavior: "smooth" });
  }

  if (error) return <div className="container error-state detail-error"><h2>Không thể tải hành trình</h2><p>{error}</p><div className="error-actions"><button className="button" onClick={() => setReloadKey((value) => value + 1)}><RefreshCw size={17} /> Thử lại</button><Link className="secondary-button" to="/tours">Xem tour khác</Link></div></div>;
  if (!tour) return <DetailSkeleton />;

  const included = asArray(tour.included);
  const excluded = asArray(tour.excluded);
  const policy = asArray(tour.policy);

  return (
    <>
      <div className="container breadcrumbs"><Link to="/">Trang chủ</Link><ChevronRight size={15} /><Link to="/tours">Tour</Link><ChevronRight size={15} /><span>{tour.destination}</span></div>
      <section className="container detail-header">
        <div><span className="tour-code">{tour.code}</span><h1>{tour.name}</h1><div className="detail-subline"><span><MapPin size={17} /> {tour.route}</span><span><Star size={17} fill="currentColor" /> {tour.rating} ({tour.review_count} đánh giá)</span></div></div>
        <div className="detail-price"><small>Giá từ</small>{tour.original_price && <del>{money.format(tour.original_price)}</del>}<strong>{money.format(tour.price)}</strong><span>/ khách</span></div>
      </section>

      <section className={`container gallery gallery-${Math.min(images.length, 3)}`}>
        <button className="gallery-main" onClick={() => setActiveImage(0)}><img src={images[0].image_url} alt={images[0].alt_text || tour.name} onError={useFallbackImage} /></button>
        <div>{images.slice(1, 3).map((image, index) => <button key={image.id || index} onClick={() => setActiveImage(index + 1)}><img src={image.image_url} alt={image.alt_text || tour.name} onError={useFallbackImage} /></button>)}</div>
        {images.length > 1 && <button className="gallery-count" onClick={() => setActiveImage(0)}>Xem {images.length} ảnh</button>}
      </section>

      <div className="container detail-layout">
        <div className="detail-content">
          <div className="quick-facts">
            <div><Clock3 /><span>Thời gian<strong>{tour.duration_days} ngày {tour.duration_nights} đêm</strong></span></div>
            <div><MapPin /><span>Khởi hành<strong>{tour.departure}</strong></span></div>
            <div><CalendarDays /><span>Lịch khởi hành<strong>Hàng tuần</strong></span></div>
            <div><Users /><span>Số chỗ còn nhận<strong>{tour.departures[0]?.available_slots || 0} khách</strong></span></div>
          </div>

          <div className="detail-intro"><span className="eyebrow">Tổng quan hành trình</span><h2>Điểm nhấn đặc biệt</h2><p>{tour.description}</p><div className="highlight-list">{asArray(tour.highlights).map((item) => <span key={item}><Check /> {item}</span>)}</div></div>

          <div className="tabs">
            <div className="tab-buttons">
              <button className={activeTab === "itinerary" ? "active" : ""} onClick={() => setActiveTab("itinerary")}>Lịch trình</button>
              <button className={activeTab === "price" ? "active" : ""} onClick={() => setActiveTab("price")}>Giá & Phụ thu</button>
              <button className={activeTab === "policy" ? "active" : ""} onClick={() => setActiveTab("policy")}>Chính sách</button>
            </div>
            <div className="tab-content">
              {activeTab === "itinerary" && <div className="timeline">{tour.itinerary.map((item) => <article key={item.day_number}><span>{String(item.day_number).padStart(2, "0")}</span><div><small>Ngày {item.day_number}</small><h3>{item.title}</h3><p>{item.description}</p>{item.meals && <em>Bữa ăn: {item.meals}</em>}</div></article>)}</div>}
              {activeTab === "price" && <div className="price-columns"><div><h3><Plus /> Giá tour bao gồm</h3>{included.map((item) => <p key={item}><Check /> {item}</p>)}</div><div><h3><Minus /> Không bao gồm</h3>{excluded.map((item) => <p key={item}><X /> {item}</p>)}</div></div>}
              {activeTab === "policy" && <div className="policy-list"><h3>Điều kiện đăng ký và hủy tour</h3>{policy.map((item, index) => <p key={item}><span>{index + 1}</span>{item}</p>)}<div className="policy-note"><ShieldCheck /> BookTours cam kết minh bạch mọi điều khoản và hỗ trợ khách hàng trong suốt hành trình.</div></div>}
            </div>
          </div>
        </div>

        <aside className="booking-card">
          <span className="eyebrow">Đặt chỗ ngay</span><h2>Chọn ngày khởi hành</h2>
          <label><CalendarDays /><select value={departure} onChange={(e) => setDeparture(e.target.value)}>{tour.departures.map((item) => <option key={item.id} value={item.id}>{date.format(new Date(`${item.start_date}T00:00:00`))} — còn {item.available_slots} chỗ</option>)}</select></label>
          <div className="booking-summary"><span>Giá tour / khách<strong>{money.format(tour.price)}</strong></span><span>Thời lượng<strong>{tour.duration_days}N{tour.duration_nights}Đ</strong></span></div>
          <button className="button book-button" disabled={!departure || !ready} onClick={bookNow}>Đặt ngay</button>
          <p><ShieldCheck size={17} /> Thông tin của bạn được bảo mật an toàn</p>
          <a className="hotline" href="tel:1900636832">Cần tư vấn? <strong>1900 636 832</strong></a>
        </aside>
      </div>

      {tour.related?.length > 0 && (
        <section className="section related-section">
          <div className="container">
            <div className="section-heading related-heading">
              <div><span className="eyebrow">Có thể bạn sẽ thích</span><h2>Hành trình liên quan</h2></div>
              {tour.related.length > 3 && <div className="related-controls">
                <button disabled={relatedScroll.atStart} onClick={() => scrollRelated(-1)} aria-label="Xem các tour trước"><ChevronLeft /></button>
                <button disabled={relatedScroll.atEnd} onClick={() => scrollRelated(1)} aria-label="Xem các tour tiếp theo"><ChevronRight /></button>
              </div>}
            </div>
            <div className="related-carousel" ref={relatedCarouselRef} onScroll={updateRelatedScroll}>
              {tour.related.map((item) => <TourCard key={item.id} tour={item} />)}
            </div>
          </div>
        </section>
      )}

      {activeImage !== null && (
        <div className="lightbox" onClick={() => setActiveImage(null)} role="dialog" aria-modal="true" aria-label={`Thư viện ảnh ${tour.name}`}>
          <button className="lightbox-close" aria-label="Đóng" onClick={() => setActiveImage(null)}><X /></button>
          {images.length > 1 && <button className="lightbox-nav lightbox-prev" aria-label="Ảnh trước" onClick={(event) => { event.stopPropagation(); setActiveImage((activeImage - 1 + images.length) % images.length); }}><ChevronLeft /></button>}
          <img src={images[activeImage].image_url} alt={images[activeImage].alt_text || tour.name} onClick={(event) => event.stopPropagation()} onError={useFallbackImage} />
          {images.length > 1 && <button className="lightbox-nav lightbox-next" aria-label="Ảnh sau" onClick={(event) => { event.stopPropagation(); setActiveImage((activeImage + 1) % images.length); }}><ChevronRight /></button>}
          <span className="lightbox-counter">{activeImage + 1} / {images.length}</span>
          {images.length > 1 && <div className="lightbox-thumbnails" onClick={(event) => event.stopPropagation()}>{images.map((image, index) => <button className={index === activeImage ? "active" : ""} key={image.id || index} onClick={() => setActiveImage(index)} aria-label={`Xem ảnh ${index + 1}`}><img src={image.image_url} alt="" onError={useFallbackImage} /></button>)}</div>}
        </div>
      )}
      <div className="mobile-booking-bar">
        <div><small>Giá từ</small><strong>{money.format(tour.price)}</strong></div>
        <button className="button" disabled={!departure || !ready} onClick={bookNow}>Đặt ngay</button>
      </div>
    </>
  );
}
