import type { CookieOptions, Request, Response } from "express";
import jwt from "jsonwebtoken";
import * as oidc from "openid-client";
import { z } from "zod";

import { authCookieOptions } from "../config/auth-cookie.js";
import { DEMO_EMAIL } from "../config/demo.js";
import { env } from "../config/env.js";
import User from "../models/User.js";
import { generateToken } from "../utils/token.js";

const transactionCookie = "google_oidc";
const callbackPath = "/api/auth/google/callback";
const transactionCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax", // Google's top-level GET callback must carry this cookie.
  path: "/api/auth/google",
};

const transactionSchema = z.discriminatedUnion("intent", [
  z.object({
    intent: z.literal("sign-in"),
    state: z.string().min(1),
    verifier: z.string().min(1),
    nonce: z.string().min(1),
    returnTo: z.string().min(1),
  }),
  z.object({
    intent: z.literal("link"),
    state: z.string().min(1),
    verifier: z.string().min(1),
    nonce: z.string().min(1),
    userId: z.string().min(1),
  }),
]);

let configPromise: Promise<oidc.Configuration> | undefined;

function googleIsConfigured(): boolean {
  return Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);
}

function googleConfig(): Promise<oidc.Configuration> {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    throw new Error("Google sign-in is not configured");
  }

  configPromise ??= oidc.discovery(
    new URL("https://accounts.google.com"),
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
  ).catch(error => {
    configPromise = undefined; // A temporary provider outage can recover on retry.
    throw error;
  });

  return configPromise;
}

function clientUrl(path: string): string {
  return new URL(path, env.CLIENT_URL).href;
}

function safeReturnTo(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/prep/") || value.includes("\\")) {
    return "/dashboard";
  }

  const target = new URL(value, env.CLIENT_URL);
  if (target.origin !== new URL(env.CLIENT_URL).origin || !target.pathname.startsWith("/prep/")) {
    return "/dashboard";
  }

  return `${target.pathname}${target.search}${target.hash}`;
}

function fail(res: Response, code: string): void {
  res.redirect(302, clientUrl(`/login?google=${code}`));
}

export const getAuthProviders = (_req: Request, res: Response): void => {
  res.json({ google: googleIsConfigured() });
};

async function beginGoogle(req: Request, res: Response, intent: "sign-in" | "link") {
  if (!googleIsConfigured()) {
    res.status(503).json({ message: "Google sign-in is not available" });
    return;
  }

  try {
    const config = await googleConfig();
    const state = oidc.randomState();
    const verifier = oidc.randomPKCECodeVerifier();
    const nonce = oidc.randomNonce();
    const challenge = await oidc.calculatePKCECodeChallenge(verifier);
    const transaction = intent === "link"
      ? { intent, state, verifier, nonce, userId: req.userId }
      : {
          intent,
          state,
          verifier,
          nonce,
          returnTo: safeReturnTo(req.query.returnTo),
        };

    res.cookie(transactionCookie, JSON.stringify(transaction), {
      ...transactionCookieOptions,
      signed: true,
      maxAge: 10 * 60 * 1000,
    });

    const url = oidc.buildAuthorizationUrl(config, {
      redirect_uri: clientUrl(callbackPath),
      scope: "openid email profile",
      state,
      nonce,
      code_challenge: challenge,
      code_challenge_method: "S256",
    });

    res.redirect(302, url.href);
  } catch {
    console.error("Google authorization could not start");
    fail(res, "unavailable");
  }
}

export const startGoogleSignIn = (req: Request, res: Response): Promise<void> =>
  beginGoogle(req, res, "sign-in");

export const startGoogleLink = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId);

    if (!user || user.isDemo || user.googleSub) {
      res.status(403).json({ message: "Google cannot be connected to this account" });
      return;
    }

    await beginGoogle(req, res, "link");
  } catch {
    console.error("Google account linking could not start");
    res.status(500).json({ message: "Unable to connect Google right now" });
  }
};

function authenticatedUserId(req: Request): string | undefined {
  try {
    if (typeof req.cookies.token !== "string") return undefined;
    const payload = jwt.verify(req.cookies.token, env.JWT_SECRET);
    return typeof payload !== "string" && typeof payload.userId === "string"
      ? payload.userId
      : undefined;
  } catch {
    return undefined;
  }
}

export const googleCallback = async (req: Request, res: Response): Promise<void> => {
  const raw = req.signedCookies[transactionCookie];
  res.clearCookie(transactionCookie, transactionCookieOptions);

  let stored: unknown;
  try {
    stored = typeof raw === "string" ? JSON.parse(raw) : undefined;
  } catch {
    fail(res, "invalid");
    return;
  }

  const parsed = transactionSchema.safeParse(stored);
  if (!parsed.success || typeof req.query.code !== "string" || typeof req.query.state !== "string" ||
    req.query.state !== parsed.data.state) {
    fail(res, "invalid");
    return;
  }

  const transaction = parsed.data;

  // Linking requires the same still-authenticated RoleNaviq user at both ends.
  if (transaction.intent === "link" && authenticatedUserId(req) !== transaction.userId) {
    fail(res, "invalid");
    return;
  }

  try {
    const config = await googleConfig();
    const tokens = await oidc.authorizationCodeGrant(
      config,
      new URL(req.originalUrl, env.CLIENT_URL),
      {
        pkceCodeVerifier: transaction.verifier,
        expectedState: transaction.state,
        expectedNonce: transaction.nonce,
        idTokenExpected: true,
      },
    );
    const claims = tokens.claims();
    const email = typeof claims?.email === "string" ? claims.email.trim().toLowerCase() : "";

    if (!claims?.sub || claims.email_verified !== true || !z.email().safeParse(email).success || email === DEMO_EMAIL) {
      fail(res, "invalid");
      return;
    }

    if (transaction.intent === "link") {
      const currentUser = await User.findById(transaction.userId);
      if (!currentUser || currentUser.isDemo || currentUser.email !== email ||
        (currentUser.googleSub && currentUser.googleSub !== claims.sub) ||
        await User.exists({ googleSub: claims.sub, _id: { $ne: currentUser._id } })) {
        res.redirect(302, clientUrl("/settings?google=conflict"));
        return;
      }

      if (currentUser.googleSub !== claims.sub) {
        const updated = await User.updateOne(
          { _id: currentUser._id, email, googleSub: { $exists: false } },
          { $set: { googleSub: claims.sub } },
        );
        if (updated.modifiedCount !== 1) {
          res.redirect(302, clientUrl("/settings?google=conflict"));
          return;
        }
      }
      res.redirect(302, clientUrl("/settings?google=linked"));
      return;
    }

    let user = await User.findOne({ googleSub: claims.sub });
    if (!user) {
      // An email match alone never links an existing password account.
      if (await User.exists({ email })) {
        fail(res, "existing-account");
        return;
      }

      user = await User.create({
        firstName: typeof claims.given_name === "string" && claims.given_name.trim()
          ? claims.given_name.trim().slice(0, 50) : "Google",
        lastName: typeof claims.family_name === "string" && claims.family_name.trim()
          ? claims.family_name.trim().slice(0, 50) : "User",
        email,
        googleSub: claims.sub,
      });
    }

    res.cookie("token", generateToken(user._id.toString()), authCookieOptions);
    res.redirect(302, clientUrl(safeReturnTo(transaction.returnTo)));
  } catch {
    // Never log tokens, identity claims, callback URLs, or the user's profile.
    console.error("Google authentication failed");
    fail(res, "unavailable");
  }
};
