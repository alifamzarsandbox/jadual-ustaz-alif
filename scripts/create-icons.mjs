import sharp from "sharp";
import { mkdir, readFile } from "node:fs/promises";

await mkdir("public/icons", { recursive: true });
const book = (await readFile("public/illustrations/book-sparkle.svg", "utf8")).replace(/<svg[^>]*>/, '<g transform="translate(116 116) scale(4.375)">').replace("</svg>", "</g>");
// The existing vector logo stays inside the maskable central safe circle.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><rect width="512" height="512" fill="#E9E2FF"/><circle cx="256" cy="256" r="200" fill="#DDF6E8"/>${book}</svg>`;
for (const [name, size] of [["icon-192", 192], ["icon-512", 512], ["maskable-512", 512], ["apple-touch-icon", 180]]) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(`public/icons/${name}.png`);
}
console.log("Generated local PWA icons: 192, 512, maskable 512, Apple 180.");
