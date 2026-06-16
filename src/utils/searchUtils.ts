import MiniSearch from "minisearch";
import { topics } from "./categoriesData";
import { hadisMeta } from "../lib/generated/hadisMeta";
import { hriscanstvoMeta } from "../lib/generated/hriscanstvoMeta";
import { ahmedijeMeta } from "../lib/generated/ahmedijeMeta";
import { ateizamMeta } from "../lib/generated/ateizamMeta";
import { hinduizamMeta } from "../lib/generated/hinduizamMeta";
import { islamMeta } from "../lib/generated/islamMeta";
import { istorijaMeta } from "../lib/generated/istorijaMeta";
import { muhammedMeta } from "../lib/generated/muhammedMeta";
import { naukaMeta } from "../lib/generated/naukaMeta";
import { odgovoriMeta } from "../lib/generated/odgovoriMeta";
import { opovrgavanjeMeta } from "../lib/generated/opovrgavanjeMeta";

const ARTICLE_SOURCES = [
  { articles: hadisMeta, basePath: "/categories/hadis/article" },
  { articles: hriscanstvoMeta, basePath: "/categories/hriscanstvo/article" },
  { articles: ahmedijeMeta, basePath: "/categories/ahmedije/article" },
  { articles: ateizamMeta, basePath: "/categories/ateizam/article" },
  { articles: hinduizamMeta, basePath: "/categories/hinduizam/article" },
  { articles: islamMeta, basePath: "/categories/islam/article" },
  { articles: istorijaMeta, basePath: "/categories/istorija/article" },
  { articles: muhammedMeta, basePath: "/categories/muhammed/article" },
  { articles: naukaMeta, basePath: "/categories/nauka/article" },
  { articles: odgovoriMeta, basePath: "/categories/odgovori/article" },
  { articles: opovrgavanjeMeta, basePath: "/categories/opovrgavanje/article" },
] as const;

export interface SearchResult {
  id: string;
  title: string;
  type: "category" | "article" | "page";
  url: string;
  excerpt?: string;
  snippet?: string;
  snippets?: string[];
  matchCount?: number;
  relevance: number;
}

interface BaseSearchData {
  id: string;
  title: string;
  type: "category" | "article" | "page";
  url: string;
  excerpt?: string;
  _tags?: string;
}

interface SearchDocument {
  id: string;
  articleId: string;
  title: string;
  type: "category" | "article" | "page";
  url: string;
  excerpt: string;
  content: string;
  tags: string;
  chunkIndex: number;
}

const CATEGORY_URLS: Record<string, string> = {
  HADIS: "/categories/hadis",
  ATEIZAM: "/categories/ateizam",
  HRIŠĆANSTVO: "/categories/hriscanstvo",
  HINDUIZAM: "/categories/hinduizam",
  ISLAM: "/categories/islam",
  ISTORIJA: "/categories/istorija",
  AHMEDIJE: "/categories/ahmedije",
  "ODGOVORI NA SUMNJE": "/categories/odgovori",
  "OPOVRGAVANJE SIJA": "/categories/opovrgavanje",
  "NAUKA I ISLAM": "/categories/nauka",
  MUHAMMED: "/categories/muhammed",
};

const CATEGORIES: BaseSearchData[] = topics
  .filter(
    (title: string, index: number, self: string[]) =>
      self.indexOf(title) === index,
  )
  .map((title: string) => ({
    id: title.toLowerCase().replace(/\s+/g, "-"),
    title,
    type: "category" as const,
    url: CATEGORY_URLS[title] ?? "/categories",
    excerpt: `${title} articles and discussions`,
  }));

const PAGES: BaseSearchData[] = [
  {
    id: "home",
    title: "Početna",
    type: "page",
    url: "/",
    excerpt: "Home page with featured content",
  },
  {
    id: "categories",
    title: "Kategorije",
    type: "page",
    url: "/categories",
    excerpt: "All categories overview",
  },
  {
    id: "tags",
    title: "Tagovi",
    type: "page",
    url: "/tags",
    excerpt: "Browse by tags",
  },
  {
    id: "about",
    title: "O nama",
    type: "page",
    url: "/about",
    excerpt: "About us information",
  },
];

function getMiniSearchOptions(query: string) {
  const normalized = normalizeForSearch(query);
  const tokens = normalized.split(/\s+/).filter(Boolean);
  const longestTokenLength = tokens.reduce(
    (max, token) => Math.max(max, token.length),
    0,
  );

  if (longestTokenLength <= 2) {
    return {
      boost: { title: 5, tags: 3, content: 1 },
      prefix: false,
      fuzzy: false,
    };
  }

  if (longestTokenLength <= 4) {
    return {
      boost: { title: 5, tags: 3, content: 1 },
      prefix: true,
      fuzzy: false,
    };
  }

  return {
    boost: { title: 4, tags: 2, content: 1 },
    prefix: true,
    fuzzy: (term: string) => (term.length > 5 ? 1 : 0),
  };
}

