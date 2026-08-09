import { createCategoryArticles } from "./categoryArticles";

export const spisiArticles = createCategoryArticles(
  import.meta.glob("/src/content/articles/spisi/*.mdx", { eager: true }),
);
