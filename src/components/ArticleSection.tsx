import { motion } from "motion/react";
import { FileText, ArrowRight, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import {
  getLatestArticles,
  formatArticleDate,
  type ArticleCardData,
} from "../utils/articleIndex";

// Newest articles across every category, rather than one per category - which
// previously surfaced the "Test članak" scaffolding from empty categories.
const latestArticles = getLatestArticles(6, 1);

/**
 * Card surfaces use explicit opaque sRGB rather than a white/1% overlay:
 * Tailwind v4 composites alpha in oklab, and a near-black grey only a few
 * levels above the page background picks up a colour cast on wide-gamut and
 * OLED displays.
 */
function LastArticleCard({
  article,
  index,
}: {
  article: ArticleCardData;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        to={article.url}
        className="group block h-full rounded-lg border border-brand-border bg-brand-surface p-8 transition-colors hover:border-brand-border-strong hover:bg-brand-surface-hover"
      >
        <div className="flex items-start gap-4">
          <FileText className="mt-1 h-6 w-6 flex-shrink-0 text-brand-dim transition-colors group-hover:text-brand-accent" />

          <div className="min-w-0 flex-1">
            <span className="mb-2 block font-mono text-xs uppercase tracking-widest text-brand-dim">
              {article.categoryTitle}
            </span>

            <h3 className="text-xl font-medium leading-tight transition-colors group-hover:text-brand-accent">
              {article.title}
            </h3>

            {article.description && (
              <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-brand-dim">
                {article.description}
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] uppercase tracking-widest text-brand-dim transition-colors group-hover:text-brand-accent">
              <span>{formatArticleDate(article.date)}</span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3 w-3" />
                {article.readingTimeMinutes} min
              </span>
              <span>{article.wordCount} reči</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function ArticleSection() {
  if (latestArticles.length === 0) return null;

  return (
    <section className="py-20 border-t border-brand-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-12 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-brand-dim">02</span>
            <h2 className="text-lg uppercase tracking-widest font-medium">
              Poslednje dodano
            </h2>
          </div>

          <Link
            to="/categories"
            className="group flex items-center gap-2 text-sm italic text-brand-dim transition-colors hover:text-brand-heading"
          >
            SVI ČLANCI{" "}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {latestArticles.map((article, index) => (
            <LastArticleCard
              key={`${article.categoryId}-${article.slug}`}
              article={article}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
