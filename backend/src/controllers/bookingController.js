import { createBooking, getBooking } from "../services/bookingService.js";

export async function store(req, res, next) {
  try {
    const booking = await createBooking(req.user.id, req.body);
    res.status(201).json(booking);
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
