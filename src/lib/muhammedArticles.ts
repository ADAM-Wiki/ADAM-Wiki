import { createCategoryArticles } from "./categoryArticles";

export const muhammedArticles = createCategoryArticles(
  import.meta.glob("/src/content/articles/muhammed/*.mdx", { eager: true }),
);
