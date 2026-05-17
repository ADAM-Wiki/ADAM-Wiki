import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { nemoralArticles } from "../utils/articlesData";

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
  return new Intl.DateTimeFormat("sr-RS", options).format(date);
};

export default function NemoralPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleNextPage = () => {
    if (currentPage < 3) {
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
    <div className="min-h-screen bg-brand-bg relative selection:bg-brand-accent selection:text-white">
      <Navbar onSearch={setSearchQuery} />

      <main className="pt-20">
        <section className="py-20 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center gap-4 mb-12">
              <span className="text-xs font-mono text-brand-dim">NEMORAL</span>
              <h1 className="text-3xl font-serif font-medium">Kategorija: Nemoral</h1>
            </div>

            <div className="prose prose-invert max-w-none">
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="p-6 border border-white/5 bg-white/[0.01] rounded-lg">
                  <h3 className="text-xl font-medium mb-4 text-white">Šta je Nemoral?</h3>
                  <p className="text-brand-dim leading-relaxed">
                    Nemoralnost se odnosi na ponašanja i akcije koje se smatraju etički
                    neprihvatljive. U ovoj kategoriji razmatramo definicije nemoralnosti,
                    njene izvore, i kako se ona manifestuje u različitim kulturama.
                  </p>
                </div>

                <div className="p-6 border border-white/5 bg-white/[0.01] rounded-lg">
                  <h3 className="text-xl font-medium mb-4 text-white">Teme u Kategoriji</h3>
                  <ul className="text-brand-dim space-y-2">
                    <li>• Definicija nemoralnosti</li>
                    <li>• Izvori moralne vrednosti</li>
                    <li>• Moralnost u religiji</li>
                    <li>• Etičke dileme</li>
                  </ul>
                </div>
              </div>

              {/* Articles */}
              <div className="border-t border-white/5 pt-12">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {nemoralArticles.map((article) => (
                    <div
                      key={article.slug}
                      onClick={() => navigate(`/nemoral/article/${article.slug}`)}
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
                  <button
                    onClick={() => handlePageClick(1)}
                    className={`px-3 py-2 text-sm border rounded transition-colors ${
                      currentPage === 1
                        ? 'text-white bg-white/10 border-white/10'
                        : 'text-brand-dim hover:text-white border-transparent hover:border-white/10'
                    }`}
                  >
                    1
                  </button>
                  <button
                    onClick={() => handlePageClick(2)}
                    className={`px-3 py-2 text-sm border rounded transition-colors ${
                      currentPage === 2
                        ? 'text-white bg-white/10 border-white/10'
                        : 'text-brand-dim hover:text-white border-transparent hover:border-white/10'
                    }`}
                  >
                    2
                  </button>
                  <button
                    onClick={() => handlePageClick(3)}
                    className={`px-3 py-2 text-sm border rounded transition-colors ${
                      currentPage === 3
                        ? 'text-white bg-white/10 border-white/10'
                        : 'text-brand-dim hover:text-white border-transparent hover:border-white/10'
                    }`}
                  >
                    3
                  </button>
                </div>

                <button
                  onClick={handleNextPage}
                  disabled={currentPage === 3}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-brand-dim hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Sledeća</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
