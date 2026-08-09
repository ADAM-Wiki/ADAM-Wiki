import { createCategoryArticles } from "./categoryArticles";

export const hinduizamArticles = createCategoryArticles(
  import.meta.glob("/src/content/articles/hinduizam/*.mdx", { eager: true }),
);
