import { createCategoryArticles } from "./categoryArticles";

export const odgovoriArticles = createCategoryArticles(
  import.meta.glob("/src/content/articles/odgovori/*.mdx", { eager: true }),
);
