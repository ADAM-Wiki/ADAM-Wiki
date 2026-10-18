import fs from "node:fs";
import path from "node:path";
import { CATEGORIES } from "../src/utils/categoriesData";
import { SEARCH_BY_CATEGORY } from "../src/lib/generated/searchIndex";
import { createHeadingIdAllocator } from "../src/utils/headingIds";

/**
 * Heading-anchor contract check, run as part of `build` right after
 * check:registry (and therefore right after generate:meta, so the index it
 * validates is always fresh).
 *
 * The id contract has two sides that derive ids from different text: the
 * build generator reads the markdown heading line, the runtime reads the
 * rendered DOM textContent. They agree only while headings are plain text.
 * This check enforces both halves:
 *
 *   1. Lint: no heading may contain `[ < & {` - links, tags, entities and
 *      MDX expressions render into different text than the raw markdown line,
 *      so the two derivations would diverge and search results would link to
 *      ids the page never assigns.
 *   2. Parity: re-deriving every article's heading ids with the shared
 *      allocator must reproduce exactly the ids stored in the generated
 *      search index - catches a stale index or an allocator rule change that
 *      would silently retarget existing anchors.
 */

const root = path.resolve(import.meta.dirname, "..");
const articlesDir = path.resolve(root, "src/content/articles");

/** Characters where markdown source and rendered DOM text diverge. */
const DIVERGENT_CHARS = /[[<&{]/;

const HEADING_PATTERN = /^(#{2,3})\s+(.+?)\s*$/;

const failures: string[] = [];

let articleCount = 0;
let headingCount = 0;

for (const { id: categoryId } of CATEGORIES) {
  const categoryDir = path.join(articlesDir, categoryId);
  // Empty categories are legitimate scaffolding; check:registry asserts the
  // dir exists, and an empty readdir is simply nothing to validate here.
  const files = fs
    .readdirSync(categoryDir)
    .filter((file) => file.endsWith(".mdx"));

  for (const file of files) {
    articleCount += 1;
    const location = `${categoryId}/${file}`;
    const source = fs.readFileSync(path.join(categoryDir, file), "utf8");

    const expectedIds: string[] = [];
    const nextHeadingId = createHeadingIdAllocator();

    source.split(/\r?\n/).forEach((line, index) => {
      const match = HEADING_PATTERN.exec(line);
      if (!match) return;

      const text = match[2].trim();
      headingCount += 1;

      const divergent = text.match(DIVERGENT_CHARS);
      if (divergent) {
        failures.push(
          `${location}:${index + 1} - heading "${text}" contains "${divergent[0]}", ` +
            `which renders differently in the DOM than in the markdown source. ` +
            `Rewrite the heading as plain text (move the link/tag/expression into the body).`,
        );
      }

      expectedIds.push(nextHeadingId(text));
    });

    // --- Parity against the generated search index -------------------------

    const slugMatch = /^\s*slug:\s*"([^"]+)"/m.exec(source);
    if (!slugMatch) {
      failures.push(`${location} - no slug in frontmatter; cannot validate ids`);
      continue;
    }
    const slug = slugMatch[1];

    const indexed = SEARCH_BY_CATEGORY[categoryId]?.find(
      (article) => article.slug === slug,
    );
    if (!indexed) {
      failures.push(
        `${location} - slug "${slug}" missing from the search index ` +
          `(run npm run generate:meta)`,
      );
      continue;
    }

    const expected = new Set(expectedIds.filter(Boolean));
    const actual = new Set(
      indexed.chunks.map((chunk) => chunk.headingId).filter(Boolean),
    );

    for (const id of expected) {
      if (!actual.has(id)) {
        failures.push(
          `${location} - heading id "${id}" is not in the search index ` +
            `(stale index? run npm run generate:meta)`,
        );
      }
    }
    for (const id of actual) {
      if (!expected.has(id)) {
        failures.push(
          `${location} - search index has id "${id}" that no heading produces ` +
            `(edited headings without regenerating? run npm run generate:meta)`,
        );
      }
    }
  }
}

if (failures.length > 0) {
  console.error(`check:anchors FAILED (${failures.length}):`);
  for (const message of failures) console.error(`  - ${message}`);
  process.exit(1);
}

console.log(
  `check:anchors OK - ${headingCount} headings across ${articleCount} articles; ` +
    `index ids and DOM-safe headings in sync.`,
);
