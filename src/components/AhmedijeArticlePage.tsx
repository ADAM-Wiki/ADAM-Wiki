import ArticlePage from "./ArticlePage";
import { ahmedijeArticles } from "../lib/ahmedijeArticles";

/**
 * Thin per-category entry point. It exists only so Vite can split this
 * category's MDX into its own chunk - all the markup lives in ArticlePage.
 */
export default function AhmedijeArticlePage() {
  return <ArticlePage categoryId="ahmedije" articles={ahmedijeArticles} />;
}
