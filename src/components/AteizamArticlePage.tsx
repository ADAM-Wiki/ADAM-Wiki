import ArticlePage from "./ArticlePage";
import { ateizamArticles } from "../lib/ateizamArticles";

/**
 * Thin per-category entry point. It exists only so Vite can split this
 * category's MDX into its own chunk - all the markup lives in ArticlePage.
 */
export default function AteizamArticlePage() {
  return <ArticlePage categoryId="ateizam" articles={ateizamArticles} />;
}
