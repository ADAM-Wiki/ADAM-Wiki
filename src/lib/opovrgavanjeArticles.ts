import { createCategoryArticles } from "./categoryArticles";

export const opovrgavanjeArticles = createCategoryArticles(
  import.meta.glob("/src/content/articles/opovrgavanje/*.mdx", { eager: true }),
);
