import { Types } from "mongoose";
import { describe, expect, it } from "vitest";

import Application from "../src/models/Application.js";
import Action from "../src/models/Action.js";
import InterviewPrep from "../src/models/InterviewPrep.js";
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
    expect(response.body.nextActions).toEqual([]);
  });

  it("returns the nearest follow-ups only for their owner", async () => {
    const owner = await createAuthenticatedAgent();
    const other = await createAuthenticatedAgent();
    const records = [
      { userId: new Types.ObjectId(owner.userId), company: "Tomorrow", followUpDate: new Date("2026-10-12"), nextAction: "Email recruiter" },
      { userId: new Types.ObjectId(owner.userId), company: "Today", followUpDate: new Date("2026-10-11"), nextAction: "Send portfolio" },
      { userId: new Types.ObjectId(other.userId), company: "Private", followUpDate: new Date("2026-10-10"), nextAction: "Private task" },
    ];
    const applications = await Application.insertMany(records.map((record) => ({ ...record, position: "Engineer", technologies: [] })));
    await Action.insertMany(applications.map((application, index) => ({ userId: application.userId, applicationId: application._id, title: records[index]!.nextAction, dueDate: records[index]!.followUpDate })));
    const response = await owner.agent.get("/api/dashboard/stats");
    expect(response.status).toBe(200);
    expect(response.body.nextActions.map((action: { applicationId: { company: string } }) => action.applicationId.company)).toEqual(["Today", "Tomorrow"]);
  });

  it("summarizes preparation for upcoming interviews only", async () => {
    const owner = await createAuthenticatedAgent();
    const other = await createAuthenticatedAgent();
    const future = new Date(Date.now() + 86_400_000);
    const [mine, theirs] = await Application.insertMany([
      { userId: owner.userId, company: "My Interview", position: "Engineer", status: "interview", interviewDate: future },
      { userId: other.userId, company: "Private Interview", position: "Engineer", status: "interview", interviewDate: future },
    ]);
    await InterviewPrep.create({ userId: owner.userId, applicationId: mine!._id, completedTasks: ["research"], practice: [{ questionId: "q1", answer: "Answer", practiced: true }], sessions: [{ completedAt: new Date(), results: [{ questionId: "q1", confidence: 3 }] }] });
    await InterviewPrep.create({ userId: other.userId, applicationId: theirs!._id, completedTasks: ["private"] });
    const response = await owner.agent.get("/api/dashboard/stats");
    expect(response.body.interviewPrep).toMatchObject([{ company: "My Interview", completedTasks: 1, practicedQuestions: 1, sessions: 1 }]);
  });
});
