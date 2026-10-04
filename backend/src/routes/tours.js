import { Router } from "express";
import {
  index,
  show,
  showFilters,
  showHome,
  suggestions,
} from "../controllers/tourController.js";
import validationErrorHandler from "../middlewares/validationErrorHandler.js";
import { listTourRules, suggestionRules, tourSlugRules } from "../validators/tourValidator.js";

const router = Router();

router.get("/home", showHome);
router.get("/filters", showFilters);
router.get("/suggestions", suggestionRules, validationErrorHandler, suggestions);
router.get("/", listTourRules, validationErrorHandler, index);
router.get("/:slug", tourSlugRules, validationErrorHandler, show);

export default router;
