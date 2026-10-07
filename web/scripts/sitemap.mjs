// Writes dist/client/sitemap.xml from the prerendered pages (one URL per index.html).
import { readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

const SITE_URL = "https://theunscriptedroom.com";
const OUT = "dist/client";
// Utility pages that are linked from emails/QR codes and shouldn't be indexed.
const EXCLUDE = new Set(["/qr", "/survey", "/portal"]);

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : name === "index.html" ? [full] : [];
  });
}

const today = new Date().toISOString().slice(0, 10);
const paths = walk(OUT)
  .map((file) => "/" + relative(OUT, file).split(sep).slice(0, -1).join("/"))
  .filter((path) => !EXCLUDE.has(path))
  .sort((a, b) => (a === "/" ? -1 : b === "/" ? 1 : a.localeCompare(b, "en", { numeric: true })));

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((path) => `  <url><loc>${SITE_URL}${path}</loc><lastmod>${today}</lastmod></url>`).join("\n")}
</urlset>
`;
writeFileSync(join(OUT, "sitemap.xml"), xml);
console.log(`[sitemap] ${paths.length} URLs written to ${OUT}/sitemap.xml`);
