import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "dist");
const ENTRIES = [
  "index.html",
  "training.html",
  "search.html",
  "contact.html",
  "assets",
  "modules",
  "lessons",
  "public/pdfs"
];

fs.rmSync(OUT, { recursive: true, force: true });
for (const entry of ENTRIES) {
  const src = path.join(ROOT, entry);
  if (!fs.existsSync(src)) throw new Error(`Missing ${entry}`);
  fs.cpSync(src, path.join(OUT, entry), { recursive: true });
}
console.log(`Static site copied to dist/ (${ENTRIES.length} entries).`);
