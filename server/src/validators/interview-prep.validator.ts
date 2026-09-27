import { z } from "zod";

export const interviewPrepSchema = z.strictObject({
  completedTasks: z.array(z.enum([
    "company-research", "role-research", "examples", "questions",
  ])).max(4),
  practice: z.array(
    z.strictObject({
      questionId: z.enum(["introduction", "interest", "challenge", "teamwork"]),
      answer: z.string().max(2000),
      practiced: z.boolean(),
    }),
  ).max(4),
  notes: z.string().max(5000),
}).superRefine((data, ctx) => {
  for (const [key, ids] of [
    ["completedTasks", data.completedTasks],
    ["practice", data.practice.map((item) => item.questionId)],
  ] as const) {
    if (new Set(ids).size !== ids.length) {
      ctx.addIssue({ code: "custom", path: [key], message: "Duplicate IDs are not allowed" });
    }
  }
});
