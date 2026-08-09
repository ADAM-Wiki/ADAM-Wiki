import { createCategoryArticles } from "./categoryArticles";

export const ahmedijeArticles = createCategoryArticles(
  import.meta.glob("/src/content/articles/ahmedije/*.mdx", { eager: true }),
);
