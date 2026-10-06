import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";

import app from "../src/app.js";

afterEach(() => vi.unstubAllEnvs());

describe("Health check", () => {
  it("reports the deployed commit when Render provides one", async () => {
    vi.stubEnv("RENDER_GIT_COMMIT", "test-commit-sha");

    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "ok",
      service: "RoleNaviq API",
      commit: "test-commit-sha",
    });
  });
});
