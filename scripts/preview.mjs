// Local-only server for verifying the exact static export at the Pages subpath.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";

const root = resolve("out");
const prefix = "/jadual-ustaz-alif";
const port = Number(process.env.PORT || 3000);
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".webmanifest": "application/manifest+json", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".png": "image/png", ".jpg": "image/jpeg", ".txt": "text/plain" };

createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    if (pathname === "/" || pathname === prefix) {
      res.writeHead(302, { Location: `${prefix}/` });
      res.end();
      return;
    }
    if (!pathname.startsWith(`${prefix}/`)) throw new Error("Not found");
    let path = resolve(root, `.${pathname.slice(prefix.length)}`);
    if (path !== root && !path.startsWith(`${root}${sep}`)) throw new Error("Not found");
    if ((await stat(path)).isDirectory()) path = resolve(path, "index.html");
    const content = await readFile(path);
    res.writeHead(200, { "Content-Type": types[extname(path)] || "application/octet-stream" });
    res.end(content);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
  }
}).listen(port, "127.0.0.1", () => console.log(`Local: http://127.0.0.1:${port}${prefix}/`));
