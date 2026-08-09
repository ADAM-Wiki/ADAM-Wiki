import ArticlePage from "./ArticlePage";
import { opovrgavanjeArticles } from "../lib/opovrgavanjeArticles";

/**
 * Thin per-category entry point. It exists only so Vite can split this
 * category's MDX into its own chunk - all the markup lives in ArticlePage.
 */
export default function OpovrgavanjeArticlePage() {
  return <ArticlePage categoryId="opovrgavanje" articles={opovrgavanjeArticles} />;
}