export function normalizeForSearch(str: string): string {
  const refs: string[] = [];

  const normalizedDashes = str
    .replace(/[\u2010\u2011\u2012\u2013\u2014\u2212]/g, "-")
    .replace(/[:]\s*(\d+)\s*-\s*(\d+)/g, ":$1-$2");

  const protectedStr = normalizedDashes.replace(
    /\b\d+:\d+(?:-\d+)?\b/g,
    (match) => {
      const key = `quranrefplaceholder${refs.length}`;
      refs.push(match.toLowerCase());
      return ` ${key} `;
    },
  );

  let normalized = protectedStr
    .toLowerCase()
    .replace(/\[([^\]]*)\]/g, "$1")
    .replace(/[-/_]/g, " ")
    .replace(/dž/gi, "dz")
    .replace(/đ/gi, "d")
    .replace(/dj/gi, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s:]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

  refs.forEach((ref, index) => {
    normalized = normalized.replace(`quranrefplaceholder${index}`, ref);
  });

  return normalized;
}

function expandArabicStyleQuery(query: string): string {
  return query
    .replace(/^(al|el|ibn|bin|abu|abd)(?=[a-z])/g, "$1 ")
    .replace(/([a-z])(al|el|ibn|bin|abu|abd)(?=[a-z])/g, "$1 $2 ");
}

function expandSurahAliases(tokens: string[]): string[] {
  const aliasMap: Record<string, string[]> = {
    zilzal: ["zilzal", "zalzal", "zalzalah", "zalzala"],
    zalzalah: ["zilzal", "zalzal", "zalzalah", "zalzala"],
    baqara: ["baqara", "baqarah"],
    fatiha: ["fatiha", "fatihah"],
    ikhlas: ["ikhlas", "ihlas"],
    yasin: ["yasin", "yaseen"],
  };

  const extra: string[] = [];

  for (const token of tokens) {
    const compact = token.replace(/\s+/g, "");
    const stripped = compact.replace(/^(al|el|ez|az)/, "");

    for (const aliases of Object.values(aliasMap)) {
      if (aliases.includes(compact) || aliases.includes(stripped)) {
        extra.push(...aliases);
      }
    }
  }

  return [...new Set(extra)];
}

function tokenizeForSearch(query: string): string[] {
  const normalized = normalizeForSearch(query);
  const referenceTokens = normalized.match(/\b\d+:\d+(?:-\d+)?\b/g) ?? [];

  const expanded = expandArabicStyleQuery(
    normalized.replace(/\b\d+:\d+(?:-\d+)?\b/g, " "),
  );

  const base = expanded.split(/\s+/).filter(Boolean);
  const extra: string[] = [];

  for (const token of base) {
    if (
      (token.startsWith("al") ||
        token.startsWith("el") ||
        token.startsWith("ez") ||
        token.startsWith("az")) &&
      token.length > 2
    ) {
      extra.push(token.slice(2));
    }
    if (token.startsWith("ibn") && token.length > 3) extra.push(token.slice(3));
    if (token.startsWith("bin") && token.length > 3) extra.push(token.slice(3));
    if (token.startsWith("abu") && token.length > 3) extra.push(token.slice(3));
    if (token.startsWith("abd") && token.length > 3) extra.push(token.slice(3));
  }

  const aliasTokens = expandSurahAliases([...base, ...extra]);

  return [
    ...new Set([...referenceTokens, ...base, ...extra, ...aliasTokens]),
  ].filter((token) => token.length >= 2);
}

export function getQueryTokens(query: string): string[] {
  return tokenizeForSearch(query);
}

export function getHighlightVariants(query: string): string[] {
  const tokens = tokenizeForSearch(query);
  const normalized = normalizeForSearch(query);
  const joinedTokens = tokens.join("");
  const spacedTokens = tokens.join(" ");
  const rawNoSpaces = normalized.replace(/\s+/g, "");

  return [
    ...new Set(
      [normalized, rawNoSpaces, joinedTokens, spacedTokens, ...tokens].filter(
        Boolean,
      ),
    ),
  ];
}

function getSnippetSearchTokens(queryTokens: string[]): string[] {
  return [
    ...new Set(
      queryTokens
        .map((token) => normalizeForSearch(token))
        .filter(Boolean)
        .map((token) => token.slice(0, Math.max(4, token.length - 1)))
        .filter((token) => token.length >= 3),
    ),
  ];
}

