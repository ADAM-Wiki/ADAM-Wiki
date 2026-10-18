import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { MDXProvider } from "@mdx-js/react";
import { FileDown } from "lucide-react";

import PageShell from "./PageShell";
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
import { formatArticleDate } from "../utils/articleIndex";
import { createHeadingIdAllocator } from "../utils/headingIds";
import type { TocItem } from "../utils/articleTypes";
import type { CategoryArticles } from "../lib/categoryArticles";

interface ArticlePageProps {
  categoryId: string;
  articles: CategoryArticles;
}

const calculateReadingTime = (words: number): string => {
  // 165wpm: theological prose with Arabic insertions reads slower than the
  // 200wpm generic-English default.
  const minutes = Math.max(1, Math.ceil(words / 165));
  return `${minutes} min čitanja`;
};

const truncateDescription = (text: string, maxLength = 155): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}…`;
};

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

  const [activeHeading, setActiveHeading] = useState("");
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [wordCount, setWordCount] = useState(0);
  const [printUnavailable, setPrintUnavailable] = useState(false);

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
    // Fresh per effect run (per article), so the dedup counters reset.
    const nextHeadingId = createHeadingIdAllocator();

    const items = headings.map((heading) => {
      const text = heading.textContent?.trim() ?? "";
      const id = nextHeadingId(text);

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

  /**
   * Print, and notice when nothing happened.
   *
   * window.print() is a no-op in several places a reader of this site plausibly
   * is: Firefox for Android has never implemented it, and the in-app browsers
   * inside Facebook, Instagram and TikTok ignore it - which matters here,
   * because those are the channels the site is shared through. In all of them
   * the button simply did nothing, with no way to tell whether it had worked.
   *
   * There is no reliable way to ask a browser whether it can print, so this
   * watches for the dialog actually opening. Chrome and Firefox announce it
   * with `beforeprint`; Safari instead flips the `print` media query. If
   * neither has happened shortly after the call, nothing opened.
   *
   * Scans stay lazy on screen, but the print preview snapshots whatever is
   * already fetched - hitting the button on arrival printed an article with
   * most photos blank (15 of 52 embedded on one real save). So every
   * not-yet-loaded image is flipped to eager and awaited first, with a 5s cap
   * so a slow network can delay the dialog but never hang the button.
   */
  const handlePrint = async () => {
    const pending = Array.from(
      articleRef.current?.querySelectorAll("img") ?? [],
    ).filter((img) => !img.complete || img.naturalWidth === 0);

    if (pending.length > 0) {
      for (const img of pending) img.loading = "eager";
      await Promise.race([
        Promise.allSettled(pending.map((img) => img.decode())),
        new Promise((resolve) => window.setTimeout(resolve, 5000)),
      ]);
    }

    let opened = false;
    const markOpened = () => {
      opened = true;
    };

    const printQuery = window.matchMedia("print");
    const onQueryChange = (event: MediaQueryListEvent) => {
      if (event.matches) opened = true;
    };

    window.addEventListener("beforeprint", markOpened);
    printQuery.addEventListener?.("change", onQueryChange);

    try {
      window.print();
    } catch {
      // Some embedded browsers throw instead of quietly doing nothing.
    }

    // Desktop browsers block inside print() until the dialog is dismissed, so
    // by the time this is scheduled `opened` is already true there.
    window.setTimeout(() => {
      window.removeEventListener("beforeprint", markOpened);
      printQuery.removeEventListener?.("change", onQueryChange);
      setPrintUnavailable(!opened);
    }, 800);
  };

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
    <PageShell>
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

        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="article-layout grid lg:grid-cols-[300px_1fr] gap-12 items-start">
              <ArticleToc
                tocItems={tocItems}
                activeHeading={activeHeading}
                onActiveChange={setActiveHeading}
              />

              <div className="article-body min-w-0 lg:col-start-2 max-w-prose">
                <header className="mb-12">
                  {/* Its own line: sharing the title's row pushed the title
                      ~60px right of every other block in the column, cut its
                      measure (an extra wrapped line on a phone), and left the
                      label vertically centred against a multi-line title. */}
                  <Link
                    to={categoryUrl}
                    className="mb-3 block text-xs font-mono text-brand-dim transition-colors hover:text-brand-accent print:hidden"
                  >
                    {eyebrow}
                  </Link>
                  <h1 className="mb-6 text-3xl font-serif font-bold text-brand-heading sm:text-4xl">
                    {title}
                  </h1>

                  {/* Provenance only: date + reading time. The raw word count
                      lives on the reading-time tooltip, and saving moved into
                      the share row where "save" naturally sits. */}
                  <div className="flex flex-wrap items-center gap-3 mb-8">
                    <span className="text-[11px] uppercase tracking-widest text-brand-dim font-medium">
                      {formatArticleDate(date)}
                    </span>

                    {/* Same treatment as the date and the word count: with a
                        border and a filled surface it shared the exact chrome
                        of the print button beside it and read as a second
                        control nobody could click. */}
                    <span
                      title={`${wordCount} reči`}
                      className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-brand-dim font-medium"
                    >
                      <svg
                        className="w-3.5 h-3.5"
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
                  </div>

                  {/* Only appears when the browser declined to open the print
                      dialog. The title attribute above is a desktop-only
                      affordance - there is no hover on a phone, which is
                      exactly where this fails. */}
                  {printUnavailable && (
                    <p
                      role="status"
                      className="mb-8 flex items-start gap-2 rounded-lg border border-brand-border bg-brand-surface p-3 text-xs leading-relaxed text-brand-dim print:hidden"
                    >
                      <FileDown aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span>
                        Vaš pregledač ne otvara prozor za štampu. Otvorite ovu
                        stranicu u Chrome-u ili Safari-ju — u meniju pregledača
                        izaberite <strong>Štampaj</strong>, pa{" "}
                        <strong>„Sačuvaj kao PDF“</strong> kao odredište.
                      </span>
                    </p>
                  )}

                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 print:hidden">
                      {tags.map((tag) => (
                        <Link
                          key={tag}
                          to={`/tags/${encodeURIComponent(tag)}`}
                          className="text-xs text-brand-dim border border-brand-border px-3 py-1 rounded-full hover:border-brand-border-strong hover:text-brand-heading transition-colors"
                        >
                          #{tag}
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Print-only TOC: screen TOC is display:none on paper, so a
                      long article prints a compact static outline instead. */}
                  {tocItems.length > 0 && (
                    <nav
                      aria-label="Sadržaj"
                      className="mt-6 hidden print:block"
                    >
                      <p className="mb-2 font-mono text-xs uppercase tracking-widest text-brand-dim">
                        Sadržaj
                      </p>
                      <ol className="list-decimal space-y-1 pl-5 text-sm text-brand-text">
                        {tocItems.map((item) => (
                          <li
                            key={item.id}
                            className={item.level === 3 ? "ml-4" : undefined}
                          >
                            {item.text}
                          </li>
                        ))}
                      </ol>
                    </nav>
                  )}

                  {/* No H2/H3 means no TOC and no mini-map. Fall back to the
                      description as the diamond-marked summary block so short
                      dense articles still open with orientation. */}
                  {tocItems.length === 0 && description && (
                    <div className="mt-8 border-l-4 border-brand-accent px-5 py-1">
                      <div className="mb-2 flex items-center gap-2">
                        <span
                          aria-hidden
                          className="h-1.5 w-1.5 rotate-45 bg-brand-accent"
                        />
                        <span className="font-mono text-xs uppercase tracking-widest text-brand-dim">
                          Sažetak
                        </span>
                      </div>
                      <p className="font-lexend leading-relaxed text-brand-text">
                        {description}
                      </p>
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

                {/* The browser's own print pipeline, not a PDF library:
                    every browser offers "Sačuvaj kao PDF" as a print
                    destination, and going through it keeps the text real
                    text - selectable, searchable, with our diacritics and
                    the Arabic intact. Rasterising the page to a canvas
                    would lose all of that. The printed layout itself lives
                    in @media print in index.css. */}
                <ArticleShare
                  url={articleUrl}
                  title={title}
                  onPrint={handlePrint}
                />

                <ArticlePrevNext
                  basePath={`${categoryUrl}/article`}
                  previous={previousArticle}
                  next={nextArticle}
                  categoryName={category?.label ?? categoryId}
                  position={{
                    index: neighbourIndex + 1,
                    total: orderedArticles.length,
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {relatedArticles.length > 0 && (
          <section className="py-12 border-t border-brand-border print:hidden">
            <div className="max-w-7xl mx-auto px-6">
              <div className="grid lg:grid-cols-[300px_minmax(0,1fr)] gap-12">
                <div className="hidden lg:block" />

                <div>
                  {/* One voice: the rubric sits above the title, never beside
                      it as a competing second heading. */}
                  <p className="mb-3 font-mono text-xs uppercase tracking-widest text-brand-dim">
                    Nastavi čitanje
                  </p>
                  <h2 className="mb-8 text-lg font-serif font-medium text-brand-heading">
                    Povezani članci
                  </h2>

                  <div className="grid md:grid-cols-3 gap-4">
                    {relatedArticles.map((rel, index) => (
                      <Link
                        key={rel.slug}
                        to={`${categoryUrl}/article/${rel.slug}`}
                        className="block p-5 border border-brand-border bg-brand-surface rounded-lg hover:border-brand-border-strong transition-colors group"
                      >
                        {/* Tag-match ranking is otherwise invisible: the top
                            hit carries the single primary recommendation. */}
                        {index === 0 && (
                          <span className="mb-3 inline-block rounded-full bg-brand-accent px-2.5 py-0.5 font-mono text-xs uppercase tracking-widest text-brand-on-accent">
                            Najsličniji
                          </span>
                        )}
                        <h3 className="text-sm font-medium text-brand-heading group-hover:text-brand-accent transition-colors leading-snug mb-2">
                          {rel.title}
                        </h3>

                        {rel.tags && (
                          <div className="flex flex-wrap gap-x-2 mt-3">
                            {rel.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="text-xs text-brand-dim"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
    </PageShell>
  );
}
