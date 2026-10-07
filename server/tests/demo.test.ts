import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../src/app.js";
import {
  DEMO_EMAIL,
  DEMO_PASSWORD,
} from "../src/config/demo.js";
import Application from "../src/models/Application.js";
import InterviewPrep from "../src/models/InterviewPrep.js";
import User from "../src/models/User.js";

describe("Demo account", () => {
  it("gives each visitor an independent, temporary workspace", async () => {
    const firstVisitor = request.agent(app);
    const secondVisitor = request.agent(app);

    const firstLogin = await firstVisitor.post("/api/auth/login").send({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    });
    const secondLogin = await secondVisitor.post("/api/auth/login").send({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    });
    expect(firstLogin.status).toBe(200);
    expect(secondLogin.status).toBe(200);
    expect(firstLogin.body.user).toMatchObject({ email: DEMO_EMAIL, isDemo: true });
    expect(secondLogin.body.user).toMatchObject({ email: DEMO_EMAIL, isDemo: true });

    const demoUserId = String(firstLogin.body.user.id);
    const otherUserId = String(secondLogin.body.user.id);
    expect(demoUserId).not.toBe(otherUserId);
    const owner = await User.findById(demoUserId);
    expect(owner?.email).not.toBe(DEMO_EMAIL);
    expect(owner?.expiresAt?.getTime()).toBeGreaterThan(Date.now());
    const initialCount = await Application.countDocuments({
      userId: demoUserId,
    });
    expect(initialCount).toBe(30);
    expect(await Application.countDocuments({ userId: otherUserId })).toBe(30);

    const pages = await Promise.all(
      [1, 2, 3].map((page) =>
        firstVisitor.get("/api/applications").query({ page, limit: 10 }),
      ),
    );

    expect(pages.map((page) => page.body.applications.length)).toEqual([10, 10, 10]);
    expect(pages.map((page) => page.body.pagination.hasNextPage)).toEqual([
      true,
      true,
      false,
    ]);
    expect(
      new Set(pages.flatMap((page) =>
        page.body.applications.map((application: { _id: string }) => application._id),
      )).size,
    ).toBe(30);

    const oneApplication = await Application.findOne({
      userId: demoUserId,
    });

    expect(oneApplication).not.toBeNull();

    const deletion = await firstVisitor.delete(`/api/applications/${oneApplication?._id}`);
    expect(deletion.status).toBe(200);

    expect(
      await Application.countDocuments({
        userId: demoUserId,
      }),
    ).toBe(initialCount - 1);

    expect(await Application.countDocuments({ userId: otherUserId })).toBe(30);

    const freshLogin = await firstVisitor.post("/api/auth/login").send({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    });

    expect(freshLogin.status).toBe(200);
    expect(String(freshLogin.body.user.id)).not.toBe(demoUserId);
    expect(
      await Application.countDocuments({
        userId: freshLogin.body.user.id,
      }),
    ).toBe(initialCount);
    expect(await Application.countDocuments({ userId: demoUserId })).toBe(29);

    const created = await secondVisitor.post("/api/applications").send({
      company: "Visitor's company", position: "Engineer", status: "saved", technologies: [],
    });
    expect(created.status).toBe(201);
    expect((await Application.findById(created.body.application._id))?.expiresAt).toEqual(
      (await User.findById(otherUserId))?.expiresAt,
    );

    const interview = await Application.findOne({ userId: otherUserId, company: "Northstar Labs" });
    const saved = await secondVisitor.put(`/api/prep/interviews/${interview?._id}`).send({
      completedTasks: ["company-research"], practice: [], notes: "Visitor's notes",
    });
    expect(saved.status).toBe(200);
    expect((await InterviewPrep.findOne({ applicationId: interview?._id }))?.expiresAt).toEqual(
      (await User.findById(otherUserId))?.expiresAt,
    );

    const me = await secondVisitor.get("/api/auth/me");
    expect(me.body.user).toMatchObject({ id: otherUserId, email: DEMO_EMAIL, isDemo: true });
  });

  it("keeps the demo profile read-only", async () => {
    const agent = request.agent(app);

    await agent.post("/api/auth/login").send({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    });

    const response = await agent.patch("/api/auth/profile").send({
      firstName: "Changed",
      lastName: "Demo",
      email: "changed@example.com",
    });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe(
      "The demo account profile is read-only",
    );
  });
});
