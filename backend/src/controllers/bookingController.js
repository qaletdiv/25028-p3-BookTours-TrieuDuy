import { createBooking, getBooking, getMyBookings } from "../services/bookingService.js";

export async function store(req, res, next) {
  try {
    const booking = await createBooking(req.user.id, req.body);
    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
}

export async function index(req, res, next) {
  try {
    res.json({ data: await getMyBookings(req.user.id) });
  } catch (error) {
    next(error);
  }
}

export async function show(req, res, next) {
  try {
    res.json(await getBooking(req.params.code, req.user.id));
  } catch (error) {
    next(error);
  }
}
