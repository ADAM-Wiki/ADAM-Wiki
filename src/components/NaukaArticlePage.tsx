import ArticlePage from "./ArticlePage";
import { naukaArticles } from "../lib/naukaArticles";

/**
 * Thin per-category entry point. It exists only so Vite can split this
 * category's MDX into its own chunk - all the markup lives in ArticlePage.
 */
export default function NaukaArticlePage() {
  return <ArticlePage categoryId="nauka" articles={naukaArticles} />;
}
