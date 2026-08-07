import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { SITE_NAME } from "../utils/siteConfig";
import BackToTop from "./BackToTop";
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

type TagArticle = {
  slug: string;
  title: string;
  summary: string;
  tags?: string[];
  basePath: string;
};

const ARTICLE_SOURCES = [
  { meta: hadisMeta, basePath: "/categories/hadis/article" },
  { meta: hriscanstvoMeta, basePath: "/categories/hriscanstvo/article" },
  { meta: ahmedijeMeta, basePath: "/categories/ahmedije/article" },
  { meta: ateizamMeta, basePath: "/categories/ateizam/article" },
  { meta: hinduizamMeta, basePath: "/categories/hinduizam/article" },
  { meta: islamMeta, basePath: "/categories/islam/article" },
  { meta: istorijaMeta, basePath: "/categories/istorija/article" },
  { meta: muhammedMeta, basePath: "/categories/muhammed/article" },
  { meta: naukaMeta, basePath: "/categories/nauka/article" },
  { meta: odgovoriMeta, basePath: "/categories/odgovori/article" },
  { meta: opovrgavanjeMeta, basePath: "/categories/opovrgavanje/article" },
] as const;

const ALL_ARTICLES: TagArticle[] = ARTICLE_SOURCES.flatMap(
  ({ meta, basePath }) =>
    meta.map((a) => ({
      slug: a.slug,
      title: a.title,
      summary: a.description,
      tags: a.tags,
      basePath: basePath,
    })),
);

const buildTagMap = () => {
  const map = new Map<string, TagArticle[]>();

  ALL_ARTICLES.forEach((article) => {
    article.tags?.forEach((tag) => {
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
    <div className="min-h-screen bg-brand-bg relative selection:bg-brand-accent selection:text-brand-on-accent">
      <Helmet>
        <title>{`Tagovi | ${SITE_NAME}`}</title>
        <meta name="description" content="Pretražite članke po tagovima." />
      </Helmet>

      <Navbar />

      <main className="pt-20">
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center gap-4 mb-12">
              <span className="text-xs font-mono text-brand-dim">TAGOVI</span>
              <h1 className="text-3xl font-serif font-medium">Svi Tagovi</h1>
            </div>

            <div className="flex flex-wrap gap-3 mb-16">
              {allTags.map((tag) => (
                <a
                  key={tag}
                  href={`#${tag}`}
                  className="px-4 py-2 text-sm border border-brand-border text-brand-dim hover:text-brand-heading hover:border-brand-border-strong rounded-full transition-colors"
                >
                  #{tag}
                  <span className="ml-2 text-xs text-brand-border-strong">
                    {tagMap.get(tag)?.length}
                  </span>
                </a>
              ))}
            </div>

            <div className="space-y-16">
              {allTags.map((tag) => (
                <div
                  key={tag}
                  id={tag}
                  className="border-t border-brand-border pt-10"
                >
                  <h2 className="text-lg font-serif font-medium mb-6 text-brand-heading">
                    #{tag}
                  </h2>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tagMap.get(tag)?.map((article) => (
                      <div
                        key={`${article.basePath}-${article.slug}`}
                        onClick={() =>
                          navigate(`${article.basePath}/${article.slug}`)
                        }
                        className="p-5 border border-brand-border bg-brand-surface rounded-lg hover:border-brand-border-strong transition-all cursor-pointer group"
                      >
                        <h3 className="text-sm font-medium text-brand-heading group-hover:text-brand-accent transition-colors leading-snug">
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

      <BackToTop />
      <Footer />
    </div>
  );
}
