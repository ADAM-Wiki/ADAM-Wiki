import MiniSearch from "minisearch";
import { CATEGORIES } from "../utils/categoriesData";
import { ARTICLE_SOURCES } from "../utils/searchCorpus";
import {
  normalizeForSearch,
  getQueryTokens,
  getIndexTokens,
  type SearchResult,
  type SearchSnippet,
} from "../utils/searchShared";
import {
  getMiniSearchOptions,
  filterHitsByRelevance,
  groupHitsByArticle,
  articleRelevance,
} from "../utils/searchRanking";
import { isPlaceholderArticle } from "../lib/categoryArticles";

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
  headingId: string;
  headingText: string;
}

interface BaseSearchData {
  id: string;
  title: string;
  type: "category" | "article" | "page";
  url: string;
  /** Registry id of the owning category; absent for type "page" entries. */
  categoryId?: string;
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
  categoryId: category.id,
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
      // Categories and pages have no in-page anchors to link to.
      headingId: "",
      headingText: "",
    };
  }),
  ...ARTICLE_SOURCES.flatMap(({ meta, search, categoryId, basePath }) => {
    const chunksBySlug = new Map(
      search.map((entry) => [entry.slug, entry.chunks]),
    );

    // Scaffolding articles are not linked from anywhere, so they must not be
    // findable either - "test" used to return them from six categories.
    const realArticles = meta.filter(
      (article) => !isPlaceholderArticle(article),
    );

    return realArticles.flatMap((article) => {
      const baseId = `${basePath}::${article.slug}`;

      const base: BaseSearchData = {
        id: baseId,
        title: article.title,
        type: "article",
        url: `${basePath}/${article.slug}`,
        categoryId,
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
        content: part.text,
        tags: article.tags?.join(" ") ?? "",
        chunkIndex: index,
        headingId: part.headingId,
        headingText: part.headingText,
      }));
    });
  }),
];

searchDocuments.forEach((doc) => documentMap.set(doc.id, doc));

const miniSearch = new MiniSearch<SearchDocument>({
  fields: ["title", "content", "tags"],
  // "content" is deliberately not stored: snippets are built from documentMap,
  // so keeping a second copy per chunk here only costs worker memory.
  storeFields: ["id", "articleId", "title", "type", "url", "excerpt"],
  // Index-time tokenization only normalizes and splits. Query-side expansion
  // (getQueryTokens) is what bridges "albuhari" to "al buhari", so repeating it
  // here would bloat the index and produce false matches on ordinary words.
  tokenize: (text) => getIndexTokens(text),
});

miniSearch.addAll(searchDocuments);

const SNIPPET_LEAD = 70;
const SNIPPET_TRAIL = 130;
const MAX_SNIPPETS_PER_RESULT = 12;

// ponytail: this cache is unbounded - one Set of every token of every chunk
// ever checked, on top of the index itself, so a long browsing session
// converges toward holding a second tokenization of the whole corpus in
// worker memory. Ceiling: memory grows with distinct chunks touched.
// Upgrade path: cap it (simple LRU) or precompute token sets at index build.
const exactTokenCache = new Map<string, Set<string>>();

