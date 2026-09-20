import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../src/app.js";
import User from "../src/models/User.js";
import {
  createAuthenticatedAgent,
  createTestUser,
  registerUser,
} from "./helpers.js";

describe("Authentication API", () => {
  it("registers a valid user and normalizes the email", async () => {
    const user = createTestUser({
      email: "NEW.USER@EXAMPLE.COM",
    });

    const response = await registerUser(user);

    expect(response.status).toBe(201);
    expect(response.body.user).toMatchObject({
      firstName: user.firstName,
      lastName: user.lastName,
      email: "new.user@example.com",
    });
    expect(response.body.user.passwordHash).toBeUndefined();

    const storedUser = await User.findOne({
      email: "new.user@example.com",
    }).select("+passwordHash");

    expect(storedUser).not.toBeNull();
    expect(storedUser?.passwordHash).not.toBe(user.password);
  });

  it("rejects invalid registration data without creating a user", async () => {
    const response = await request(app).post("/api/auth/register").send({
      firstName: "A",
      lastName: "User",
      email: "not-an-email",
      password: "short",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid registration data");
    expect(await User.countDocuments()).toBe(0);
  });

  it("rejects a duplicate email address", async () => {
    const user = createTestUser();

    expect((await registerUser(user)).status).toBe(201);

    const duplicateResponse = await registerUser({
      ...user,
      email: user.email.toUpperCase(),
    });

    expect(duplicateResponse.status).toBe(409);
    expect(duplicateResponse.body.message).toBe(
      "A user with this email already exists",
    );
  });

  it("logs in with an HttpOnly cookie and returns the current user", async () => {
    const user = createTestUser();
    const agent = request.agent(app);

    await agent.post("/api/auth/register").send(user);

    const loginResponse = await agent.post("/api/auth/login").send({
      email: user.email,
      password: user.password,
    });

    expect(loginResponse.status).toBe(200);

    const cookies = loginResponse.headers["set-cookie"];
    expect(cookies).toBeDefined();
    expect(String(cookies)).toContain("HttpOnly");

    const meResponse = await agent.get("/api/auth/me");

    expect(meResponse.status).toBe(200);
    expect(meResponse.body.user.email).toBe(user.email.toLowerCase());
  });

  it("rejects invalid login credentials", async () => {
    const user = createTestUser();

    await registerUser(user);

    const response = await request(app).post("/api/auth/login").send({
      email: user.email,
      password: "WrongPassword123!",
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Invalid email or password");
  });

  it("clears the authenticated session on logout", async () => {
    const { agent } = await createAuthenticatedAgent();

    expect((await agent.get("/api/auth/me")).status).toBe(200);
    expect((await agent.post("/api/auth/logout")).status).toBe(200);

    const meResponse = await agent.get("/api/auth/me");

    expect(meResponse.status).toBe(401);
  });
});
