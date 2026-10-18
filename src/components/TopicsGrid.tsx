import { motion } from "motion/react";
import { ArrowRight, FolderOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { getCategoryStats } from "../utils/articleIndex";

// Categories with no published articles are kept off the home page; they are
// still reachable from /categories.
const categories = getCategoryStats().filter((category) => category.count > 0);

export default function TopicsGrid() {
  return (
    <section className="border-t border-brand-border py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs uppercase tracking-[0.28em] text-brand-dim">
              01
            </span>
            <h2 className="text-lg font-medium uppercase tracking-[0.22em] text-brand-heading">
              Pregledaj kategorije
            </h2>
          </div>
          <Link
            to="/categories"
            className="group flex items-center gap-2 text-sm italic text-brand-dim transition-colors hover:text-brand-heading"
          >
            SVE KATEGORIJE{" "}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((category, index) => {
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.04, duration: 0.25 }}
              >
                <Link
                  to={category.url}
                  className="group flex h-full items-center gap-4 rounded-2xl border border-brand-border bg-brand-surface/80 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-border-strong hover:bg-brand-surface-hover sm:p-5"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand-border bg-brand-bg/60">
                    <FolderOpen
                      aria-hidden
                      className="h-4 w-4 shrink-0 text-brand-dim"
                    />
                  </div>

                  <span className="min-w-0 flex-1 break-words text-xs font-medium uppercase tracking-[0.18em] text-brand-heading transition-colors group-hover:text-brand-accent">
                    {category.title}
                  </span>

                  <span className="shrink-0 font-mono text-xs text-brand-dim transition-colors group-hover:text-brand-accent">
                    {category.count}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