/** Worker-side provider for the shared relevance filter: lazy, cached token sets. */
function getDocTokens(chunkId: string): ReadonlySet<string> | undefined {
  let indexed = exactTokenCache.get(chunkId);
  if (!indexed) {
    const doc = documentMap.get(chunkId);
    if (!doc) return undefined;
    indexed = new Set(
      getIndexTokens(`${doc.title} ${doc.content} ${doc.tags}`),
    );
    exactTokenCache.set(chunkId, indexed);
  }
  return indexed;
}

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
  // ponytail: apostrophe deletion and bracket-stripping shift the normalized
  // offsets against the original text, so apostrophe-heavy chunks ("Kur'an",
  // quotes) can cut a snippet window late or early by a few characters.
  // Ceiling: misplaced window edges on such chunks; the match itself is still
  // found because search is substring-based. Upgrade path: build the normalized
  // string with an index map (same trick as src/utils/highlight.tsx).
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
    // Ellipsis character, not three periods - these strings are rendered
    // straight into the result preview.
    return `${from > 0 ? "…" : ""}${snippet}${to < text.length ? "…" : ""}`;
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

  // READY is posted once at startup; a worker warmed from the landing page
  // fires it before any listener exists and the message is lost. Re-announce
  // readiness to whoever asks. (Asking early is safe: the message queue holds
  // it until evaluation completes, same as SEARCH.)
  if (type === "PING") {
    self.postMessage({ type: "READY" });
    return;
  }

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
  const rankOptions = getMiniSearchOptions(query);
  // No result limit is passed: MiniSearch v7 removed the `limit` option (it
  // was silently ignored here). Ranking the true top-N needs every hit anyway
  // - truncating raw chunk hits before grouping would drop articles whose
  // matches sit beyond the cut - and the cost is bounded elsewhere: the
  // relative cutoff plus the exact-token bypass prune the hit list, and
  // snippets are only built for the top `limit` articles below.
  const hits = miniSearch.search(searchString, rankOptions);

  const filteredHits = filterHitsByRelevance(hits, tokens, rankOptions, getDocTokens);

  if (!filteredHits.length) {
    self.postMessage({ type: "RESULTS", requestId, results: [] });
    return;
  }

  // Accumulate per article: the best-scoring chunk plus how many chunks matched.
  // Snippets are NOT built here: only the top articles (after ranking) pay for
  // them below, which skips ~90% of snippet work on broad queries.
  const grouped = groupHitsByArticle(filteredHits, (hit) =>
    documentMap.get(String(hit.id))?.articleId,
  );

  const scored = Array.from(grouped.entries()).flatMap(
    ([articleId, group]) => {
      const base = baseDataMap.get(articleId);
      if (!base) return [];

      const result: SearchResult = {
        id: base.id,
        title: base.title,
        type: base.type,
        url: base.url,
        categoryId: base.categoryId,
        excerpt: base.excerpt,
        relevance: articleRelevance(group.bestScore, group.chunkHits),
        matchCount: group.chunkHits,
      };
      if (base.type !== "article") {
        result.snippets = base.excerpt
          ? [{ text: base.excerpt, headingId: "", headingText: "" }]
          : [];
        result.snippet = result.snippets[0]?.text;
      } else {
        result.snippets = [];
      }
      const docs = group.hits
        .map((hit) => documentMap.get(String(hit.id)))
        .filter((doc): doc is SearchDocument => Boolean(doc));
      return [{ result, docs }];
    },
  );

  const matchingArticles = scored
    .filter((e) => e.result.type === "article")
    .sort((a, b) => b.result.relevance - a.result.relevance);

  // Snippets only for what is actually sent. Each snippet carries the anchor
  // of the section it came from, so a result can link straight to that
  // heading rather than the top of the article.
  const topArticles = matchingArticles.slice(0, limit);
  for (const { result, docs } of topArticles) {
    const snippets: SearchSnippet[] = [];
    const seen = new Set<string>();
    for (const doc of docs) {
      if (snippets.length >= MAX_SNIPPETS_PER_RESULT) break;
      const texts = buildSnippets(
        doc.content,
        tokens,
        MAX_SNIPPETS_PER_RESULT - snippets.length,
      );
      for (const text of texts) {
        if (seen.has(text)) continue;
        seen.add(text);
        snippets.push({
          text,
          headingId: doc.headingId,
          headingText: doc.headingText,
        });
        if (snippets.length >= MAX_SNIPPETS_PER_RESULT) break;
      }
    }
    result.snippets = snippets;
    result.snippet = snippets[0]?.text;
  }
  const articleResults = topArticles.map((e) => e.result);

  const otherResults = scored
    .filter((e) => e.result.type !== "article")
    .sort((a, b) => b.result.relevance - a.result.relevance)
    .slice(0, 3)
    .map((e) => e.result);

  // Per-category matched-article totals, so the results page can report
  // honest counts (and honest "Prikaži još" remainders) while a category
  // filter is active. Computed over ALL matches, not the capped list.
  const categoryCounts: Record<string, number> = {};
  for (const { result } of matchingArticles) {
    if (result.categoryId) {
      categoryCounts[result.categoryId] =
        (categoryCounts[result.categoryId] ?? 0) + 1;
    }
  }

  // totalArticles is what matched, not what fits: the list is capped at `limit`
  // and the page used to label the capped length as the result count, so a term
  // in eighty articles reported "20 rezultata" as though that were all of them.
  self.postMessage({
    type: "RESULTS",
    requestId,
    results: [...articleResults, ...otherResults],
    totalArticles: matchingArticles.length,
    categoryCounts,
  });
};
