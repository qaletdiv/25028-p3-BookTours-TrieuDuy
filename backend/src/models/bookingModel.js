import { pool } from "../config/db.js";

export async function findDepartureForBooking(connection, departureId, tourId) {
  const [rows] = await connection.query(
    `SELECT id, start_date, end_date, available_slots
     FROM tour_departures
     WHERE id = ? AND tour_id = ? AND start_date >= CURDATE()
     LIMIT 1`,
    [departureId, tourId],
  );
  return rows[0] || null;
}

export async function reserveDepartureSlots(connection, departureId, tourId, guests) {
  const [result] = await connection.query(
    `UPDATE tour_departures
     SET available_slots = available_slots - ?
     WHERE id = ? AND tour_id = ? AND available_slots >= ?`,
    [guests, departureId, tourId, guests],
  );
  return result.affectedRows === 1;
}

export async function insertBooking(connection, booking) {
  const [result] = await connection.query(
    `INSERT INTO bookings (
      code, user_id, tour_id, departure_id,
      contact_name, contact_phone, contact_email, contact_address,
      adult_count, child_count, passengers,
      adult_price, child_price, total_price, payment_method
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      booking.code,
      booking.userId,
      booking.tourId,
      booking.departureId,
      booking.contactName,
      booking.contactPhone,
      booking.contactEmail,
      booking.contactAddress,
      booking.adultCount,
      booking.childCount,
      JSON.stringify(booking.passengers),
      booking.adultPrice,
      booking.childPrice,
      booking.totalPrice,
      booking.paymentMethod,
    ],
  );
  return result.insertId;
}

export async function findBookingByCode(code, userId) {
  const [rows] = await pool.query(
    `SELECT b.code, b.contact_name, b.contact_phone, b.contact_email, b.contact_address,
      b.adult_count, b.child_count, b.passengers, b.adult_price, b.child_price,
      b.total_price, b.payment_method, b.created_at,
      t.name AS tour_name, t.code AS tour_code, t.slug AS tour_slug, t.route, t.cover_image,
      td.start_date, td.end_date
     FROM bookings b
     JOIN tours t ON t.id = b.tour_id
     JOIN tour_departures td ON td.id = b.departure_id
     WHERE b.code = ? AND b.user_id = ?
     LIMIT 1`,
    [code, userId],
  );
  return rows[0] || null;
}
