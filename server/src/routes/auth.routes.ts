import { Router } from "express";

import {
  register,
  login,
  logout,
  getCurrentUser,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { updateProfile } from "../controllers/auth.controller.js";
import { authLimiter } from "../middleware/rate-limit.middleware.js";

const router = Router();

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.get("/me", authenticate, getCurrentUser);
router.patch("/profile", authenticate, updateProfile);
router.post("/logout", logout);

export default router;
