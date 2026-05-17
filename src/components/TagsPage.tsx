import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { SITE_NAME } from "../utils/siteConfig";
import {
  hadisArticles,
  hriscanstvoArticles,
  ateizmaArticles,
} from "../utils/articlesData";

// Combine all articles from all categories
const ALL_ARTICLES = [
  ...hadisArticles.map(a => ({ ...a, basePath: "/hadis/article" })),
  ...hriscanstvoArticles.map(a => ({ ...a, basePath: "/hriscanstvo/article" })),
  ...ateizmaArticles.map(a => ({ ...a, basePath: "/ateizam/article" })),
  // add more as you create them
];

// Build tag → articles map
const buildTagMap = () => {
  const map = new Map<string, typeof ALL_ARTICLES>();
  ALL_ARTICLES.forEach(article => {
    article.tags?.forEach(tag => {
      if (!map.has(tag)) map.set(tag, []);
      map.get(tag)!.push(article);
    });
  });
  return map;
};

export default function TagsPage() {
  const navigate = useNavigate();
  const tagMap = buildTagMap();
  const allTags = Array.from(tagMap.keys()).sort();

  return (
    <div className="min-h-screen bg-brand-bg relative selection:bg-brand-accent selection:text-white">
      <Helmet>
        <title>Tagovi | {SITE_NAME}</title>
        <meta name="description" content="Pretražite članke po tagovima." />
      </Helmet>

      <Navbar onSearch={() => {}} />

      <main className="pt-20">
        <section className="py-20 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6">

            <div className="flex items-center gap-4 mb-12">
              <span className="text-xs font-mono text-brand-dim">TAGOVI</span>
              <h1 className="text-3xl font-serif font-medium">Svi Tagovi</h1>
            </div>

            {/* Tag cloud */}
            <div className="flex flex-wrap gap-3 mb-16">
              {allTags.map(tag => (
                <a
                  key={tag}
                  href={`#${tag}`}
                  className="px-4 py-2 text-sm border border-white/10 text-brand-dim hover:text-white hover:border-white/30 rounded-full transition-colors"
                >
                  #{tag}
                  <span className="ml-2 text-xs text-white/20">
                    {tagMap.get(tag)?.length}
                  </span>
                </a>
              ))}
            </div>

            {/* Articles grouped by tag */}
            <div className="space-y-16">
              {allTags.map(tag => (
                <div key={tag} id={tag} className="border-t border-white/5 pt-10">
                  <h2 className="text-lg font-serif font-medium mb-6 text-white">
                    #{tag}
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tagMap.get(tag)?.map(article => (
                      <div
                        key={article.slug}
                        onClick={() => navigate(`${article.basePath}/${article.slug}`)}
                        className="p-5 border border-white/5 bg-white/[0.01] rounded-lg hover:border-white/20 transition-all cursor-pointer group"
                      >
                        <h3 className="text-sm font-medium text-white group-hover:text-brand-accent transition-colors leading-snug">
                          {article.title}
                        </h3>
                        <p className="text-xs text-brand-dim mt-2 leading-relaxed line-clamp-2">
                          {article.summary}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}