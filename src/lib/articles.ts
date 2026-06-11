import type { ComponentType } from "react";

export interface HadisArticleMeta {
  title: string;
  date: string;
  slug: string;
  category: string;
  tags: string[];
  description: string;
}

export interface HadisArticleModule {
  default: ComponentType;
  meta: HadisArticleMeta;
}

const modules = import.meta.glob("/src/content/articles/hadis/*.mdx", {
  eager: true,
}) as Record<string, HadisArticleModule>;

export function getAllHadisArticles(): HadisArticleMeta[] {
  return Object.values(modules)
    .map((mod) => mod.meta)
    .filter(
      (meta): meta is HadisArticleMeta =>
        !!meta &&
        typeof meta.slug === "string" &&
        typeof meta.title === "string" &&
        typeof meta.date === "string" &&
        typeof meta.description === "string" &&
        Array.isArray(meta.tags)
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getHadisArticleBySlug(slug: string): HadisArticleModule | null {
  for (const mod of Object.values(modules)) {
    if (mod?.meta?.slug === slug) {
      return mod;
    }
  }

  return null;
}