import fs from "node:fs";
import path from "node:path";
import { getAllRoutes } from "./lib/routes";
import { SITE_URL } from "../src/utils/siteConfig";

/**
 * Writes public/sitemap.xml and public/robots.txt from the generated article
 * metadata. Runs after generate:meta and before vite build, so Vite copies both
 * into dist/.
 */

const PUBLIC_DIR = path.resolve("public");

// SITE_URL already includes the /ADAM-Wiki base path.
const BASE = SITE_URL.replace(/\/$/, "");

function absoluteUrl(routePath: string): string {
  return routePath === "/" ? `${BASE}/` : `${BASE}${routePath}`;
}

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function generate(): void {
  const routes = getAllRoutes().filter((route) => !route.noIndex);

  const entries = routes
    .map((route) => {
      const lines = [
        "  <url>",
        `    <loc>${xmlEscape(absoluteUrl(route.path))}</loc>`,
      ];
      if (route.lastmod) lines.push(`    <lastmod>${route.lastmod}</lastmod>`);
      lines.push(`    <changefreq>${route.changefreq}</changefreq>`);
      lines.push(`    <priority>${route.priority.toFixed(1)}</priority>`);
      lines.push("  </url>");
      return lines.join("\n");
    })
    .join("\n");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`;

  const robots = `User-agent: *
Allow: /

Sitemap: ${BASE}/sitemap.xml
`;

  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  fs.writeFileSync(path.join(PUBLIC_DIR, "sitemap.xml"), sitemap, "utf8");
  fs.writeFileSync(path.join(PUBLIC_DIR, "robots.txt"), robots, "utf8");

  console.log(`Generated sitemap.xml with ${routes.length} URLs, and robots.txt`);
}

generate();
