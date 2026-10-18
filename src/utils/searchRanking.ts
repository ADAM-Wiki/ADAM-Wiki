import { normalizeForSearch } from "./searchShared";

/**
 * The single source of truth for ranking policy. Both the worker
 * (src/workers/search.worker.ts) and the regression check
 * (scripts/check-search.ts) import from here; neither re-implements it.
 * The previous copy in check-search.ts had already drifted from the worker
 * (it never learned about the exact-token bypass), which is exactly the
 * failure this module exists to prevent.
 */
export interface RankOptions {
  boost: { title: number; tags: number; content: number };
  prefix: boolean;
  fuzzy: number | false;
}

export function getMiniSearchOptions(query: string): RankOptions {
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
      fuzzy: false,
    };
  if (longest <= 4)
    return {
      boost: { title: 5, tags: 3, content: 1 },
      prefix: true,
      fuzzy: false,
    };
  return { boost: { title: 4, tags: 2, content: 1 }, prefix: true, fuzzy: 0.2 };
}

/**
 * MiniSearch scores scale with term count and IDF, so an absolute threshold
 * behaves completely differently for a one-word and a three-word query.
 * Cutting relative to the best hit keeps the filter meaningful either way.
 */
export const RELATIVE_SCORE_CUTOFF = 0.3;

export function getScoreCutoff(topScore: number): number {
  return topScore * RELATIVE_SCORE_CUTOFF;
}

/**
 * Whether a chunk literally contains a query term (same fields, same
 * tokenization as the index). Such chunks bypass the relative score cutoff:
 * when one dominant article pushes the cutoff out of reach, genuine mentions
 * elsewhere must still be findable. The cutoff then only filters fuzzy-level
 * noise, which is its actual job. `prefix` mirrors the MiniSearch option used
 * for the query so short queries stay exact-only.
 *
 * The token sets come from the caller: the worker caches them per chunk, the
 * check script builds them per doc, and this function stays pure.
 */
function chunkMatchesTokens(
  indexed: ReadonlySet<string>,
  queryTokens: string[],
  prefix: boolean,
): boolean {
  for (const token of queryTokens) {
    for (const word of indexed) {
      if (prefix ? word.startsWith(token) : word === token) return true;
    }
  }
  return false;
}

/** Applies the score cutoff plus the exact-token bypass, in that order. */
export function filterHitsByRelevance<
  T extends { id: string | number; score: number },
>(
  hits: readonly T[],
  tokens: string[],
  options: Pick<RankOptions, "prefix">,
  getDocTokens: (id: string) => ReadonlySet<string> | undefined,
): T[] {
  if (!hits.length) return [];
  const cutoff = getScoreCutoff(hits[0].score);
  return hits.filter((hit) => {
    if (hit.score >= cutoff) return true;
    const indexed = getDocTokens(String(hit.id));
    if (!indexed) return false;
    return chunkMatchesTokens(indexed, tokens, options.prefix);
  });
}

/**
 * An article discussing the term across many chunks is more relevant than one
 * that mentions it once in a short chunk, but the strength of the best match
 * should still dominate - hence a logarithmic rather than linear bonus.
 */
export function articleRelevance(
  bestScore: number,
  chunkHits: number,
): number {
  return bestScore + Math.log1p(chunkHits);
}

export interface ArticleGroup<T> {
  bestScore: number;
  chunkHits: number;
  hits: T[];
}

/** Accumulates per article: the best-scoring chunk plus how many chunks matched. */
export function groupHitsByArticle<T extends { id: string | number; score: number }>(
  hits: readonly T[],
  getArticleId: (hit: T) => string | undefined,
): Map<string, ArticleGroup<T>> {
  const grouped = new Map<string, ArticleGroup<T>>();

  for (const hit of hits) {
    const articleId = getArticleId(hit);
    if (!articleId) continue;

    const existing = grouped.get(articleId);
    if (!existing) {
      grouped.set(articleId, { bestScore: hit.score, chunkHits: 1, hits: [hit] });
      continue;
    }
    existing.chunkHits += 1;
    existing.bestScore = Math.max(existing.bestScore, hit.score);
    existing.hits.push(hit);
  }

  return grouped;
}
