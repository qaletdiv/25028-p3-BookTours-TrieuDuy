CREATE DATABASE IF NOT EXISTS book_tours
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE book_tours;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS tour_itineraries;
DROP TABLE IF EXISTS tour_departures;
DROP TABLE IF EXISTS tour_images;
DROP TABLE IF EXISTS tours;
DROP TABLE IF EXISTS banners;
DROP TABLE IF EXISTS tour_types;
DROP TABLE IF EXISTS departures;
DROP TABLE IF EXISTS destinations;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE destinations (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) NOT NULL UNIQUE
);

CREATE TABLE departures (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) NOT NULL UNIQUE
);

CREATE TABLE tour_types (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) NOT NULL UNIQUE
);

CREATE TABLE banners (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(180) NOT NULL,
  subtitle VARCHAR(255),
  image_url VARCHAR(600) NOT NULL,
  cta_text VARCHAR(50) DEFAULT 'Khám phá ngay',
  cta_url VARCHAR(255) DEFAULT '/tours',
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE tours (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  destination_id INT UNSIGNED NOT NULL,
  departure_id INT UNSIGNED NOT NULL,
  tour_type_id INT UNSIGNED NOT NULL,
  code VARCHAR(30) NOT NULL UNIQUE,
  slug VARCHAR(180) NOT NULL UNIQUE,
  name VARCHAR(220) NOT NULL,
  summary VARCHAR(350),
  description TEXT,
  route VARCHAR(255) NOT NULL,
  region ENUM('domestic', 'international') NOT NULL,
  duration_days TINYINT UNSIGNED NOT NULL,
  duration_nights TINYINT UNSIGNED NOT NULL,
  price DECIMAL(14, 0) NOT NULL,
  original_price DECIMAL(14, 0),
  cover_image VARCHAR(600) NOT NULL,
  video_url VARCHAR(600),
  rating DECIMAL(2, 1) DEFAULT 5.0,
  review_count INT UNSIGNED DEFAULT 0,
  highlights JSON,
  included JSON,
  excluded JSON,
  policy JSON,
  is_hot BOOLEAN DEFAULT FALSE,
  featured_order INT DEFAULT 99,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tour_filters (status, region, price, duration_days),
  FOREIGN KEY (destination_id) REFERENCES destinations(id),
  FOREIGN KEY (departure_id) REFERENCES departures(id),
  FOREIGN KEY (tour_type_id) REFERENCES tour_types(id)
);

CREATE TABLE tour_images (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tour_id INT UNSIGNED NOT NULL,
  image_url VARCHAR(600) NOT NULL,
  alt_text VARCHAR(255),
  display_order INT DEFAULT 0,
  FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE
);

CREATE TABLE tour_departures (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tour_id INT UNSIGNED NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  available_slots SMALLINT UNSIGNED DEFAULT 0,
  UNIQUE KEY uk_tour_start (tour_id, start_date),
  FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE
);

CREATE TABLE tour_itineraries (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tour_id INT UNSIGNED NOT NULL,
  day_number TINYINT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  meals VARCHAR(100),
  UNIQUE KEY uk_tour_day (tour_id, day_number),
  FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE
);
