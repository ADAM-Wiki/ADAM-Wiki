import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer";

/**
 * Renders the default Open Graph card to public/images/og-default.png.
 *
 * The article pages referenced /images/og-default.jpg, which never existed, so
 * every social preview fell back to a broken image. 1200x630 is the size
 * Facebook, LinkedIn, X and Discord all expect.
 */

const OUTPUT = path.resolve("public/images/og-default.png");

const BRAND = {
  bg: "#0a0a0a",
  accent: "#3b82f6",
  text: "#e5e5e5",
  dim: "#737373",
};

const CARD = `<!doctype html>
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
        font-family: Georgia, "Times New Roman", serif;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 90px;
        position: relative;
        overflow: hidden;
      }
      .glow {
        position: absolute;
        top: -260px;
        right: -200px;
        width: 720px;
        height: 720px;
        border-radius: 50%;
        background: radial-gradient(circle, ${BRAND.accent}33 0%, transparent 70%);
      }
      .rule { width: 90px; height: 4px; background: ${BRAND.accent}; margin-bottom: 42px; }
      h1 { font-size: 104px; font-weight: 500; letter-spacing: -2px; line-height: 1; }
      .accent { color: ${BRAND.accent}; }
      p {
        margin-top: 30px;
        font-size: 33px;
        line-height: 1.45;
        color: ${BRAND.dim};
        font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
        max-width: 900px;
      }
      .url {
        position: absolute;
        bottom: 70px;
        left: 90px;
        font-family: ui-monospace, "SF Mono", Menlo, monospace;
        font-size: 23px;
        letter-spacing: 3px;
        text-transform: uppercase;
        color: ${BRAND.dim};
      }
    </style>
  </head>
  <body>
    <div class="glow"></div>
    <div class="rule"></div>
    <h1>Adam<span class="accent">-</span>Wiki</h1>
    <p>Članci i odgovori o islamu, hadisu, hrišćanstvu, ateizmu i istoriji.</p>
    <div class="url">adam-wiki.github.io</div>
  </body>
</html>`;

async function run(): Promise<void> {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
  await page.setContent(CARD, { waitUntil: "load" });

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  await page.screenshot({ path: OUTPUT, type: "png" });

  await browser.close();

  const kb = (fs.statSync(OUTPUT).size / 1024).toFixed(1);
  console.log(`Generated og-default.png (1200x630, ${kb} KB)`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
