import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { hadisArticles } from '../utils/articlesData';
import { Helmet } from 'react-helmet-async';
import { SITE_NAME, SITE_URL } from '../utils/siteConfig';
import BackToTop from "./BackToTop";

// Utility functions for automatic calculations
const calculateWordCount = (content: string[]): number => {
  return content.reduce((count, paragraph) => {
    const words = paragraph.trim().split(/\s+/).length;
    return count + words;
  }, 0);
};

const calculateReadingTime = (wordCount: number): string => {
  const wordsPerMinute = 200;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min čitanja`;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" };
  return new Intl.DateTimeFormat("sr-Latn-RS", options).format(date);
};

export default function HadisPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1); // Start on page 1
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

  const ARTICLES_PER_PAGE = 6; // or whatever you use
  const totalPages = Math.ceil(hadisArticles.length / ARTICLES_PER_PAGE);
  // Add this — only show articles for current page
  const paginatedArticles = hadisArticles.slice(
    (currentPage - 1) * ARTICLES_PER_PAGE,
    currentPage * ARTICLES_PER_PAGE
  );

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-brand-bg relative selection:bg-brand-accent selection:text-white">
      
      <Helmet>
      <title>Hadis | {SITE_NAME}</title>
      <meta name="description" content="Islamski hadisi i njihova naučna objašnjenja. Istražite autentične hadise Poslanika Muhammeda s.a.v.s." />
      <meta property="og:title" content={`Hadis | ${SITE_NAME}`} />
      <meta property="og:description" content="Islamski hadisi i njihova naučna objašnjenja." />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={`${SITE_URL}/hadis`} />
      <meta property="og:image" content={`${SITE_URL}/images/og-default.jpg`} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={`Hadis | ${SITE_NAME}`} />
      <meta name="twitter:description" content="Islamski hadisi i njihova naučna objašnjenja." />
    </Helmet>

      <Navbar onSearch={setSearchQuery} />

      <main className="pt-20">
        <section className="py-20 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center gap-4 mb-12">
              <span className="text-xs font-mono text-brand-dim">HADIS</span>
              <h1 className="text-3xl font-serif font-medium">Kategorija: Hadisi</h1>
            </div>

            <div className="prose prose-invert max-w-none">
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="p-6 border border-white/5 bg-white/[0.01] rounded-lg">
                  <h3 className="text-xl font-medium mb-4 text-white">Šta je Hadis?</h3>
                  <p className="text-brand-dim leading-relaxed">
                    Hadis je izvještaj o riječima, postupcima ili odobrenjima Poslanika Muhammeda (s.a.v.s.).
                    Svaki hadis se sastoji od dva dijela: isnada (lanac prenosilaca) i matna (tekst hadisa).
                  </p>
                </div>

                <div className="p-6 border border-white/5 bg-white/[0.01] rounded-lg">
                  <h3 className="text-xl font-medium mb-4 text-white">Vrste Hadisa</h3>
                  <ul className="text-brand-dim space-y-2">
                    <li>• Sahih - Autentični hadisi</li>
                    <li>• Hasan - Dobri hadisi</li>
                    <li>• Da'if - Slabi hadisi</li>
                    <li>• Maudhu' - Izmišljeni hadisi</li>
                  </ul>
                </div>
              </div>

              {/* Hadis Articles/Categories */}
              <div className="border-t border-white/5 pt-12">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedArticles.map((article) => (
                    <div
                      key={article.slug}
                      onClick={() => navigate(`/hadis/article/${article.slug}`)}
                      className="p-6 border border-white/5 bg-white/[0.01] rounded-lg hover:border-white/20 transition-all cursor-pointer group"
                    >
                      <h4 className="text-lg font-medium mb-3 text-white group-hover:text-brand-accent transition-colors">
                        {article.title}
                      </h4>
                      <p className="text-sm text-brand-dim leading-relaxed mb-4">
                        {article.summary}
                      </p>
                      <div className="flex items-center gap-6 text-[10px] uppercase tracking-widest text-brand-dim font-medium">
                        <span>{formatDate(article.dateCreated)}</span>
                        <span>{calculateReadingTime(calculateWordCount(article.content))}</span>
                        <span>{calculateWordCount(article.content)} REČI</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

 {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-16 pt-8 border-t border-white/5">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-brand-dim hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>←</span>
                    <span>Prethodna</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageClick(page)}
                        className={`px-3 py-2 text-sm border rounded transition-colors ${
                          currentPage === page
                            ? "text-white bg-white/10 border-white/10"
                            : "text-brand-dim hover:text-white border-transparent hover:border-white/10"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-brand-dim hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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