import MiniSearch from "minisearch";
import { CATEGORIES } from "../utils/categoriesData";
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
import { hadisSearch } from "../lib/generated/hadisSearch";
import { hriscanstvoSearch } from "../lib/generated/hriscanstvoSearch";
import { ahmedijeSearch } from "../lib/generated/ahmedijeSearch";
import { ateizamSearch } from "../lib/generated/ateizamSearch";
import { hinduizamSearch } from "../lib/generated/hinduizamSearch";
import { islamSearch } from "../lib/generated/islamSearch";
import { istorijaSearch } from "../lib/generated/istorijaSearch";
import { muhammedSearch } from "../lib/generated/muhammedSearch";
import { naukaSearch } from "../lib/generated/naukaSearch";
import { odgovoriSearch } from "../lib/generated/odgovoriSearch";
import { opovrgavanjeSearch } from "../lib/generated/opovrgavanjeSearch";
import {
  normalizeForSearch,
  getQueryTokens,
  getIndexTokens,
  type SearchResult,
} from "../utils/searchShared";

type ArticleListing = {
  title: string;
  slug: string;
  description: string;
  tags: string[];
};

type ArticleChunks = { slug: string; chunks: string[] };

const ARTICLE_SOURCES: ReadonlyArray<{
  meta: readonly ArticleListing[];
  search: readonly ArticleChunks[];
  basePath: string;
}> = [
  { meta: hadisMeta, search: hadisSearch, basePath: "/categories/hadis/article" },
  {
    meta: hriscanstvoMeta,
    search: hriscanstvoSearch,
    basePath: "/categories/hriscanstvo/article",
  },
  {
    meta: ahmedijeMeta,
    search: ahmedijeSearch,
    basePath: "/categories/ahmedije/article",
  },
  {
    meta: ateizamMeta,
    search: ateizamSearch,
    basePath: "/categories/ateizam/article",
  },
  {
    meta: hinduizamMeta,
    search: hinduizamSearch,
    basePath: "/categories/hinduizam/article",
  },
  { meta: islamMeta, search: islamSearch, basePath: "/categories/islam/article" },
  {
    meta: istorijaMeta,
    search: istorijaSearch,
    basePath: "/categories/istorija/article",
  },
  {
    meta: muhammedMeta,
    search: muhammedSearch,
    basePath: "/categories/muhammed/article",
  },
  { meta: naukaMeta, search: naukaSearch, basePath: "/categories/nauka/article" },
  {
    meta: odgovoriMeta,
    search: odgovoriSearch,
    basePath: "/categories/odgovori/article",
  },
  {
    meta: opovrgavanjeMeta,
    search: opovrgavanjeSearch,
    basePath: "/categories/opovrgavanje/article",
  },
];

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

const baseDataMap = new Map<string, BaseSearchData>();
const documentMap = new Map<string, SearchDocument>();

