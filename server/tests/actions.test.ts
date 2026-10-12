import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../src/app.js";
import Application from "../src/models/Application.js";
import Action from "../src/models/Action.js";
import { migrateLegacyActions } from "../src/utils/migrate-actions.js";
import { createAuthenticatedAgent, validApplication } from "./helpers.js";

describe("Follow-up actions", () => {
  it("requires authentication and ownership", async () => {
    expect((await request(app).get("/api/actions")).status).toBe(401);
    const owner = await createAuthenticatedAgent();
    const stranger = await createAuthenticatedAgent();
    const created = await owner.agent.post("/api/applications").send(validApplication);
    const applicationId = created.body.application._id;
    expect((await stranger.agent.post("/api/actions").send({ applicationId, title: "Private", dueDate: "2026-10-22" })).status).toBe(404);
    const action = await owner.agent.post("/api/actions").send({ applicationId, title: "Email recruiter", dueDate: "2026-10-22" });
    expect(action.status).toBe(201);
    expect((await stranger.agent.patch(`/api/actions/${action.body.action._id}`).send({ completed: true })).status).toBe(404);
    expect((await stranger.agent.delete(`/api/actions/${action.body.action._id}`)).status).toBe(404);
    expect((await stranger.agent.get(`/api/actions?applicationId=${applicationId}`)).body.actions).toEqual([]);
  });

  it("tracks multiple open actions, completion, rescheduling and deletion", async () => {
    const { agent } = await createAuthenticatedAgent();
    const applicationId = (await agent.post("/api/applications").send(validApplication)).body.application._id;
    const first = await agent.post("/api/actions").send({ applicationId, title: "Email", dueDate: "2026-10-22" });
    const second = await agent.post("/api/actions").send({ applicationId, title: "Call", dueDate: "2026-10-23" });
    expect(first.status).toBe(201); expect(second.status).toBe(201);
    expect((await agent.get(`/api/actions?applicationId=${applicationId}`)).body.actions).toHaveLength(2);
    const id = first.body.action._id;
    const changed = await agent.patch(`/api/actions/${id}`).send({ title: "Send email", dueDate: "2026-10-24", completed: true });
    expect(changed.body.action).toMatchObject({ title: "Send email", dueDate: "2026-10-24T00:00:00.000Z" });
    expect(changed.body.action.completedAt).toBeTruthy();
    expect((await agent.get(`/api/actions?applicationId=${applicationId}&status=completed`)).body.actions).toHaveLength(1);
    expect((await agent.get("/api/dashboard/stats")).body.nextActions).toHaveLength(1);
    expect((await agent.patch(`/api/actions/${id}`).send({ completed: false })).body.action.completedAt).toBeUndefined();
    expect((await agent.delete(`/api/actions/${id}`)).status).toBe(200);
    expect((await agent.delete(`/api/applications/${applicationId}`)).status).toBe(200);
    expect(await Action.countDocuments()).toBe(0);
  });

  it("migrates an old paired follow-up once and preserves the demo expiry", async () => {
    const { agent, userId } = await createAuthenticatedAgent();
    const expiry = new Date(Date.now() + 86_400_000);
    const application = await Application.create({ userId, company: "Legacy", position: "Engineer", status: "saved", nextAction: "Original", followUpDate: new Date("2026-10-22"), expiresAt: expiry });
    await migrateLegacyActions(userId); await migrateLegacyActions(userId);
    const response = await agent.get(`/api/actions?applicationId=${application._id}`);
    expect(response.body.actions).toHaveLength(1);
    expect(response.body.actions[0]).toMatchObject({ title: "Original", expiresAt: expiry.toISOString() });
    expect((await Application.findById(application._id))?.nextAction).toBeUndefined();
  });
});
