import type { ComponentType } from "react";

export interface ArticleMeta {
  title: string;
  date: string;
  slug: string;
  category: string;
  tags: string[];
  description: string;
  wordCount?: number;
}

export interface ArticleModule {
  default: ComponentType;
  meta: ArticleMeta;
}

export interface CategoryArticles {
  /** Every article in the category, newest first. */
  getAll(): ArticleMeta[];
  getBySlug(slug: string): ArticleModule | null;
}

/**
 * Scaffolding articles ("Test članak") exist so that empty categories still
 * build. They must never surface in a listing, in related articles, or in the
 * sitemap - only a direct URL should reach one.
 */
export function isPlaceholderArticle(article: {
  title: string;
  slug: string;
}): boolean {
  return (
    /^\s*test\b/i.test(article.title) || /^test-clanak$/i.test(article.slug)
  );
}

function isValidMeta(meta: unknown): meta is ArticleMeta {
  const m = meta as ArticleMeta | undefined;
  return (
    !!m &&
    typeof m.slug === "string" &&
    typeof m.title === "string" &&
    typeof m.date === "string" &&
    typeof m.category === "string" &&
    typeof m.description === "string" &&
    Array.isArray(m.tags)
  );
}

/**
 * Wraps one category's eagerly-globbed MDX modules.
 *
 * Each category keeps its own `import.meta.glob` call in its own module so Vite
 * can still split the MDX per category - a single shared glob would pull every
 * article into one chunk (the hadis chunk alone is ~212 kB).
 */
export function createCategoryArticles(
  modules: Record<string, unknown>,
): CategoryArticles {
  const loaded = Object.values(modules) as ArticleModule[];

  return {
    getAll() {
      return loaded
        .map((mod) => mod.meta)
        .filter(isValidMeta)
        .filter((meta) => !isPlaceholderArticle(meta))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },

    getBySlug(slug: string) {
      return loaded.find((mod) => mod.meta?.slug === slug) ?? null;
    },
  };
}