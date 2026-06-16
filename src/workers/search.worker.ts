import MiniSearch from "minisearch";
import { topics } from "../utils/categoriesData";
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
import {
  normalizeForSearch,
  getQueryTokens,
  type SearchResult,
} from "../utils/searchShared";

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

interface SearchDocument {
  id: string;
  articleId: string;
  title: string;
  type: "category" | "article" | "page";
  url: string;
  excerpt: string;
  content: string; // Keeps only raw text to significantly save worker memory
  tags: string;
  chunkIndex: number;
}

interface BaseSearchData {
  id: string;
  title: string;
  type: "category" | "article" | "page";
  url: string;
  excerpt?: string;
  _tags?: string;
}

const CATEGORY_URLS: Record<string, string> = {
  HADIS: "/categories/hadis",
  HRIŠĆANSTVO: "/categories/hriscanstvo",
  ATEIZAM: "/categories/ateizam",
  HINDUIZAM: "/categories/hinduizam",
  ISLAM: "/categories/islam",
  ISTORIJA: "/categories/istorija",
  AHMEDIJE: "/categories/ahmedije",
  "ODGOVORI NA SUMNJE": "/categories/odgovori",
  "OPOVRGAVANJE SIJA": "/categories/opovrgavanje",
  "NAUKA I ISLAM": "/categories/nauka",
  MUHAMMED: "/categories/muhammed",
};

const baseDataMap = new Map<string, BaseSearchData>();
const documentMap = new Map<string, SearchDocument>();

const CATEGORIES: BaseSearchData[] = topics
  .filter((t: string, i: number, s: string[]) => s.indexOf(t) === i)
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
    excerpt: "Home page",
  },
  {
    id: "categories",
    title: "Kategorije",
    type: "page",
    url: "/categories",
    excerpt: "All categories",
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
    excerpt: "About us",
  },
];

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

      const base: BaseSearchData = {
        id: baseId,
        title: article.title,
        type: "article",
        url: `${basePath}/${article.slug}`,
        excerpt: article.description,
        _tags: article.tags?.join(" ") ?? "",
      };

      baseDataMap.set(baseId, base);

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
  // Tokenize and normalize dynamically on index lookup
  tokenize: (text) => getQueryTokens(text),
});

miniSearch.addAll(searchDocuments);

function getMiniSearchOptions(query: string) {
  const normalized = normalizeForSearch(query);
  const tokens = normalized.split(/\s+/).filter(Boolean);
  const longest = tokens.reduce(
    (max: number, t: string) => Math.max(max, t.length),
    0,
  );

  if (longest <= 2)
    return {
      boost: { title: 5, tags: 3, content: 1 },
      prefix: false,
      fuzzy: false as const,
    };
  if (longest <= 4)
    return {
      boost: { title: 5, tags: 3, content: 1 },
      prefix: true,
      fuzzy: false as const,
    };
  return { boost: { title: 4, tags: 2, content: 1 }, prefix: true, fuzzy: 0.2 };
}

function getMinScore(query: string): number {
  const normalized = normalizeForSearch(query);
  const tokens = normalized.split(/\s+/).filter(Boolean);
  const longest = tokens.reduce(
    (max: number, t: string) => Math.max(max, t.length),
    0,
  );
  if (longest <= 2) return 5;
  if (longest <= 4) return 2.5;
  return 1.5;
}

