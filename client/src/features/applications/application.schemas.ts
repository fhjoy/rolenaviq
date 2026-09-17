import { z } from "zod";

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const jobUrlSchema = z.union([
  z.literal(""),
  z
    .string()
    .trim()
    .refine(isHttpUrl, "Please enter a valid HTTP or HTTPS URL"),
]);

export const applicationFormSchema = z
  .object({
    company: z.string().trim().min(1, "Company is required"),

    position: z.string().trim().min(1, "Position is required"),

    jobUrl: jobUrlSchema,

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
  })
  .superRefine((data, ctx) => {
    const requiresInterviewDate =
      data.status === "interview" || data.status === "technical_interview";

    if (requiresInterviewDate && !data.interviewDate) {
      ctx.addIssue({
        code: "custom",
        path: ["interviewDate"],
        message: "Interview date and time is required for interview stages",
      });
    }
  });

export type ApplicationFormData = z.infer<typeof applicationFormSchema>;
