import fs from "node:fs";
import path from "node:path";
import readingTime from "reading-time";

/**
 * Shared generator for every article category.
 *
 * Emits two files per category so that listing pages never have to pull the
 * article bodies into the main bundle:
 *
 *   src/lib/generated/<key>Meta.ts    listing metadata only (a few KB)
 *   src/lib/generated/<key>Search.ts  the search chunks, imported only by the worker
 */

export type CategoryConfig = {
  /** Directory under src/content/articles, and the base of the generated file names. */
  key: string;
  /** Exact exported type name for the listing metadata, kept verbatim so existing imports keep working. */
  typeName: string;
};

type ArticleMeta = {
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

/**
 * Must stay byte-identical to slugifyHeading in the article pages, which
 * derives heading ids from rendered textContent at runtime. If the two drift,
 * search results will link to anchors that do not exist.
 */
function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "dj")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

type Section = { headingId: string; headingText: string; lines: string[] };

/**
 * Splits an MDX body at markdown h2/h3 boundaries, replicating the numbering
 * the article page applies when it de-duplicates repeated heading text.
 *
 * Only ## and ### are considered, because the page's table of contents is built
 * from querySelectorAll("h2, h3").
 */
function splitIntoSections(source: string): Section[] {
  const headingPattern = /^(#{2,3})\s+(.+?)\s*$/;
  const counts: Record<string, number> = {};
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
    const base = slugifyHeading(headingText);
    const seen = counts[base] ?? 0;
    counts[base] = seen + 1;

    current = {
      headingId: seen === 0 ? base : `${base}-${seen}`,
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
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => path.join(dir, file));
}

export function generateCategoryMeta({ key, typeName }: CategoryConfig): void {
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
    `export type ${typeName} = {`,
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
    `export const ${key}Meta: ${typeName}[] = ` +
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
