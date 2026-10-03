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
const DEFAULT_OUTPUT = path.resolve("public/images/og-default.jpg");
const MAP_OUTPUT = path.resolve("src/lib/generated/ogImages.ts");
const FONT_DIR = path.resolve("public/fonts");

/**
 * Bumped whenever the card design changes.
 *
 * Filenames are content hashes and a card is skipped when its file already
 * exists, so without this a redesign would regenerate nothing at all - every
 * hash would be unchanged and every card left on the old design. Folding the
 * version into the hash renames all of them, which re-renders the set and lets
 * the existing prune step clear out the previous generation.
 */
const DESIGN_VERSION = "2";

/**
 * The site's own dark-theme tokens, copied from :root in src/index.css.
 *
 * These used to be a generic near-black with a Tailwind blue accent, which is
 * the one thing a share card must not be: the site is warm black with a gold
 * accent, so a shared link previewed as though it belonged to a different
 * project.
 */
const BRAND = {
  bg: "#11100d",
  accent: "#c7a16a",
  heading: "#f4efe6",
  text: "#e7dfd4",
  dim: "#b7ac98",
};

const CATEGORY_LABELS: Record<string, string> = {
  hadis: "Hadiske nauke",
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
  // Both were missing, so their cards printed the raw slug - "spisi", "kuran" -
  // where every other category printed a label.
  spisi: "Muhammed ﷺ u ranijim spisima",
  kuran: "Očuvanje Kur'ana",
};

/**
 * The site's real typefaces, inlined as base64.
 *
 * The cards used to be set in Georgia and system-ui, which is nobody's brand.
 * These are the same files the site serves; inlining them means the renderer
 * needs no server and cannot race a network fetch, and latin-ext is included
 * because that is where the Serbian diacritics live.
 */
function fontFace(family: string, file: string): string {
  const data = fs.readFileSync(path.join(FONT_DIR, file)).toString("base64");
  return `@font-face{font-family:"${family}";font-style:normal;font-weight:400 700;src:url(data:font/woff2;base64,${data}) format("woff2");}`;
}

const FONTS = [
  fontFace("Cormorant Garamond", "cormorant-latin.woff2"),
  fontFace("Cormorant Garamond", "cormorant-latin-ext.woff2"),
  fontFace("Inter", "inter-latin.woff2"),
  fontFace("Inter", "inter-latin-ext.woff2"),
].join("");

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
  if (n <= 40) return 86;
  if (n <= 70) return 72;
  if (n <= 110) return 58;
  if (n <= 150) return 48;
  return 42;
}

/**
 * The share card.
 *
 * Carries the home page's oversized Å monogram, so the card someone sees in a
 * message and the page they land on open with the same mark. The title is set
 * in the site's display serif and left-aligned - a share card is usually seen
 * small in a feed, where a left edge is far quicker to scan than a centred
 * block.
 */
function card(options: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
}): string {
  const { title, subtitle, eyebrow } = options;

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      ${FONTS}
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        width: 1200px;
        height: 630px;
        background: ${BRAND.bg};
        color: ${BRAND.text};
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 80px 90px;
        position: relative;
        overflow: hidden;
        font-family: Inter, sans-serif;
        -webkit-font-smoothing: antialiased;
      }
      .glow {
        position: absolute;
        inset: 0;
        background: radial-gradient(
          circle at 72% 40%,
          rgba(199, 161, 106, 0.13) 0%,
          transparent 58%
        );
      }
      /* Cropped by the card edges on purpose, the way it is on the hero. */
      .monogram {
        position: absolute;
        right: -40px;
        top: 50%;
        transform: translateY(-50%);
        font-family: "Cormorant Garamond", serif;
        font-size: 620px;
        line-height: 0.8;
        color: ${BRAND.accent};
        opacity: 0.09;
      }
      .content { position: relative; z-index: 1; max-width: 840px; }
      .brand {
        font-size: 24px;
        font-weight: 700;
        letter-spacing: 8px;
        text-transform: uppercase;
        color: ${BRAND.heading};
      }
      .brand .sep { color: ${BRAND.accent}; }
      .rule {
        width: 96px;
        height: 3px;
        background: ${BRAND.accent};
        margin: 24px 0 30px;
      }
      h1 {
        font-family: "Cormorant Garamond", serif;
        font-weight: 600;
        font-size: ${titleFontSize(title)}px;
        line-height: 1.08;
        letter-spacing: -0.02em;
        color: ${BRAND.heading};
        text-wrap: balance;
        max-height: 360px;
        overflow: hidden;
      }
      .subtitle {
        margin-top: 24px;
        font-size: 26px;
        line-height: 1.5;
        color: ${BRAND.dim};
        max-width: 760px;
      }
      .footer {
        position: absolute;
        left: 90px;
        right: 90px;
        bottom: 64px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        z-index: 1;
        font-size: 19px;
        letter-spacing: 3px;
        text-transform: uppercase;
        color: ${BRAND.dim};
      }
      .eyebrow { color: ${BRAND.accent}; font-weight: 500; letter-spacing: 4px; }
    </style>
  </head>
  <body>
    <div class="glow"></div>
    <div class="monogram">Å</div>
    <div class="content">
      <div class="brand">Adam<span class="sep">-</span>Wiki</div>
      <div class="rule"></div>
      <h1>${escapeHtml(title)}</h1>
      ${subtitle ? `<div class="subtitle">${escapeHtml(subtitle)}</div>` : ""}
    </div>
    <div class="footer">
      <span class="eyebrow">${escapeHtml(eyebrow ?? "")}</span>
      <span>adam-wiki.github.io</span>
    </div>
  </body>
</html>`;
}

/**
 * JPEG at 92, not PNG.
 *
 * The monogram and the corner glow are large smooth gradients, which lossless
 * PNG stores terribly - the cards came out at ~190kB each, or 37MB across the
 * set, all of it committed and deployed. The same pixels are 60kB as JPEG, and
 * at quality 92 there is no visible artefacting on the type. Every platform
 * that reads og:image accepts JPEG.
 */
async function shoot(page: Page, html: string, output: string): Promise<void> {
  await page.setContent(html, { waitUntil: "load" });
  // The faces are inlined, but decoding still happens after load - without this
  // a card can be captured while the title is still in the fallback serif.
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: output as `${string}.jpg`,
    type: "jpeg",
    quality: 92,
  });
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
        .update(`v${DESIGN_VERSION}|${key}|${article.slug}|${article.title}`)
        .digest("hex")
        .slice(0, 12);

      entries.push({
        category: key,
        slug: article.slug,
        title: article.title,
        hash,
        // Hashed filename keeps paths short: article slugs run to 90+ chars and
        // some contain spaces and diacritics.
        file: `${hash}.jpg`,
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
      eyebrow: "Arhiva",
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
