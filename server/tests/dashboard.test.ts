import { Types } from "mongoose";
import { describe, expect, it } from "vitest";

import Application from "../src/models/Application.js";
import { createAuthenticatedAgent } from "./helpers.js";

describe("Dashboard API", () => {
  it("calculates statistics from only the authenticated user's applications", async () => {
    const userA = await createAuthenticatedAgent();
    const userB = await createAuthenticatedAgent();

    const userAStatuses = [
      "saved",
      "applied",
      "applied",
      "screening",
      "interview",
      "technical_interview",
      "offer",
      "rejected",
    ] as const;

    await Application.insertMany(
      userAStatuses.map((status, index) => ({
        userId: new Types.ObjectId(userA.userId),
        company: `Company ${index}`,
        position: "Engineer",
        status,
        technologies: [],
        ...(status === "interview" || status === "technical_interview"
          ? { interviewDate: new Date("2026-10-20T10:00:00.000Z") }
          : {}),
      })),
    );

    await Application.insertMany([
      {
        userId: new Types.ObjectId(userB.userId),
        company: "Other User Company",
        position: "Engineer",
        status: "offer",
        technologies: [],
      },
      {
        userId: new Types.ObjectId(userB.userId),
        company: "Another Other User Company",
        position: "Engineer",
        status: "rejected",
        technologies: [],
      },
    ]);

    const response = await userA.agent.get("/api/dashboard/stats");

    expect(response.status).toBe(200);
    expect(response.body.stats).toEqual({
      total: 8,
      applied: 2,
      interviews: 2,
      offers: 1,
      rejected: 1,
      responseRate: 71,
    });

    const distribution = Object.fromEntries(
      response.body.statusDistribution.map(
        (item: { status: string; count: number }) => [
          item.status,
          item.count,
        ],
      ),
    );

    expect(distribution).toMatchObject({
      Saved: 1,
      Applied: 2,
      Screening: 1,
      Interview: 1,
      "Technical Interview": 1,
      Offer: 1,
      Rejected: 1,
      Withdrawn: 0,
    });
  });
});
