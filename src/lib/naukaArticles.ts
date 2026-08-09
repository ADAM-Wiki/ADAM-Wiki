import { createCategoryArticles } from "./categoryArticles";

export const naukaArticles = createCategoryArticles(
  import.meta.glob("/src/content/articles/nauka/*.mdx", { eager: true }),
);
