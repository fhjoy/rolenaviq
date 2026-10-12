import { describe, expect, it } from "vitest";
import Application from "../src/models/Application.js";
import Action from "../src/models/Action.js";
import { csvColumns, csvCell } from "../src/utils/application-csv.js";
import { createAuthenticatedAgent, validApplication } from "./helpers.js";

const header = csvColumns.join(",");
function row(values: Partial<Record<(typeof csvColumns)[number], string>>) {
  return csvColumns.map(column => csvCell(values[column] ?? "")).join(",");
}

describe("Application CSV transfer", () => {
  it("exports owned data and round-trips quoted text, follow-ups and safe spreadsheet cells", async () => {
    const owner = await createAuthenticatedAgent();
    const other = await createAuthenticatedAgent();
    const first = await owner.agent.post("/api/applications").send({ ...validApplication, company: '=Company, "North"', notes: "line 1\nline 2" });
    const id = first.body.application._id;
    await owner.agent.post("/api/actions").send({ applicationId: id, title: "Follow up", dueDate: "2026-10-22" });
    await other.agent.post("/api/applications").send({ ...validApplication, company: "Private" });

    const exportResult = await owner.agent.get("/api/applications/export");
    expect(exportResult.status).toBe(200);
    expect(exportResult.headers["content-disposition"]).toContain("attachment");
    expect(exportResult.text).toContain("'=Company, " );
    expect(exportResult.text).not.toContain("Private");
    await Application.deleteMany({ userId: owner.userId });
    await Action.deleteMany({ userId: owner.userId });
    const preview = await owner.agent.post("/api/applications/import/preview").set("Content-Type", "text/csv").send(exportResult.text);
    expect(preview.body).toMatchObject({ total: 1, importable: 1, duplicates: [], errors: [] });
    const imported = await owner.agent.post("/api/applications/import").set("Content-Type", "text/csv").send(exportResult.text);
    expect(imported.body.imported).toBe(1);
    const application = await Application.findOne({ userId: owner.userId });
    expect(application?.company).toBe('=Company, "North"');
    expect(application?.notes).toBe("line 1\nline 2");
    expect((await Action.find({ applicationId: application?._id })).map(action => action.title)).toEqual(["Follow up"]);
    expect((await owner.agent.post("/api/applications/import/preview").set("Content-Type", "text/csv").send(exportResult.text)).body.duplicates).toEqual([2]);
    expect((await owner.agent.post("/api/applications/import").set("Content-Type", "text/csv").send(exportResult.text)).body.imported).toBe(0);
  });

  it("previews errors and refuses to import a file with invalid rows", async () => {
    const { agent } = await createAuthenticatedAgent();
    const csv = `${header}\r\n${row({ company: "Okay", position: "Engineer", status: "saved" })}\r\n${row({ company: "Bad", position: "Engineer", status: "interview" })}\r\n`;
    const preview = await agent.post("/api/applications/import/preview").set("Content-Type", "text/csv").send(csv);
    expect(preview.body).toMatchObject({ total: 2, importable: 1, errors: [{ row: 3 }] });
    expect((await agent.post("/api/applications/import").set("Content-Type", "text/csv").send(csv)).status).toBe(400);
    expect(await Application.countDocuments()).toBe(0);
    expect((await agent.post("/api/applications/import/preview").set("Content-Type", "text/csv").send(`${header}\n"unclosed`)).status).toBe(400);
  });
});
