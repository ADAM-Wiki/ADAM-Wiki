import path from "node:path";
import type { Plugin } from "vite";
import { CATEGORIES } from "../../src/utils/categoriesData";
import {
  generateCategoryIndexes,
  generateCategoryMeta,
} from "./generate-category-meta";

/**
 * Dev-only keep-in-sync for the generated listing/search data.
 *
 * The .mdx files are the single source of truth, but listings, tags and stats
 * read metaIndex.ts and the search worker reads searchIndex.ts - generated
 * copies that would otherwise stay frozen at the last `npm run generate:meta`
 * until someone remembers to run it. While the dev server runs, article pages
 * (live import.meta.glob) would then disagree with every listing about the
 * same content.
 *
 * This plugin closes that seam from inside the dev server: once at startup
 * (healing drift from edits made while no server was running), then the
 * changed category on every content save. The generated files are in the
 * module graph, so Vite reloads their importers as soon as the writes land.
 *
 * Build is unaffected (`apply: "serve"`); the build chain still runs
 * generate:meta plus check:registry/check:anchors on its own.
 */

const CONTENT_DIR = path.resolve("src/content/articles");
const DEBOUNCE_MS = 200;

const registryKeys = CATEGORIES.map((category) => category.id);

function regenerateCategory(categoryId: string): boolean {
  try {
    generateCategoryMeta(categoryId);
    console.log(`[meta] ${categoryId} regenerated`);
    return true;
  } catch (error) {
    // Half-typed frontmatter throws mid-edit; keep serving, next save retries.
    console.error(
      `[meta] ${categoryId} regeneration failed: ${(error as Error).message}`,
    );
    return false;
  }
}

function writeIndexes(): void {
  try {
    generateCategoryIndexes(registryKeys);
  } catch (error) {
    console.error(
      `[meta] index write failed: ${(error as Error).message}`,
    );
  }
}

export function devMetaWatcher(): Plugin {
  return {
    name: "dev-meta-watcher",
    apply: "serve",

    configureServer(server) {
      let timer: ReturnType<typeof setTimeout> | undefined;

      const schedule = (file: string): void => {
        const resolved = path.resolve(file);
        if (!resolved.endsWith(".mdx")) return;
        if (!resolved.startsWith(CONTENT_DIR + path.sep)) return;

        const categoryId = path
          .relative(CONTENT_DIR, resolved)
          .split(path.sep)[0];
        if (!registryKeys.includes(categoryId)) return;

        clearTimeout(timer);
        timer = setTimeout(() => {
          if (regenerateCategory(categoryId)) writeIndexes();
        }, DEBOUNCE_MS);
      };

      server.watcher.on("change", schedule);
      server.watcher.on("add", schedule);
      server.watcher.on("unlink", schedule);

      // Heal drift from edits made while no server was running.
      for (const key of registryKeys) {
        regenerateCategory(key);
      }
      writeIndexes();
    },
  };
}
