import { z } from "zod";

export const profileSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "First name is required")
    .max(50, "First name is too long"),

  lastName: z
    .string()
    .trim()
    .min(1, "Last name is required")
    .max(50, "Last name is too long"),

  email: z.string().trim().email("Please enter a valid email address"),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
