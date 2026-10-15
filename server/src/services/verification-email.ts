import { createHash, randomBytes } from "node:crypto";

import { env } from "../config/env.js";

export const VERIFICATION_LINK_MS = 30 * 60 * 1000;
export const VERIFICATION_RESEND_MS = 60 * 1000;
export const UNVERIFIED_ACCOUNT_MS = 7 * 24 * 60 * 60 * 1000;

export function emailVerificationEnabled(): boolean {
  return Boolean(env.BREVO_API_KEY && env.EMAIL_FROM);
}

export function newVerificationToken() {
  const token = randomBytes(32).toString("hex");
  return { token, hash: hashVerificationToken(token) };
}

export function hashVerificationToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function sendVerificationEmail(to: string, token: string): Promise<void> {
  if (!env.BREVO_API_KEY || !env.EMAIL_FROM) {
    throw new Error("Email verification is not configured");
  }

  const url = new URL("/verify-email", env.CLIENT_URL);
  // Fragments are never sent to Vercel/Render as part of an HTTP request.
  url.hash = new URLSearchParams({ token }).toString();

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": env.BREVO_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: "RoleNaviq", email: env.EMAIL_FROM },
      to: [{ email: to }],
      subject: "Verify your RoleNaviq email",
      textContent: `Welcome to RoleNaviq. Open this link to verify your email address: ${url.href}\n\nThe link expires in 30 minutes. If you did not create an account, you can ignore this message.`,
    }),
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    // Brevo errors may contain recipient details. Never log the response body or link.
    throw new Error("Verification email delivery failed");
  }
}
