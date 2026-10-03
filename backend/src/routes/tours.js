import { Router } from "express";
import { pool } from "../config/db.js";

const router = Router();

const TOUR_CARD_SELECT = `
  SELECT t.id, t.code, t.slug, t.name, t.summary, t.route, t.duration_days,
    t.duration_nights, t.price, t.original_price, t.cover_image, t.is_hot,
    t.rating, t.review_count,
    d.name AS destination, d.slug AS destination_slug,
    dp.name AS departure, tt.name AS tour_type
  FROM tours t
  JOIN destinations d ON d.id = t.destination_id
  JOIN departures dp ON dp.id = t.departure_id
  JOIN tour_types tt ON tt.id = t.tour_type_id
`;

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function mapTour(tour) {
  return {
    ...tour,
    price: Number(tour.price),
    original_price: tour.original_price ? Number(tour.original_price) : null,
    rating: Number(tour.rating),
    is_hot: Boolean(tour.is_hot),
  };
}

function parseJson(value) {
  if (Array.isArray(value)) return value;
  try {
    return JSON.parse(value || "[]");
  } catch {
    return [];
  }
}

router.get("/home", async (_req, res, next) => {
  try {
    const [hot] = await pool.query(
      `${TOUR_CARD_SELECT} WHERE t.status = 'active' AND t.is_hot = 1 ORDER BY t.featured_order, t.id DESC LIMIT 6`,
    );
    const [domestic] = await pool.query(
      `${TOUR_CARD_SELECT} WHERE t.status = 'active' AND t.region = 'domestic' ORDER BY t.featured_order, t.id DESC LIMIT 6`,
    );
    const [international] = await pool.query(
      `${TOUR_CARD_SELECT} WHERE t.status = 'active' AND t.region = 'international' ORDER BY t.featured_order, t.id DESC LIMIT 6`,
    );
    const [banners] = await pool.query(
      "SELECT id, title, subtitle, image_url, cta_text, cta_url FROM banners WHERE is_active = 1 ORDER BY display_order",
    );

    res.json({
      banners,
      sections: {
        hot: hot.map(mapTour),
        domestic: domestic.map(mapTour),
        international: international.map(mapTour),
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/filters", async (_req, res, next) => {
  try {
    const [[destinations], [departures], [types]] = await Promise.all([
      pool.query("SELECT id, name, slug FROM destinations ORDER BY name"),
      pool.query("SELECT id, name, slug FROM departures ORDER BY name"),
      pool.query("SELECT id, name, slug FROM tour_types ORDER BY name"),
    ]);
    res.json({ destinations, departures, types });
  } catch (error) {
    next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const page = Math.max(1, toNumber(req.query.page, 1));
    const limit = Math.min(24, Math.max(1, toNumber(req.query.limit, 9)));
    const offset = (page - 1) * limit;
    const conditions = ["t.status = 'active'"];
    const params = [];

    const equalFilters = [
      ["destination", "d.slug"],
      ["departure", "dp.slug"],
      ["type", "tt.slug"],
      ["region", "t.region"],
    ];
    equalFilters.forEach(([queryKey, column]) => {
      if (req.query[queryKey]) {
        conditions.push(`${column} = ?`);
        params.push(req.query[queryKey]);
      }
    });

    if (req.query.keyword) {
      conditions.push("(t.name LIKE ? OR t.route LIKE ? OR d.name LIKE ?)");
      const keyword = `%${req.query.keyword}%`;
      params.push(keyword, keyword, keyword);
    }
    if (req.query.minPrice) {
      conditions.push("t.price >= ?");
      params.push(Math.max(0, toNumber(req.query.minPrice, 0)));
    }
    if (req.query.maxPrice) {
      conditions.push("t.price <= ?");
      params.push(Math.max(0, toNumber(req.query.maxPrice, 0)));
    }
    if (req.query.minDays) {
      conditions.push("t.duration_days >= ?");
      params.push(Math.max(1, toNumber(req.query.minDays, 1)));
    }
    if (req.query.maxDays) {
      conditions.push("t.duration_days <= ?");
      params.push(Math.max(1, toNumber(req.query.maxDays, 30)));
    }
    if (req.query.startDate) {
      conditions.push(
        "EXISTS (SELECT 1 FROM tour_departures td WHERE td.tour_id = t.id AND td.start_date >= ? AND td.available_slots > 0)",
      );
      params.push(req.query.startDate);
    }

    const sortMap = {
      newest: "t.id DESC",
      price_asc: "t.price ASC",
      price_desc: "t.price DESC",
      name_asc: "t.name ASC",
      name_desc: "t.name DESC",
    };
    const orderBy = sortMap[req.query.sort] || sortMap.newest;
    const where = `WHERE ${conditions.join(" AND ")}`;
    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM tours t
       JOIN destinations d ON d.id = t.destination_id
       JOIN departures dp ON dp.id = t.departure_id
       JOIN tour_types tt ON tt.id = t.tour_type_id ${where}`,
      params,
    );
    const [rows] = await pool.query(
      `${TOUR_CARD_SELECT} ${where} ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );
    const total = Number(countRows[0].total);

    res.json({
      data: rows.map(mapTour),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:slug", async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT t.id, t.destination_id, t.departure_id, t.tour_type_id,
        t.code, t.slug, t.name, t.summary, t.route, t.duration_days,
        t.duration_nights, t.price, t.original_price, t.cover_image, t.is_hot,
        t.description, t.highlights, t.included, t.excluded, t.policy,
        t.video_url, t.rating, t.review_count,
        d.name AS destination, d.slug AS destination_slug,
        dp.name AS departure, tt.name AS tour_type
       FROM tours t
       JOIN destinations d ON d.id = t.destination_id
       JOIN departures dp ON dp.id = t.departure_id
       JOIN tour_types tt ON tt.id = t.tour_type_id
       WHERE t.slug = ? AND t.status = 'active' LIMIT 1`,
      [req.params.slug],
    );
    if (!rows.length) {
      return res.status(404).json({ message: "Không tìm thấy tour." });
    }

    const tour = rows[0];
    const [[images], [departures], [itinerary], [related]] = await Promise.all([
      pool.query(
        "SELECT id, image_url, alt_text FROM tour_images WHERE tour_id = ? ORDER BY display_order",
        [tour.id],
      ),
      pool.query(
        "SELECT id, start_date, end_date, available_slots FROM tour_departures WHERE tour_id = ? AND start_date >= CURDATE() ORDER BY start_date LIMIT 12",
        [tour.id],
      ),
      pool.query(
        "SELECT day_number, title, description, meals FROM tour_itineraries WHERE tour_id = ? ORDER BY day_number",
        [tour.id],
      ),
      pool.query(
        `${TOUR_CARD_SELECT}
         WHERE t.status = 'active' AND t.id <> ? AND (t.destination_id = ? OR t.tour_type_id = ?)
         ORDER BY (t.destination_id = ?) DESC, t.is_hot DESC LIMIT 4`,
        [tour.id, tour.destination_id, tour.tour_type_id, tour.destination_id],
      ),
    ]);

    res.json({
      ...mapTour(tour),
      rating: Number(tour.rating),
      highlights: parseJson(tour.highlights),
      included: parseJson(tour.included),
      excluded: parseJson(tour.excluded),
      policy: parseJson(tour.policy),
      images,
      departures,
      itinerary,
      related: related.map(mapTour),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
