import { z } from "zod";

export const registerSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "First name must contain at least 2 characters")
    .max(50),

  lastName: z
    .string()
    .trim()
    .min(2, "Last name must contain at least 2 characters")
    .max(50),

  email: z.string().trim().email("Please provide a valid email address"),

  password: z
    .string()
    .min(8, "Password must contain at least 8 characters")
    .max(100),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Please provide a valid email address"),

  password: z.string().min(1, "Password is required"),
});
