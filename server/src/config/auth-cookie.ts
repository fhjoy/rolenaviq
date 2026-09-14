import type { CookieOptions } from "express";

import { env } from "./env.js";

const baseAuthCookieOptions: CookieOptions = {
  httpOnly: true,

  secure: env.NODE_ENV === "production",

  sameSite: env.COOKIE_SAME_SITE,

  path: "/",
};

export const authCookieOptions: CookieOptions = {
  ...baseAuthCookieOptions,

  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const clearAuthCookieOptions: CookieOptions = {
  ...baseAuthCookieOptions,
};
