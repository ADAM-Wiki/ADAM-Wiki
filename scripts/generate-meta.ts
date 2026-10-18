import { CATEGORIES } from "../src/utils/categoriesData";
import {
  generateCategoryIndexes,
  generateCategoryMeta,
} from "./lib/generate-category-meta";

/**
 * Generates metadata for every category in the registry (categoriesData.ts)
 * in a single tsx process, then fans the per-category files into the two
 * registry-wide indexes (metaIndex.ts / searchIndex.ts).
 *
 * Pass category keys to limit the per-category run:
 *   tsx scripts/generate-meta.ts hadis ateizam
 * The indexes always cover every registry entry, so a partial run cannot
 * leave them stale.
 */
const registryKeys = CATEGORIES.map((category) => category.id);
const requested = process.argv.slice(2);

for (const key of requested) {
  if (!registryKeys.includes(key)) {
    throw new Error(
      `Unknown category "${key}". The registry in src/utils/categoriesData.ts has: ${registryKeys.join(", ")}`,
    );
  }
}

const targets = requested.length ? requested : registryKeys;

console.log(`Generating metadata for ${targets.length} categories...`);
for (const key of targets) {
  generateCategoryMeta(key);
}

console.log("Writing registry indexes (metaIndex/searchIndex)...");
generateCategoryIndexes(registryKeys);
console.log("Done.");
