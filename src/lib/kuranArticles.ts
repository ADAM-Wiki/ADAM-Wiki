import { createCategoryArticles } from "./categoryArticles";

export const kuranArticles = createCategoryArticles(
  import.meta.glob("/src/content/articles/kuran/*.mdx", { eager: true }),
);
