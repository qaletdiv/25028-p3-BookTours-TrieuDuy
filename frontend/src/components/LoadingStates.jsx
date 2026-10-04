export function TourCardSkeleton() {
  return (
    <div className="tour-card skeleton-card" aria-hidden="true">
      <div className="skeleton skeleton-image" />
      <div className="tour-card-body">
        <div className="skeleton skeleton-line skeleton-line-sm" />
        <div className="skeleton skeleton-line skeleton-line-lg" />
        <div className="skeleton skeleton-line skeleton-line-md" />
        <div className="skeleton skeleton-footer" />
      </div>
    </div>
  );
}

export function TourGridSkeleton({ count = 6, results = false }) {
  return (
    <div className={`tour-grid ${results ? "results-grid" : ""}`} aria-label="Đang tải danh sách tour">
      {Array.from({ length: count }, (_, index) => <TourCardSkeleton key={index} />)}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="container detail-skeleton" aria-label="Đang tải chi tiết tour">
      <div className="skeleton skeleton-line skeleton-title" />
      <div className="skeleton skeleton-line skeleton-line-md" />
      <div className="skeleton skeleton-detail-image" />
      <div className="detail-skeleton-grid">
        <div>
          <div className="skeleton skeleton-line skeleton-line-lg" />
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-line skeleton-line-md" />
        </div>
        <div className="skeleton skeleton-booking" />
      </div>
    </div>
  );
}
