// Zips the current build (dist/client) into releases/ under a unique, dated name, e.g.
// releases/unscripted-room-2026-10-08-cf32c36.zip. Builds wipe dist/, but releases/ is never
// cleared, so every packaged version is kept. releases/ is git-ignored (each zip is ~40 MB).
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

if (!fs.existsSync("dist/client/index.html")) {
  console.error("No build found. Run `npm run build` first.");
  process.exit(1);
}
const sha = execFileSync("git", ["rev-parse", "--short", "HEAD"]).toString().trim();
const dirty = execFileSync("git", ["status", "--porcelain", "--", "."]).toString().trim()
  ? "-uncommitted"
  : "";
const date = new Date().toISOString().slice(0, 10);
fs.mkdirSync("releases", { recursive: true });
let name = `unscripted-room-${date}-${sha}${dirty}.zip`;
for (let i = 2; fs.existsSync(path.join("releases", name)); i++)
  name = `unscripted-room-${date}-${sha}${dirty}-${i}.zip`;
execFileSync("zip", ["-qr", path.resolve("releases", name), "."], { cwd: "dist/client" });
console.log(`[release] releases/${name}`);
