import { Router } from "express";
import { index, show, store } from "../controllers/bookingController.js";
import requireAuth from "../middlewares/requireAuth.js";
import validationErrorHandler from "../middlewares/validationErrorHandler.js";
import { bookingCodeRules, createBookingRules } from "../validators/bookingValidator.js";

const router = Router();

router.use(requireAuth);
router.post("/", createBookingRules, validationErrorHandler, store);
router.get("/", index);
router.get("/:code", bookingCodeRules, validationErrorHandler, show);

export default router;
