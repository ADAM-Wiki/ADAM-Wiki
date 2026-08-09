import { hadisMeta } from "../lib/generated/hadisMeta";
import { ateizamMeta } from "../lib/generated/ateizamMeta";
import { hriscanstvoMeta } from "../lib/generated/hriscanstvoMeta";
import { hinduizamMeta } from "../lib/generated/hinduizamMeta";
import { islamMeta } from "../lib/generated/islamMeta";
import { istorijaMeta } from "../lib/generated/istorijaMeta";
import { ahmedijeMeta } from "../lib/generated/ahmedijeMeta";
import { odgovoriMeta } from "../lib/generated/odgovoriMeta";
import { opovrgavanjeMeta } from "../lib/generated/opovrgavanjeMeta";
import { naukaMeta } from "../lib/generated/naukaMeta";
import { muhammedMeta } from "../lib/generated/muhammedMeta";
import { spisiMeta } from "../lib/generated/spisiMeta";
import { CATEGORIES, type CategoryData } from "./categoriesData";
import { isPlaceholderArticle } from "../lib/categoryArticles";

export interface ArticleListing {
  title: string;
  date: string;
  slug: string;
  tags: string[];
  description: string;
  wordCount: number;
  readingTimeMinutes: number;
}

export interface ArticleCardData extends ArticleListing {
  categoryId: string;
  categoryTitle: string;
  url: string;
}

export interface CategoryStats extends CategoryData {
  count: number;
  /** Newest article in the category, if it has any. */
  latest?: ArticleCardData;
}

const META_BY_CATEGORY: Record<string, readonly ArticleListing[]> = {
  hadis: hadisMeta,
  ateizam: ateizamMeta,
  hriscanstvo: hriscanstvoMeta,
  hinduizam: hinduizamMeta,
  islam: islamMeta,
  istorija: istorijaMeta,
  ahmedije: ahmedijeMeta,
  odgovori: odgovoriMeta,
  opovrgavanje: opovrgavanjeMeta,
  nauka: naukaMeta,
  muhammed: muhammedMeta,
  spisi: spisiMeta,
};

const isPlaceholder = isPlaceholderArticle;

function toCardData(
  article: ArticleListing,
  category: CategoryData,
): ArticleCardData {
  return {
    ...article,
    categoryId: category.id,
    categoryTitle: category.title,
    url: `/categories/${category.id}/article/${article.slug}`,
  };
}

function byDateDesc(a: ArticleListing, b: ArticleListing): number {
  return new Date(b.date).getTime() - new Date(a.date).getTime();
}

/** Every real article, newest first, across all categories. */
export function getAllArticles(): ArticleCardData[] {
  return CATEGORIES.flatMap((category) => {
    const articles = META_BY_CATEGORY[category.id] ?? [];
    return articles
      .filter((article) => !isPlaceholder(article))
      .map((article) => toCardData(article, category));
  }).sort(byDateDesc);
}

/**
 * Newest articles, capped per category.
 *
 * Whole categories were imported on a single day, so a pure date sort filled
 * the entire list with one category. The cap keeps the section representative;
 * `limit` is only an upper bound, so fewer cards is the expected outcome when
 * the cap binds.
 */
export function getLatestArticles(
  limit = 6,
  maxPerCategory = 2,
): ArticleCardData[] {
  const perCategory = new Map<string, number>();
  const picked: ArticleCardData[] = [];

  for (const article of getAllArticles()) {
    if (picked.length === limit) break;

    const used = perCategory.get(article.categoryId) ?? 0;
    if (used >= maxPerCategory) continue;

    perCategory.set(article.categoryId, used + 1);
    picked.push(article);
  }

  return picked;
}

/**
 * One category's real articles, newest first - what the listing page renders.
 * Placeholders are filtered here too, so a scaffolding-only category shows an
 * empty state rather than a "Test članak" card.
 */
export function getCategoryListing(categoryId: string): ArticleListing[] {
  return (META_BY_CATEGORY[categoryId] ?? [])
    .filter((article) => !isPlaceholder(article))
    .slice()
    .sort(byDateDesc);
}

/** Categories with their real article counts, richest first. */
export function getCategoryStats(): CategoryStats[] {
  return CATEGORIES.map((category) => {
    const articles = (META_BY_CATEGORY[category.id] ?? [])
      .filter((article) => !isPlaceholder(article))
      .slice()
      .sort(byDateDesc);

    return {
      ...category,
      count: articles.length,
      latest: articles[0] ? toCardData(articles[0], category) : undefined,
    };
  }).sort((a, b) => b.count - a.count || a.title.localeCompare(b.title, "sr"));
}

export function getTotalArticleCount(): number {
  return getAllArticles().length;
}

/** "12. jun 2026." - matches the formatting used on article pages. */
export function formatArticleDate(date: string): string {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("sr-Latn-RS", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
