import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useScrollToHash } from "../hooks/useScrollToHash";
import { Helmet } from "react-helmet-async";
import { Link as LinkIcon } from "lucide-react";
import { MDXProvider } from "@mdx-js/react";

import Navbar from "./Navbar";
import Footer from "./Footer";
import BackToTop from "./BackToTop";
import NotFoundPage from "./NotFoundPage";
import { SITE_NAME, SITE_URL } from "../utils/siteConfig";
import { getOgImage } from "../utils/ogImage";
import {
  getIstorijaArticleBySlug,
  getAllIstorijaArticles,
} from "../lib/istorijaArticles";
import { mdxComponents } from "./mdx/MdxComponents";
import ArticleToc from "./ArticleToc";

type TocItem = {
  id: string;
  text: string;
  level: 2 | 3;
};

const calculateReadingTime = (words: number): string => {
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min čitanja`;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("sr-Latn-RS", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
};

const truncateDescription = (text: string, maxLength = 155): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}...`;
};

const slugifyHeading = (text: string): string =>
  text
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "dj")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export default function IstorijaArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [copied, setCopied] = useState(false);
  const [activeHeading, setActiveHeading] = useState("");
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [wordCount, setWordCount] = useState(0);

  const articleRef = useRef<HTMLElement | null>(null);

  // Jumps to the heading a search result pointed at, once ids are assigned.
  useScrollToHash(tocItems.length > 0);

  const article = slug ? getIstorijaArticleBySlug(slug) : null;

  useEffect(() => {
    // A hash targets a specific heading; useScrollToHash takes over there.
    if (window.location.hash) return;
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    if (!articleRef.current) return;

    const headings = Array.from(articleRef.current.querySelectorAll("h2, h3"));
    const counts: Record<string, number> = {};

    const items = headings.map((heading) => {
      const text = heading.textContent?.trim() ?? "";
      const baseId = slugifyHeading(text);
      const count = counts[baseId] ?? 0;
      counts[baseId] = count + 1;
      const id = count === 0 ? baseId : `${baseId}-${count}`;

      heading.id = id;

      return {
        id,
        text,
        level: heading.tagName === "H3" ? 3 : 2,
      } as TocItem;
    });

    const articleText = articleRef.current.textContent?.trim() ?? "";
    const words = articleText
      ? articleText.split(/\s+/).filter(Boolean).length
      : 0;

    setTocItems(items);
    setWordCount(words);
  }, [article?.meta.slug]);

  useEffect(() => {
    if (tocItems.length > 0) {
      setActiveHeading(tocItems[0].id);
    } else {
      setActiveHeading("");
    }
  }, [tocItems]);

  useEffect(() => {
    if (!tocItems.length) return;

    const headingElements = tocItems
      .map((item) => document.getElementById(item.id))
      .filter(Boolean) as HTMLElement[];

    if (!headingElements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((e) => e.isIntersecting);

        if (visibleEntries.length > 0) {
          const topEntry = visibleEntries.reduce((prev, curr) =>
            prev.boundingClientRect.top < curr.boundingClientRect.top
              ? prev
              : curr,
          );
          setActiveHeading(topEntry.target.id);
        }
      },
      {
        rootMargin: "-100px 0px -60% 0px",
        threshold: 0,
      },
    );

    headingElements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [tocItems]);

  if (!article) {
    return <NotFoundPage />;
  }

  const ArticleContent = article.default;
  const {
    title,
    description,
    tags = [],
    date,
    slug: articleSlug,
  } = article.meta;
  const metaDescription = truncateDescription(description ?? title);
  const articleUrl = `${SITE_URL}/categories/istorija/article/${articleSlug}`;

  const related = getAllIstorijaArticles()
    .filter((item) => item.slug !== articleSlug)
    .map((item) => ({
      ...item,
      matchCount: item.tags?.filter((tag) => tags.includes(tag)).length ?? 0,
    }))
    .filter((item) => item.matchCount > 0)
    .sort((a, b) => b.matchCount - a.matchCount)
    .slice(0, 3);

  const fallbackRelated = getAllIstorijaArticles()
    .filter((item) => item.slug !== articleSlug)
    .slice(0, 3);

  const relatedArticles = related.length > 0 ? related : fallbackRelated;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(articleUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`${title} — ${articleUrl}`);
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-brand-bg relative selection:bg-brand-accent selection:text-brand-on-accent">
      <Helmet>
        <title>{`${title} | ${SITE_NAME}`}</title>
        <meta name="description" content={metaDescription} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={articleUrl} />
        <meta
          property="og:image"
          content={getOgImage("istorija", articleSlug)}
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={title} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={metaDescription} />
        <meta
          name="twitter:image"
          content={getOgImage("istorija", articleSlug)}
        />
      </Helmet>

      <Navbar />

      <main className="pt-20">
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-[300px_1fr] gap-12 items-start">
              <ArticleToc
                tocItems={tocItems}
                activeHeading={activeHeading}
                onActiveChange={setActiveHeading}
              />

              <div className="min-w-0 lg:col-start-2 max-w-prose">
                <header className="mb-12">
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-xs font-mono text-brand-dim">
                      ISTORIJA
                    </span>
                    <h1 className="text-3xl font-serif font-bold text-brand-heading">
                      {title}
                    </h1>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mb-8">
                    <span className="text-[11px] uppercase tracking-widest text-brand-dim font-medium">
                      {formatDate(date)}
                    </span>

                    <span className="text-brand-border">·</span>

                    <span className="flex items-center gap-1.5 px-3 py-1 bg-brand-surface border border-brand-border rounded-full text-xs font-medium text-brand-heading">
                      <svg
                        className="w-3.5 h-3.5 opacity-60"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      {calculateReadingTime(wordCount)}
                    </span>

                    <span className="text-brand-border">·</span>

                    <span className="text-[11px] uppercase tracking-widest text-brand-dim font-medium">
                      {wordCount} REČI
                    </span>
                  </div>

                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => navigate(`/tags#${tag}`)}
                          className="text-xs text-brand-dim border border-brand-border px-3 py-1 rounded-full hover:border-brand-border-strong hover:text-brand-heading transition-colors cursor-pointer"
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  )}
                </header>

                <article ref={articleRef} className="max-w-none space-y-8">
                  <MDXProvider components={mdxComponents}>
                    <ArticleContent />
                  </MDXProvider>
                </article>

                <div className="mt-16 pt-8 border-t border-brand-border flex flex-wrap items-center gap-4">
                  <span className="text-xs font-mono text-brand-dim uppercase tracking-widest">
                    Podeli
                  </span>

                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="flex items-center gap-2 px-4 py-2 text-sm border border-brand-border text-brand-dim hover:text-brand-heading hover:border-brand-border-strong rounded-lg transition-colors"
                  >
                    {copied ? (
                      <>
                        <span>✓</span>
                        <span>Kopirano</span>
                      </>
                    ) : (
                      <>
                        <LinkIcon className="w-4 h-4" />
                        <span>Kopiraj link</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleWhatsApp}
                    className="flex items-center gap-2 px-4 py-2 text-sm border border-brand-border text-brand-dim hover:text-brand-heading hover:border-brand-border-strong rounded-lg transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.114.554 4.1 1.523 5.828L.057 23.428a.75.75 0 00.916.916l5.6-1.466A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.891 0-3.667-.502-5.198-1.38l-.374-.217-3.878 1.016 1.017-3.772-.232-.386A9.956 9.956 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                    </svg>
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {relatedArticles.length > 0 && (
          <section className="py-12 border-t border-brand-border">
            <div className="max-w-7xl mx-auto px-6">
              <div className="grid lg:grid-cols-[240px_minmax(0,1fr)] gap-12">
                <div className="hidden lg:block" />

                <div>
                  <div className="flex items-center gap-4 mb-8">
                    <span className="text-xs font-mono text-brand-dim">
                      SLIČNO
                    </span>
                    <h2 className="text-lg font-serif font-medium text-brand-heading">
                      Povezani članci
                    </h2>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    {relatedArticles.map((rel) => (
                      <div
                        key={rel.slug}
                        onClick={() => {
                          navigate(`/categories/istorija/article/${rel.slug}`);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="p-5 border border-brand-border bg-brand-surface rounded-lg hover:border-brand-border-strong transition-all cursor-pointer group"
                      >
                        <h3 className="text-sm font-medium text-brand-heading group-hover:text-brand-accent transition-colors leading-snug mb-2">
                          {rel.title}
                        </h3>

                        {rel.tags && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {rel.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="text-[10px] text-brand-dim border border-brand-border px-2 py-0.5 rounded-full"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <BackToTop />
      <Footer />
    </div>
  );
}
