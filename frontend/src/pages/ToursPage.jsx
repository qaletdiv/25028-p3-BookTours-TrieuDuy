import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Filter, MapPin, RefreshCw, Search, SlidersHorizontal, X } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { TourGridSkeleton } from "../components/LoadingStates";
import TourCard from "../components/TourCard";
import { toursApi } from "../lib/api";

const defaultForm = { keyword: "", destination: "", departure: "", type: "", minPrice: "", maxPrice: "", minDays: "", maxDays: "" };
const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });

function formFromParams(params) {
  return Object.fromEntries(Object.keys(defaultForm).map((key) => [key, params.get(key) || ""]));
}

export default function ToursPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [result, setResult] = useState(null);
  const [filters, setFilters] = useState({ destinations: [], departures: [], types: [], prices: [] });
  const [form, setForm] = useState(() => formFromParams(searchParams));
  const [filterOpen, setFilterOpen] = useState(false);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const paramsKey = searchParams.toString();

  useEffect(() => {
    setForm(formFromParams(searchParams));
    setError("");
    setResult(null);
    toursApi.getTours(searchParams)
      .then(setResult)
      .catch((err) => setError(err.message));
  }, [paramsKey, reloadKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    toursApi.getFilters().then(setFilters).catch(() => {});
  }, []);

  useEffect(() => {
    const keyword = form.keyword.trim();
    if (keyword.length < 2) {
      setSuggestions([]);
      setSuggestionsLoading(false);
      return undefined;
    }

    let cancelled = false;
    setSuggestionsLoading(true);
    const timer = setTimeout(() => {
      toursApi.getSuggestions(keyword)
        .then((response) => {
          if (!cancelled) setSuggestions(response.data);
        })
        .catch(() => {
          if (!cancelled) setSuggestions([]);
        })
        .finally(() => {
          if (!cancelled) setSuggestionsLoading(false);
        });
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [form.keyword]);

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
    setForm(defaultForm);
    setSearchParams(new URLSearchParams());
  }

  function changeParam(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    if (key !== "page") next.delete("page");
    setSearchParams(next);
    window.scrollTo({ top: 300, behavior: "smooth" });
  }

  function removeParams(keys) {
    const next = new URLSearchParams(searchParams);
    keys.forEach((key) => next.delete(key));
    next.delete("page");
    setSearchParams(next);
  }

  const pageTitle = searchParams.get("region") === "domestic"
    ? "Tour trong nước"
    : searchParams.get("region") === "international" ? "Tour nước ngoài" : "Tất cả hành trình";
  const findName = (items, slug) => items.find((item) => item.slug === slug)?.name || slug;
  const activeChips = [];

  if (searchParams.get("region")) activeChips.push({ label: searchParams.get("region") === "domestic" ? "Trong nước" : "Nước ngoài", keys: ["region"] });
  if (searchParams.get("keyword")) activeChips.push({ label: `Từ khóa: ${searchParams.get("keyword")}`, keys: ["keyword"] });
  if (searchParams.get("destination")) activeChips.push({ label: `Đến: ${findName(filters.destinations, searchParams.get("destination"))}`, keys: ["destination"] });
  if (searchParams.get("departure")) activeChips.push({ label: `Từ: ${findName(filters.departures, searchParams.get("departure"))}`, keys: ["departure"] });
  if (searchParams.get("type")) activeChips.push({ label: findName(filters.types, searchParams.get("type")), keys: ["type"] });
  if (searchParams.get("minPrice") || searchParams.get("maxPrice")) {
    const min = searchParams.get("minPrice") ? `${Number(searchParams.get("minPrice")) / 1000000}tr` : "0";
    const max = searchParams.get("maxPrice") ? `${Number(searchParams.get("maxPrice")) / 1000000}tr` : "không giới hạn";
    activeChips.push({ label: `Giá: ${min} – ${max}`, keys: ["minPrice", "maxPrice"] });
  }
  if (searchParams.get("minDays") || searchParams.get("maxDays")) {
    activeChips.push({ label: `${searchParams.get("minDays") || 1}–${searchParams.get("maxDays") || 30} ngày`, keys: ["minDays", "maxDays"] });
  }

  useEffect(() => {
    document.title = `${pageTitle} | BookTours`;
  }, [pageTitle]);

  return (
    <>
      <section className="page-hero">
        <div className="container"><span className="eyebrow eyebrow-light">Khám phá theo cách của bạn</span><h1>{pageTitle}</h1><p>Tìm hành trình phù hợp và bắt đầu tạo nên những ký ức đẹp.</p></div>
      </section>
      <div className="container tours-layout">
        <button className="mobile-filter-button" onClick={() => setFilterOpen(true)}><SlidersHorizontal size={19} /> Bộ lọc {activeChips.length > 0 && <span>{activeChips.length}</span>}</button>
        <aside className={filterOpen ? "filter-sidebar open" : "filter-sidebar"}>
          <div className="filter-title"><div><Filter size={20} /><h2>Bộ lọc</h2></div><button onClick={() => setFilterOpen(false)} aria-label="Đóng"><X /></button></div>
          <form onSubmit={applyFilters}>
            <div className="filter-search filter-field"><label htmlFor="tour-keyword">Tên tour</label><div className="search-input-wrap"><Search size={17} /><input id="tour-keyword" value={form.keyword} onFocus={() => setSuggestionsOpen(true)} onBlur={() => setSuggestionsOpen(false)} onChange={(e) => { setForm({ ...form, keyword: e.target.value }); setSuggestionsOpen(true); }} placeholder="Nhập tên hoặc mã tour..." autoComplete="off" />
              {suggestionsOpen && form.keyword.trim().length >= 2 && <div className="search-suggestions" onMouseDown={(event) => event.preventDefault()}>
                {suggestionsLoading ? <p>Đang tìm tour phù hợp...</p> : suggestions.length ? (
                  <><strong className="suggestion-heading">Gợi ý tour</strong>{suggestions.map((tour) => <button className="tour-suggestion" type="button" key={tour.id} onClick={() => navigate(`/tours/${tour.slug}`)}><img src={tour.cover_image} alt="" /><span><b>{tour.name}</b><small><MapPin size={12} /> {tour.destination}</small></span><em>{money.format(tour.price)}</em></button>)}</>
                ) : <p>Không tìm thấy gợi ý phù hợp.</p>}
              </div>}
            </div></div>
            <label><span>Điểm đến</span><select value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })}><option value="">Tất cả điểm đến</option>{filters.destinations.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}</select></label>
            <label><span>Điểm khởi hành</span><select value={form.departure} onChange={(e) => setForm({ ...form, departure: e.target.value })}><option value="">Tất cả</option>{filters.departures.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}</select></label>
            <label><span>Loại hình tour</span><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option value="">Tất cả loại hình</option>{filters.types.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}</select></label>
            <fieldset><legend>Khoảng giá thực tế</legend><div className="range-inputs">
              <select aria-label="Giá từ" value={form.minPrice} onChange={(e) => setForm({ ...form, minPrice: e.target.value })}>
                <option value="">Giá từ</option>
                {filters.prices.map((price) => <option key={price} value={price} disabled={Boolean(form.maxPrice) && price > Number(form.maxPrice)}>{money.format(price)}</option>)}
              </select>
              <span>–</span>
              <select aria-label="Giá đến" value={form.maxPrice} onChange={(e) => setForm({ ...form, maxPrice: e.target.value })}>
                <option value="">Giá đến</option>
                {filters.prices.map((price) => <option key={price} value={price} disabled={Boolean(form.minPrice) && price < Number(form.minPrice)}>{money.format(price)}</option>)}
              </select>
            </div><small className="filter-hint">Các mức giá được lấy trực tiếp từ tour đang mở bán.</small></fieldset>
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
          {activeChips.length > 0 && <div className="filter-chips"><span>Đang lọc:</span>{activeChips.map((chip) => <button key={chip.keys.join("-")} onClick={() => removeParams(chip.keys)}>{chip.label}<X size={14} /></button>)}<button className="clear-chips" onClick={resetFilters}>Xóa tất cả</button></div>}
          {error ? <div className="error-state"><h2>Không thể tải tour</h2><p>{error}</p><button className="button" onClick={() => setReloadKey((value) => value + 1)}><RefreshCw size={17} /> Thử lại</button></div> : !result ? <TourGridSkeleton count={9} results /> : result.data.length ? (
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
