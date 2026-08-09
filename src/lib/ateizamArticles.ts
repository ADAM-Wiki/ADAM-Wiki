import { createCategoryArticles } from "./categoryArticles";

export const ateizamArticles = createCategoryArticles(
  import.meta.glob("/src/content/articles/ateizam/*.mdx", { eager: true }),
);
