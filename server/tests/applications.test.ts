import request from "supertest";
import { Types } from "mongoose";
import { describe, expect, it } from "vitest";

import app from "../src/app.js";
import Application from "../src/models/Application.js";
import {
  createAuthenticatedAgent,
  validApplication,
} from "./helpers.js";

describe("Applications API", () => {
  it("protects application routes from unauthenticated requests", async () => {
    const response = await request(app).get("/api/applications");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Authentication required");
  });

  it("creates an application for the authenticated user", async () => {
    const { agent, userId } = await createAuthenticatedAgent();

    const response = await agent
      .post("/api/applications")
      .send(validApplication);

    expect(response.status).toBe(201);
    expect(response.body.application).toMatchObject({
      company: validApplication.company,
      position: validApplication.position,
      status: "saved",
    });

    const storedApplication = await Application.findById(
      response.body.application._id,
    );

    expect(storedApplication?.userId.toString()).toBe(userId);
  });

  it("ignores a client supplied userId and keeps ownership with the authenticated user", async () => {
    const { agent, userId } = await createAuthenticatedAgent();
    const maliciousUserId = new Types.ObjectId().toString();

    const response = await agent.post("/api/applications").send({
      ...validApplication,
      userId: maliciousUserId,
    });

    expect(response.status).toBe(201);

    const storedApplication = await Application.findById(
      response.body.application._id,
    );

    expect(storedApplication?.userId.toString()).toBe(userId);
    expect(storedApplication?.userId.toString()).not.toBe(maliciousUserId);
  });

  it("returns only applications owned by the authenticated user", async () => {
    const userA = await createAuthenticatedAgent();
    const userB = await createAuthenticatedAgent();

    await userA.agent.post("/api/applications").send({
      ...validApplication,
      company: "User A Company",
    });

    await userB.agent.post("/api/applications").send({
      ...validApplication,
      company: "User B Company",
    });

    const response = await userA.agent.get("/api/applications");

    expect(response.status).toBe(200);
    expect(response.body.applications).toHaveLength(1);
    expect(response.body.applications[0].company).toBe("User A Company");
  });

  it("does not expose another user's application by id", async () => {
    const userA = await createAuthenticatedAgent();
    const userB = await createAuthenticatedAgent();

    const createResponse = await userA.agent
      .post("/api/applications")
      .send(validApplication);

    const response = await userB.agent.get(
      `/api/applications/${createResponse.body.application._id}`,
    );

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Application not found");
  });

  it("requires an interview date for interview stages", async () => {
    const { agent } = await createAuthenticatedAgent();

    const response = await agent.post("/api/applications").send({
      ...validApplication,
      status: "interview",
    });

    expect(response.status).toBe(400);
    expect(response.body.errors.interviewDate).toContain(
      "Interview date and time is required for interview stages",
    );
  });

  it("allows forward workflow progress and rejects transitions out of Offer", async () => {
    const { agent } = await createAuthenticatedAgent();

    const createResponse = await agent
      .post("/api/applications")
      .send(validApplication);

    const applicationId = createResponse.body.application._id;

    const appliedResponse = await agent
      .patch(`/api/applications/${applicationId}`)
      .send({
        status: "applied",
      });

    expect(appliedResponse.status).toBe(200);
    expect(appliedResponse.body.application.status).toBe("applied");

    const offerResponse = await agent
      .patch(`/api/applications/${applicationId}`)
      .send({
        status: "offer",
      });

    expect(offerResponse.status).toBe(200);

    const invalidResponse = await agent
      .patch(`/api/applications/${applicationId}`)
      .send({
        status: "screening",
      });

    expect(invalidResponse.status).toBe(409);
    expect(invalidResponse.body.message).toBe(
      "This status transition is not allowed",
    );
  });

  it("requires the explicit reopen flag to move rejected applications back to Applied", async () => {
    const { agent } = await createAuthenticatedAgent();

    const createResponse = await agent
      .post("/api/applications")
      .send(validApplication);

    const applicationId = createResponse.body.application._id;

    expect(
      (
        await agent
          .patch(`/api/applications/${applicationId}`)
          .send({ status: "rejected" })
      ).status,
    ).toBe(200);

    const withoutReopen = await agent
      .patch(`/api/applications/${applicationId}`)
      .send({
        status: "applied",
      });

    expect(withoutReopen.status).toBe(409);

    const withReopen = await agent
      .patch(`/api/applications/${applicationId}`)
      .send({
        status: "applied",
        reopen: true,
      });

    expect(withReopen.status).toBe(200);
    expect(withReopen.body.application.status).toBe("applied");
  });

  it("prevents another user from updating or deleting an application", async () => {
    const owner = await createAuthenticatedAgent();
    const otherUser = await createAuthenticatedAgent();

    const createResponse = await owner.agent
      .post("/api/applications")
      .send(validApplication);

    const applicationId = createResponse.body.application._id;

    const updateResponse = await otherUser.agent
      .patch(`/api/applications/${applicationId}`)
      .send({
        notes: "Should not be allowed",
      });

    const deleteResponse = await otherUser.agent.delete(
      `/api/applications/${applicationId}`,
    );

    expect(updateResponse.status).toBe(404);
    expect(deleteResponse.status).toBe(404);
    expect(await Application.findById(applicationId)).not.toBeNull();
  });

  it("treats regex characters in search input as literal text", async () => {
    const { agent } = await createAuthenticatedAgent();

    await agent.post("/api/applications").send({
      ...validApplication,
      company: "C++ Labs",
    });

    await agent.post("/api/applications").send({
      ...validApplication,
      company: "Cxx Labs",
    });

    const response = await agent
      .get("/api/applications")
      .query({ search: "C++" });

    expect(response.status).toBe(200);
    expect(response.body.applications).toHaveLength(1);
    expect(response.body.applications[0].company).toBe("C++ Labs");
  });

  it("returns stable pagination metadata and requested sorting", async () => {
    const { agent } = await createAuthenticatedAgent();

    for (const company of ["Gamma", "Alpha", "Delta", "Beta", "Epsilon"]) {
      await agent.post("/api/applications").send({
        ...validApplication,
        company,
      });
    }

    const response = await agent.get("/api/applications").query({
      page: 2,
      limit: 2,
      sort: "company",
    });

    expect(response.status).toBe(200);
    expect(response.body.pagination).toEqual({
      page: 2,
      limit: 2,
      total: 5,
      totalPages: 3,
      hasNextPage: true,
      hasPreviousPage: true,
    });
    expect(
      response.body.applications.map(
        (application: { company: string }) => application.company,
      ),
    ).toEqual(["Delta", "Epsilon"]);
  });
});
