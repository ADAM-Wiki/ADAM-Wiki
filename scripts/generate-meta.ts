import { CATEGORIES, getCategory } from "./lib/categories";
import { generateCategoryMeta } from "./lib/generate-category-meta";

/**
 * Generates metadata for every category in a single tsx process.
 *
 * Pass category keys to limit the run:
 *   tsx scripts/generate-meta.ts hadis ateizam
 */
const requested = process.argv.slice(2);
const targets = requested.length ? requested.map(getCategory) : CATEGORIES;

console.log(`Generating metadata for ${targets.length} categories...`);
for (const category of targets) {
  generateCategoryMeta(category);
}
console.log("Done.");
