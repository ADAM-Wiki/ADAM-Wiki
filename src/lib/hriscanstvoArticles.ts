import { createCategoryArticles } from "./categoryArticles";

export const hriscanstvoArticles = createCategoryArticles(
  import.meta.glob("/src/content/articles/hriscanstvo/*.mdx", { eager: true }),
);
