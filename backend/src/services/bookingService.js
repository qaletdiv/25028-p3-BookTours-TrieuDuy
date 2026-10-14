import { pool } from "../config/db.js";
import {
  findBookingByCode,
  findDepartureForBooking,
  insertBooking,
  reserveDepartureSlots,
} from "../models/bookingModel.js";
import { findTourBySlug } from "../models/tourModel.js";
import { updateUserAddress } from "../models/userModel.js";
import ApiError from "../utils/ApiError.js";

const CHILD_RATE = 0.7;

function parsePassengers(value) {
  if (Array.isArray(value)) return value;
  try {
    return JSON.parse(value || "[]");
  } catch {
    return [];
  }
}

function createBookingCode() {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `BT${stamp}${random}`;
}

function mapBooking(row) {
  return {
    code: row.code,
    contactName: row.contact_name,
    contactPhone: row.contact_phone,
    contactEmail: row.contact_email,
    contactAddress: row.contact_address,
    adults: row.adult_count,
    children: row.child_count,
    passengers: parsePassengers(row.passengers),
    adultPrice: Number(row.adult_price),
    childPrice: Number(row.child_price),
    totalPrice: Number(row.total_price),
    paymentMethod: row.payment_method,
    createdAt: row.created_at,
    tourName: row.tour_name,
    tourCode: row.tour_code,
    tourSlug: row.tour_slug,
    route: row.route,
    coverImage: row.cover_image,
    startDate: row.start_date,
    endDate: row.end_date,
  };
}

export async function createBooking(userId, payload) {
  const tour = await findTourBySlug(payload.tourSlug);
  if (!tour) {
    throw new ApiError(404, "Không tìm thấy tour.");
  }

  const adults = Number(payload.adults);
  const children = Number(payload.children);
  const guests = adults + children;
  const adultTypes = payload.passengers.filter((item) => item.type === "adult").length;
  const childTypes = payload.passengers.filter((item) => item.type === "child").length;
  if (adultTypes !== adults || childTypes !== children) {
    throw new ApiError(400, "Loại hành khách không khớp với số lượng đã chọn.");
  }

  const adultPrice = Number(tour.price);
  const childPrice = Math.round(adultPrice * CHILD_RATE);
  const totalPrice = adultPrice * adults + childPrice * children;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const departure = await findDepartureForBooking(
      connection,
      Number(payload.departureId),
      tour.id,
    );
    if (!departure) {
      throw new ApiError(400, "Ngày khởi hành không còn mở bán.");
    }
    if (departure.available_slots < guests) {
      throw new ApiError(400, `Chỉ còn ${departure.available_slots} chỗ cho ngày này.`);
    }

    const reserved = await reserveDepartureSlots(connection, departure.id, tour.id, guests);
    if (!reserved) {
      throw new ApiError(400, "Số chỗ vừa thay đổi. Vui lòng chọn lại số khách.");
    }

    await updateUserAddress(connection, userId, payload.address.trim());
    const code = createBookingCode();
    await insertBooking(connection, {
      code,
      userId,
      tourId: tour.id,
      departureId: departure.id,
      contactName: payload.fullName.trim(),
      contactPhone: payload.phone.trim(),
      contactEmail: payload.email.trim(),
      contactAddress: payload.address.trim(),
      adultCount: adults,
      childCount: children,
      passengers: payload.passengers.map((item) => ({
        fullName: item.fullName.trim(),
        type: item.type,
      })),
      adultPrice,
      childPrice,
      totalPrice,
      paymentMethod: payload.paymentMethod,
    });
    await connection.commit();
    return { code };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function getBooking(code, userId) {
  const booking = await findBookingByCode(code, userId);
  if (!booking) {
    throw new ApiError(404, "Không tìm thấy booking.");
  }
  return mapBooking(booking);
}
