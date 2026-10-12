import SwaggerParser from "@apidevtools/swagger-parser";
import AjvModule from "ajv";
import formatsModule from "ajv-formats";
import { describe, expect, it } from "vitest";
import { createAuthenticatedAgent, validApplication } from "./helpers.js";

const spec = await SwaggerParser.dereference(new URL("../openapi.yaml", import.meta.url).pathname);
const validator = new (AjvModule as unknown as typeof import("ajv").Ajv)({ strict: false, allErrors: true });
(formatsModule as unknown as (instance: typeof validator) => void)(validator);

function matches(path: string, method: string, status: number, body: unknown) {
  const operation = (spec.paths as Record<string, Record<string, { responses: Record<string, { content: Record<string, { schema: object }> }> }>>)[path]?.[method];
  const schema = operation?.responses[String(status)]?.content?.["application/json"]?.schema;
  if (!schema) throw new Error(`No JSON response schema for ${method} ${path} ${status}`);
  const validate = validator.compile(schema);
  if (!validate(body)) throw new Error(JSON.stringify(validate.errors));
  return true;
}

describe("OpenAPI response contract", () => {
  it("validates responses consumed by React and Angular", async () => {
    const { agent } = await createAuthenticatedAgent();
    const currentUser = await agent.get("/api/auth/me");
    expect(matches("/auth/me", "get", 200, currentUser.body)).toBe(true);

    const application = await agent.post("/api/applications").send(validApplication);
    expect(matches("/applications", "post", 201, application.body)).toBe(true);
    const id = application.body.application._id;
    expect(matches("/applications", "get", 200, (await agent.get("/api/applications")).body)).toBe(true);
    expect(matches("/applications/{id}", "get", 200, (await agent.get(`/api/applications/${id}`)).body)).toBe(true);

    const createdAction = await agent.post("/api/actions").send({ applicationId: id, title: "Follow up", dueDate: "2026-10-22" });
    expect(matches("/actions", "post", 201, createdAction.body)).toBe(true);
    expect(matches("/actions", "get", 200, (await agent.get("/api/actions")).body)).toBe(true);
    expect(matches("/dashboard/stats", "get", 200, (await agent.get("/api/dashboard/stats")).body)).toBe(true);

    const scheduled = await agent.post("/api/applications").send({ ...validApplication, company: "Interview", status: "interview", interviewDate: new Date(Date.now() + 86_400_000).toISOString() });
    expect(matches("/prep/interviews", "get", 200, (await agent.get("/api/prep/interviews")).body)).toBe(true);
    expect(matches("/prep/interviews/{applicationId}", "get", 200, (await agent.get(`/api/prep/interviews/${scheduled.body.application._id}`)).body)).toBe(true);

    const csv = (await agent.get("/api/applications/export")).text;
    const preview = await agent.post("/api/applications/import/preview").set("Content-Type", "text/csv").send(csv);
    expect(matches("/applications/import/preview", "post", 200, preview.body)).toBe(true);
  });

  it("fails if a required dashboard field disappears", () => {
    expect(() => matches("/dashboard/stats", "get", 200, { stats: {}, statusDistribution: [], monthlyActivity: [], nextActions: [] })).toThrow();
  });
});
