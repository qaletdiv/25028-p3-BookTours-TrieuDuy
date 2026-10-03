import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Filter, Search, SlidersHorizontal, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import TourCard from "../components/TourCard";
import { toursApi } from "../lib/api";

const defaultForm = { keyword: "", destination: "", departure: "", type: "", minPrice: "", maxPrice: "", minDays: "", maxDays: "" };

function formFromParams(params) {
  return Object.fromEntries(Object.keys(defaultForm).map((key) => [key, params.get(key) || ""]));
}

export default function ToursPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [result, setResult] = useState(null);
  const [filters, setFilters] = useState({ destinations: [], departures: [], types: [] });
  const [form, setForm] = useState(() => formFromParams(searchParams));
  const [filterOpen, setFilterOpen] = useState(false);
  const [error, setError] = useState("");
  const paramsKey = searchParams.toString();

  useEffect(() => {
    setForm(formFromParams(searchParams));
    setError("");
    toursApi.getTours(searchParams)
      .then(setResult)
      .catch((err) => setError(err.message));
  }, [paramsKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    toursApi.getFilters().then(setFilters).catch(() => {});
  }, []);

  function applyFilters(event) {
    event.preventDefault();
    const next = new URLSearchParams();
    Object.entries(form).forEach(([key, value]) => value && next.set(key, value));
    if (searchParams.get("region")) next.set("region", searchParams.get("region"));
    next.set("sort", searchParams.get("sort") || "newest");
    setSearchParams(next);
    setFilterOpen(false);
  }

  function resetFilters() {
    const next = new URLSearchParams();
    if (searchParams.get("region")) next.set("region", searchParams.get("region"));
    setForm(defaultForm);
    setSearchParams(next);
  }

  function changeParam(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    if (key !== "page") next.delete("page");
    setSearchParams(next);
    window.scrollTo({ top: 300, behavior: "smooth" });
  }

  const pageTitle = searchParams.get("region") === "domestic"
    ? "Tour trong nước"
    : searchParams.get("region") === "international" ? "Tour nước ngoài" : "Tất cả hành trình";

  return (
    <>
      <section className="page-hero">
        <div className="container"><span className="eyebrow eyebrow-light">Khám phá theo cách của bạn</span><h1>{pageTitle}</h1><p>Tìm hành trình phù hợp và bắt đầu tạo nên những ký ức đẹp.</p></div>
      </section>
      <div className="container tours-layout">
        <button className="mobile-filter-button" onClick={() => setFilterOpen(true)}><SlidersHorizontal size={19} /> Bộ lọc</button>
        <aside className={filterOpen ? "filter-sidebar open" : "filter-sidebar"}>
          <div className="filter-title"><div><Filter size={20} /><h2>Bộ lọc</h2></div><button onClick={() => setFilterOpen(false)} aria-label="Đóng"><X /></button></div>
          <form onSubmit={applyFilters}>
            <label className="filter-search"><span>Từ khóa</span><div><Search size={17} /><input value={form.keyword} onChange={(e) => setForm({ ...form, keyword: e.target.value })} placeholder="Tên tour, địa điểm..." /></div></label>
            <label><span>Điểm đến</span><select value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })}><option value="">Tất cả điểm đến</option>{filters.destinations.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}</select></label>
            <label><span>Điểm khởi hành</span><select value={form.departure} onChange={(e) => setForm({ ...form, departure: e.target.value })}><option value="">Tất cả</option>{filters.departures.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}</select></label>
            <label><span>Loại hình tour</span><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option value="">Tất cả loại hình</option>{filters.types.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}</select></label>
            <fieldset><legend>Khoảng giá (triệu đồng)</legend><div className="range-inputs"><input type="number" min="0" placeholder="Từ" value={form.minPrice ? form.minPrice / 1000000 : ""} onChange={(e) => setForm({ ...form, minPrice: e.target.value ? String(Number(e.target.value) * 1000000) : "" })} /><span>–</span><input type="number" min="0" placeholder="Đến" value={form.maxPrice ? form.maxPrice / 1000000 : ""} onChange={(e) => setForm({ ...form, maxPrice: e.target.value ? String(Number(e.target.value) * 1000000) : "" })} /></div></fieldset>
            <fieldset><legend>Thời lượng</legend><div className="duration-options">
              {[["1", "3", "1–3 ngày"], ["4", "7", "4–7 ngày"], ["8", "30", "Trên 7 ngày"]].map(([min, max, label]) => (
                <label key={min}><input type="radio" name="duration" checked={form.minDays === min} onChange={() => setForm({ ...form, minDays: min, maxDays: max })} /> {label}</label>
              ))}
            </div></fieldset>
            <button className="button filter-submit" type="submit">Áp dụng bộ lọc</button>
            <button className="reset-button" type="button" onClick={resetFilters}>Xóa bộ lọc</button>
          </form>
        </aside>

        <div className="tour-results">
          <div className="results-toolbar">
            <p>{result ? <><strong>{result.pagination.total}</strong> hành trình được tìm thấy</> : "Đang tìm hành trình..."}</p>
            <label>Sắp xếp: <select value={searchParams.get("sort") || "newest"} onChange={(e) => changeParam("sort", e.target.value)}><option value="newest">Mới nhất</option><option value="price_asc">Giá thấp đến cao</option><option value="price_desc">Giá cao đến thấp</option><option value="name_asc">Tên A–Z</option><option value="name_desc">Tên Z–A</option></select></label>
          </div>
          {error ? <div className="error-state"><h2>Không thể tải tour</h2><p>{error}</p></div> : !result ? <div className="page-loader"><span /></div> : result.data.length ? (
            <>
              <div className="tour-grid results-grid">{result.data.map((tour) => <TourCard key={tour.id} tour={tour} />)}</div>
              {result.pagination.totalPages > 1 && <div className="pagination">
                <button disabled={result.pagination.page === 1} onClick={() => changeParam("page", result.pagination.page - 1)}><ChevronLeft /></button>
                {Array.from({ length: result.pagination.totalPages }, (_, i) => i + 1).map((page) => <button className={page === result.pagination.page ? "active" : ""} key={page} onClick={() => changeParam("page", page)}>{page}</button>)}
                <button disabled={result.pagination.page === result.pagination.totalPages} onClick={() => changeParam("page", result.pagination.page + 1)}><ChevronRight /></button>
              </div>}
            </>
          ) : <div className="empty-state"><Search /><h2>Chưa tìm thấy tour phù hợp</h2><p>Thử thay đổi tiêu chí hoặc xóa bớt bộ lọc.</p><button className="button" onClick={resetFilters}>Xem tất cả tour</button></div>}
        </div>
      </div>
      {filterOpen && <button className="filter-overlay" aria-label="Đóng bộ lọc" onClick={() => setFilterOpen(false)} />}
    </>
  );
}
