import fs from "node:fs";
import path from "node:path";
import { CATEGORIES } from "../src/utils/categoriesData";
import { META_BY_CATEGORY } from "../src/lib/generated/metaIndex";
import { SEARCH_BY_CATEGORY } from "../src/lib/generated/searchIndex";

/**
 * Registry completeness check, run as part of `build` right after
 * generate:meta so it validates fresh output.
 *
 * src/utils/categoriesData.ts is the one hand-written list of categories.
 * This asserts every derived artifact actually covers it - the failure mode
 * that shipped twice (spisi/kuran absent from the sitemap and prerender,
 * raw slugs on OG cards) now fails the build instead of failing silently.
 *
 * Empty categories are legitimate: 5 of the 13 are scaffolding with no
 * articles yet, so content presence is asserted, not content volume.
 */

const root = path.resolve(import.meta.dirname, "..");
const resolve = (...parts: string[]) => path.join(root, ...parts);

const ids = CATEGORIES.map((category) => category.id);
const failures: string[] = [];

const fail = (message: string) => failures.push(message);

// --- Registry invariants -------------------------------------------------

if (new Set(ids).size !== ids.length) {
  fail(`duplicate category ids in the registry: ${ids.join(", ")}`);
}

// --- Registry -> derived artifacts ---------------------------------------

for (const id of ids) {
  const component = `src/components/${id.charAt(0).toUpperCase()}${id.slice(1)}ArticlePage.tsx`;

  if (!fs.existsSync(resolve("src/content/articles", id))) {
    fail(`"${id}": missing content dir src/content/articles/${id}`);
  }
  if (!fs.existsSync(resolve("src/lib/generated", `${id}Meta.ts`))) {
    fail(`"${id}": missing src/lib/generated/${id}Meta.ts (run npm run generate:meta)`);
  }
  if (!fs.existsSync(resolve("src/lib/generated", `${id}Search.ts`))) {
    fail(`"${id}": missing src/lib/generated/${id}Search.ts (run npm run generate:meta)`);
  }
  if (!fs.existsSync(resolve(component))) {
    fail(`"${id}": missing ${component} (App.tsx cannot build its article route)`);
  }
  if (!(id in META_BY_CATEGORY)) {
    fail(`"${id}": absent from META_BY_CATEGORY (metaIndex.ts is stale)`);
  }
  if (!(id in SEARCH_BY_CATEGORY)) {
    fail(`"${id}": absent from SEARCH_BY_CATEGORY (searchIndex.ts is stale)`);
  }
}

// --- Derived artifacts -> registry (orphans) -----------------------------

const contentDirs = fs
  .readdirSync(resolve("src/content/articles"), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

for (const dir of contentDirs) {
  if (!ids.includes(dir)) {
    fail(`orphan content dir src/content/articles/${dir} - not in the registry`);
  }
}

const generatedFiles = fs.readdirSync(resolve("src/lib/generated"));
for (const file of generatedFiles) {
  const match = /^(.+?)(Meta|Search)\.ts$/.exec(file);
  // metaIndex/searchIndex/ogImages/imageSizes carry no category id and are skipped.
  if (match && !ids.includes(match[1])) {
    fail(`orphan generated file src/lib/generated/${file} - not in the registry`);
  }
}

for (const key of Object.keys(META_BY_CATEGORY)) {
  if (!ids.includes(key)) {
    fail(`META_BY_CATEGORY has "${key}" - not in the registry`);
  }
}
for (const key of Object.keys(SEARCH_BY_CATEGORY)) {
  if (!ids.includes(key)) {
    fail(`SEARCH_BY_CATEGORY has "${key}" - not in the registry`);
  }
}

// --- Verdict -------------------------------------------------------------

if (failures.length > 0) {
  console.error(`check:registry FAILED (${failures.length}):`);
  for (const message of failures) console.error(`  - ${message}`);
  process.exit(1);
}

console.log(
  `check:registry OK - ${ids.length} categories, registry/meta/search/components in sync.`,
);
