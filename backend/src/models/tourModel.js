import { pool } from "../config/db.js";

const TOUR_CARD_SELECT = `
  SELECT t.id, t.code, t.slug, t.name, t.summary, t.route, t.duration_days,
    t.duration_nights, t.price, t.original_price, t.cover_image, t.is_hot,
    t.rating, t.review_count, t.region,
    d.name AS destination, d.slug AS destination_slug,
    dp.name AS departure, tt.name AS tour_type
  FROM tours t
  JOIN destinations d ON d.id = t.destination_id
  JOIN departures dp ON dp.id = t.departure_id
  JOIN tour_types tt ON tt.id = t.tour_type_id
`;

const SORT_COLUMNS = {
  newest: "t.id DESC",
  price_asc: "t.price ASC",
  price_desc: "t.price DESC",
  name_asc: "t.name ASC",
  name_desc: "t.name DESC",
};

function buildTourFilters(filters) {
  const conditions = ["t.status = 'active'"];
  const params = [];
  const exactFilters = [
    ["destination", "d.slug"],
    ["departure", "dp.slug"],
    ["type", "tt.slug"],
    ["region", "t.region"],
  ];

  exactFilters.forEach(([key, column]) => {
    if (filters[key]) {
      conditions.push(`${column} = ?`);
      params.push(filters[key]);
    }
  });

  if (filters.keyword) {
    conditions.push("(t.name LIKE ? OR t.code LIKE ? OR t.route LIKE ? OR t.slug LIKE ?)");
    const keyword = `%${filters.keyword}%`;
    const slugKeyword = `%${filters.keyword.trim().toLowerCase().replace(/\s+/g, "-")}%`;
    params.push(keyword, keyword, keyword, slugKeyword);
  }
  if (filters.minPrice !== undefined) {
    conditions.push("t.price >= ?");
    params.push(filters.minPrice);
  }
  if (filters.maxPrice !== undefined) {
    conditions.push("t.price <= ?");
    params.push(filters.maxPrice);
  }
  if (filters.minDays !== undefined) {
    conditions.push("t.duration_days >= ?");
    params.push(filters.minDays);
  }
  if (filters.maxDays !== undefined) {
    conditions.push("t.duration_days <= ?");
    params.push(filters.maxDays);
  }
  if (filters.startDate) {
    conditions.push(
      "EXISTS (SELECT 1 FROM tour_departures td WHERE td.tour_id = t.id AND td.start_date >= ? AND td.available_slots > 0)",
    );
    params.push(filters.startDate);
  }

  return { where: `WHERE ${conditions.join(" AND ")}`, params };
}

export async function findHotTours(limit = 6) {
  const [rows] = await pool.query(
    `${TOUR_CARD_SELECT}
     WHERE t.status = 'active' AND t.is_hot = 1
     ORDER BY t.featured_order, t.id DESC LIMIT ?`,
    [limit],
  );
  return rows;
}

export async function findToursByRegion(region, limit = 6) {
  const [rows] = await pool.query(
    `${TOUR_CARD_SELECT}
     WHERE t.status = 'active' AND t.region = ?
     ORDER BY t.featured_order, t.id DESC LIMIT ?`,
    [region, limit],
  );
  return rows;
}

export async function findTours(filters, pagination) {
  const { where, params } = buildTourFilters(filters);
  const orderBy = SORT_COLUMNS[pagination.sort] || SORT_COLUMNS.newest;
  const joins = `
    FROM tours t
    JOIN destinations d ON d.id = t.destination_id
    JOIN departures dp ON dp.id = t.departure_id
    JOIN tour_types tt ON tt.id = t.tour_type_id
  `;

  const [countResult, rowsResult] = await Promise.all([
    pool.query(`SELECT COUNT(*) AS total ${joins} ${where}`, params),
    pool.query(
      `${TOUR_CARD_SELECT} ${where} ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
      [...params, pagination.limit, pagination.offset],
    ),
  ]);

  return {
    rows: rowsResult[0],
    total: Number(countResult[0][0].total),
  };
}

export async function findTourSuggestions(keyword, limit = 6) {
  const contains = `%${keyword}%`;
  const startsWith = `${keyword}%`;
  const slugContains = `%${keyword.toLowerCase().replace(/\s+/g, "-")}%`;
  const [rows] = await pool.query(
    `SELECT t.id, t.name, t.slug, t.cover_image, t.price,
      d.name AS destination
     FROM tours t
     JOIN destinations d ON d.id = t.destination_id
     WHERE t.status = 'active'
       AND (t.name LIKE ? OR t.code LIKE ? OR t.route LIKE ? OR t.slug LIKE ?)
     ORDER BY
       CASE
         WHEN t.name LIKE ? THEN 0
         WHEN t.code LIKE ? THEN 1
         ELSE 2
       END,
       t.is_hot DESC,
       t.name
     LIMIT ?`,
    [contains, contains, contains, slugContains, startsWith, startsWith, limit],
  );
  return rows;
}

export async function findTourBySlug(slug) {
  const [rows] = await pool.query(
    `SELECT t.id, t.destination_id, t.departure_id, t.tour_type_id,
      t.code, t.slug, t.name, t.summary, t.route, t.duration_days,
      t.duration_nights, t.price, t.original_price, t.cover_image, t.is_hot,
      t.region,
      t.description, t.highlights, t.included, t.excluded, t.policy,
      t.video_url, t.rating, t.review_count,
      d.name AS destination, d.slug AS destination_slug,
      dp.name AS departure, tt.name AS tour_type
     FROM tours t
     JOIN destinations d ON d.id = t.destination_id
     JOIN departures dp ON dp.id = t.departure_id
     JOIN tour_types tt ON tt.id = t.tour_type_id
     WHERE t.slug = ? AND t.status = 'active' LIMIT 1`,
    [slug],
  );
  return rows[0] || null;
}

export async function findTourImages(tourId) {
  const [rows] = await pool.query(
    "SELECT id, image_url, alt_text FROM tour_images WHERE tour_id = ? ORDER BY display_order",
    [tourId],
  );
  return rows;
}

export async function findTourDepartures(tourId) {
  const [rows] = await pool.query(
    `SELECT id, start_date, end_date, available_slots
     FROM tour_departures
     WHERE tour_id = ? AND start_date >= CURDATE()
     ORDER BY start_date LIMIT 12`,
    [tourId],
  );
  return rows;
}

export async function findTourItinerary(tourId) {
  const [rows] = await pool.query(
    `SELECT day_number, title, description, meals
     FROM tour_itineraries WHERE tour_id = ? ORDER BY day_number`,
    [tourId],
  );
  return rows;
}

export async function findRelatedTours(tour, limit = 6) {
  const [rows] = await pool.query(
    `${TOUR_CARD_SELECT}
     WHERE t.status = 'active'
       AND t.id <> ?
       AND t.region = ?
     ORDER BY
       (t.destination_id = ?) DESC,
       (t.tour_type_id = ?) DESC,
       t.is_hot DESC,
       t.featured_order,
       t.id DESC
     LIMIT ?`,
    [tour.id, tour.region, tour.destination_id, tour.tour_type_id, limit],
  );
  return rows;
}
