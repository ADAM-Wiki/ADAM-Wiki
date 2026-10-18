import fs from "node:fs";
import path from "node:path";
import readingTime from "reading-time";
import { createHeadingIdAllocator } from "../../src/utils/headingIds";

/**
 * Shared generator for every article category.
 *
 * Emits two files per category so that listing pages never have to pull the
 * article bodies into the main bundle:
 *
 *   src/lib/generated/<key>Meta.ts    listing metadata only (a few KB)
 *   src/lib/generated/<key>Search.ts  the search chunks, imported only by the worker
 *
 * Plus two registry-wide indexes (see generateCategoryIndexes) that fan every
 * per-category file into a single import, so no consumer keeps its own list.
 */

export type ArticleMeta = {
  title: string;
  date: string;
  slug: string;
  category: string;
  tags: string[];
  description: string;
};

type ListingEntry = ArticleMeta & {
  wordCount: number;
  readingTimeMinutes: number;
};

type SearchChunk = {
  text: string;
  /** Matches the DOM id the article page assigns to that heading, or "". */
  headingId: string;
  headingText: string;
};

type SearchEntry = {
  slug: string;
  chunks: SearchChunk[];
};

function chunkText(text: string, maxWords = 120): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const chunks: string[] = [];

  for (let i = 0; i < words.length; i += maxWords) {
    chunks.push(words.slice(i, i + maxWords).join(" "));
  }

  return chunks.length ? chunks : [text];
}

type Section = { headingId: string; headingText: string; lines: string[] };

/**
 * Splits an MDX body at markdown h2/h3 boundaries. The id allocator is the
 * shared implementation (src/utils/headingIds.ts) - the runtime assigns the
 * same ids from the rendered headings.
 *
 * Only ## and ### are considered, because the page's table of contents is built
 * from querySelectorAll("h2, h3").
 */
