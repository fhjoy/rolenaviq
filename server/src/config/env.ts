import "dotenv/config";

import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce.number().int().positive().default(5000),

  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),

  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must contain at least 32 characters"),

  CLIENT_URL: z.string().url("CLIENT_URL must be a valid URL"),

  COOKIE_SAME_SITE: z.enum(["lax", "strict", "none"]).default("lax"),

  GOOGLE_CLIENT_ID: z.preprocess(value => value === "" ? undefined : value, z.string().min(1).optional()),
  GOOGLE_CLIENT_SECRET: z.preprocess(value => value === "" ? undefined : value, z.string().min(1).optional()),
  BREVO_API_KEY: z.preprocess(value => value === "" ? undefined : value, z.string().min(1).optional()),
  EMAIL_FROM: z.preprocess(value => value === "" ? undefined : value, z.email().optional()),
}).refine(
  value => Boolean(value.GOOGLE_CLIENT_ID) === Boolean(value.GOOGLE_CLIENT_SECRET),
  { message: "Set both Google OAuth credentials, or neither" },
).refine(
  value => Boolean(value.BREVO_API_KEY) === Boolean(value.EMAIL_FROM),
  { message: "Set both Brevo email credentials, or neither" },
);

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error("Invalid environment configuration:");

  console.error(result.error.flatten().fieldErrors);

  process.exit(1);
}

export const env = result.data;
