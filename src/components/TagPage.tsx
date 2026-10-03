import { useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Clock, FileText } from "lucide-react";

import Navbar from "./Navbar";
import Footer from "./Footer";
import BackToTop from "./BackToTop";
import Pagination from "./Pagination";
import { SITE_NAME, SITE_URL } from "../utils/siteConfig";
import {
  getArticlesByTag,
  getTagCounts,
  formatArticleDate,
} from "../utils/articleIndex";

const ARTICLES_PER_PAGE = 12;

/** Serbian counts: 1 članak, 2-4 članka, 5+ članaka. */
function articleCount(n: number): string {
  const lastTwo = n % 100;
  const last = n % 10;

  if (lastTwo >= 11 && lastTwo <= 14) return `${n} članaka`;
  if (last === 1) return `${n} članak`;
  if (last >= 2 && last <= 4) return `${n} članka`;
  return `${n} članaka`;
}

/**
 * Everything filed under one tag.
 *
 * Tags used to link at /search?q=<tag>, which ran a full-text search rather
 * than a tag filter - so the "kuran" tag, on 112 articles, returned two hits.
 * This reads the tag straight off each article's frontmatter, so the count in
 * the cloud and the list you land on are the same number by construction.
 */
export default function TagPage() {
  const { tag = "" } = useParams<{ tag: string }>();
  const decoded = decodeURIComponent(tag);

  // Paging lives in the URL, so page 3 of a tag can be linked, bookmarked and
  // reached with the back button. As component state it was invisible to all
  // three - the address bar said the same thing on every page of the list.
  const [searchParams, setSearchParams] = useSearchParams();

  const articles = getArticlesByTag(decoded);
  const totalPages = Math.max(
    1,
    Math.ceil(articles.length / ARTICLES_PER_PAGE),
  );

  // Clamped, because ?page= is user-editable and arrives from bookmarks.
  const requested = Number(searchParams.get("page")) || 1;
  const currentPage = Math.min(Math.max(1, Math.trunc(requested)), totalPages);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [decoded]);

  const goToPage = (page: number) => {
    // Page 1 is the bare URL rather than ?page=1, so a tag has one canonical
    // address instead of two that render identically.
    setSearchParams(page === 1 ? {} : { page: String(page) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const paginated = articles.slice(
    (currentPage - 1) * ARTICLES_PER_PAGE,
    currentPage * ARTICLES_PER_PAGE,
  );

  // Tags that most often appear alongside this one - the natural next step
  // when the list in front of you is not quite what you wanted.
  const related = (() => {
    const counts = new Map<string, number>();

    for (const article of articles) {
      for (const other of article.tags ?? []) {
        const clean = other.trim().toLowerCase();
        if (!clean || clean === decoded.toLowerCase()) continue;
        counts.set(clean, (counts.get(clean) ?? 0) + 1);
      }
    }

    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }));
  })();

  const pageTitle = `#${decoded} | ${SITE_NAME}`;
  const description = articles.length
    ? `${articleCount(articles.length)} sa temom „${decoded}“.`
    : `Nema članaka sa tagom „${decoded}“.`;

  if (articles.length === 0) {
    // An unknown or unused tag is a dead end, so it offers the way back rather
    // than an empty list. The most used tags come along as a starting point.
    const popular = getTagCounts().slice(0, 12);

    return (
      <div className="page-no-grid min-h-screen bg-brand-bg selection:bg-brand-accent selection:text-brand-on-accent">
        <Helmet>
          <title>{pageTitle}</title>
          <meta name="description" content={description} />
          <meta name="robots" content="noindex" />
        </Helmet>

        <Navbar />

        <main id="glavni-sadrzaj" tabIndex={-1} className="pt-24 pb-20">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <span className="font-mono text-xs uppercase tracking-widest text-brand-dim">
              TAG
            </span>
            <h1 className="mt-2 font-serif text-3xl font-medium text-brand-heading">
              #{decoded}
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-brand-dim">
              Nema članaka sa ovim tagom.
            </p>

            <div className="mt-10 border-t border-brand-border pt-8">
              <p className="font-mono text-[10px] uppercase tracking-widest text-brand-dim">
                Najčešći tagovi
              </p>

              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {popular.map(({ tag: name, count }) => (
                  <Link
                    key={name}
                    to={`/tags/${encodeURIComponent(name)}`}
                    className="group flex items-center gap-2 rounded-lg border border-brand-border bg-brand-surface px-3 py-1.5 text-sm text-brand-text transition-colors hover:border-brand-border-strong hover:text-brand-heading"
                  >
                    {name}
                    <span className="font-mono text-[10px] text-brand-dim transition-colors group-hover:text-brand-accent">
                      {count}
                    </span>
                  </Link>
                ))}
              </div>

              <Link
                to="/tags"
                className="mt-8 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-brand-dim transition-colors hover:text-brand-accent"
              >
                <ArrowLeft aria-hidden className="h-3 w-3 shrink-0" />
                Svi tagovi
              </Link>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="page-no-grid min-h-screen bg-brand-bg selection:bg-brand-accent selection:text-brand-on-accent">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content={`${SITE_URL}/tags/${encodeURIComponent(decoded)}`}
        />
      </Helmet>

      <Navbar />

      <main id="glavni-sadrzaj" tabIndex={-1} className="pt-24 pb-20">
        <div className="mx-auto max-w-5xl px-6">
          <header className="text-center">
            <Link
              to="/tags"
              className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-brand-dim transition-colors hover:text-brand-accent"
            >
              <ArrowLeft aria-hidden className="h-3 w-3 shrink-0" />
              Svi tagovi
            </Link>

            <h1 className="mt-3 font-serif text-3xl font-medium text-brand-heading">
              #{decoded}
            </h1>

            <p className="mt-4 flex flex-wrap items-baseline justify-center gap-x-3 font-mono text-xs uppercase tracking-widest text-brand-dim">
              <span className="font-serif text-2xl tracking-normal text-brand-accent">
                {articles.length}
              </span>
              {articleCount(articles.length).replace(/^\d+\s/, "")}
            </p>
          </header>

          {related.length > 0 && (
            <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-brand-dim">
                Uz ovaj tag
              </span>
              {related.map(({ name, count }) => (
                <Link
                  key={name}
                  to={`/tags/${encodeURIComponent(name)}`}
                  className="group flex items-center gap-1.5 rounded-full border border-brand-border bg-brand-surface px-3 py-1.5 text-xs text-brand-dim transition-colors hover:border-brand-accent hover:text-brand-accent"
                >
                  {name}
                  <span className="font-mono text-[10px] text-brand-dim/70">
                    {count}
                  </span>
                </Link>
              ))}
            </div>
          )}

          <div
            key={currentPage}
            className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          >
            {paginated.map((article, index) => (
              <div
                key={`${article.categoryId}-${article.slug}`}
                className="page-rise"
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <Link
                  to={article.url}
                  className="group flex h-full flex-col rounded-lg border border-brand-border bg-brand-surface p-5 transition-colors hover:border-brand-border-strong hover:bg-brand-surface-hover"
                >
                  <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-brand-dim">
                    <FileText aria-hidden className="h-3 w-3 shrink-0" />
                    {article.categoryTitle}
                  </span>

                  <h2 className="mt-2 text-base font-medium leading-snug text-brand-heading transition-colors group-hover:text-brand-accent">
                    {article.title}
                  </h2>

                  {article.description && (
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-brand-dim">
                      {article.description}
                    </p>
                  )}

                  <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-4 font-mono text-[10px] uppercase tracking-widest text-brand-dim">
                    <span>{formatArticleDate(article.date)}</span>
                    <span className="flex items-center gap-1.5">
                      <Clock aria-hidden className="h-3 w-3 shrink-0" />
                      {article.readingTimeMinutes} min
                    </span>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={goToPage}
            />
          )}
        </div>
      </main>

      <BackToTop />
      <Footer />
    </div>
  );
}
