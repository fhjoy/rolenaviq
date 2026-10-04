import { z } from "zod";

const questionId = z.enum([
  "introduction", "interest", "challenge", "teamwork", "javascript",
  "react", "angular", "accessibility", "testing", "api-design",
  "architecture", "tradeoffs",
]);

export const interviewPrepSchema = z.strictObject({
  completedTasks: z.array(z.enum([
    "company-research", "role-research", "examples", "questions",
  ])).max(4),
  practice: z.array(
    z.strictObject({
      questionId,
      answer: z.string().max(2000),
      practiced: z.boolean(),
    }),
  ).max(12),
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

export const practiceSessionSchema = z.strictObject({
  results: z.array(z.strictObject({
    questionId,
    confidence: z.number().int().min(1).max(3),
  })).min(1).max(5),
}).superRefine((data, ctx) => {
  if (new Set(data.results.map(result => result.questionId)).size !== data.results.length) {
    ctx.addIssue({ code: "custom", path: ["results"], message: "Duplicate questions are not allowed" });
  }
});
