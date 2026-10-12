import { readFile } from "node:fs/promises";
import SwaggerParser from "@apidevtools/swagger-parser";

const spec = await SwaggerParser.validate(new URL("../openapi.yaml", import.meta.url).pathname);
const mounts = {
  "auth.routes.ts": "/auth",
  "application.routes.ts": "/applications",
  "action.routes.ts": "/actions",
  "dashboard.routes.ts": "/dashboard",
  "interview-prep.routes.ts": "/prep",
};

for (const [filename, prefix] of Object.entries(mounts)) {
  const source = await readFile(new URL(`../src/routes/${filename}`, import.meta.url), "utf8");
  for (const match of source.matchAll(/router\.(get|post|patch|put|delete)\("([^\"]+)"/g)) {
    const method = match[1];
    const path = `${prefix}${match[2] === "/" ? "" : match[2]}`.replace(/:([A-Za-z]+)/g, "{$1}");
    if (!spec.paths[path]?.[method]) throw new Error(`Undocumented route: ${method.toUpperCase()} ${path}`);
  }
}

for (const [path, methods] of Object.entries(spec.paths)) {
  for (const [method, operation] of Object.entries(methods)) {
    if (["parameters", "summary", "description", "servers"].includes(method)) continue;
    if (!operation.responses || !Object.keys(operation.responses).length) throw new Error(`No response described for ${method.toUpperCase()} ${path}`);
  }
}

console.log("OpenAPI schema, references and Express route inventory are valid.");
