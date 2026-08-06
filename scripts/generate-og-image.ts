import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import puppeteer, { type Page } from "puppeteer";
import { CATEGORIES } from "./lib/categories";

/**
 * Renders Open Graph cards to public/images/og/.
 *
 * One default card plus one per article, so a shared article link previews with
 * that article's own title rather than a generic site image. 1200x630 is the
 * size Facebook, LinkedIn, X, Discord and WhatsApp all expect.
 *
 * Filenames are content hashes of (category, slug, title): a changed title
 * produces a new file, and orphaned cards are pruned on each run.
 */

const OG_DIR = path.resolve("public/images/og");
const DEFAULT_OUTPUT = path.resolve("public/images/og-default.png");
const MAP_OUTPUT = path.resolve("src/lib/generated/ogImages.ts");

const BRAND = {
  bg: "#0a0a0a",
  accent: "#3b82f6",
  text: "#e5e5e5",
  dim: "#737373",
};

const CATEGORY_LABELS: Record<string, string> = {
  hadis: "Hadis",
  ateizam: "Ateizam",
  hriscanstvo: "Hrišćanstvo",
  hinduizam: "Hinduizam",
  islam: "Islam",
  istorija: "Istorija",
  ahmedije: "Ahmedije",
  odgovori: "Odgovori na sumnje",
  opovrgavanje: "Opovrgavanje šija",
  nauka: "Nauka i islam",
  muhammed: "Muhammed",
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Longer titles step down in size so they keep fitting the card. */
function titleFontSize(title: string): number {
  const n = title.length;
  if (n <= 40) return 78;
  if (n <= 70) return 64;
  if (n <= 110) return 52;
  if (n <= 150) return 44;
  return 38;
}

function card(options: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  isDefault?: boolean;
}): string {
  const { title, subtitle, eyebrow, isDefault = false } = options;

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        width: 1200px;
        height: 630px;
        background: ${BRAND.bg};
        color: ${BRAND.text};
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 88px 90px 96px;
        position: relative;
        overflow: hidden;
        font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
      }
      .glow {
        position: absolute;
        top: -280px;
        right: -220px;
        width: 760px;
        height: 760px;
        border-radius: 50%;
        background: radial-gradient(circle, ${BRAND.accent}30 0%, transparent 70%);
      }
      .brand {
        font-size: 30px;
        font-weight: 700;
        letter-spacing: 7px;
        text-transform: uppercase;
        color: ${BRAND.text};
      }
      .brand .sep { color: ${BRAND.accent}; }
      .rule {
        width: 104px;
        height: 4px;
        background: ${BRAND.accent};
        margin: 26px 0 34px;
      }
      h1 {
        font-family: Georgia, "Times New Roman", serif;
        font-weight: 500;
        font-size: ${titleFontSize(title)}px;
        line-height: 1.16;
        letter-spacing: -1px;
        max-height: 340px;
        overflow: hidden;
      }
      .subtitle {
        margin-top: 26px;
        font-size: 29px;
        line-height: 1.45;
        color: ${BRAND.dim};
        max-width: 940px;
      }
      .footer {
        position: absolute;
        left: 90px;
        right: 90px;
        bottom: 66px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-family: ui-monospace, "SF Mono", Menlo, monospace;
        font-size: 22px;
        letter-spacing: 3px;
        text-transform: uppercase;
        color: ${BRAND.dim};
      }
      .eyebrow { color: ${BRAND.accent}; }
    </style>
  </head>
  <body>
    <div class="glow"></div>
    <div class="brand">Adam<span class="sep">-</span>Wiki</div>
    <div class="rule"></div>
    <h1>${escapeHtml(title)}</h1>
    ${subtitle ? `<div class="subtitle">${escapeHtml(subtitle)}</div>` : ""}
    <div class="footer">
      <span class="eyebrow">${escapeHtml(eyebrow ?? "")}</span>
      <span>${isDefault ? "adam-wiki.github.io" : "adam-wiki.github.io"}</span>
    </div>
  </body>
</html>`;
}

async function shoot(page: Page, html: string, output: string): Promise<void> {
  await page.setContent(html, { waitUntil: "load" });
  await page.screenshot({ path: output as `${string}.png`, type: "png" });
}

type ArticleEntry = {
  category: string;
  slug: string;
  title: string;
  hash: string;
  file: string;
};

async function loadArticles(): Promise<ArticleEntry[]> {
  const entries: ArticleEntry[] = [];

  for (const { key } of CATEGORIES) {
    const module = await import(`../src/lib/generated/${key}Meta.ts`);
    const articles = module[`${key}Meta`] as Array<{
      slug: string;
      title: string;
    }>;

    for (const article of articles) {
      const hash = crypto
        .createHash("sha1")
        .update(`${key}|${article.slug}|${article.title}`)
        .digest("hex")
        .slice(0, 12);

      entries.push({
        category: key,
        slug: article.slug,
        title: article.title,
        hash,
        // Hashed filename keeps paths short: article slugs run to 90+ chars and
        // some contain spaces and diacritics.
        file: `${hash}.png`,
      });
    }
  }

  return entries;
}

async function run(): Promise<void> {
  const force = process.argv.includes("--force");
  const articles = await loadArticles();

  fs.mkdirSync(OG_DIR, { recursive: true });

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });

  // Default card, used for the home page and anything without its own.
  await shoot(
    page,
    card({
      title: "Uspostavljanje istine kroz dokaze",
      subtitle:
        "Članci i odgovori o islamu, hadisu, hrišćanstvu, ateizmu i istoriji.",
      isDefault: true,
    }),
    DEFAULT_OUTPUT,
  );

  let rendered = 0;
  let skipped = 0;

  for (const article of articles) {
    const output = path.join(OG_DIR, article.file);

    if (!force && fs.existsSync(output)) {
      skipped++;
      continue;
    }

    await shoot(
      page,
      card({
        title: article.title,
        eyebrow: CATEGORY_LABELS[article.category] ?? article.category,
      }),
      output,
    );
    rendered++;
  }

  await browser.close();

  // Drop cards whose title or slug changed, so the folder cannot grow forever.
  const referenced = new Set(articles.map((a) => a.file));
  let pruned = 0;
  for (const file of fs.readdirSync(OG_DIR)) {
    if (!referenced.has(file)) {
      fs.unlinkSync(path.join(OG_DIR, file));
      pruned++;
    }
  }

  const map = articles
    .map(
      (a) =>
        `  ${JSON.stringify(`${a.category}/${a.slug}`)}: ${JSON.stringify(`/images/og/${a.file}`)},`,
    )
    .join("\n");

  const source = `// AUTO-GENERATED by scripts/generate-og-image.ts. Do not edit by hand.
// Maps "<category>/<slug>" to that article's Open Graph card.
export const OG_IMAGES: Record<string, string> = {
${map}
};
`;

  fs.mkdirSync(path.dirname(MAP_OUTPUT), { recursive: true });
  fs.writeFileSync(MAP_OUTPUT, source, "utf8");

  console.log(
    `OG cards: ${rendered} rendered, ${skipped} unchanged, ${pruned} pruned (${articles.length} articles).`,
  );
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
