import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";

const google = vi.hoisted(() => ({
  claims: {
    sub: "google-user-123",
    email: "person@example.com",
    email_verified: true,
    given_name: "Test",
    family_name: "Person",
  },
  discovery: vi.fn(async () => ({})),
  authorizationCodeGrant: vi.fn(async () => ({ claims: () => google.claims })),
}));

vi.mock("openid-client", () => ({
  discovery: google.discovery,
  randomState: () => "random-state",
  randomNonce: () => "random-nonce",
  randomPKCECodeVerifier: () => "random-verifier",
  calculatePKCECodeChallenge: async () => "random-challenge",
  buildAuthorizationUrl: () => new URL("https://accounts.google.com/o/oauth2/v2/auth?state=random-state"),
  authorizationCodeGrant: google.authorizationCodeGrant,
}));

import app from "../src/app.js";
import { DEMO_EMAIL, DEMO_PASSWORD } from "../src/config/demo.js";
import User from "../src/models/User.js";
import { createTestUser, registerUser } from "./helpers.js";

const callback = "/api/auth/google/callback?code=authorization-code&state=random-state";

afterEach(() => {
  google.claims.sub = "google-user-123";
  google.claims.email = "person@example.com";
  google.claims.email_verified = true;
  vi.clearAllMocks();
});

describe("Google OpenID Connect sign-in", () => {
  it("starts a browser redirect with a short-lived, signed transaction cookie", async () => {
    const response = await request(app).get("/api/auth/google");

    expect(response.status).toBe(302);
    expect(response.headers.location).toContain("accounts.google.com");
    expect(String(response.headers["set-cookie"])).toContain("google_oidc=s%3A");
    expect(String(response.headers["set-cookie"])).toContain("HttpOnly");
    expect(String(response.headers["set-cookie"])).toContain("SameSite=Lax");
  });

  it("creates a Google-only user and signs in with the existing RoleNaviq session", async () => {
    const agent = request.agent(app);
    await agent.get("/api/auth/google");
    const response = await agent.get(callback);

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe("http://localhost:5173/dashboard");
    expect(String(response.headers["set-cookie"])).toContain("token=");
    expect((await agent.get("/api/auth/me")).body.user).toMatchObject({
      email: "person@example.com", googleLinked: true,
    });
    const stored = await User.findOne({ googleSub: "google-user-123" }).select("+passwordHash");
    expect(stored?.passwordHash).toBeUndefined();
    expect((await agent.post("/api/auth/login").send({ email: google.claims.email, password: "wrong" })).status).toBe(401);
    expect(google.authorizationCodeGrant).toHaveBeenCalledWith(
      expect.anything(), expect.any(URL),
      expect.objectContaining({
        expectedState: "random-state",
        expectedNonce: "random-nonce",
        pkceCodeVerifier: "random-verifier",
        idTokenExpected: true,
      }),
    );

    // Consuming the callback also consumes the transaction cookie.
    expect((await agent.get(callback)).headers.location).toContain("google=invalid");
  });

  it("returns to an Interview Prep page without accepting an external redirect", async () => {
    const agent = request.agent(app);
    await agent.get("/api/auth/google?returnTo=%2Fprep%2Finterviews%2F42%3Ftab%3Dnotes");
    expect((await agent.get(callback)).headers.location).toBe("http://localhost:5173/prep/interviews/42?tab=notes");

    await agent.get("/api/auth/google?returnTo=%2F%2Fevil.example");
    expect((await agent.get(callback)).headers.location).toBe("http://localhost:5173/dashboard");
  });

  it("rejects callbacks without the matching state and verified email", async () => {
    const agent = request.agent(app);
    expect((await agent.get(callback)).headers.location).toContain("google=invalid");
    await agent.get("/api/auth/google");
    expect((await agent.get("/api/auth/google/callback?code=authorization-code&state=wrong")).headers.location)
      .toContain("google=invalid");

    await agent.get("/api/auth/google");
    google.claims.email_verified = false;
    expect((await agent.get(callback)).headers.location).toContain("google=invalid");
    expect(await User.countDocuments()).toBe(0);
  });

  it("requires an existing password account to link Google explicitly", async () => {
    const passwordUser = createTestUser({ email: google.claims.email });
    await registerUser(passwordUser);
    const agent = request.agent(app);
    await agent.get("/api/auth/google");
    expect((await agent.get(callback)).headers.location).toContain("google=existing-account");
    expect((await User.findOne({ email: passwordUser.email }))?.googleSub).toBeUndefined();

    await agent.post("/api/auth/login").send({ email: passwordUser.email, password: passwordUser.password });
    expect((await agent.get("/api/auth/google/link")).status).toBe(302);
    expect((await agent.get(callback)).headers.location).toBe("http://localhost:5173/settings?google=linked");
    expect((await User.findOne({ email: passwordUser.email }))?.googleSub).toBe("google-user-123");

    await agent.post("/api/auth/logout");
    await agent.get("/api/auth/google");
    expect((await agent.get(callback)).headers.location).toBe("http://localhost:5173/dashboard");
    expect(await User.countDocuments()).toBe(1);
  });

  it("rejects linking when the RoleNaviq session changes during the redirect", async () => {
    const passwordUser = createTestUser({ email: google.claims.email });
    await registerUser(passwordUser);
    const agent = request.agent(app);
    await agent.post("/api/auth/login").send({ email: passwordUser.email, password: passwordUser.password });
    await agent.get("/api/auth/google/link");
    await agent.post("/api/auth/logout");

    expect((await agent.get(callback)).headers.location).toContain("google=invalid");
    expect((await User.findOne({ email: passwordUser.email }))?.googleSub).toBeUndefined();
  });

  it("does not link a different Google email or a demo account", async () => {
    const passwordUser = createTestUser({ email: "owner@example.com" });
    await registerUser(passwordUser);
    const agent = request.agent(app);
    await agent.post("/api/auth/login").send({ email: passwordUser.email, password: passwordUser.password });
    await agent.get("/api/auth/google/link");
    expect((await agent.get(callback)).headers.location).toContain("google=conflict");
    expect((await User.findOne({ email: passwordUser.email }))?.googleSub).toBeUndefined();

    const demo = request.agent(app);
    await demo.post("/api/auth/login").send({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    });
    expect((await demo.get("/api/auth/google/link")).status).toBe(403);
  });
});