function splitIntoSections(source: string): Section[] {
  const headingPattern = /^(#{2,3})\s+(.+?)\s*$/;
  const nextHeadingId = createHeadingIdAllocator();
  const sections: Section[] = [];

  let current: Section = { headingId: "", headingText: "", lines: [] };

  for (const line of source.split(/\r?\n/)) {
    const match = line.match(headingPattern);
    if (!match) {
      current.lines.push(line);
      continue;
    }

    sections.push(current);

    const headingText = match[2].trim();

    current = {
      headingId: nextHeadingId(headingText),
      headingText,
      // The heading itself stays searchable within its own section.
      lines: [headingText],
    };
  }

  sections.push(current);
  return sections;
}

function stripMetaBlock(source: string): string {
  return source.replace(/export\s+const\s+meta\s*=\s*{[\s\S]*?};/, "").trim();
}

function stripMdx(source: string): string {
  // 1. Capture the 'reference' attribute value from JSX tags before they are stripped
  const withReferences = source.replace(
    /<[A-Za-z0-9]+\s+[^>]*\breference=(?:"([^"]+)"|'([^']+)'|{([^}]+)})[^>]*>/g,
    (_, double, single, brace) => ` ${double || single || brace} `,
  );

  // 2. Run the rest of the clean-up pipeline on the processed source
  return withReferences
    .replace(/^import\s.+$/gm, " ")
    .replace(/^export\s.+$/gm, " ")
    .replace(/<[^>]*>/g, " ") // Now this safely deletes the brackets without losing the reference text
    .replace(/\{[^}]*\}/g, " ")
    .replace(/!\[.*?\]\(.*?\)/g, " ")
    .replace(/\[([^\]]+)\]\((.*?)\)/g, "$1")
    .replace(/[`*_>#~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractMeta(source: string, filePath: string): ArticleMeta {
  const match = source.match(/export\s+const\s+meta\s*=\s*({[\s\S]*?});/);

  if (!match) {
    throw new Error(`Missing export const meta block in ${filePath}`);
  }

  return Function('"use strict"; return (' + match[1] + ");")() as ArticleMeta;
}

function getMdxFiles(dir: string): string[] {
  // A registry category may have no content directory at all - git does not
  // track empty dirs, so a fresh checkout lacks the placeholder folders a
  // working tree happens to have. No directory simply means no articles.
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => path.join(dir, file));
}

/** hadis -> GeneratedHadisMeta; the type name is used only inside its own file. */
function metaTypeName(key: string): string {
  return `Generated${key.charAt(0).toUpperCase()}${key.slice(1)}Meta`;
}

export function generateCategoryMeta(key: string): void {
  const contentDir = path.resolve(`src/content/articles/${key}`);
  const outputDir = path.resolve("src/lib/generated");
  const metaFile = path.join(outputDir, `${key}Meta.ts`);
  const searchFile = path.join(outputDir, `${key}Search.ts`);

  const files = getMdxFiles(contentDir);

  const parsed = files.map((filePath) => {
    const source = fs.readFileSync(filePath, "utf8");
    const meta = extractMeta(source, filePath);
    const withoutMeta = stripMetaBlock(source);
    const body = stripMdx(withoutMeta);
    const stats = readingTime(body);

    // Chunk within each heading section rather than across the whole article,
    // so every chunk knows which anchor a search result should jump to.
    const chunks: SearchChunk[] = splitIntoSections(withoutMeta).flatMap(
      (section) => {
        const text = stripMdx(section.lines.join("\n"));
        if (!text) return [];

        return chunkText(text).map((part) => ({
          text: part,
          headingId: section.headingId,
          headingText: section.headingText,
        }));
      },
    );

    return {
      listing: {
        ...meta,
        wordCount: stats.words,
        readingTimeMinutes: Math.max(1, Math.ceil(stats.minutes)),
      } satisfies ListingEntry,
      search: {
        slug: meta.slug,
        chunks,
      } satisfies SearchEntry,
    };
  });

  parsed.sort(
    (a, b) =>
      new Date(b.listing.date).getTime() - new Date(a.listing.date).getTime(),
  );

  const listing = parsed.map((entry) => entry.listing);
  const search = parsed.map((entry) => entry.search);

  fs.mkdirSync(outputDir, { recursive: true });

  const metaSource = [
    "// AUTO-GENERATED by scripts/generate-meta.ts. Do not edit by hand.",
    `export type ${metaTypeName(key)} = {`,
    "  title: string;",
    "  date: string;",
    "  slug: string;",
    "  category: string;",
    "  tags: string[];",
    "  description: string;",
    "  wordCount: number;",
    "  readingTimeMinutes: number;",
    "};",
    "",
    `export const ${key}Meta: ${metaTypeName(key)}[] = ` +
      JSON.stringify(listing, null, 2) +
      ";",
    "",
  ].join("\n");

  // Search payload is machine-only data and is imported solely by the search
  // worker, so it is emitted compactly rather than pretty-printed.
  const searchSource = [
    "// AUTO-GENERATED by scripts/generate-meta.ts. Do not edit by hand.",
    "// Imported ONLY by src/workers/search.worker.ts - never from a component,",
    "// otherwise the article bodies end up in the main bundle.",
    `export const ${key}Search: { slug: string; chunks: { text: string; headingId: string; headingText: string }[] }[] = ` +
      JSON.stringify(search) +
      ";",
    "",
  ].join("\n");

  fs.writeFileSync(metaFile, metaSource, "utf8");
  fs.writeFileSync(searchFile, searchSource, "utf8");

  const chunkCount = search.reduce((sum, entry) => sum + entry.chunks.length, 0);
  console.log(
    `  ${key.padEnd(13)} ${String(listing.length).padStart(3)} articles, ${String(chunkCount).padStart(4)} chunks`,
  );
}

/**
 * Fans every per-category file into two registry-wide indexes, so consumers
 * iterate one import instead of keeping their own hand-synced list.
 *
 * The split mirrors the per-category files: metaIndex.ts is safe for the main
 * bundle, searchIndex.ts holds the 1.4 MB of article text and must only ever
 * be imported by the search worker (and the regression check).
 */
export function generateCategoryIndexes(keys: string[]): void {
  const outputDir = path.resolve("src/lib/generated");
  fs.mkdirSync(outputDir, { recursive: true });

  const metaSource = [
    "// AUTO-GENERATED by scripts/generate-meta.ts. Do not edit by hand.",
    "// Registry-wide listing index - one import instead of 13. Main-bundle-safe:",
    "// listing metadata only, never article text.",
    ...keys.map((key) => `import { ${key}Meta } from "./${key}Meta";`),
    "",
    `export const META_BY_CATEGORY: Record<string, {`,
    "  title: string;",
    "  date: string;",
    "  slug: string;",
    "  category: string;",
    "  tags: string[];",
    "  description: string;",
    "  wordCount: number;",
    "  readingTimeMinutes: number;",
    `}[]> = {`,
    ...keys.map((key) => `  ${key}: ${key}Meta,`),
    "};",
    "",
  ].join("\n");

  const searchSource = [
    "// AUTO-GENERATED by scripts/generate-meta.ts. Do not edit by hand.",
    "// Registry-wide search index. Imported ONLY by src/workers/search.worker.ts",
    "// and scripts/check-search.ts - never from a component, otherwise the",
    "// article bodies end up in the main bundle.",
    ...keys.map((key) => `import { ${key}Search } from "./${key}Search";`),
    "",
    `export const SEARCH_BY_CATEGORY: Record<string, {`,
    "  slug: string;",
    "  chunks: { text: string; headingId: string; headingText: string }[];",
    `}[]> = {`,
    ...keys.map((key) => `  ${key}: ${key}Search,`),
    "};",
    "",
  ].join("\n");

  fs.writeFileSync(
    path.join(outputDir, "metaIndex.ts"),
    [
      metaSource,
      "",
    ].join("\n"),
    "utf8",
  );
  fs.writeFileSync(
    path.join(outputDir, "searchIndex.ts"),
    [
      searchSource,
      "",
    ].join("\n"),
    "utf8",
  );
  console.log(`  metaIndex/searchIndex covering ${keys.length} categories`);
}
