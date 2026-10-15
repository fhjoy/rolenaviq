import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import app from "../src/app.js";
import { env } from "../src/config/env.js";
import User from "../src/models/User.js";
import { createTestUser, registerUser } from "./helpers.js";

const originalKey = env.BREVO_API_KEY;
const originalSender = env.EMAIL_FROM;
const deliveries: string[] = [];

function latestToken() {
  const match = deliveries.at(-1)?.match(/#token=([0-9a-f]{64})/);
  if (!match) throw new Error("No verification link was sent");
  return match[1];
}

beforeEach(() => {
  env.BREVO_API_KEY = "test-brevo-key";
  env.EMAIL_FROM = "sender@example.com";
  deliveries.length = 0;
  vi.stubGlobal("fetch", vi.fn(async (_url: string, options: RequestInit) => {
    const body = JSON.parse(String(options.body)) as { textContent: string };
    deliveries.push(body.textContent);
    return new Response(JSON.stringify({ messageId: "test" }), { status: 201 });
  }));
});

afterEach(() => {
  env.BREVO_API_KEY = originalKey;
  env.EMAIL_FROM = originalSender;
  vi.unstubAllGlobals();
});

describe("Email verification", () => {
  it("stores a hash, blocks login, and accepts a link only once", async () => {
    const user = createTestUser();
    const registered = await registerUser(user);
    expect(registered.status).toBe(201);
    expect(registered.body.verificationRequired).toBe(true);
    expect(registered.body.user.verificationTokenHash).toBeUndefined();

    const token = latestToken();
    const stored = await User.findOne({ email: user.email }).select("+verificationTokenHash");
    expect(stored?.emailVerifiedAt).toBeNull();
    expect(stored?.verificationTokenHash).toMatch(/^[0-9a-f]{64}$/);
    expect(stored?.verificationTokenHash).not.toBe(token);
    expect(stored?.unverifiedExpiresAt).toBeInstanceOf(Date);

    const agent = request.agent(app);
    const login = () => agent.post("/api/auth/login").send({ email: user.email, password: user.password });
    const before = await login();
    expect(before.status).toBe(403);
    expect(before.headers["set-cookie"]).toBeUndefined();
    expect((await agent.get("/api/auth/me")).status).toBe(401);

    const verified = await request(app).post("/api/auth/verify-email").send({ token });
    expect(verified.status).toBe(200);
    expect((await request(app).post("/api/auth/verify-email").send({ token })).status).toBe(400);
    expect((await login()).status).toBe(200);
    expect((await agent.get("/api/auth/me")).status).toBe(200);
    const after = await User.findOne({ email: user.email }).select("+verificationTokenHash");
    expect(after?.verificationTokenHash).toBeUndefined();
    expect(after?.unverifiedExpiresAt).toBeUndefined();
  });

  it("rejects malformed and expired links", async () => {
    expect((await request(app).post("/api/auth/verify-email").send({ token: "bad" })).status).toBe(400);
    const user = createTestUser();
    await registerUser(user);
    const token = latestToken();
    await User.updateOne({ email: user.email }, { verificationExpiresAt: new Date(Date.now() - 1000) });
    expect((await request(app).post("/api/auth/verify-email").send({ token })).status).toBe(400);
  });

  it("resends after a cooldown, invalidates the old link, and does not reveal unknown addresses", async () => {
    const user = createTestUser();
    await registerUser(user);
    const first = latestToken();
    const send = (email: string) => request(app).post("/api/auth/resend-verification").send({ email });

    expect((await send(user.email)).status).toBe(202);
    expect(deliveries).toHaveLength(1);
    await User.updateOne({ email: user.email }, { verificationSentAt: new Date(Date.now() - 61_000) });
    const resend = await send(user.email.toUpperCase());
    expect(resend.status).toBe(202);
    expect(deliveries).toHaveLength(2);
    expect((await send("missing@example.com")).body).toEqual(resend.body);
    expect((await request(app).post("/api/auth/verify-email").send({ token: first })).status).toBe(400);
    expect((await request(app).post("/api/auth/verify-email").send({ token: latestToken() })).status).toBe(200);
    expect((await send(user.email)).body).toEqual(resend.body);
    expect(deliveries).toHaveLength(2);
  });

  it("rolls back registration when the email provider rejects delivery", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("unavailable", { status: 503 })));
    const user = createTestUser();
    const result = await registerUser(user);
    expect(result.status).toBe(503);
    expect(await User.findOne({ email: user.email })).toBeNull();
  });

  it("keeps earlier accounts usable and prevents unverified profile email changes", async () => {
    env.BREVO_API_KEY = undefined;
    env.EMAIL_FROM = undefined;
    const legacy = createTestUser();
    expect((await registerUser(legacy)).body.verificationRequired).toBe(false);
    env.BREVO_API_KEY = "test-brevo-key";
    env.EMAIL_FROM = "sender@example.com";

    const agent = request.agent(app);
    expect((await agent.post("/api/auth/login").send({ email: legacy.email, password: legacy.password })).status).toBe(200);
    const change = await agent.patch("/api/auth/profile").send({
      firstName: legacy.firstName,
      lastName: legacy.lastName,
      email: "other@example.com",
    });
    expect(change.status).toBe(400);
    expect((await User.findOne({ email: legacy.email }))?.email).toBe(legacy.email);
  });
});
