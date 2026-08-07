import { motion } from "motion/react";
import { FileText, FolderOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import BackToTop from "./BackToTop";
import { CATEGORIES } from "../utils/categoriesData";

// Single source of truth, so a renamed category cannot drift between this page
// and the home grid.
const topics = CATEGORIES.map((category) => category.title);

const CATEGORY_URLS: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((category) => [category.title, category.url]),
);

export default function CategoriesPage() {
  const navigate = useNavigate();

  const handleTopicClick = (topic: string) => {
    const route = CATEGORY_URLS[topic] ?? "/categories";
    navigate(route);
  };

  return (
    <div className="min-h-screen bg-brand-bg relative selection:bg-brand-accent selection:text-brand-on-accent">
      <Navbar />

      <main className="pt-20">
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center gap-4 mb-12">
              <span className="text-xs font-mono text-brand-dim">01</span>
              <h1 className="text-3xl font-serif font-medium">
                Sve kategorije
              </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {topics.map((topic, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className={`group p-5 rounded-lg border border-brand-border bg-brand-surface hover:border-brand-border-strong hover:bg-brand-surface-hover transition-colors cursor-pointer flex items-start gap-4 min-h-[50px] ${
                    topic.length > 15 ? "sm:col-span-1" : ""
                  }`}
                  onClick={() => handleTopicClick(topic)}
                >
                  <FolderOpen className="w-5 h-5 text-brand-dim group-hover:text-brand-accent transition-colors" />
                  <span className="text-xs font-medium tracking-widest transition-colors group-hover:text-brand-heading uppercase">
                    {topic}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <BackToTop />
      <Footer />
    </div>
  );
}
