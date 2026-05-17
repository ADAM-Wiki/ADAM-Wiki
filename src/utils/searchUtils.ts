// searchUtils.ts — search engine for site content
// Searches only titles and excerpts — NOT full article content.
// Now uses tokenised search (every word in the query must appear somewhere),
// Unicode-normalised diacritic stripping, and word‑boundary scoring.
// To add new categories: edit categoriesData.ts
// To add new articles: edit articlesData.ts

import { topics } from './categoriesData';
import {
  hadisArticles,
  hriscanstvoArticles,
  ateizmaArticles,
  hinduizamArticles,
  seriatArticles,
  kuranArticles,
  ravnaZemjaArticles,
  nemoralArticles,
  type ArticleData
} from './articlesData';

const ARTICLE_SOURCES = [
  { articles: hadisArticles,        basePath: "/hadis/article" },
  { articles: hriscanstvoArticles,  basePath: "/hriscanstvo/article" },
  { articles: ateizmaArticles,      basePath: "/ateizam/article" },
  { articles: hinduizamArticles,    basePath: "/hinduizam/article" },
  { articles: seriatArticles,       basePath: "/serijat/article" },
  { articles: kuranArticles,        basePath: "/kuran/article" },
  { articles: ravnaZemjaArticles,   basePath: "/ravna-zemlja/article" },
  { articles: nemoralArticles,      basePath: "/moral/article" },
];

// ─── Public types ─────────────────────────────────────────────────────────────

export interface SearchResult {
  id: string;
  title: string;
  type: 'category' | 'article' | 'page';
  url: string;
  excerpt?: string;
  relevance: number;
}

// ─── Internal types ───────────────────────────────────────────────────────────

interface BaseSearchData {
  id: string;
  title: string;
  type: 'category' | 'article' | 'page';
  url: string;
  excerpt?: string;
}

// ─── Build categories from categoriesData.ts ─────────────────────────────────

const CATEGORIES: BaseSearchData[] = topics
  .filter((title: string, index: number, self: string[]) => self.indexOf(title) === index)
  .map((title: string) => ({
    id:      title.toLowerCase().replace(/\s+/g, '-'),
    title,
    type:    'category' as const,
    url:     title === 'HADIS' ? '/hadis' : `/category/${title.toLowerCase()}`,
    excerpt: `${title} articles and discussions`,
  }));

// ─── Static pages ─────────────────────────────────────────────────────────────

const PAGES: BaseSearchData[] = [
  { id: 'home',       title: 'Početna',    type: 'page', url: '/',           excerpt: 'Home page with featured content' },
  { id: 'categories', title: 'Kategorije', type: 'page', url: '/categories', excerpt: 'All categories overview' },
  { id: 'posts',      title: 'Postovi',    type: 'page', url: '/posts',      excerpt: 'All posts and articles' },
  { id: 'tags',       title: 'Tagovi',     type: 'page', url: '/tags',       excerpt: 'Browse by tags' },
  { id: 'about',      title: 'O nama',     type: 'page', url: '/about',      excerpt: 'About us information' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Normalizes Serbian/Croatian/Bosnian text for search matching.
 * Key rule: đ and dj both → "d" (same base), so they always match each other.
 * Order matters: handle multi-char sequences BEFORE single-char replacements.
 */
function stripDiacritics(str: string): string {
  return str
    .toLowerCase()
    .replace(/dž/gi, 'dz')
    // đ and dj → same base "d" so they always match each other
    .replace(/đ/g,   'd')
    .replace(/Đ/g,   'd')
    .replace(/dj/gi, 'd')
    // NFD decompose + strip combining marks (č→c, ć→c, ž→z, š→s)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

// ─── Index building ───────────────────────────────────────────────────────────

const searchDataMap = new Map<string, BaseSearchData>();
const allSearchableText = new Map<string, string>();

function buildSearchIndex(): void {
  const articleEntries: BaseSearchData[] = ARTICLE_SOURCES.flatMap(({ articles, basePath }) =>
    articles.map((article: ArticleData) => ({
      id:      article.slug,
      title:   article.title,
      type:    'article' as const,
      url:     `${basePath}/${article.slug}`,
      excerpt: article.summary,
    }))
  );

  const allItems: BaseSearchData[] = [...CATEGORIES, ...PAGES, ...articleEntries];

  allItems.forEach(item => {
    searchDataMap.set(item.id, item);
    const text = stripDiacritics([item.title, item.excerpt ?? ''].join(' '));
    allSearchableText.set(item.id, text);
  });
}

buildSearchIndex();

// ─── Public API ───────────────────────────────────────────────────────────────

export function searchContent(query: string, limit = 20): SearchResult[] {
  if (!query.trim()) return [];

  const rawQuery = stripDiacritics(query.trim());
  const tokens = rawQuery.split(/\s+/).filter(Boolean);
  const MAX_DIST = 1;

  const results: { item: BaseSearchData; score: number }[] = [];

  allSearchableText.forEach((normalizedText, id) => {
    const item = searchDataMap.get(id);
    if (!item) return;

    const words = normalizedText.split(/\s+/);
    let tokensMatched = 0;
    let score = 1;

    for (const token of tokens) {
      // 1. Exact word match
      if (words.includes(token)) {
        tokensMatched++;
        score += 20;
        continue;
      }

      // 2. Substring match — handles different word endings (određivanje/određivanju)
      if (normalizedText.includes(token)) {
        tokensMatched++;
        score += 15;
        continue;
      }

      // 3. Fuzzy match — only for tokens 3+ chars to avoid false matches on short words
      if (token.length >= 3) {
        let bestDist = MAX_DIST + 1;
        for (const word of words) {
          if (Math.abs(word.length - token.length) > MAX_DIST) continue;
          const dist = levenshtein(word, token);
          if (dist < bestDist) bestDist = dist;
          if (bestDist === 0) break;
        }
        if (bestDist <= MAX_DIST) {
          tokensMatched++;
          score += (10 - bestDist * 3);
        }
      }
    }

    if (tokensMatched < tokens.length) return;

    const title = stripDiacritics(item.title);
    tokens.forEach(token => {
      if (title.includes(token)) score += 20;
      if (title.startsWith(token)) score += 15;
      const boundaryRegex = new RegExp(`\\b${escapeRegExp(token)}\\b`, 'i');
      if (boundaryRegex.test(title)) score += 10;
    });

    if (item.type === 'article') score += 5;
    results.push({ item, score });
  });

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(r => ({ ...r.item, relevance: r.score }));
}

export function getAllCategories(): string[] {
  return CATEGORIES.map(c => c.title);
}

export function getCategoryByTitle(title: string): BaseSearchData | undefined {
  const lower = stripDiacritics(title);
  return CATEGORIES.find(c => stripDiacritics(c.title) === lower);
}

export function rebuildSearchIndex(): void {
  searchDataMap.clear();
  allSearchableText.clear();
  buildSearchIndex();
}