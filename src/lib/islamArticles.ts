import { createCategoryArticles } from "./categoryArticles";

export const islamArticles = createCategoryArticles(
  import.meta.glob("/src/content/articles/islam/*.mdx", { eager: true }),
);
