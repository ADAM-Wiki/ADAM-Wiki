import ArticlePage from "./ArticlePage";
import { istorijaArticles } from "../lib/istorijaArticles";

/**
 * Thin per-category entry point. It exists only so Vite can split this
 * category's MDX into its own chunk - all the markup lives in ArticlePage.
 */
export default function IstorijaArticlePage() {
  return <ArticlePage categoryId="istorija" articles={istorijaArticles} />;
}
