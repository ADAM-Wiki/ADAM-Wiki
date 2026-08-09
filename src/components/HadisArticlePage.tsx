import ArticlePage from "./ArticlePage";
import { hadisArticles } from "../lib/hadisArticles";

/**
 * Thin per-category entry point. It exists only so Vite can split this
 * category's MDX into its own chunk - all the markup lives in ArticlePage.
 */
export default function HadisArticlePage() {
  return <ArticlePage categoryId="hadis" articles={hadisArticles} />;
}
