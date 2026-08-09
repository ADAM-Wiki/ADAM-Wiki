import ArticlePage from "./ArticlePage";
import { hriscanstvoArticles } from "../lib/hriscanstvoArticles";

/**
 * Thin per-category entry point. It exists only so Vite can split this
 * category's MDX into its own chunk - all the markup lives in ArticlePage.
 */
export default function HriscanstvoArticlePage() {
  return <ArticlePage categoryId="hriscanstvo" articles={hriscanstvoArticles} />;
}
