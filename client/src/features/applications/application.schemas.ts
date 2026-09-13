import { z } from "zod";

export const applicationFormSchema = z.object({
  company: z.string().trim().min(1, "Company is required"),

  position: z.string().trim().min(1, "Position is required"),

  jobUrl: z.union([
    z.literal(""),
    z.string().trim().url("Please enter a valid URL"),
  ]),

  location: z.string().trim().optional(),

  workplaceType: z.union([
    z.enum(["remote", "hybrid", "onsite"]),
    z.literal(""),
  ]),

  employmentType: z.union([
    z.enum(["full_time", "part_time", "contract", "freelance", "internship"]),
    z.literal(""),
  ]),

  status: z.enum([
    "saved",
    "applied",
    "screening",
    "interview",
    "technical_interview",
    "offer",
    "rejected",
    "withdrawn",
  ]),

  technologies: z.string().optional(),

  appliedAt: z.string().optional(),

  interviewDate: z.string().optional(),

  notes: z.string().max(5000).optional(),
});

export type ApplicationFormData = z.infer<typeof applicationFormSchema>;
