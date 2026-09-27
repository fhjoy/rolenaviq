import { cpSync, mkdirSync } from "node:fs";

mkdirSync("dist/prep", { recursive: true });
cpSync("prep/dist/prep/browser", "dist/prep", { recursive: true });
