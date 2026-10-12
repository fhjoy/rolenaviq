import { z } from "zod";

const dueDate = z.iso.date().transform(value => new Date(`${value}T00:00:00.000Z`));

export const createActionSchema = z.object({
  applicationId: z.string().min(1),
  title: z.string().trim().min(1).max(200),
  dueDate,
});

export const updateActionSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  dueDate: dueDate.optional(),
  completed: z.boolean().optional(),
}).refine(value => Object.keys(value).length > 0, "Provide a change");

export const actionQuerySchema = z.object({
  applicationId: z.string().optional(),
  status: z.enum(["open", "completed", "all"]).default("open"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});
