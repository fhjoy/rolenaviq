import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../src/app.js";
import InterviewPrep from "../src/models/InterviewPrep.js";
import { createAuthenticatedAgent, validApplication } from "./helpers.js";

const interview = {
  ...validApplication,
  status: "interview",
  interviewDate: "2026-11-02T09:00:00.000Z",
};

const preparation = {
  completedTasks: ["company-research"],
  practice: [
    { questionId: "introduction", answer: "I build accessible web apps.", practiced: true },
  ],
  notes: "Ask about the team's workflow.",
};

describe("Interview preparation API", () => {
  it("requires a session for the list and preparation routes", async () => {
    expect((await request(app).get("/api/prep/interviews")).status).toBe(401);
    expect(
      (await request(app).put("/api/prep/interviews/507f1f77bcf86cd799439011")).status,
    ).toBe(401);
  });

  it("lists only the signed-in user's interview-stage applications", async () => {
    const owner = await createAuthenticatedAgent();
    const other = await createAuthenticatedAgent();

    await owner.agent.post("/api/applications").send(interview);
    await owner.agent.post("/api/applications").send(validApplication);
    await other.agent.post("/api/applications").send(interview);

    const response = await owner.agent.get("/api/prep/interviews");
    expect(response.status).toBe(200);
    expect(response.body.applications).toHaveLength(1);
    expect(response.body.applications[0].company).toBe(interview.company);
  });

  it("saves and reloads notes, checklist and practice answers", async () => {
    const { agent } = await createAuthenticatedAgent();
    const created = await agent.post("/api/applications").send(interview);
    const path = `/api/prep/interviews/${created.body.application._id}`;

    const before = await agent.get(path);
    expect(before.body.prep).toMatchObject({ notes: "", practice: [] });

    expect((await agent.put(path).send(preparation)).status).toBe(200);
    const after = await agent.get(path);
    expect(after.body.prep).toMatchObject(preparation);

    await agent.put(path).send({ ...preparation, notes: "Updated note" });
    expect(await InterviewPrep.countDocuments()).toBe(1);
  });

  it("records a practice session and shows progress only to its owner", async () => {
    const owner = await createAuthenticatedAgent();
    const other = await createAuthenticatedAgent();
    const created = await owner.agent.post("/api/applications").send(interview);
    const id = created.body.application._id;
    const path = `/api/prep/interviews/${id}`;
    await owner.agent.put(path).send(preparation);

    const session = await owner.agent.post(`${path}/sessions`).send({ results: [
      { questionId: "introduction", confidence: 2 },
      { questionId: "accessibility", confidence: 3 },
    ] });
    expect(session.status).toBe(201);
    expect(session.body.session.results).toHaveLength(2);
    expect((await owner.agent.get(path)).body.prep.sessions).toHaveLength(1);
    expect((await owner.agent.get("/api/prep/interviews")).body.applications[0].progress)
      .toEqual({ completedTasks: 1, practicedQuestions: 1, sessions: 1 });
    expect((await other.agent.post(`${path}/sessions`).send({ results: [
      { questionId: "introduction", confidence: 2 },
    ] })).status).toBe(404);
  });

  it("records practice before any plan is saved and keeps the session after saving answers", async () => {
    const { agent } = await createAuthenticatedAgent();
    const created = await agent.post("/api/applications").send(interview);
    const path = `/api/prep/interviews/${created.body.application._id}`;
    const response = await agent.post(`${path}/sessions`).send({ results: [
      { questionId: "testing", confidence: 1 },
    ] });
    expect(response.status).toBe(201);
    await agent.put(path).send(preparation);
    const after = await agent.get(path);
    expect(after.body.prep.sessions).toHaveLength(1);
    expect(after.body.prep.practice).toEqual(preparation.practice);
  });

  it("rejects duplicate questions and out-of-range confidence without saving", async () => {
    const { agent } = await createAuthenticatedAgent();
    const created = await agent.post("/api/applications").send(interview);
    const path = `/api/prep/interviews/${created.body.application._id}/sessions`;
    expect((await agent.post(path).send({ results: [
      { questionId: "react", confidence: 2 }, { questionId: "react", confidence: 3 },
    ] })).status).toBe(400);
    expect((await agent.post(path).send({ results: [
      { questionId: "react", confidence: 9 },
    ] })).status).toBe(400);
    expect(await InterviewPrep.countDocuments()).toBe(0);
  });

  it("does not read or alter another user's preparation", async () => {
    const owner = await createAuthenticatedAgent();
    const other = await createAuthenticatedAgent();
    const created = await owner.agent.post("/api/applications").send(interview);
    const path = `/api/prep/interviews/${created.body.application._id}`;
    await owner.agent.put(path).send(preparation);

    expect((await other.agent.get(path)).status).toBe(404);
    expect((await other.agent.put(path).send(preparation)).status).toBe(404);
    expect((await owner.agent.get(path)).body.prep.notes).toBe(preparation.notes);
  });

  it("rejects invalid IDs and oversized or client-owned data", async () => {
    const { agent } = await createAuthenticatedAgent();
    expect((await agent.get("/api/prep/interviews/not-an-id")).status).toBe(400);

    const created = await agent.post("/api/applications").send(interview);
    const path = `/api/prep/interviews/${created.body.application._id}`;
    expect((await agent.put(path).send({ ...preparation, userId: "someone-else" })).status).toBe(400);
    expect((await agent.put(path).send({ ...preparation, notes: "x".repeat(5001) })).status).toBe(400);
  });

  it("removes preparation when its application is deleted", async () => {
    const { agent } = await createAuthenticatedAgent();
    const created = await agent.post("/api/applications").send(interview);
    const id = created.body.application._id;
    await agent.put(`/api/prep/interviews/${id}`).send(preparation);

    expect((await agent.delete(`/api/applications/${id}`)).status).toBe(200);
    expect(await InterviewPrep.countDocuments()).toBe(0);
  });
});
