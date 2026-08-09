import ArticlePage from "./ArticlePage";
import { muhammedArticles } from "../lib/muhammedArticles";

/**
 * Thin per-category entry point. It exists only so Vite can split this
 * category's MDX into its own chunk - all the markup lives in ArticlePage.
 */
export default function MuhammedArticlePage() {
  return <ArticlePage categoryId="muhammed" articles={muhammedArticles} />;
}
