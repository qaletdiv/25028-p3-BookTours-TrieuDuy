import { pool } from "../config/db.js";

export async function findUserByEmail(email) {
  const [rows] = await pool.query(
    `SELECT id, full_name, email, phone, password_hash, address
     FROM users WHERE email = ? LIMIT 1`,
    [email],
  );
  return rows[0] || null;
}

export async function findUserById(id) {
  const [rows] = await pool.query(
    `SELECT id, full_name, email, phone, address
     FROM users WHERE id = ? LIMIT 1`,
    [id],
  );
  return rows[0] || null;
}

export async function createUser({ fullName, email, phone, passwordHash }) {
  const [result] = await pool.query(
    `INSERT INTO users (full_name, email, phone, password_hash)
     VALUES (?, ?, ?, ?)`,
    [fullName, email, phone, passwordHash],
  );
  return findUserById(result.insertId);
}

export async function updateUserAddress(connection, userId, address) {
  await connection.query("UPDATE users SET address = ? WHERE id = ?", [address, userId]);
}
