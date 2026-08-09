import { createCategoryArticles } from "./categoryArticles";

export const hadisArticles = createCategoryArticles(
  import.meta.glob("/src/content/articles/hadis/*.mdx", { eager: true }),
);
