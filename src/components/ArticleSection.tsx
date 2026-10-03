import { motion } from "motion/react";
import { BookOpenText, ArrowRight, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import {
  getLatestArticles,
  formatArticleDate,
  type ArticleCardData,
} from "../utils/articleIndex";

// Newest articles across every category, rather than one per category - which
// previously surfaced the "Test članak" scaffolding from empty categories.
const latestArticles = getLatestArticles(6, 1);

function FeaturedArticleCard({ article }: { article: ArticleCardData }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35 }}
    >
      <Link
        to={article.url}
        className="group block rounded-lg border border-brand-border bg-brand-surface p-5 transition-colors hover:border-brand-border-strong sm:p-8"
      >
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-brand-note-fg">
            Najnoviji tekst
          </span>
          <span aria-hidden className="h-px min-w-6 flex-1 bg-brand-border" />
          <span className="font-mono text-xs uppercase tracking-widest text-brand-accent">
            {article.categoryTitle}
          </span>
        </div>

        <h3 className="mt-5 max-w-5xl font-serif text-3xl leading-tight text-brand-heading transition-colors group-hover:text-brand-accent sm:text-4xl">
          {article.title}
        </h3>
        {article.description && (
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-brand-dim sm:text-base">
            {article.description}
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[10px] uppercase tracking-widest text-brand-dim sm:text-[11px]">
          <span>{formatArticleDate(article.date)}</span>
          <span className="flex items-center gap-1.5">
            <Clock aria-hidden className="h-3 w-3" />
            {article.readingTimeMinutes} min čitanja
          </span>
          <span>{article.wordCount} reči</span>
        </div>
      </Link>
    </motion.div>
  );
}

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
        className="group flex min-h-24 h-full items-start gap-3 rounded-lg border border-brand-border bg-brand-surface p-4 transition-colors hover:border-brand-border-strong hover:bg-brand-surface-hover sm:p-5"
      >
        <BookOpenText
          aria-hidden
          className="mt-1 h-5 w-5 shrink-0 text-brand-dim"
        />

        <div className="min-w-0 flex-1">
          <span className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-brand-dim">
            {article.categoryTitle}
          </span>

          <h3 className="text-sm font-medium leading-snug transition-colors group-hover:text-brand-accent sm:text-base">
            {article.title}
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-widest text-brand-dim">
            <span>{formatArticleDate(article.date)}</span>
            <span className="flex items-center gap-1">
              <Clock aria-hidden className="h-3 w-3" />
              {article.readingTimeMinutes} min
            </span>
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

        <FeaturedArticleCard article={latestArticles[0]} />
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {latestArticles.slice(1).map((article, index) => (
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
