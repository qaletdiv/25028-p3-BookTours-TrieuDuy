import { Router } from "express";
import { login, me, register } from "../controllers/authController.js";
import requireAuth from "../middlewares/requireAuth.js";
import validationErrorHandler from "../middlewares/validationErrorHandler.js";
import { loginRules, registerRules } from "../validators/authValidator.js";

const router = Router();

router.post("/register", registerRules, validationErrorHandler, register);
router.post("/login", loginRules, validationErrorHandler, login);
router.get("/me", requireAuth, me);

export default router;
