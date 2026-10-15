import { Router } from "express";

import {
  register,
  login,
  logout,
  getCurrentUser,
  resendVerification,
  verifyEmail,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { updateProfile } from "../controllers/auth.controller.js";
import { authLimiter } from "../middleware/rate-limit.middleware.js";
import {
  getAuthProviders,
  googleCallback,
  startGoogleLink,
  startGoogleSignIn,
} from "../controllers/google-auth.controller.js";

const router = Router();

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/verify-email", authLimiter, verifyEmail);
router.post("/resend-verification", authLimiter, resendVerification);
router.get("/providers", getAuthProviders);
router.get("/google", authLimiter, startGoogleSignIn);
router.get("/google/link", authenticate, authLimiter, startGoogleLink);
router.get("/google/callback", authLimiter, googleCallback);
router.get("/me", authenticate, getCurrentUser);
router.patch("/profile", authenticate, updateProfile);
router.post("/logout", logout);

export default router;
