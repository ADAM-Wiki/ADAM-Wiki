import { createCategoryArticles } from "./categoryArticles";

export const istorijaArticles = createCategoryArticles(
  import.meta.glob("/src/content/articles/istorija/*.mdx", { eager: true }),
);
