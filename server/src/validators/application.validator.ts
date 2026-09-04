import { z } from "zod";

import {
  applicationStatuses,
  employmentTypes,
  workplaceTypes,
} from "../models/Application.js";

export const createApplicationSchema = z.object({
  company: z.string().trim().min(1, "Company is required").max(100),

  position: z.string().trim().min(1, "Position is required").max(150),

  jobUrl: z.string().trim().url("Please provide a valid URL").optional(),

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

export const updateApplicationSchema = createApplicationSchema.partial();

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
