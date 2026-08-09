import ArticlePage from "./ArticlePage";
import { islamArticles } from "../lib/islamArticles";

/**
 * Thin per-category entry point. It exists only so Vite can split this
 * category's MDX into its own chunk - all the markup lives in ArticlePage.
 */
export default function IslamArticlePage() {
  return <ArticlePage categoryId="islam" articles={islamArticles} />;
}
