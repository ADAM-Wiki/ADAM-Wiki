import ArticlePage from "./ArticlePage";
import { odgovoriArticles } from "../lib/odgovoriArticles";

/**
 * Thin per-category entry point. It exists only so Vite can split this
 * category's MDX into its own chunk - all the markup lives in ArticlePage.
 */
export default function OdgovoriArticlePage() {
  return <ArticlePage categoryId="odgovori" articles={odgovoriArticles} />;
}
