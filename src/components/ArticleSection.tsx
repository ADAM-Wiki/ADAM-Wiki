import { motion } from "motion/react";
import { FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { hadisMeta } from "../lib/generated/hadisMeta";
import { hriscanstvoMeta } from "../lib/generated/hriscanstvoMeta";
import { ahmedijeMeta } from "../lib/generated/ahmedijeMeta";
import { ateizamMeta } from "../lib/generated/ateizamMeta";
import { hinduizamMeta } from "../lib/generated/hinduizamMeta";
import { islamMeta } from "../lib/generated/islamMeta";
import { istorijaMeta } from "../lib/generated/istorijaMeta";
import { muhammedMeta } from "../lib/generated/muhammedMeta";
import { naukaMeta } from "../lib/generated/naukaMeta";
import { odgovoriMeta } from "../lib/generated/odgovoriMeta";
import { opovrgavanjeMeta } from "../lib/generated/opovrgavanjeMeta";

interface LatestArticleCardData {
  slug: string;
  title: string;
  category: string;
  url: string;
}

function getLatestArticle<
  T extends { slug: string; title: string; date: string },
>(articles: T[]): T | undefined {
  return [...articles].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )[0];
}

const ARTICLE_SOURCES = [
  {
    articles: hadisMeta,
    category: "Hadis",
    basePath: "/categories/hadis/article",
  },
  {
    articles: hriscanstvoMeta,
    category: "Hrišćanstvo",
    basePath: "/categories/hriscanstvo/article",
  },
  {
    articles: ateizamMeta,
    category: "Ateizam",
    basePath: "/categories/ateizam/article",
  },
  {
    articles: ahmedijeMeta,
    category: "Ahmedije",
    basePath: "/categories/ahmedije/article",
  },
  {
    articles: hinduizamMeta,
    category: "Hinduizam",
    basePath: "/categories/hinduizam/article",
  },
  {
    articles: islamMeta,
    category: "Islam",
    basePath: "/categories/islam/article",
  },
  {
    articles: istorijaMeta,
    category: "Istorija",
    basePath: "/categories/istorija/article",
  },
  {
    articles: muhammedMeta,
    category: "Muhammed",
    basePath: "/categories/muhammed/article",
  },
  {
    articles: naukaMeta,
    category: "Nauka i islam",
    basePath: "/categories/nauka/article",
  },
  {
    articles: odgovoriMeta,
    category: "Odgovori na sumnje",
    basePath: "/categories/odgovori/article",
  },
  {
    articles: opovrgavanjeMeta,
    category: "Opovrgavanje šija",
    basePath: "/categories/opovrgavanje/article",
  },
] as const;

function getLatestArticles(): LatestArticleCardData[] {
  return ARTICLE_SOURCES.map(({ articles, category, basePath }) => {
    const latest = getLatestArticle(articles);
    if (!latest) return null;

    return {
      slug: latest.slug,
      title: latest.title,
      category,
      url: `${basePath}/${latest.slug}`,
    };
  }).filter(Boolean) as LatestArticleCardData[];
}

function LastArticleCard({
  title,
  category,
  onClick,
}: {
  title: string;
  category: string;
  onClick: () => void;
}) {
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
          <h3 className="text-xl font-medium group-hover:text-brand-accent transition-colors leading-tight">
            {title}
          </h3>
        </div>
      </div>
    </motion.div>
  );
}

export default function ArticleSection() {
  const navigate = useNavigate();
  const latestArticles = getLatestArticles();

  if (latestArticles.length === 0) return null;

  return (
    <section className="py-20 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-4 mb-12">
          <span className="text-xs font-mono text-brand-dim">02</span>
          <h2 className="text-lg uppercase tracking-widest font-medium">
            Poslednje dodano
          </h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-1">
          {latestArticles.map((article) => (
            <LastArticleCard
              key={`${article.category}-${article.slug}`}
              title={article.title}
              category={article.category}
              onClick={() => {
                navigate(article.url);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
