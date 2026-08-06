import { motion } from "motion/react";
import { ArrowRight, FolderOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { getCategoryStats } from "../utils/articleIndex";

// Categories with no published articles are kept off the home page; they are
// still reachable from /categories.
const categories = getCategoryStats().filter((category) => category.count > 0);

export default function TopicsGrid() {
  return (
    <section className="py-20 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-brand-dim">01</span>
            <h2 className="text-lg uppercase tracking-widest font-medium">
              Pregledaj kategorije
            </h2>
          </div>
          <Link
            to="/categories"
            className="flex items-center gap-2 text-sm text-brand-dim hover:text-white transition-colors group italic"
          >
            SVE KATEGORIJE{" "}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={category.url}
                className="group flex h-full items-center gap-4 rounded-lg border border-white/5 bg-[#111111] p-5 transition-colors hover:border-white/20 hover:bg-[#171717]"
              >
                <FolderOpen className="w-4 h-4 shrink-0 text-brand-dim group-hover:text-brand-accent transition-colors" />

                <span className="min-w-0 flex-1 text-xs font-medium uppercase tracking-widest transition-colors group-hover:text-white">
                  {category.title}
                </span>

                <span className="shrink-0 font-mono text-xs text-brand-dim transition-colors group-hover:text-brand-accent">
                  {category.count}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
