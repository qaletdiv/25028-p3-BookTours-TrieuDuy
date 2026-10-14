USE book_tours;

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  address VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookings (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(30) NOT NULL UNIQUE,
  user_id INT UNSIGNED NOT NULL,
  tour_id INT UNSIGNED NOT NULL,
  departure_id INT UNSIGNED NOT NULL,
  contact_name VARCHAR(120) NOT NULL,
  contact_phone VARCHAR(20) NOT NULL,
  contact_email VARCHAR(180) NOT NULL,
  contact_address VARCHAR(255) NOT NULL,
  adult_count TINYINT UNSIGNED NOT NULL,
  child_count TINYINT UNSIGNED NOT NULL DEFAULT 0,
  passengers JSON NOT NULL,
  adult_price DECIMAL(14, 0) NOT NULL,
  child_price DECIMAL(14, 0) NOT NULL,
  total_price DECIMAL(14, 0) NOT NULL,
  payment_method ENUM('bank_transfer', 'credit_card') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_booking_user (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (tour_id) REFERENCES tours(id),
  FOREIGN KEY (departure_id) REFERENCES tour_departures(id)
);
