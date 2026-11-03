import { readdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { join } from "node:path";

const base = "/jadual-ustaz-alif/";
async function list(dir, prefix = "") {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = `${prefix}${entry.name}`;
    if (entry.isDirectory()) found.push(...await list(join(dir, entry.name), `${path}/`));
    else if (path === "index.html" || path === "manifest.webmanifest" || path.startsWith("_next/static/") || path.startsWith("icons/") || path.startsWith("illustrations/")) found.push(path);
  }
  return found.sort();
}
const files = await list("out");
const hash = createHash("sha256");
for (const file of files) { hash.update(file); hash.update(await readFile(join("out", file))); }
const template = await readFile("scripts/sw-template.js", "utf8");
hash.update(template);
const version = hash.digest("hex").slice(0, 16);
const urls = files.map((path) => base + (path === "index.html" ? "" : path));
const prefix = "jadual-ustaz-alif-precache-";
await writeFile("out/sw.js", `const APP_BASE = ${JSON.stringify(base)};\nconst CACHE_PREFIX = ${JSON.stringify(prefix)};\nconst CACHE_NAME = ${JSON.stringify(prefix + version)};\nconst PRECACHE = ${JSON.stringify(urls)};\n${template}`);
console.log(`PWA ${version}: ${urls.length} essential assets precached under ${base}`);
