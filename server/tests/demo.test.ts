import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../src/app.js";
import {
  DEMO_EMAIL,
  DEMO_PASSWORD,
} from "../src/config/demo.js";
import Application from "../src/models/Application.js";

describe("Demo account", () => {
  it("restores the demo application dataset on every valid demo login", async () => {
    const agent = request.agent(app);

    const firstLogin = await agent.post("/api/auth/login").send({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    });

    expect(firstLogin.status).toBe(200);

    const demoUserId = String(firstLogin.body.user.id);
    const initialCount = await Application.countDocuments({
      userId: demoUserId,
    });

    expect(initialCount).toBeGreaterThan(0);

    const oneApplication = await Application.findOne({
      userId: demoUserId,
    });

    expect(oneApplication).not.toBeNull();

    await Application.findByIdAndDelete(oneApplication?._id);

    expect(
      await Application.countDocuments({
        userId: demoUserId,
      }),
    ).toBe(initialCount - 1);

    const secondLogin = await agent.post("/api/auth/login").send({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    });

    expect(secondLogin.status).toBe(200);
    expect(
      await Application.countDocuments({
        userId: demoUserId,
      }),
    ).toBe(initialCount);
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
