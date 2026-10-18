import { useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { FileText } from "lucide-react";

import PageShell from "./PageShell";
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
  // Paging lives in the URL: page 3 of a category is a real address that can be
  // linked and returned to with the back button.
  const [searchParams, setSearchParams] = useSearchParams();
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

  // Paging no longer needs resetting between categories: the page number is a
  // query param, and navigating to another category leaves it behind.

  if (!category) {
    return <NotFoundPage />;
  }

  const articles = getCategoryListing(categoryId);
  const totalPages = Math.max(
    1,
    Math.ceil(articles.length / ARTICLES_PER_PAGE),
  );

  // Clamped, because ?page= is user-editable and arrives from bookmarks.
  const requested = Number(searchParams.get("page")) || 1;
  const currentPage = Math.min(Math.max(1, Math.trunc(requested)), totalPages);

  const paginatedArticles = articles.slice(
    (currentPage - 1) * ARTICLES_PER_PAGE,
    currentPage * ARTICLES_PER_PAGE,
  );
  const isIndexStyle = category.id === "spisi";

  const handlePageClick = (page: number) => {
    // Page 1 is the bare URL rather than ?page=1, so a category keeps one
    // canonical address instead of two that render identically.
    setSearchParams(page === 1 ? {} : { page: String(page) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pageTitle = `${category.label} | ${SITE_NAME}`;

  return (
    <PageShell>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={category.description} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={category.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${SITE_URL}${category.url}`} />
        <meta
          property="og:image"
          content={`${SITE_URL}/images/og-default.jpg`}
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={category.description} />
      </Helmet>

        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            {/* Label above, not beside: beside it indented the title by the
                label's width and let it sit between the title's lines when it
                wrapped - the same row /article used before it moved up. */}
            <div {...rise(0, "mb-4")}>
              <span className="mb-3 block text-xs font-mono text-brand-dim">
                {category.eyebrow}
              </span>
              <h1 className="text-3xl font-serif font-medium text-brand-heading">
                {category.label}
              </h1>
            </div>
            <p
              {...rise(
                1,
                "mb-8 max-w-2xl text-sm leading-relaxed text-brand-dim",
              )}
            >
              {category.description}
            </p>

            {isIndexStyle && (
              <p
                {...rise(
                  2,
                  "mb-12 font-mono text-xs uppercase tracking-widest text-brand-dim",
                )}
              >
                {articles.length} članaka
              </p>
            )}

            <div className={isIndexStyle ? "" : "pt-12"}>
              {paginatedArticles.length > 0 ? (
                isIndexStyle ? (
                  <div
                    key={currentPage}
                    className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                  >
                    {paginatedArticles.map((article, index) => {
                      const hasWordCount =
                        typeof article.wordCount === "number" &&
                        article.wordCount > 0;

                      return (
                        <div key={article.slug} {...rise(index + 1)}>
                          <Link
                            to={`${category.url}/article/${article.slug}`}
                            className={`group flex h-full flex-col rounded-xl border p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-border-strong hover:bg-brand-surface-hover ${
                              index === 0
                                ? "border-brand-accent/40 bg-brand-surface"
                                : "border-brand-border bg-brand-surface/80"
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-md border border-brand-border bg-brand-bg/60 text-brand-dim transition-colors group-hover:border-brand-border-strong group-hover:text-brand-accent">
                                <FileText aria-hidden className="h-4 w-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-3">
                                  <h2 className="min-w-0 text-xs font-medium uppercase tracking-widest text-brand-heading transition-colors group-hover:text-brand-accent">
                                    {article.title}
                                  </h2>
                                  <span className="shrink-0 font-mono text-[11px] text-brand-dim">
                                    {String(index + 1).padStart(2, "0")}
                                  </span>
                                </div>
                                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-brand-dim">
                                  {index === 0 ? "Najnovije" : "Članak"}
                                </p>
                              </div>
                            </div>

                            {article.description && (
                              <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-brand-dim">
                                {article.description}
                              </p>
                            )}

                            <div className="mt-auto flex flex-wrap items-center gap-3 pt-4 text-[10px] font-medium uppercase tracking-widest text-brand-dim">
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
                    key={currentPage}
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
                  >
                    {paginatedArticles.map((article, index) => {
                      const hasWordCount =
                        typeof article.wordCount === "number" &&
                        article.wordCount > 0;

                      return (
                        <div key={article.slug} {...rise(index + 1)}>
                          <Link
                            to={`${category.url}/article/${article.slug}`}
                            className="group flex h-full flex-col rounded-xl border border-brand-border bg-brand-surface/90 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-accent/35 hover:bg-brand-surface"
                          >
                            <div className="mb-3 flex items-center justify-between gap-3 text-[10px] font-mono uppercase tracking-[0.22em] text-brand-dim">
                              <span>{formatArticleDate(article.date)}</span>
                              <span>{String(index + 1).padStart(2, "0")}</span>
                            </div>

                            <h2 className="text-lg font-medium mb-3 text-brand-heading group-hover:text-brand-accent transition-colors leading-snug">
                              {article.title}
                            </h2>

                            {article.description && (
                              <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-brand-dim">
                                {article.description}
                              </p>
                            )}

                            <div className="mt-auto pt-3 border-t border-brand-border/80 text-[10px] uppercase tracking-[0.18em] text-brand-dim">
                              {hasWordCount ? (
                                <span>
                                  {article.wordCount} REČI ·{" "}
                                  {article.readingTimeMinutes} MIN
                                </span>
                              ) : (
                                <span>Članak</span>
                              )}
                            </div>
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                )
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
              <div key={currentPage}>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageClick}
                />
              </div>
            )}
          </div>
        </section>
    </PageShell>
  );
}
