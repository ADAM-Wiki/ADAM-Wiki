import ArticlePage from "./ArticlePage";
import { hinduizamArticles } from "../lib/hinduizamArticles";

/**
 * Thin per-category entry point. It exists only so Vite can split this
 * category's MDX into its own chunk - all the markup lives in ArticlePage.
 */
export default function HinduizamArticlePage() {
  return <ArticlePage categoryId="hinduizam" articles={hinduizamArticles} />;
}
