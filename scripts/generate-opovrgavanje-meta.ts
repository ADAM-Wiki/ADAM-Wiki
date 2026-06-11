import fs from "node:fs";
import path from "node:path";
import readingTime from "reading-time";

type OpovrgavanjeArticleMeta = {
  title: string;
  date: string;
  slug: string;
  category: string;
  tags: string[];
  description: string;
};

type GeneratedOpovrgavanjeMeta = OpovrgavanjeArticleMeta & {
  wordCount: number;
  readingTimeMinutes: number;
  searchText: string;
  searchChunks: string[];
};

const CONTENT_DIR = path.resolve("src/content/articles/opovrgavanje");
const OUTPUT_FILE = path.resolve("src/lib/generated/opovrgavanjeMeta.ts");

function chunkText(text: string, maxWords = 120): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const chunks: string[] = [];

  for (let i = 0; i < words.length; i += maxWords) {
    chunks.push(words.slice(i, i + maxWords).join(" "));
  }

  return chunks.length ? chunks : [text];
}

function stripMetaBlock(source: string): string {
  return source.replace(/export\s+const\s+meta\s*=\s*{[\s\S]*?};/, "").trim();
}

function stripMdx(source: string): string {
  return source
    .replace(/^import\s.+$/gm, " ")
    .replace(/^export\s.+$/gm, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\{[^}]*\}/g, " ")
    .replace(/!\[.*?\]\(.*?\)/g, " ")
    .replace(/\[([^\]]+)\]\((.*?)\)/g, "$1")
    .replace(/[`*_>#~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractMeta(source: string): OpovrgavanjeArticleMeta {
  const match = source.match(/export\s+const\s+meta\s*=\s*({[\s\S]*?});/);

  if (!match) {
    throw new Error("Missing export const meta block");
  }

  return Function(
    '"use strict"; return (' + match[1] + ");",
  )() as OpovrgavanjeArticleMeta;
}

function getMdxFiles(dir: string): string[] {
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => path.join(dir, file));
}

function generate(): void {
  const files = getMdxFiles(CONTENT_DIR);

  const articles: GeneratedOpovrgavanjeMeta[] = files.map((filePath) => {
    const source = fs.readFileSync(filePath, "utf8");
    const meta = extractMeta(source);
    const body = stripMdx(stripMetaBlock(source));
    const stats = readingTime(body);

    return {
      ...meta,
      wordCount: stats.words,
      readingTimeMinutes: Math.max(1, Math.ceil(stats.minutes)),
      searchText: body,
      searchChunks: chunkText(body),
    };
  });

  articles.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });

  const lines = [
    "export type GeneratedOpovrgavanjeMeta = {",
    "  title: string;",
    "  date: string;",
    "  slug: string;",
    "  category: string;",
    "  tags: string[];",
    "  description: string;",
    "  wordCount: number;",
    "  readingTimeMinutes: number;",
    "  searchText: string;",
    "  searchChunks: string[];",
    "};",
    "",
    "export const opovrgavanjeMeta: GeneratedOpovrgavanjeMeta[] = " +
      JSON.stringify(articles, null, 2) +
      ";",
    "",
  ];

  fs.writeFileSync(OUTPUT_FILE, lines.join("\n"), "utf8");
  console.log(
    "Generated metadata for " + articles.length + " opovrgavanje articles.",
  );
}

generate();
