import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import express from "express";
import puppeteer, { type Browser, type HTTPRequest } from "puppeteer";
import { getAllRoutes } from "./lib/routes";

/**
 * Post-build prerenderer.
 *
 * Serves dist/ exactly as GitHub Pages will (under the /ADAM-Wiki/ base),
 * renders every known route in headless Chrome, and writes the resulting HTML
 * back into dist/ as <route>/index.html.
 *
 * Why this exists: social crawlers (Facebook, WhatsApp, Discord, Twitter) never
 * execute JavaScript, so the per-article og: tags that react-helmet-async sets
 * at runtime were invisible to them. Baking them into the served HTML is what
 * makes shared links preview correctly, and makes articles indexable without
 * relying on a search engine's JS rendering queue.
 */

const DIST = path.resolve("dist");
const BASE_PATH = "/ADAM-Wiki";
const PORT = 4173;
const CONCURRENCY = 4;

/** Assets that cost bandwidth and time but cannot affect the rendered markup. */
const BLOCKED_RESOURCES = new Set(["image", "media", "font"]);

function startServer(shell: string): Promise<http.Server> {
  const app = express();

  // Always serve the pristine shell for HTML navigations rather than whatever
  // is on disk, so that re-running the prerenderer over an already-prerendered
  // dist/ cannot compound duplicate <head> tags. Assets still come from disk.
  app.use(BASE_PATH, express.static(DIST, { index: false }));

  app.use(BASE_PATH, (_req, res) => {
    res.type("html").send(shell);
  });

  return new Promise((resolve, reject) => {
    const server = app.listen(PORT, () => resolve(server));
    server.on("error", reject);
  });
}

/**
 * Runs inside the page immediately before serialising.
 *
 * 1. motion/react mounts elements at opacity 0 and animates them in, and
 *    whileInView elements never animate at all when they sit below the fold in
 *    a headless viewport. Either way the snapshot would capture invisible
 *    content, so inline animation styles are cleared.
 *
 * 2. index.html ships default title/description/og tags as a fallback. On a
 *    prerendered route Helmet adds its own, leaving two of each - and crawlers
 *    read the first occurrence, which would be the generic default. The later
 *    (Helmet-authored) tag wins and the earlier duplicate is removed.
 */
function prepareSnapshot(): void {
  for (const el of Array.from(
    document.querySelectorAll<HTMLElement>("[style]"),
  )) {
    const style = el.style;
    if (style.opacity !== "" && Number(style.opacity) < 1) {
      style.removeProperty("opacity");
    }
    if (style.transform && style.transform !== "none") {
      style.removeProperty("transform");
    }
  }

  const head = document.head;

  // Tags from index.html are marked data-default. Helmet's are not. Whenever
  // both supply the same key the default is dropped, so the crawler sees
  // exactly one value regardless of the order Helmet injects in.
  const titles = Array.from(head.querySelectorAll("title"));
  const helmetTitle = titles.find(
    (t) => !t.hasAttribute("data-default") && (t.textContent ?? "").trim(),
  );
  for (const title of titles) {
    const isRedundant = helmetTitle
      ? title !== helmetTitle
      : !title.hasAttribute("data-default");
    if (isRedundant) title.remove();
  }
  head.querySelector("title")?.removeAttribute("data-default");

  const metas = Array.from(head.querySelectorAll("meta"));
  const byKey = new Map<string, HTMLMetaElement[]>();

  for (const meta of metas) {
    const property = meta.getAttribute("property");
    const name = meta.getAttribute("name");
    const key = property ? `property:${property}` : name ? `name:${name}` : null;
    if (!key) continue;

    byKey.set(key, [...(byKey.get(key) ?? []), meta]);
  }

  for (const group of byKey.values()) {
    if (group.length < 2) continue;

    const authored = group.filter((m) => !m.hasAttribute("data-default"));
    // Prefer Helmet's tag; if several, the last one wins.
    const winner = authored.length
      ? authored[authored.length - 1]
      : group[group.length - 1];

    for (const meta of group) {
      if (meta !== winner) meta.remove();
    }
  }

  for (const meta of Array.from(head.querySelectorAll("meta[data-default]"))) {
    meta.removeAttribute("data-default");
  }
}

async function renderRoute(
  browser: Browser,
  routePath: string,
): Promise<{ routePath: string; html: string; title: string }> {
  const page = await browser.newPage();

  // A tall viewport puts most whileInView content in view on first paint.
  await page.setViewport({ width: 1280, height: 3000 });

  await page.setRequestInterception(true);
  page.on("request", (request: HTTPRequest) => {
    if (BLOCKED_RESOURCES.has(request.resourceType())) request.abort();
    else request.continue();
  });

  const url = `http://localhost:${PORT}${BASE_PATH}${routePath === "/" ? "/" : routePath}`;

  await page.goto(url, { waitUntil: "networkidle0", timeout: 60_000 });

  // Routes are lazy-loaded, and the Suspense fallback is an empty div - so
  // "root has children" is not enough to know the real page mounted. Waiting on
  // actual rendered text avoids snapshotting the placeholder.
  await page.waitForFunction(
    () => (document.getElementById("root")?.innerText?.trim().length ?? 0) > 100,
    { timeout: 30_000 },
  );

  // Entry animations must finish before the snapshot, or a card gets frozen
  // at opacity 0 in the served HTML - invisible until React hydrates, and
  // invisible to a crawler that does not run scripts. Motion writes inline
  // opacity/transform while animating and clears them when done, so waiting
  // for that to drain beats guessing a duration.
  await page
    .waitForFunction(
      () =>
        ![...document.querySelectorAll<HTMLElement>("[style]")].some(
          (el) => el.style.opacity !== "" || el.style.transform !== "",
        ),
      { timeout: 10_000, polling: 100 },
    )
    .catch(() => {
      console.warn(`  animations still running: ${routePath}`);
    });

  // Helmet's head updates.
  await new Promise((resolve) => setTimeout(resolve, 200));

  await page.evaluate(prepareSnapshot);

  const html = await page.content();
  const title = await page.title();

  await page.close();
  return { routePath, html, title };
}

function writeRoute(routePath: string, html: string): void {
  const target =
    routePath === "/"
      ? path.join(DIST, "index.html")
      : path.join(DIST, routePath, "index.html");

  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, html, "utf8");
}

async function run(): Promise<void> {
  if (!fs.existsSync(path.join(DIST, "index.html"))) {
    throw new Error("dist/index.html not found - run vite build first.");
  }

  const routes = getAllRoutes();

  // Captured before any route is written, so repeated runs stay idempotent.
  const shell = fs.readFileSync(path.join(DIST, "index.html"), "utf8");

  const server = await startServer(shell);
  const browser = await puppeteer.launch({ headless: true });

  console.log(`Prerendering ${routes.length} routes...`);

  let done = 0;
  let failed = 0;
  const queue = [...routes];

  async function worker(): Promise<void> {
    while (queue.length) {
      const route = queue.shift();
      if (!route) break;

      try {
        const { html, title } = await renderRoute(browser, route.path);
        writeRoute(route.path, html);
        done++;
        console.log(
          `  [${String(done).padStart(2)}/${routes.length}] ${route.path}  ${JSON.stringify(title)}`,
        );
      } catch (error) {
        failed++;
        console.error(`  FAILED ${route.path}: ${(error as Error).message}`);
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, routes.length) }, worker),
  );

  await browser.close();
  server.close();

  console.log(`Prerendered ${done} routes${failed ? `, ${failed} failed` : ""}.`);
  if (failed) process.exitCode = 1;
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
