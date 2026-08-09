import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import Navbar from "./Navbar";
import Footer from "./Footer";
import BackToTop from "./BackToTop";
import Pagination from "./Pagination";
import NotFoundPage from "./NotFoundPage";
import { SITE_NAME, SITE_URL } from "../utils/siteConfig";
import { getCategoryById } from "../utils/categoriesData";
import { getCategoryListing, formatArticleDate } from "../utils/articleIndex";

const ARTICLES_PER_PAGE = 6;

/**
 * One listing view for every category. The route is /categories/:categoryId,
 * so a new category needs an entry in CATEGORIES and nothing else.
 */
export default function CategoryPage() {
  const { categoryId = "" } = useParams<{ categoryId: string }>();
  const [currentPage, setCurrentPage] = useState(1);
  // Items land one after another rather than all at once. The same .page-rise
  // the category grid on /categories uses, so arriving at a category reads as
  // a continuation of the page you came from. See index.css for why it is CSS
  // and not Motion.
  //
  // Stagger kept short on purpose: this replays on every page change, and a
  // long one turns pagination into a wait.
  const rise = (index: number, extra = "") => ({
    className: `page-rise ${extra}`.trimEnd(),
    style: { animationDelay: `${index * 50}ms` },
  });

  const category = getCategoryById(categoryId);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Reset paging when navigating straight from one category to another.
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryId]);

  if (!category) {
    return <NotFoundPage />;
  }

  const articles = getCategoryListing(categoryId);
  const totalPages = Math.ceil(articles.length / ARTICLES_PER_PAGE);

  const paginatedArticles = articles.slice(
    (currentPage - 1) * ARTICLES_PER_PAGE,
    currentPage * ARTICLES_PER_PAGE,
  );

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pageTitle = `${category.label} | ${SITE_NAME}`;

  return (
    <div className="min-h-screen bg-brand-bg relative selection:bg-brand-accent selection:text-brand-on-accent">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={category.description} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={category.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${SITE_URL}${category.url}`} />
        <meta
          property="og:image"
          content={`${SITE_URL}/images/og-default.png`}
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={category.description} />
      </Helmet>

      <Navbar />

      <main className="pt-20">
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div {...rise(0, "flex items-center gap-4")}>
              <span className="text-xs font-mono text-brand-dim">
                {category.eyebrow}
              </span>
              <h1 className="text-3xl font-serif font-medium">
                Kategorija: {category.label}
              </h1>
            </div>

            <div className="pt-12">
              {paginatedArticles.length > 0 ? (
                // Keyed by page so the stagger replays when you paginate,
                // which is the only signal that the list changed - the grid
                // otherwise looks identical after the scroll to top.
                <div
                  key={currentPage}
                  className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {paginatedArticles.map((article, index) => {
                    const hasWordCount =
                      typeof article.wordCount === "number" &&
                      article.wordCount > 0;

                    return (
                      <div key={article.slug} {...rise(index + 1)}>
                        <Link
                          to={`${category.url}/article/${article.slug}`}
                          className="block h-full p-6 border border-brand-border bg-brand-surface rounded-lg hover:border-brand-border-strong transition-colors cursor-pointer group"
                        >
                          <h2 className="text-lg font-medium mb-3 text-brand-heading group-hover:text-brand-accent transition-colors leading-snug">
                            {article.title}
                          </h2>

                          <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-widest text-brand-dim font-medium">
                            <span>{formatArticleDate(article.date)}</span>
                            {hasWordCount && (
                              <>
                                <span className="text-brand-border">·</span>
                                <span>{article.wordCount} REČI</span>
                                <span className="text-brand-border">·</span>
                                <span>
                                  {article.readingTimeMinutes} MIN ČITANJA
                                </span>
                              </>
                            )}
                          </div>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div
                  {...rise(
                    1,
                    "rounded-lg border border-dashed border-brand-border bg-brand-surface p-10 text-center",
                  )}
                >
                  <p className="text-sm text-brand-text">
                    Još nema objavljenih članaka u ovoj kategoriji.
                  </p>
                  <Link
                    to="/categories"
                    className="mt-4 inline-block font-mono text-xs uppercase tracking-widest text-brand-dim transition-colors hover:text-brand-accent"
                  >
                    Pogledaj sve kategorije
                  </Link>
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div key={currentPage} {...rise(paginatedArticles.length + 1)}>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageClick}
                />
              </div>
            )}
          </div>
        </section>
      </main>

      <BackToTop />
      <Footer />
    </div>
  );
}
