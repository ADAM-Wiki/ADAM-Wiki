import type { ComponentType } from "react";

export interface IslamArticleMeta {
  title: string;
  date: string;
  slug: string;
  category: string;
  tags: string[];
  description: string;
  wordCount?: number;
}

export interface IslamArticleModule {
  default: ComponentType;
  meta: IslamArticleMeta;
}

const modules = import.meta.glob("/src/content/articles/islam/*.mdx", {
  eager: true,
}) as Record<string, IslamArticleModule>;

export function getAllIslamArticles(): IslamArticleMeta[] {
  return Object.values(modules)
    .map((mod) => mod.meta)
    .filter(
      (meta) =>
        !!meta &&
        typeof meta.slug === "string" &&
        typeof meta.title === "string" &&
        typeof meta.date === "string" &&
        typeof meta.category === "string" &&
        typeof meta.description === "string" &&
        Array.isArray(meta.tags),
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getIslamArticleBySlug(slug: string): IslamArticleModule | null {
  for (const mod of Object.values(modules)) {
    if (mod.meta.slug === slug) {
      return mod;
    }
  }

  return null;
}
