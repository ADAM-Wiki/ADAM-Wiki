import { motion } from "motion/react";
import { FileText, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAllCategories, getCategoryByTitle } from "../utils/searchUtils";

const topics = getAllCategories();

export default function TopicsGrid({ query = "" }: { query?: string }) {
  const navigate = useNavigate();
  const normalizedQuery = query.trim().toLowerCase();
  const filteredTopics = normalizedQuery
    ? topics.filter((topic) => topic.toLowerCase().includes(normalizedQuery))
    : topics;

  const handleTopicClick = (topic: string) => {
    const categoryData = getCategoryByTitle(topic);
    if (categoryData) {
      navigate(categoryData.url);
    } else {
      // Fallback for categories not in search data
      navigate(`/category/${topic.toLowerCase()}`);
    }
  };

  return (
    <section className="py-20 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-brand-dim">01</span>
            <h2 className="text-lg uppercase tracking-widest font-medium">Pregledaj kategorije</h2>
          </div>
          <span
            className="flex items-center gap-2 text-sm text-brand-dim hover:text-white transition-colors group italic cursor-pointer"
            onClick={() => navigate("/categories")}
          >
            SVE KATEGORIJE <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </span>
        </div>

        {filteredTopics.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredTopics.map((topic, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="group p-5 border border-white/5 hover:border-white/20 hover:bg-white/[0.02] transition-all cursor-pointer flex items-center gap-4"
                onClick={() => handleTopicClick(topic)}
              >
                <FileText className="w-4 h-4 shrink-0 mt-0.5 text-brand-dim group-hover:text-brand-accent transition-colors" />
                <span className="text-xs font-medium tracking-widest transition-colors group-hover:text-white uppercase">{topic}</span>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-8 text-center text-sm text-brand-dim">
            Nema rezultata za "{query}".
          </div>
        )}
      </div>
    </section>
  );
}
