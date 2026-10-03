import ArticlePage from "./ArticlePage";
import { kuranArticles } from "../lib/kuranArticles";

/**
 * Thin per-category entry point. It exists only so Vite can split this
 * category's MDX into its own chunk - all the markup lives in ArticlePage.
 */
export default function KuranArticlePage() {
  return <ArticlePage categoryId="kuran" articles={kuranArticles} />;
}
