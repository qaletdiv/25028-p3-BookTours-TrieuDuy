import { Router } from "express";
import {
  index,
  show,
  showFilters,
  showHome,
} from "../controllers/tourController.js";
import validationErrorHandler from "../middlewares/validationErrorHandler.js";
import { listTourRules, tourSlugRules } from "../validators/tourValidator.js";

const router = Router();

router.get("/home", showHome);
router.get("/filters", showFilters);
router.get("/", listTourRules, validationErrorHandler, index);
router.get("/:slug", tourSlugRules, validationErrorHandler, show);

export default router;
