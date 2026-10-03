import { hadisMeta } from "../../src/lib/generated/hadisMeta";
import { ateizamMeta } from "../../src/lib/generated/ateizamMeta";
import { hriscanstvoMeta } from "../../src/lib/generated/hriscanstvoMeta";
import { hinduizamMeta } from "../../src/lib/generated/hinduizamMeta";
import { islamMeta } from "../../src/lib/generated/islamMeta";
import { istorijaMeta } from "../../src/lib/generated/istorijaMeta";
import { ahmedijeMeta } from "../../src/lib/generated/ahmedijeMeta";
import { odgovoriMeta } from "../../src/lib/generated/odgovoriMeta";
import { opovrgavanjeMeta } from "../../src/lib/generated/opovrgavanjeMeta";
import { naukaMeta } from "../../src/lib/generated/naukaMeta";
import { muhammedMeta } from "../../src/lib/generated/muhammedMeta";
import { spisiMeta } from "../../src/lib/generated/spisiMeta";
import { kuranMeta } from "../../src/lib/generated/kuranMeta";
import { isPlaceholderArticle } from "../../src/lib/categoryArticles";

export type Route = {
  /** Path relative to the site root, always starting with "/". */
  path: string;
  /** ISO date of the newest content on the page, when known. */
  lastmod?: string;
  priority: number;
  changefreq: "daily" | "weekly" | "monthly" | "yearly";
  /** Excluded from sitemap.xml but still prerendered. */
  noIndex?: boolean;
};

const CATEGORY_META = [
  { key: "hadis", articles: hadisMeta },
  { key: "ateizam", articles: ateizamMeta },
  { key: "hriscanstvo", articles: hriscanstvoMeta },
  { key: "hinduizam", articles: hinduizamMeta },
  { key: "islam", articles: islamMeta },
  { key: "istorija", articles: istorijaMeta },
  { key: "ahmedije", articles: ahmedijeMeta },
  { key: "odgovori", articles: odgovoriMeta },
  { key: "opovrgavanje", articles: opovrgavanjeMeta },
  { key: "nauka", articles: naukaMeta },
  { key: "muhammed", articles: muhammedMeta },
  // Both were live routes in App.tsx but absent here, so their articles were
  // neither prerendered nor listed in the sitemap - kuran alone is 55 of them.
  { key: "spisi", articles: spisiMeta },
  { key: "kuran", articles: kuranMeta },
];

function newestDate(dates: string[]): string | undefined {
  const valid = dates
    .map((d) => new Date(d))
    .filter((d) => !Number.isNaN(d.getTime()))
    .sort((a, b) => b.getTime() - a.getTime());

  return valid[0]?.toISOString().slice(0, 10);
}

/**
 * One route per tag in use.
 *
 * Tags became real pages rather than a search query, so they are worth
 * prerendering and indexing like any other listing - each is a hand-curated
 * grouping that no category covers.
 */
function tagRoutes(): Route[] {
  const dates = new Map<string, string[]>();

  for (const { articles } of CATEGORY_META) {
    for (const article of articles) {
      if (isPlaceholderArticle(article)) continue;

      for (const tag of article.tags ?? []) {
        const clean = tag.trim().toLowerCase();
        if (!clean) continue;
        dates.set(clean, [...(dates.get(clean) ?? []), article.date]);
      }
    }
  }

  return [...dates.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([tag, tagDates]) => ({
      path: `/tags/${encodeURIComponent(tag)}`,
      lastmod: newestDate(tagDates),
      priority: 0.4,
      changefreq: "weekly" as const,
    }));
}

export function getAllRoutes(): Route[] {
  const articleRoutes: Route[] = [];
  const categoryRoutes: Route[] = [];

  for (const { key, articles } of CATEGORY_META) {
    for (const article of articles) {
      articleRoutes.push({
        path: `/categories/${key}/article/${article.slug}`,
        lastmod: newestDate([article.date]),
        priority: 0.8,
        changefreq: "monthly",
        // Scaffolding articles are no longer linked from anywhere; keeping them
        // out of the sitemap stops "Test članak" being indexed.
        noIndex: isPlaceholderArticle(article) || undefined,
      });
    }

    const realArticles = articles.filter(
      (article) => !isPlaceholderArticle(article),
    );

    categoryRoutes.push({
      path: `/categories/${key}`,
      lastmod: newestDate(realArticles.map((a) => a.date)),
      priority: 0.7,
      changefreq: "weekly",
    });
  }

  const allDates = CATEGORY_META.flatMap(({ articles }) =>
    articles.filter((a) => !isPlaceholderArticle(a)).map((a) => a.date),
  );

  return [
    { path: "/", lastmod: newestDate(allDates), priority: 1.0, changefreq: "weekly" },
    {
      path: "/categories",
      lastmod: newestDate(allDates),
      priority: 0.9,
      changefreq: "weekly",
    },
    ...categoryRoutes,
    ...articleRoutes,
    { path: "/tags", priority: 0.5, changefreq: "weekly" },
    ...tagRoutes(),
    { path: "/about", priority: 0.4, changefreq: "yearly" },
    { path: "/kontakt", priority: 0.3, changefreq: "yearly" },
    // A giveaway landing page people are meant to find and share.
    { path: "/kuran-cirilica", priority: 0.8, changefreq: "monthly" },
    { path: "/privatnost", priority: 0.1, changefreq: "yearly" },
    { path: "/uslovi", priority: 0.1, changefreq: "yearly" },
    { path: "/kolacici", priority: 0.1, changefreq: "yearly" },
    // Prerendered so the shell loads fast, but a search box is not a landing page.
    { path: "/search", priority: 0.2, changefreq: "monthly", noIndex: true },
  ];
}
