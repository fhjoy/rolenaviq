import { rateLimit } from "express-rate-limit";

import { env } from "../config/env.js";

const skipInTests = (): boolean => env.NODE_ENV === "test";

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  limit: 200,

  standardHeaders: "draft-8",

  legacyHeaders: false,

  skip: skipInTests,

  message: {
    message: "Too many requests. Please try again later.",
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  limit: 10,

  standardHeaders: "draft-8",

  legacyHeaders: false,

  skip: skipInTests,

  message: {
    message: "Too many authentication attempts. Please try again later.",
  },
});
