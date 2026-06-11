import type { ComponentType } from "react";

export interface NaukaArticleMeta {
  title: string;
  date: string;
  slug: string;
  category: string;
  tags: string[];
  description: string;
  wordCount?: number;
}

export interface NaukaArticleModule {
  default: ComponentType;
  meta: NaukaArticleMeta;
}

const modules = import.meta.glob("/src/content/articles/nauka/*.mdx", {
  eager: true,
}) as Record<string, NaukaArticleModule>;

export function getAllNaukaArticles(): NaukaArticleMeta[] {
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

export function getNaukaArticleBySlug(slug: string): NaukaArticleModule | null {
  for (const mod of Object.values(modules)) {
    if (mod.meta.slug === slug) {
      return mod;
    }
  }

  return null;
}
