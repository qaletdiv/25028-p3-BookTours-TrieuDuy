import { useEffect, useState } from "react";
import { ArrowRight, CalendarDays, ChevronLeft, ChevronRight, Clock3, Headphones, MapPin, Pause, Play, RefreshCw, Search, ShieldCheck, Sparkles, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { TourGridSkeleton } from "../components/LoadingStates";
import TourCard from "../components/TourCard";
import { toursApi } from "../lib/api";

function TourSection({ eyebrow, title, tours, link }) {
  if (!tours?.length) return null;
  return (
    <section className="section">
      <div className="container">
        <div className="section-heading">
          <div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div>
          <Link className="text-link" to={link}>Xem tất cả <ArrowRight size={18} /></Link>
        </div>
        <div className="tour-grid">{tours.map((tour) => <TourCard key={tour.id} tour={tour} />)}</div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState({ destinations: [], departures: [] });
  const [slide, setSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [showPromo, setShowPromo] = useState(() => !sessionStorage.getItem("promoSeen"));
  const [search, setSearch] = useState({ destination: "", departure: "", startDate: "", duration: "" });

  useEffect(() => {
    document.title = "BookTours | Đi để cảm nhận";
    setError("");
    Promise.all([toursApi.getHome(), toursApi.getFilters()])
      .then(([home, filterData]) => { setData(home); setFilters(filterData); })
      .catch((err) => setError(err.message));
  }, [reloadKey]);

  useEffect(() => {
    if (!data?.banners?.length || isPaused || isHovering) return undefined;
    data.banners.forEach((banner) => {
      const image = new Image();
      image.src = banner.image_url;
    });
    const timer = setInterval(() => setSlide((current) => (current + 1) % data.banners.length), 6000);
    return () => clearInterval(timer);
  }, [data, isPaused, isHovering]);

  function retryLoading() {
    setData(null);
    setReloadKey((value) => value + 1);
  }

  function closePromo() {
    sessionStorage.setItem("promoSeen", "1");
    setShowPromo(false);
  }

  function submitSearch(event) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (search.destination) params.set("destination", search.destination);
    if (search.departure) params.set("departure", search.departure);
    if (search.startDate) params.set("startDate", search.startDate);
    if (search.duration) {
      const [minDays, maxDays] = search.duration.split("-");
      params.set("minDays", minDays);
      params.set("maxDays", maxDays);
    }
    navigate(`/tours?${params}`);
  }

  const banners = data?.banners || [];
  const activeBanner = banners[slide];

  return (
    <>
      <section className="hero" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
        <div className="hero-slides" aria-hidden="true">
          {(banners.length ? banners : [{ id: "fallback", image_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=85" }]).map((banner, index) => (
            <div
              className={`hero-slide ${index === slide ? "active" : ""}`}
              key={banner.id}
              style={{ backgroundImage: `linear-gradient(90deg, rgba(5,31,38,.82), rgba(5,31,38,.15)), url("${banner.image_url}")` }}
            />
          ))}
        </div>
        <div className="container hero-content" key={activeBanner?.id || "fallback"}>
          <span className="hero-kicker"><Sparkles size={17} /> Hành trình đáng nhớ bắt đầu từ đây</span>
          <h1>{activeBanner?.title || "Khám phá thế giới theo cách của bạn"}</h1>
          <p>{activeBanner?.subtitle || "Những hành trình được tuyển chọn với dịch vụ tận tâm và mức giá tốt nhất."}</p>
          <Link className="button button-light" to={activeBanner?.cta_url || "/tours"}>{activeBanner?.cta_text || "Khám phá ngay"} <ArrowRight size={19} /></Link>
        </div>
        {banners.length > 1 && (
          <div className="slider-controls">
            <button onClick={() => setSlide((slide - 1 + banners.length) % banners.length)} aria-label="Banner trước"><ChevronLeft /></button>
            <span>{String(slide + 1).padStart(2, "0")} / {String(banners.length).padStart(2, "0")}</span>
            <div className="slider-dots">
              {banners.map((banner, index) => (
                <button
                  className={index === slide ? "active" : ""}
                  key={banner.id}
                  onClick={() => setSlide(index)}
                  aria-label={`Xem banner ${index + 1}`}
                />
              ))}
            </div>
            <button className="slider-pause" onClick={() => setIsPaused((value) => !value)} aria-label={isPaused ? "Tiếp tục trình chiếu" : "Tạm dừng trình chiếu"}>
              {isPaused ? <Play /> : <Pause />}
            </button>
            <button onClick={() => setSlide((slide + 1) % banners.length)} aria-label="Banner sau"><ChevronRight /></button>
          </div>
        )}
      </section>

      <div className="container search-panel-wrap">
        <form className="search-panel" onSubmit={submitSearch}>
          <label><span><MapPin size={18} /> Điểm đến</span><select value={search.destination} onChange={(e) => setSearch({ ...search, destination: e.target.value })}><option value="">Bạn muốn đi đâu?</option>{filters.destinations.map((item) => <option value={item.slug} key={item.id}>{item.name}</option>)}</select></label>
          <label><span><MapPin size={18} /> Khởi hành từ</span><select value={search.departure} onChange={(e) => setSearch({ ...search, departure: e.target.value })}><option value="">Chọn nơi khởi hành</option>{filters.departures.map((item) => <option value={item.slug} key={item.id}>{item.name}</option>)}</select></label>
          <label><span><CalendarDays size={18} /> Ngày đi</span><input type="date" value={search.startDate} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setSearch({ ...search, startDate: e.target.value })} /></label>
          <label><span><Clock3 size={18} /> Thời lượng</span><select value={search.duration} onChange={(e) => setSearch({ ...search, duration: e.target.value })}><option value="">Tất cả</option><option value="1-3">1–3 ngày</option><option value="4-7">4–7 ngày</option><option value="8-30">Trên 7 ngày</option></select></label>
          <button className="button search-button" type="submit"><Search size={20} /> Tìm tour</button>
        </form>
      </div>

      {error ? <div className="container error-state"><h2>Chưa tải được dữ liệu</h2><p>{error} Hãy kiểm tra backend và MySQL.</p><button className="button" onClick={retryLoading}><RefreshCw size={17} /> Thử lại</button></div> : !data ? (
        <section className="section"><div className="container"><div className="section-heading"><div><span className="eyebrow">Đang chuẩn bị hành trình</span><h2>Tour dành cho bạn</h2></div></div><TourGridSkeleton /></div></section>
      ) : (
        <>
          <TourSection eyebrow="Được yêu thích nhất" title="Tour nổi bật" tours={data.sections.hot} link="/tours?sort=newest" />
          <TourSection eyebrow="Đi trọn Việt Nam" title="Khám phá trong nước" tours={data.sections.domestic} link="/tours?region=domestic" />
          <section className="inspiration"><div className="container inspiration-inner"><div><span className="eyebrow eyebrow-light">Hành trình của riêng bạn</span><h2>Đi xa để thấy thế giới,<br />đi về để thấy yêu thương.</h2><Link className="button button-light" to="/tours">Lên kế hoạch ngay <ArrowRight size={18} /></Link></div></div></section>
          <TourSection eyebrow="Vươn ra thế giới" title="Tour nước ngoài" tours={data.sections.international} link="/tours?region=international" />
        </>
      )}

      <section className="section benefits"><div className="container benefits-grid">
        <div><ShieldCheck /><h3>An tâm tuyệt đối</h3><p>Đối tác uy tín, lịch trình minh bạch và bảo hiểm đầy đủ.</p></div>
        <div><Sparkles /><h3>Trải nghiệm tuyển chọn</h3><p>Mỗi hành trình được thiết kế tỉ mỉ bởi chuyên gia.</p></div>
        <div><Headphones /><h3>Hỗ trợ tận tâm 24/7</h3><p>Luôn đồng hành trước, trong và sau chuyến đi.</p></div>
      </div></section>

      {showPromo && (
        <div className="modal-backdrop" role="presentation" onMouseDown={closePromo}>
          <div className="promo-modal" role="dialog" aria-modal="true" aria-label="Ưu đãi thành viên" onMouseDown={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closePromo} aria-label="Đóng"><X /></button>
            <div className="promo-image" />
            <div className="promo-content"><span className="eyebrow">Quà tặng thành viên mới</span><h2>Nhận ngay ưu đãi 500.000đ</h2><p>Đăng ký nhận tin để không bỏ lỡ những hành trình và ưu đãi mới nhất từ BookTours.</p><form onSubmit={(e) => { e.preventDefault(); closePromo(); }}><input type="email" required placeholder="Email của bạn" /><button className="button">Nhận ưu đãi</button></form><small>Chúng tôi tôn trọng quyền riêng tư của bạn.</small></div>
          </div>
        </div>
      )}
    </>
  );
}
