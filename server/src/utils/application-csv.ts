import { z } from "zod";
import { createApplicationSchema } from "../validators/application.validator.js";

export const csvColumns = [
  "company", "position", "status", "jobUrl", "jobDescription", "location",
  "workplaceType", "employmentType", "technologies", "salaryMin", "salaryMax",
  "currency", "appliedAt", "interviewDate", "notes", "actions",
] as const;

export function csvCell(value: unknown): string {
  let text = value == null ? "" : String(value);
  // Spreadsheet programs may treat imported strings as formulas. The leading
  // apostrophe can be removed by our importer to keep exported data reversible.
  if (/^[\s]*[=+@-]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export function parseCsv(input: string): string[][] {
  const source = input.replace(/^\uFEFF/, "");
  if (source.length > 1_000_000) throw new Error("CSV exceeds 1 MB");
  const rows: string[][] = [];
  let row: string[] = [], cell = "", quoted = false, closed = false;
  for (let i = 0; i < source.length; i++) {
    const character = source[i];
    if (quoted) {
      if (character === '"' && source[i + 1] === '"') { cell += '"'; i++; }
      else if (character === '"') { quoted = false; closed = true; }
      else cell += character;
    } else if (character === '"' && cell === "" && !closed) quoted = true;
    else if (character === "," || character === "\n" || character === "\r") {
      row.push(cell); cell = ""; closed = false;
      if (character !== ",") {
        if (character === "\r" && source[i + 1] === "\n") i++;
        rows.push(row); row = [];
        if (rows.length > 201) throw new Error("CSV is limited to 200 applications");
      }
    } else if (character === '"' || closed) throw new Error("Malformed CSV quoting");
    else cell += character;
  }
  if (quoted) throw new Error("Unclosed CSV quote");
  if (cell !== "" || row.length > 0 || closed) { row.push(cell); rows.push(row); }
  return rows;
}

const actionColumn = z.array(z.object({
  title: z.string().trim().min(1).max(200),
  dueDate: z.iso.date(),
  completedAt: z.iso.datetime().optional(),
})).max(200);

function restore(value: string) { return /^'[\s]*[=+@-]/.test(value) ? value.slice(1) : value; }

export function decodeApplications(csv: string) {
  const [header, ...rows] = parseCsv(csv);
  if (!header || header.join("\u0000") !== csvColumns.join("\u0000")) throw new Error("CSV header does not match the RoleNaviq export format");
  if (rows.length === 0) throw new Error("CSV contains no applications");
  const errors: { row: number; message: string }[] = [];
  const valid: { row: number; application: z.infer<typeof createApplicationSchema>; actions: z.infer<typeof actionColumn> }[] = [];
  rows.forEach((values, index) => {
    if (values.length !== csvColumns.length) { errors.push({ row: index + 2, message: "Wrong number of columns" }); return; }
    const fields = Object.fromEntries(csvColumns.map((key, i) => [key, restore(values[i] ?? "")]));
    try {
      const raw = {
        ...Object.fromEntries(Object.entries(fields).filter(([key, value]) => key !== "actions" && key !== "technologies" && key !== "salaryMin" && key !== "salaryMax" && value !== "")),
        technologies: fields.technologies ? fields.technologies.split(";").map(value => value.trim()).filter(Boolean) : [],
        ...(fields.salaryMin ? { salaryMin: Number(fields.salaryMin) } : {}),
        ...(fields.salaryMax ? { salaryMax: Number(fields.salaryMax) } : {}),
      };
      const parsed = createApplicationSchema.safeParse(raw);
      const actions = actionColumn.safeParse(fields.actions ? JSON.parse(fields.actions) : []);
      if (!parsed.success || !actions.success) throw new Error(parsed.success ? "Invalid actions JSON" : parsed.error.issues[0]?.message ?? "Invalid application");
      valid.push({ row: index + 2, application: parsed.data, actions: actions.data });
    } catch (error) { errors.push({ row: index + 2, message: error instanceof Error ? error.message : "Invalid row" }); }
  });
  return { valid, errors };
}

export function applicationIdentity(application: { company: string; position: string; jobUrl?: string; appliedAt?: Date }) {
  return [application.company, application.position, application.jobUrl ?? "", application.appliedAt?.toISOString().slice(0, 10) ?? ""]
    .map(value => value.trim().toLowerCase()).join("\u0000");
}
