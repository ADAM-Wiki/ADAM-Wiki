import { motion } from "motion/react";
import { FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import BackToTop from "./BackToTop";

export const topics = [
  "HADIS", "ATEIZAM", "HRIŠĆANSTVO", "HINDUIZAM",
  "ŠERIJAT", "KUR`AN", "RAVNA ZEMLJA", "NEMORAL",
  "ISLAM", "HADISKE NAUKE", "HINDUIZAM", "ISTORIJA ARAPA",
  "ISLAMSKO OSVAJANJE NAKON POSLANIKA", "AHMEDIJE", 
  "OPOVRGAVANJE SIJA", "MUHAMMED"
];

const routeMap: Record<string, string> = {
  "HRIŠĆANSTVO": "/hriscanstvo",
  "KUR`AN": "/kuran",
  "ŠERIJAT": "/seriat",
  "RAVNA ZEMLJA": "/ravna-zemlja",
  "HADISKE NAUKE": "/hadiske-nauke",
  "ISLAMSKO OSVAJANJE NAKON POSLANIKA": "/islamsko-osvajanje",
  "ISTORIJA ARAPA": "/istorija-arapa",
  "OPOVRGAVANJE SIJA": "/opovrgavanje-sija"
};

export default function CategoriesPage() {
  const navigate = useNavigate();

  const handleTopicClick = (topic: string) => {
    const route = routeMap[topic] || `/${topic.toLowerCase()}`;
    navigate(route);
  };

  return (
    <div className="min-h-screen bg-brand-bg relative selection:bg-brand-accent selection:text-white">
      <Navbar onSearch={() => {}} />

      <main className="pt-20">
        <section className="py-20 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center gap-4 mb-12">
              <span className="text-xs font-mono text-brand-dim">02</span>
              <h1 className="text-3xl font-serif font-medium">Sve kategorije</h1>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {topics.map((topic, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="group p-5 border border-white/5 hover:border-white/20 hover:bg-white/[0.02] transition-all cursor-pointer flex items-center gap-4"
                  onClick={() => handleTopicClick(topic)}
                >
                  <FileText className="w-4 h-4 text-brand-dim group-hover:text-brand-accent transition-colors" />
                  <span className="text-xs font-medium tracking-widest transition-colors group-hover:text-white uppercase">{topic}</span>
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