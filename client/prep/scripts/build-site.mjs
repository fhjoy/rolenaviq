import { cpSync, mkdirSync, rmSync } from "node:fs";

// Keep Angular's /prep/ base path when this app deploys on its own.
rmSync("dist/site", { recursive: true, force: true });
mkdirSync("dist/site/prep", { recursive: true });
cpSync("dist/prep/browser", "dist/site/prep", { recursive: true });
