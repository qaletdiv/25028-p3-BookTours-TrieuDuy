import { pool } from "../config/db.js";

export async function findActiveBanners() {
  const [rows] = await pool.query(
    `SELECT id, title, subtitle, image_url, cta_text, cta_url
     FROM banners WHERE is_active = 1 ORDER BY display_order`,
  );
  return rows;
}

export async function findDestinations() {
  const [rows] = await pool.query(
    "SELECT id, name, slug FROM destinations ORDER BY name",
  );
  return rows;
}

export async function findDepartures() {
  const [rows] = await pool.query(
    "SELECT id, name, slug FROM departures ORDER BY name",
  );
  return rows;
}

export async function findTourTypes() {
  const [rows] = await pool.query(
    "SELECT id, name, slug FROM tour_types ORDER BY name",
  );
  return rows;
}

export async function findTourPriceOptions() {
  const [rows] = await pool.query(
    `SELECT DISTINCT price
     FROM tours
     WHERE status = 'active'
     ORDER BY price`,
  );
  return rows.map((row) => Number(row.price));
}
