import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";
import vm from "node:vm";
import sharp from "sharp";

const base = "/jadual-ustaz-alif/";
const root = resolve("out");
const manifest = JSON.parse(await readFile(resolve(root, "manifest.webmanifest"), "utf8"));
const manifestUrl = `https://example.test${base}manifest.webmanifest`;
assert.equal(new URL(manifest.start_url, manifestUrl).pathname, base);
assert.equal(new URL(manifest.scope, manifestUrl).pathname, base);
assert.equal(manifest.display, "standalone");
for (const icon of manifest.icons) {
  const metadata = await sharp(resolve(root, icon.src)).metadata();
  assert.equal(`${metadata.width}x${metadata.height}`, icon.sizes);
  assert.equal(metadata.format, "png");
}
const apple = await sharp(resolve(root, "icons/apple-touch-icon.png")).metadata();
assert.equal(apple.width, 180);
const source = await readFile(resolve(root, "sw.js"), "utf8");
let precache, scope;
vm.runInNewContext(`${source}\nreport(PRECACHE, APP_BASE);`, {
  self: { addEventListener() {} }, report: (urls, path) => { precache = urls; scope = path; },
});
assert.equal(scope, base);
assert.ok(precache.includes(base));
assert.ok(precache.includes(`${base}manifest.webmanifest`));
for (const url of precache) {
  assert.ok(url.startsWith(base));
  assert.ok((await stat(resolve(root, url.slice(base.length) || "index.html"))).size > 0);
}
const html = await readFile(resolve(root, "index.html"), "utf8");
for (const match of html.matchAll(/(?:src|href)="(\/jadual-ustaz-alif\/[^"?#]*)"/g)) {
  const path = match[1];
  assert.ok(precache.includes(path), `Essential HTML asset missing from cache: ${path}`);
}
await stat(resolve(root, ".nojekyll"));
console.log(`Static PWA verified: ${precache.length} cache assets, manifest subpath, PNG dimensions, HTML assets and .nojekyll.`);