function buildSnippet(
  text: string,
  queryTokens: string[],
  maxLen = 220,
): string | undefined {
  if (!text.trim()) return undefined;
  const normalizedText = normalizeForSearch(text);
  let matchIndex = -1;
  let matchLength = 0;

  for (const token of queryTokens) {
    const idx = normalizedText.indexOf(token);
    if (idx !== -1 && (matchIndex === -1 || idx < matchIndex)) {
      matchIndex = idx;
      matchLength = token.length;
    }
  }

  if (matchIndex === -1) {
    return text.length > maxLen ? `${text.slice(0, maxLen).trim()}...` : text;
  }

  // Calculate safe boundaries
  let start = Math.max(0, matchIndex - 70);
  let end = Math.min(text.length, matchIndex + matchLength + 130);

  // Prevent slicing words at the start of snippet
  if (start > 0) {
    const nextSpace = text.indexOf(" ", start);
    if (nextSpace !== -1 && nextSpace < matchIndex) {
      start = nextSpace + 1;
    }
  }

  // Prevent slicing words at the end of snippet
  if (end < text.length) {
    const prevSpace = text.lastIndexOf(" ", end);
    if (prevSpace !== -1 && prevSpace > matchIndex + matchLength) {
      end = prevSpace;
    }
  }

  const snippet = text.slice(start, end).trim();
  return `${start > 0 ? "..." : ""}${snippet}${end < text.length ? "..." : ""}`;
}

self.postMessage({ type: "READY" });

self.onmessage = (
  e: MessageEvent<{
    type: string;
    query: string;
    limit?: number;
    requestId?: number;
  }>,
) => {
  const { type, query, limit = 20, requestId = 0 } = e.data;

  if (type !== "SEARCH") return;

  if (!query.trim() || normalizeForSearch(query).length < 2) {
    self.postMessage({ type: "RESULTS", requestId, results: [] });
    return;
  }

  const tokens = getQueryTokens(query).filter((t: string) => t.length >= 2);
  if (!tokens.length) {
    self.postMessage({ type: "RESULTS", requestId, results: [] });
    return;
  }

  // Unified list of fully normalized and expanded search terms
  const searchString = tokens.join(" ");
  const options = {
    ...(getMiniSearchOptions(query) as any),
    limit: Math.max(limit * 10, 100),
  } as any;
  const hits = miniSearch.search(searchString, options);
  const minScore = getMinScore(query);
  const filteredHits = hits.filter((hit) => hit.score >= minScore);

  if (!filteredHits.length) {
    self.postMessage({ type: "RESULTS", requestId, results: [] });
    return;
  }

  const grouped = new Map<string, SearchResult>();

  for (const hit of filteredHits) {
    const doc = documentMap.get(String(hit.id));
    if (!doc) continue;

    const base = baseDataMap.get(doc.articleId);
    if (!base) continue;

    const existing = grouped.get(base.id);
    const snippet =
      base.type === "article"
        ? buildSnippet(doc.content, tokens) // doc.content is raw content
        : base.excerpt;

    const score = hit.score + (base.type === "article" ? 5 : 0);

    if (!existing) {
      // First match for this article/page
      grouped.set(base.id, {
        id: base.id,
        title: base.title,
        type: base.type,
        url: base.url,
        excerpt: base.excerpt,
        snippet,
        snippets: snippet ? [snippet] : [],
        relevance: score,
        matchCount: 1,
      });
    } else {
      existing.matchCount = (existing.matchCount ?? 0) + 1;

      if (base.type === "article") {
        // For articles, collect multiple snippets from different chunks
        // but keep the highest relevance score
        if (score > existing.relevance) {
          existing.relevance = score;
        }
        if (
          snippet &&
          existing.snippets &&
          !existing.snippets.includes(snippet) &&
          existing.snippets.length < 10
        ) {
          existing.snippets.push(snippet);
        }
      } else if (score > existing.relevance) {
        // For non-articles (categories, pages), keep highest relevance
        existing.relevance = score;
      }
    }
  }

  const articleResults = Array.from(grouped.values())
    .filter((r) => r.type === "article")
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, limit);

  const otherResults = Array.from(grouped.values())
    .filter((r) => r.type !== "article")
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, Math.min(3, limit - articleResults.length));

  const results = [...articleResults, ...otherResults]
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, limit);

  self.postMessage({ type: "RESULTS", requestId, results });
};