const CATEGORY_DOCS: BaseSearchData[] = CATEGORIES.map((category) => ({
  id: category.id,
  title: category.title,
  type: "category" as const,
  url: category.url,
  excerpt: `${category.title} articles and discussions`,
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
  ...[...CATEGORY_DOCS, ...PAGES].map((item) => {
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
  ...ARTICLE_SOURCES.flatMap(({ meta, search, basePath }) => {
    const chunksBySlug = new Map(
      search.map((entry) => [entry.slug, entry.chunks]),
    );

    return meta.flatMap((article) => {
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

      const chunks = chunksBySlug.get(article.slug) ?? [];

      return chunks.map((part, index) => ({
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
    });
  }),
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
  // Index-time tokenization only normalizes and splits. Query-side expansion
  // (getQueryTokens) is what bridges "albuhari" to "al buhari", so repeating it
  // here would bloat the index and produce false matches on ordinary words.
  tokenize: (text) => getIndexTokens(text),
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

/**
 * MiniSearch scores scale with term count and IDF, so an absolute threshold
 * behaves completely differently for a one-word and a three-word query.
 * Cutting relative to the best hit keeps the filter meaningful either way.
 */
const RELATIVE_SCORE_CUTOFF = 0.3;

function getScoreCutoff(topScore: number): number {
  return topScore * RELATIVE_SCORE_CUTOFF;
}

const SNIPPET_LEAD = 70;
const SNIPPET_TRAIL = 130;
const MAX_SNIPPETS_PER_RESULT = 12;

/**
 * Returns every distinct match window inside one chunk, not just the first.
 * A chunk is ~120 words and can easily mention the term several times; showing
 * only the first occurrence hides most of the evidence.
 */
function buildSnippets(
  text: string,
  queryTokens: string[],
  maxSnippets: number,
): string[] {
  if (!text.trim() || maxSnippets <= 0) return [];

  // normalizeForSearch collapses whitespace but preserves character count for
  // everything else, so indices map closely enough for snippet windows.
  const normalizedText = normalizeForSearch(text);

  const windows: Array<{ start: number; end: number }> = [];

  for (const token of queryTokens) {
    let from = 0;
    while (true) {
      const index = normalizedText.indexOf(token, from);
      if (index === -1) break;

      windows.push({
        start: Math.max(0, index - SNIPPET_LEAD),
        end: Math.min(text.length, index + token.length + SNIPPET_TRAIL),
      });

      from = index + Math.max(1, token.length);
    }
  }

  if (!windows.length) return [];

  windows.sort((a, b) => a.start - b.start);

  const merged: Array<{ start: number; end: number }> = [];
  for (const win of windows) {
    const last = merged[merged.length - 1];
    // Overlapping (or nearly touching) windows become one snippet.
    if (last && win.start <= last.end - 40) {
      last.end = Math.max(last.end, win.end);
    } else {
      merged.push({ ...win });
    }
  }

  return merged.slice(0, maxSnippets).map(({ start, end }) => {
    let from = start;
    let to = end;

    // Avoid cutting words in half at either edge.
    if (from > 0) {
      const nextSpace = text.indexOf(" ", from);
      if (nextSpace !== -1 && nextSpace < to) from = nextSpace + 1;
    }
    if (to < text.length) {
      const prevSpace = text.lastIndexOf(" ", to);
      if (prevSpace !== -1 && prevSpace > from) to = prevSpace;
    }

    const snippet = text.slice(from, to).trim();
    return `${from > 0 ? "..." : ""}${snippet}${to < text.length ? "..." : ""}`;
  });
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

  if (!hits.length) {
    self.postMessage({ type: "RESULTS", requestId, results: [] });
    return;
  }

  const cutoff = getScoreCutoff(hits[0].score);
  const filteredHits = hits.filter((hit) => hit.score >= cutoff);

  if (!filteredHits.length) {
    self.postMessage({ type: "RESULTS", requestId, results: [] });
    return;
  }

  // Accumulate per article: the best-scoring chunk plus how many chunks matched.
  const grouped = new Map<
    string,
    { result: SearchResult; bestScore: number; chunkHits: number }
  >();

  for (const hit of filteredHits) {
    const doc = documentMap.get(String(hit.id));
    if (!doc) continue;

    const base = baseDataMap.get(doc.articleId);
    if (!base) continue;

    const existing = grouped.get(base.id);
    const remainingSlots =
      MAX_SNIPPETS_PER_RESULT - (existing?.result.snippets?.length ?? 0);

    const snippets =
      base.type === "article"
        ? buildSnippets(doc.content, tokens, remainingSlots) // doc.content is raw content
        : base.excerpt
          ? [base.excerpt]
          : [];

    if (!existing) {
      grouped.set(base.id, {
        bestScore: hit.score,
        chunkHits: 1,
        result: {
          id: base.id,
          title: base.title,
          type: base.type,
          url: base.url,
          excerpt: base.excerpt,
          snippet: snippets[0],
          snippets,
          relevance: hit.score,
          matchCount: 1,
        },
      });
      continue;
    }

    existing.chunkHits += 1;
    existing.bestScore = Math.max(existing.bestScore, hit.score);
    existing.result.matchCount = existing.chunkHits;

    if (base.type === "article" && existing.result.snippets) {
      for (const snippet of snippets) {
        if (existing.result.snippets.length >= MAX_SNIPPETS_PER_RESULT) break;
        if (!existing.result.snippets.includes(snippet)) {
          existing.result.snippets.push(snippet);
        }
      }
      existing.result.snippet ??= existing.result.snippets[0];
    }
  }

  // An article discussing the term across many chunks is more relevant than one
  // that mentions it once in a short chunk, but the strength of the best match
  // should still dominate - hence a logarithmic rather than linear bonus.
  const scored = Array.from(grouped.values()).map(
    ({ result, bestScore, chunkHits }) => {
      result.relevance = bestScore + Math.log1p(chunkHits);
      return result;
    },
  );

  const articleResults = scored
    .filter((r) => r.type === "article")
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, limit);

  const otherResults = scored
    .filter((r) => r.type !== "article")
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 3);

  self.postMessage({
    type: "RESULTS",
    requestId,
    results: [...articleResults, ...otherResults],
  });
};
