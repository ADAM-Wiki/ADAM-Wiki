import ArticlePage from "./ArticlePage";
import { spisiArticles } from "../lib/spisiArticles";

/**
 * Thin per-category entry point. It exists only so Vite can split this
 * category's MDX into its own chunk - all the markup lives in ArticlePage.
 */
export default function SpisiArticlePage() {
  return <ArticlePage categoryId="spisi" articles={spisiArticles} />;
}
