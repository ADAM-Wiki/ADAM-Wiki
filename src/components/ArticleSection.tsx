import { motion } from "motion/react";
import { FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { hadisArticles } from '../utils/articlesData';
import { hriscanstvoArticles } from "../utils/articlesData";
// import { hriscanstvoArticles } from '../utils/articlesData'; // add when ready

interface LatestArticle {
  slug: string;
  title: string;
  dateCreated: string;
  category: string;
  basePath: string;
}

// Get the single latest article from each category by date
const getLatestPerCategory = (): LatestArticle[] => {
  const categories = [
    { articles: hadisArticles, category: "Hadis", basePath: "/hadis/article" },
    { articles: hriscanstvoArticles, category: "Hrišćanstvo", basePath: "/hriscanstvo/article" },
    // { articles: hriscanstvoArticles, category: "Hrišćanstvo", basePath: "/hriscanstvo/article" },
    // add more categories here as you create them
  ];

  return categories
    .map(({ articles, category, basePath }) => {
      const latest = [...articles].sort(
        (a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
      )[0];

      if (!latest) return null;

      return {
        slug: latest.slug,
        title: latest.title,
        dateCreated: latest.dateCreated,
        category,
        basePath,
      };
    })
    .filter(Boolean) as LatestArticle[];
};

function LastArticleCard({ title, category, onClick }: { title: string; category: string; onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group cursor-pointer p-8 border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] transition-all"
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        <FileText className="w-6 h-6 text-brand-dim group-hover:text-brand-accent transition-colors mt-1 flex-shrink-0" />
        <div className="flex-1">
          <span className="text-xs font-mono text-brand-dim uppercase tracking-widest mb-2 block">
            {category}
          </span>
          <h3 className="text-xl font-medium :text-brand-accent transition-colors leading-tight">
            {title}
          </h3>
        </div>
      </div>
    </motion.div>
  );
}

export default function ArticleSection() {
  const navigate = useNavigate();
  const latestArticles = getLatestPerCategory();

  if (latestArticles.length === 0) return null;

  return (
    <section className="py-20 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-4 mb-12">
          <span className="text-xs font-mono text-brand-dim">02</span>
          <h2 className="text-lg uppercase tracking-widest font-medium">Poslednje dodano</h2>
        </div>

        <div className="grid md:grid-cols-1lg:grid-cols-3 gap-4">
          {latestArticles.map((article) => (
            <LastArticleCard
              key={article.slug}
              title={article.title}
              category={article.category}
              onClick={() => {
                navigate(`${article.basePath}/${article.slug}`);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}