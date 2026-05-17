import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { kuranArticles } from "../utils/articlesData";

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

export default function KuranArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const article = kuranArticles.find((item) => item.slug === slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!article) {
    return (
      <div className="min-h-screen bg-brand-bg relative selection:bg-brand-accent selection:text-white">
        <Navbar onSearch={() => {}} />
        <main className="pt-20">
          <div className="max-w-7xl mx-auto px-6 py-20 text-center">
            <h1 className="text-3xl font-serif font-medium text-white mb-4">Članak nije pronađen</h1>
            <p className="text-brand-dim mb-8">Traženi članak nije dostupan ili URL nije ispravan.</p>
            <button
              onClick={() => navigate("/kuran")}
              className="px-6 py-3 bg-brand-accent text-white rounded-lg hover:bg-white/10 transition"
            >
              Povratak na Kuran stranicu
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg relative selection:bg-brand-accent selection:text-white">
      <Navbar onSearch={() => {}} />

      <main className="pt-20">
        <section className="py-20 border-t border-white/5">
          <div className="max-w-5xl mx-auto px-6">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-xs font-mono text-brand-dim">KUR'AN</span>
              <h1 className="text-3xl font-serif font-medium">{article.title}</h1>
            </div>

            <div className="flex flex-wrap gap-4 text-[11px] uppercase tracking-widest text-brand-dim font-medium mb-10">
              <span>{formatDate(article.dateCreated)}</span>
              <span>{calculateReadingTime(calculateWordCount(article.content))}</span>
              <span>{calculateWordCount(article.content)} REČI</span>
            </div>

            <div className="prose prose-invert max-w-none space-y-8">
              <p>{article.summary}</p>
              {article.content.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
