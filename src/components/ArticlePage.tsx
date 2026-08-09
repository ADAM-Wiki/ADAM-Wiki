import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { MDXProvider } from "@mdx-js/react";

import Navbar from "./Navbar";
import Footer from "./Footer";
import BackToTop from "./BackToTop";
import NotFoundPage from "./NotFoundPage";
import ArticleShare from "./ArticleShare";
import ArticlePrevNext from "./ArticlePrevNext";
import ArticleToc from "./ArticleToc";
import { mdxComponents } from "./mdx/MdxComponents";
import { FootnoteProvider, FootnoteList } from "./mdx/Footnotes";
import { useScrollToHash } from "../hooks/useScrollToHash";
import { isSmoothScrolling } from "../utils/smoothScroll";
import { SITE_NAME, SITE_URL } from "../utils/siteConfig";
import { getOgImage } from "../utils/ogImage";
import { getCategoryById } from "../utils/categoriesData";
import type { CategoryArticles } from "../lib/categoryArticles";

type TocItem = {
  id: string;
  text: string;
  level: 2 | 3;
};

interface ArticlePageProps {
  categoryId: string;
  articles: CategoryArticles;
}

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

// Must stay byte-identical to slugifyHeading in scripts/lib/generate-category-meta.ts,
// otherwise search results link to heading ids that do not exist on the page.
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

/**
 * One article view, shared by every category.
 *
 * The category's MDX modules arrive as a prop rather than being resolved here,
 * so each category keeps its own lazily-loaded chunk.
 */
export default function ArticlePage({
  categoryId,
  articles,
}: ArticlePageProps) {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [activeHeading, setActiveHeading] = useState("");
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [wordCount, setWordCount] = useState(0);

  const articleRef = useRef<HTMLElement | null>(null);

  // Jumps to the heading a search result pointed at, once ids are assigned.
  useScrollToHash(tocItems.length > 0);

  const article = slug ? articles.getBySlug(slug) : null;

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
        // A TOC click already picked the destination; without this the
        // highlight walks through every heading the page scrolls past.
        if (isSmoothScrolling()) return;

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

  const category = getCategoryById(categoryId);
  const categoryUrl = `/categories/${categoryId}`;
  const eyebrow = category?.eyebrow ?? categoryId.toUpperCase();

  const ArticleContent = article.default;
  const {
    title,
    description,
    tags = [],
    date,
    slug: articleSlug,
  } = article.meta;
  const metaDescription = truncateDescription(description ?? title);
  const articleUrl = `${SITE_URL}${categoryUrl}/article/${articleSlug}`;
  const ogImage = getOgImage(categoryId, articleSlug);

  const orderedArticles = articles.getAll();

  // Position in the category listing, for the previous/next links.
  const neighbourIndex = orderedArticles.findIndex(
    (item) => item.slug === articleSlug,
  );
  const previousArticle =
    neighbourIndex > 0 ? orderedArticles[neighbourIndex - 1] : null;
  const nextArticle =
    neighbourIndex >= 0 && neighbourIndex < orderedArticles.length - 1
      ? orderedArticles[neighbourIndex + 1]
      : null;

  const others = orderedArticles.filter((item) => item.slug !== articleSlug);

  const related = others
    .map((item) => ({
      ...item,
      matchCount: item.tags?.filter((tag) => tags.includes(tag)).length ?? 0,
    }))
    .filter((item) => item.matchCount > 0)
    .sort((a, b) => b.matchCount - a.matchCount)
    .slice(0, 3);

  const relatedArticles = related.length > 0 ? related : others.slice(0, 3);

  return (
    <div className="min-h-screen bg-brand-bg relative selection:bg-brand-accent selection:text-brand-on-accent">
      <Helmet>
        <title>{`${title} | ${SITE_NAME}`}</title>
        <meta name="description" content={metaDescription} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={articleUrl} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={title} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={ogImage} />
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
                    <Link
                      to={categoryUrl}
                      className="text-xs font-mono text-brand-dim transition-colors hover:text-brand-accent"
                    >
                      {eyebrow}
                    </Link>
                    <h1 className="text-3xl font-serif font-bold text-brand-heading sm:text-4xl">
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
                        <Link
                          key={tag}
                          to={`/search?q=${encodeURIComponent(tag)}`}
                          className="text-xs text-brand-dim border border-brand-border px-3 py-1 rounded-full hover:border-brand-border-strong hover:text-brand-heading transition-colors"
                        >
                          #{tag}
                        </Link>
                      ))}
                    </div>
                  )}
                </header>

                {/* Keyed by slug: footnote numbering is per article and the
                    registry only ever appends. */}
                <FootnoteProvider key={articleSlug}>
                  <article ref={articleRef} className="max-w-none space-y-8">
                    <MDXProvider components={mdxComponents}>
                      <ArticleContent />
                    </MDXProvider>
                  </article>

                  <FootnoteList />
                </FootnoteProvider>

                <ArticleShare url={articleUrl} title={title} />

                <ArticlePrevNext
                  basePath={`${categoryUrl}/article`}
                  previous={previousArticle}
                  next={nextArticle}
                />
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
                    <Link
                      to={categoryUrl}
                      className="text-xs font-mono text-brand-dim transition-colors hover:text-brand-accent"
                    >
                      SLIČNO
                    </Link>
                    <h2 className="text-lg font-serif font-medium text-brand-heading">
                      Povezani članci
                    </h2>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    {relatedArticles.map((rel) => (
                      <div
                        key={rel.slug}
                        onClick={() => {
                          navigate(`${categoryUrl}/article/${rel.slug}`);
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
