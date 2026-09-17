import { z } from "zod";

import {
  applicationStatuses,
  employmentTypes,
  workplaceTypes,
} from "../models/Application.js";

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const httpUrlSchema = z
  .string()
  .trim()
  .refine(isHttpUrl, "Please provide a valid HTTP or HTTPS URL");

const applicationFieldsSchema = z.object({
  company: z.string().trim().min(1, "Company is required").max(100),

  position: z.string().trim().min(1, "Position is required").max(150),

  jobUrl: httpUrlSchema.optional(),

  location: z.string().trim().max(150).optional(),

  workplaceType: z.enum(workplaceTypes).optional(),

  employmentType: z.enum(employmentTypes).optional(),

  status: z.enum(applicationStatuses).default("saved"),

  technologies: z.array(z.string().trim().min(1)).default([]),

  salaryMin: z.number().nonnegative().optional(),

  salaryMax: z.number().nonnegative().optional(),

  currency: z.string().trim().length(3).default("EUR"),

  appliedAt: z.coerce.date().optional(),

  interviewDate: z.coerce.date().optional(),

  notes: z.string().trim().max(5000).optional(),
});

export const createApplicationSchema = applicationFieldsSchema.superRefine(
  (data, ctx) => {
    const requiresInterviewDate =
      data.status === "interview" || data.status === "technical_interview";

    if (requiresInterviewDate && !data.interviewDate) {
      ctx.addIssue({
        code: "custom",
        path: ["interviewDate"],
        message: "Interview date and time is required for interview stages",
      });
    }
  },
);

export const updateApplicationSchema = applicationFieldsSchema
  .partial()
  .extend({
    jobUrl: httpUrlSchema.nullable().optional(),

    location: z.string().trim().max(150).nullable().optional(),

    workplaceType: z.enum(workplaceTypes).nullable().optional(),

    employmentType: z.enum(employmentTypes).nullable().optional(),

    appliedAt: z.union([z.null(), z.coerce.date()]).optional(),

    interviewDate: z.union([z.null(), z.coerce.date()]).optional(),

    notes: z.string().trim().max(5000).nullable().optional(),

    reopen: z.boolean().optional(),
  });

export const applicationQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),

  status: z.enum(applicationStatuses).optional(),

  workplaceType: z.enum(workplaceTypes).optional(),

  employmentType: z.enum(employmentTypes).optional(),

  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(10),

  sort: z
    .enum([
      "-createdAt",
      "createdAt",
      "-appliedAt",
      "appliedAt",
      "company",
      "-company",
      "position",
      "-position",
    ])
    .default("-createdAt"),
});
