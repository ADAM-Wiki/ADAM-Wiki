import { motion } from "motion/react";
import { FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import BackToTop from "./BackToTop";

export const topics = [
  "AHMEDIJE",
  "ATEIZAM",
  "HADIS",
  "HINDUIZAM",
  "HRIŠĆANSTVO",
  "ISLAM",
  "ISTORIJA",
  "MUHAMMED",
  "NAUKA I ISLAM",
  "ODGOVORI NA SUMNJE",
  "OPOVRGAVANJE SIJA",
];

const CATEGORY_URLS: Record<string, string> = {
  HADIS: "/categories/hadis",
  ATEIZAM: "/categories/ateizam",
  HRIŠĆANSTVO: "/categories/hriscanstvo",
  HINDUIZAM: "/categories/hinduizam",
  ISLAM: "/categories/islam",
  ISTORIJA: "/categories/istorija",
  AHMEDIJE: "/categories/ahmedije",
  "ODGOVORI NA SUMNJE": "/categories/odgovori",
  "OPOVRGAVANJE SIJA": "/categories/opovrgavanje",
  "NAUKA I ISLAM": "/categories/nauka",
  MUHAMMED: "/categories/muhammed",
};

export default function CategoriesPage() {
  const navigate = useNavigate();

  const handleTopicClick = (topic: string) => {
    const route = CATEGORY_URLS[topic] ?? "/categories";
    navigate(route);
  };

  return (
    <div className="min-h-screen bg-brand-bg relative selection:bg-brand-accent selection:text-white">
      <Navbar onSearch={() => {}} />

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
                  className={`group p-5 border border-white/5 hover:border-white/20 hover:bg-white/[0.02] transition-all cursor-pointer flex items-start gap-4 min-h-[50px] ${
                    topic.length > 15 ? "sm:col-span-1" : ""
                  }`}
                  onClick={() => handleTopicClick(topic)}
                >
                  <FileText className="w-5 h-5 text-brand-dim group-hover:text-brand-accent transition-colors" />
                  <span className="text-xs font-medium tracking-widest transition-colors group-hover:text-white uppercase">
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