function splitIntoSnippetBlocks(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function blockMatchesQuery(block: string, queryTokens: string[]): boolean {
  const normalizedBlock = normalizeForSearch(block);
  const snippetTokens = getSnippetSearchTokens(queryTokens);
  return snippetTokens.some((token) => normalizedBlock.includes(token));
}

function countTokenOccurrences(text: string, queryTokens: string[]): number {
  const normalizedText = normalizeForSearch(text);
  const snippetTokens = getSnippetSearchTokens(queryTokens);

  let total = 0;

  for (const token of snippetTokens) {
    let fromIndex = 0;

    while (true) {
      const index = normalizedText.indexOf(token, fromIndex);
      if (index === -1) break;
      total++;
      fromIndex = index + token.length;
    }
  }

  return total;
}

function buildMultipleSnippets(
  text: string,
  queryTokens: string[],
  maxSnippets = 10,
): string[] {
  if (!text.trim() || !queryTokens.length) return [];

  const normalizedText = normalizeForSearch(text);
  const snippetTokens = getSnippetSearchTokens(queryTokens);
  if (!snippetTokens.length) return [];

  const windows: Array<{ start: number; end: number }> = [];

  for (const token of snippetTokens) {
    let fromIndex = 0;

    while (true) {
      const index = normalizedText.indexOf(token, fromIndex);
      if (index === -1) break;

      windows.push({
        start: Math.max(0, index - 90),
        end: Math.min(text.length, index + token.length + 140),
      });

      fromIndex = index + Math.max(1, token.length);
    }
  }

  if (!windows.length) return [];

  windows.sort((a, b) => a.start - b.start);

  const merged: Array<{ start: number; end: number }> = [];
  for (const win of windows) {
    const last = merged[merged.length - 1];
    if (last && win.start <= last.end - 40) {
      last.end = Math.max(last.end, win.end);
    } else {
      merged.push({ ...win });
    }
  }

  return merged
    .slice(0, maxSnippets)
    .map(({ start, end }) => {
      const snippet = text.slice(start, end).trim();
      return `${start > 0 ? "..." : ""}${snippet}${end < text.length ? "..." : ""}`;
    })
    .filter(Boolean);
}

function buildSnippet(
  text: string,
  queryTokens: string[],
  maxLen = 220,
): string | undefined {
  const snippets = buildMultipleSnippets(text, queryTokens, 1);
  const first = snippets[0];
  if (!first) {
    if (!text.trim()) return undefined;
    return text.length > maxLen ? `${text.slice(0, maxLen).trim()}...` : text;
  }
  return first.length > maxLen ? `${first.slice(0, maxLen).trim()}...` : first;
}

const baseDataMap = new Map<string, BaseSearchData>();
const documentMap = new Map<string, SearchDocument>();

const searchDocuments: SearchDocument[] = [
  ...CATEGORIES.map((item) => {
    baseDataMap.set(item.id, item);
    return {
      id: item.id,
      articleId: item.id,
      title: item.title,
      type: item.type,
      url: item.url,
      excerpt: item.excerpt ?? "",
      content: item.excerpt ?? "",
      tags: "",
      chunkIndex: 0,
    };
  }),
  ...PAGES.map((item) => {
    baseDataMap.set(item.id, item);
    return {
      id: item.id,
      articleId: item.id,
      title: item.title,
      type: item.type,
      url: item.url,
      excerpt: item.excerpt ?? "",
      content: item.excerpt ?? "",
      tags: "",
      chunkIndex: 0,
    };
  }),
  ...ARTICLE_SOURCES.flatMap(({ articles, basePath }) =>
    articles.flatMap((article) => {
      const baseId = `${basePath}::${article.slug}`;

      const articleBase: BaseSearchData = {
        id: baseId,
        title: article.title,
        type: "article",
        url: `${basePath}/${article.slug}`,
        excerpt: article.description,
        _tags: article.tags?.join(" ") ?? "",
      };

      baseDataMap.set(baseId, articleBase);

      return article.searchChunks.map((part, index) => ({
        id: `${baseId}::${index}`,
        articleId: baseId,
        title: article.title,
        type: "article" as const,
        url: `${basePath}/${article.slug}`,
        excerpt: article.description,
        content: part,
        tags: article.tags?.join(" ") ?? "",
        chunkIndex: index,
      }));
    }),
  ),
];

searchDocuments.forEach((doc) => documentMap.set(doc.id, doc));

const allChunksByArticle = new Map<string, string[]>();

for (const doc of searchDocuments) {
  if (doc.type !== "article") continue;

  const existing = allChunksByArticle.get(doc.articleId) ?? [];
  existing.push(doc.content);
  allChunksByArticle.set(doc.articleId, existing);
}

const miniSearch = new MiniSearch<SearchDocument>({
  fields: ["title", "content", "tags"],
  storeFields: [
    "id",
    "articleId",
    "title",
    "type",
    "url",
    "excerpt",
    "content",
    "chunkIndex",
  ],
  tokenize: (text) => tokenizeForSearch(text),
});

miniSearch.addAll(searchDocuments);

function getMinScore(_query: string): number {
  return 0.05;
}

export function searchContent(query: string, limit = 20): SearchResult[] {
  if (!query.trim()) return [];

  const normalizedQuery = normalizeForSearch(query);
  if (normalizedQuery.length < 2) return [];

  const tokens = tokenizeForSearch(query).filter((t) => t.length >= 2);
  if (!tokens.length) return [];

  const searchString = tokens.join(" ");
  const options = {
    ...(getMiniSearchOptions(query) as any),
    limit: Math.max(limit * 10, 100),
  } as any;
  const hits = miniSearch.search(searchString, options);

  const minScore = getMinScore(query);
  const filteredHits = hits.filter((hit) => hit.score >= minScore);
  if (!filteredHits.length) return [];

  const groupedDocs = new Map<
    string,
    {
      base: BaseSearchData;
      relevance: number;
      hits: number;
    }
  >();

  for (const hit of filteredHits) {
    const doc = documentMap.get(String(hit.id));
    if (!doc) continue;

    const base = baseDataMap.get(doc.articleId);
    if (!base) continue;

    const score = hit.score + (base.type === "article" ? 5 : 0);
    const existing = groupedDocs.get(base.id);

    if (!existing) {
      groupedDocs.set(base.id, {
        base,
        relevance: score,
        hits: 1,
      });
    } else {
      existing.hits += 1;
      if (score > existing.relevance) {
        existing.relevance = score;
      }
    }
  }

  const groupedResults: SearchResult[] = Array.from(groupedDocs.values()).map(
    ({ base, relevance, hits }) => {
      const mergedText =
        base.type === "article"
          ? (allChunksByArticle.get(base.id) ?? []).join(" ")
          : (base.excerpt ?? "");

      if (
        normalizeForSearch(query) === "arapsko" &&
        base.url.includes(
          "autenticnost-hadisa-orijentalisti-priznaju-superiornost-islamske-nauke-o-isnadu",
        )
      ) {
        console.log("FULL MERGED TEXT:", mergedText);
      }

      const previewSource = mergedText.trim() || base.excerpt || "";

      const rawSnippets =
        base.type === "article"
          ? buildMultipleSnippets(previewSource, tokens, 12)
          : base.excerpt
            ? [base.excerpt]
            : [];

      const fallbackSnippet = buildSnippet(previewSource, tokens);

      const snippets =
        rawSnippets.length > 0
          ? rawSnippets
          : fallbackSnippet
            ? [fallbackSnippet]
            : [];

      const matchCount = hits;

      return {
        id: base.id,
        title: base.title,
        type: base.type,
        url: base.url,
        excerpt: base.excerpt,
        snippet: snippets[0],
        snippets,
        matchCount,
        relevance,
      };
    },
  );

  const articleResults = groupedResults
    .filter((r) => r.type === "article")
    .sort((a, b) => {
      if ((b.matchCount ?? 0) !== (a.matchCount ?? 0)) {
        return (b.matchCount ?? 0) - (a.matchCount ?? 0);
      }
      return b.relevance - a.relevance;
    })
    .slice(0, limit);

  const otherResults = groupedResults
    .filter((r) => r.type !== "article")
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 3);

  return [...articleResults, ...otherResults]
    .sort((a, b) => {
      if ((b.matchCount ?? 0) !== (a.matchCount ?? 0)) {
        return (b.matchCount ?? 0) - (a.matchCount ?? 0);
      }
      return b.relevance - a.relevance;
    })
    .slice(0, limit);
}

export function getAllCategories(): string[] {
  return CATEGORIES.map((c) => c.title);
}

export function getCategoryByTitle(title: string): BaseSearchData | undefined {
  const normalized = normalizeForSearch(title);
  return CATEGORIES.find((c) => normalizeForSearch(c.title) === normalized);
}

export function expandQuery(query: string): string {
  return expandArabicStyleQuery(normalizeForSearch(query));
}

export function rebuildSearchIndex(): void {
  miniSearch.removeAll();
  miniSearch.addAll(searchDocuments);
}
