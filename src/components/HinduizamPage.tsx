import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Helmet } from "react-helmet-async";
import { SITE_NAME, SITE_URL } from "../utils/siteConfig";
import BackToTop from "./BackToTop";
import {
  hinduizamMeta,
  type GeneratedHinduizamMeta,
} from "../lib/generated/hinduizamMeta";

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return new Intl.DateTimeFormat("sr-Latn-RS", options).format(date);
};

export default function HinduizamPage() {
  const [currentPage, setCurrentPage] = useState(1);

  const articles: GeneratedHinduizamMeta[] = hinduizamMeta;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const ARTICLES_PER_PAGE = 6;
  const totalPages = Math.ceil(articles.length / ARTICLES_PER_PAGE);

  const paginatedArticles = articles.slice(
    (currentPage - 1) * ARTICLES_PER_PAGE,
    currentPage * ARTICLES_PER_PAGE,
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-brand-bg relative selection:bg-brand-accent selection:text-brand-on-accent">
      <Helmet>
        <title>{`Hinduizam | ${SITE_NAME}`}</title>
        <meta name="description" content="Odgovori Hindusima" />
        <meta property="og:title" content={`Hinduizam | ${SITE_NAME}`} />
        <meta property="og:description" content="Odgovori Hindusima" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${SITE_URL}/categories/hinduizam`} />
        <meta
          property="og:image"
          content={`${SITE_URL}/images/og-default.png`}
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Hinduizam | ${SITE_NAME}`} />
        <meta name="twitter:description" content="Odgovori Hindusima" />
      </Helmet>

      <Navbar />

      <main className="pt-20">
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center gap-4 ">
              <span className="text-xs font-mono text-brand-dim">
                HINDUIZAM
              </span>
              <h1 className="text-3xl font-serif font-medium">
                Kategorija: Hinduizam
              </h1>
            </div>

            <div className="prose prose-invert max-w-none">
              <div className="pt-12">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 not-prose">
                  {paginatedArticles.map((article: GeneratedHinduizamMeta) => {
                    const hasWordCount =
                      typeof article.wordCount === "number" &&
                      article.wordCount > 0;
                    const wordCount = article.wordCount;
                    const readingTime = article.readingTimeMinutes;

                    return (
                      <Link
                        key={article.slug}
                        to={`/categories/hinduizam/article/${article.slug}`}
                        className="block p-6 border border-brand-border bg-brand-surface rounded-lg hover:border-brand-border-strong transition-all cursor-pointer group"
                      >
                        <h4 className="text-lg font-medium mb-3 text-brand-heading group-hover:text-brand-accent transition-colors leading-snug">
                          {article.title}
                        </h4>

                        <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-widest text-brand-dim font-medium">
                          <span>{formatDate(article.date)}</span>
                          {hasWordCount && (
                            <>
                              <span className="text-brand-border">·</span>
                              <span>{wordCount} REČI</span>
                              <span className="text-brand-border">·</span>
                              <span>{readingTime} MIN ČITANJA</span>
                            </>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-16 pt-8 border-t border-brand-border not-prose">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-brand-dim hover:text-brand-heading transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>←</span>
                    <span>Prethodna</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => handlePageClick(page)}
                          className={`px-3 py-2 text-sm border rounded transition-colors ${
                            currentPage === page
                              ? "text-brand-heading bg-brand-surface border-brand-border"
                              : "text-brand-dim hover:text-brand-heading border-transparent hover:border-brand-border"
                          }`}
                        >
                          {page}
                        </button>
                      ),
                    )}
                  </div>

                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-brand-dim hover:text-brand-heading transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>Sledeća</span>
                    <span>→</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <BackToTop />
      <Footer />
    </div>
  );
}
