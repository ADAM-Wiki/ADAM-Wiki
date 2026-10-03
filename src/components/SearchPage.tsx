import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import type { SearchResult, SearchSnippet } from "../utils/searchShared";
import { highlightText } from "../utils/highlight";
import {
  Search,
  X,
  Loader2,
  FileText,
  FolderOpen,
  CornerDownRight,
  Clock,
  Hash,
  Trash2,
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "motion/react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { SITE_NAME } from "../utils/siteConfig";
import { useSearch } from "../hooks/useSearch";
import { useRecentSearches } from "../hooks/useRecentSearches";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { getTotalArticleCount, getTagCounts } from "../utils/articleIndex";

const totalArticleCount = getTotalArticleCount();

/** Computed once at module load; the tag list is static per build. */
const popularTags = getTagCounts().slice(0, 12);

const CATEGORY_LABELS: Record<string, string> = {
  hadis: "Hadiske nauke",
  hriscanstvo: "Hrišćanstvo",
  ahmedije: "Ahmedije",
  ateizam: "Ateizam",
  hinduizam: "Hinduizam",
  islam: "Islam",
  istorija: "Istorija",
  muhammed: "Muhammed",
  nauka: "Nauka",
  odgovori: "Odgovori",
  opovrgavanje: "Opovrgavanje",
};

function getCategoryLabel(url: string): string {
  const segment = url.split("/")[2];
  return CATEGORY_LABELS[segment] ?? segment;
}

/** Serbian counts: 1 rezultat, 2-4 rezultata, 5+ rezultata. */
function resultNoun(n: number): string {
  const lastTwo = n % 100;
  if (lastTwo >= 11 && lastTwo <= 14) return "rezultata";
  const last = n % 10;
  if (last === 1) return "rezultat";
  if (last >= 2 && last <= 4) return "rezultata";
  return "rezultata";
}

export default function SearchPage() {
  // Seeded from ?q= so the home page search box can hand off a query.
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";

  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mobilePreview, setMobilePreview] = useState<SearchResult | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { results, totalArticles, search, clear, isReady, isSearching } =
    useSearch();
  const { recent, remember, clearRecent } = useRecentSearches();

  useFocusTrap(Boolean(mobilePreview), sheetRef);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Desktop only. On a phone this threw up the on-screen keyboard the instant
    // the page opened, covering the results the visitor came to read - and it
    // fired on every arrival, including the back button.
    if (window.matchMedia("(min-width: 768px)").matches) {
      const timer = window.setTimeout(() => inputRef.current?.focus(), 100);
      return () => window.clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (!mobilePreview) return;

    // Restore what was there rather than "", which threw away the value the
    // navbar's own menu had saved when both were open at once.
    const previousBody = document.body.style.overflow;
    const previousRoot = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBody;
      document.documentElement.style.overflow = previousRoot;
    };
  }, [mobilePreview]);

  // The sheet covers the input, whose own onKeyDown handles Escape everywhere
  // else, so it needs its own listener to be dismissible from the keyboard.
  useEffect(() => {
    if (!mobilePreview) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobilePreview(null);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobilePreview]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), 200);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const trimmed = debouncedQuery.trim();

    if (!trimmed) {
      clear();
      setMobilePreview(null);
      return;
    }

    search(trimmed);
  }, [debouncedQuery, search, clear]);

  const handleClear = useCallback(() => {
    setQuery("");
    setDebouncedQuery("");
    clear();
    setMobilePreview(null);
    inputRef.current?.focus();
  }, [clear]);

  const articleResults = useMemo(
    () => results.filter((r) => r.type === "article"),
    [results],
  );
  const categoryResults = useMemo(
    () => results.filter((r) => r.type !== "article"),
    [results],
  );

  const isLoading = query.trim().length > 0 && (!isReady || isSearching);
  const hasQuery = query.trim().length > 0;
  const isCapped = totalArticles > articleResults.length;

  // A new result set invalidates the old selection.
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  const previewResult =
    articleResults[selectedIndex] ?? articleResults[0] ?? null;
  const activeMobilePreview = mobilePreview;

  // Opening something is what marks a query as worth remembering. Storing the
  // debounced query instead would fill the history with every prefix typed on
  // the way to it - "h", "ha", "had", "hadis".
  const openResult = useCallback(
    (result: SearchResult) => {
      remember(query);
      navigate(result.url);
    },
    [navigate, remember, query],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Escape") {
        handleClear();
        return;
      }

      if (!articleResults.length) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % articleResults.length);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedIndex(
          (prev) => (prev - 1 + articleResults.length) % articleResults.length,
        );
      } else if (event.key === "Enter") {
        event.preventDefault();
        const target = articleResults[selectedIndex];
        if (target) openResult(target);
      }
    },
    [articleResults, selectedIndex, openResult, handleClear],
  );

  // Keep the keyboard selection inside the scrollable result list.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const active = list.querySelector<HTMLElement>('[data-selected="true"]');
    active?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  const toSnippets = (result: SearchResult | null): SearchSnippet[] => {
    if (!result) return [];
    if (result.snippets?.length) return result.snippets;

    const fallback = result.snippet ?? result.excerpt;
    return fallback ? [{ text: fallback, headingId: "", headingText: "" }] : [];
  };

  const displaySnippets = toSnippets(previewResult);

  const displayMatchCount =
    previewResult?.matchCount && previewResult.matchCount > 0
      ? previewResult.matchCount
      : displaySnippets.length;

  // Highlighting walks every snippet character, so it is memoised rather than
  // recomputed on each render (selection changes re-render this component).
  const highlightedTitle = useMemo(
    () => (previewResult ? highlightText(previewResult.title, query) : null),
    [previewResult, query],
  );

  const highlightedSnippets = useMemo(
    () => displaySnippets.map((snippet) => highlightText(snippet.text, query)),
    [displaySnippets, query],
  );

  /** Opens the article at the heading the snippet was found under. */
  const openSnippet = useCallback(
    (result: SearchResult, snippet: SearchSnippet) => {
      remember(query);
      navigate(snippet.headingId ? `${result.url}#${snippet.headingId}` : result.url);
    },
    [navigate, remember, query],
  );

  const mobileDisplaySnippets = toSnippets(activeMobilePreview);

  const mobileDisplayMatchCount =
    activeMobilePreview?.matchCount && activeMobilePreview.matchCount > 0
      ? activeMobilePreview.matchCount
      : mobileDisplaySnippets.length;

  const mobileHighlightedSnippets = useMemo(
    () =>
      mobileDisplaySnippets.map((snippet) => highlightText(snippet.text, query)),
    [mobileDisplaySnippets, query],
  );

  return (
    <div className="min-h-screen bg-brand-bg relative selection:bg-brand-accent selection:text-brand-on-accent">
      <Helmet>
        <title>{`Pretraga | ${SITE_NAME}`}</title>
        <meta name="description" content="Pretražite sve članke." />
      </Helmet>

      <Navbar />

      <main id="glavni-sadrzaj" tabIndex={-1} className="pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-8 text-center">
            <span className="text-xs font-mono text-brand-dim tracking-widest uppercase">
              PRETRAGA
            </span>
            <h1 className="text-3xl font-serif font-medium text-brand-heading mt-2">
              Pretražite sadržaj
            </h1>

            <p className="mt-4 flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1 font-mono text-xs uppercase tracking-widest text-brand-dim">
              <span className="font-serif text-2xl tracking-normal text-brand-accent">
                {totalArticleCount}
              </span>
              članaka
              <span className="text-brand-border-strong">·</span>
              sa izvorima, citirano i indeksirano u celosti
            </p>
          </div>

          <div className="relative mb-6 mx-auto max-w-2xl">
            <Search
              aria-hidden
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-dim pointer-events-none"
            />
            <input
              ref={inputRef}
              type="text"
              name="q"
              autoComplete="off"
              spellCheck={false}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pretraži arhivu…"
              aria-label="Pretraga sadržaja"
              // text-base below sm: iOS Safari zooms the whole page in when a
              // focused field is under 16px, and never zooms back out.
              className="w-full bg-brand-surface border border-brand-border rounded-lg pl-11 pr-10 py-3 text-base sm:text-sm text-brand-heading placeholder:text-brand-dim focus:border-brand-accent transition-colors"
            />
            {isLoading ? (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-dim animate-spin" />
            ) : query ? (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Poništi pretragu"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-dim hover:text-brand-heading transition-colors"
              >
                <X aria-hidden className="w-4 h-4" />
              </button>
            ) : null}
          </div>

          {/* Always mounted, and deliberately not the same node as the visible
              count. A live region only announces changes that happen while it
              is already in the document, so one that appears along with the
              results would say nothing at all. */}
          <p role="status" aria-live="polite" className="sr-only">
            {!hasQuery
              ? ""
              : isLoading
                ? "Pretraga u toku…"
                : articleResults.length === 0
                  ? `Nema rezultata za ${query}`
                  : isCapped
                    ? `Prikazano prvih ${articleResults.length} od ${totalArticles} ${resultNoun(totalArticles)}`
                    : `${articleResults.length} ${resultNoun(articleResults.length)}`}
          </p>

          {hasQuery && !isLoading && (
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mb-4">
              {/* The list is capped, so the count has to say which number it is.
                  Reporting the capped length alone read as a total, and a term
                  in eighty articles looked like a term in twenty. */}
              <p
                aria-hidden
                className="text-xs text-brand-dim font-mono uppercase tracking-widest"
              >
                {isCapped ? (
                  <>
                    Prvih {articleResults.length} od{" "}
                    <span className="text-brand-accent">{totalArticles}</span>{" "}
                    {resultNoun(totalArticles)}
                  </>
                ) : (
                  `${articleResults.length} ${resultNoun(articleResults.length)}`
                )}
              </p>
              {articleResults.length > 0 && (
                <p className="hidden md:block text-[10px] text-brand-dim/70 font-mono uppercase tracking-widest">
                  ↑↓ kretanje · ↵ otvori · esc poništi
                </p>
              )}
            </div>
          )}

          {hasQuery && !isLoading && categoryResults.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
              <span className="text-[10px] font-mono uppercase tracking-widest text-brand-dim">
                Kategorije
              </span>
              {categoryResults.map((result) => (
                <Link
                  key={result.id}
                  to={result.url}
                  onClick={() => remember(query)}
                  className="flex items-center gap-1.5 rounded-full border border-brand-border bg-brand-surface px-3 py-1.5 text-xs text-brand-dim hover:border-brand-accent hover:text-brand-accent transition-colors"
                >
                  <FolderOpen aria-hidden className="w-3 h-3 shrink-0" />
                  {result.title}
                </Link>
              ))}
            </div>
          )}

          {!hasQuery && (
            <div className="mx-auto max-w-2xl">
              {recent.length > 0 && (
                <div className="mb-4">
                  <div className="mb-3 flex items-center justify-between gap-4">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-brand-dim">
                      Nedavne pretrage
                    </span>
                    <button
                      type="button"
                      onClick={clearRecent}
                      className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-brand-dim transition-colors hover:text-brand-accent"
                    >
                      <Trash2 aria-hidden className="h-3 w-3 shrink-0" />
                      Obriši istoriju
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {recent.map((entry) => (
                      <button
                        key={entry}
                        type="button"
                        onClick={() => {
                          setQuery(entry);
                          inputRef.current?.focus();
                        }}
                        className="flex items-center gap-1.5 rounded-full border border-brand-border bg-brand-surface px-3 py-1.5 text-xs text-brand-dim transition-colors hover:border-brand-accent hover:text-brand-accent"
                      >
                        <Clock aria-hidden className="h-3 w-3 shrink-0" />
                        {entry}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* An empty search box on a 206-article archive used to offer a
                  single line of instruction. The most-used tags are the
                  cheapest way in for someone who does not yet have a query. */}
              <div className={recent.length > 0 ? "pt-8" : "pt-12"}>
                <p className="text-center font-mono text-[10px] uppercase tracking-widest text-brand-dim">
                  Ili počnite od najčešćih tema
                </p>

                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {popularTags.map(({ tag, count }) => (
                    <Link
                      key={tag}
                      to={`/tags/${encodeURIComponent(tag)}`}
                      className="group flex items-center gap-2 rounded-full border border-brand-border bg-brand-surface px-3 py-1.5 text-xs text-brand-dim transition-colors hover:border-brand-accent hover:text-brand-accent"
                    >
                      <Hash aria-hidden className="h-3 w-3 shrink-0" />
                      {tag}
                      <span className="font-mono text-[10px] text-brand-dim/70">
                        {count}
                      </span>
                    </Link>
                  ))}
                </div>

                <p className="mt-8 text-center text-sm text-brand-dim">
                  Ili kucajte da pretražite ceo tekst svih članaka
                </p>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="text-center py-24 text-brand-dim">
              <Loader2
                aria-hidden
                className="w-8 h-8 mx-auto mb-4 opacity-30 animate-spin"
              />
              <p className="text-sm">
                {!isReady ? "Učitavanje pretrage…" : "Pretražujem…"}
              </p>
            </div>
          )}

          {!isLoading && hasQuery && articleResults.length > 0 && (
            <div className="grid md:grid-cols-[1fr_400px] gap-0 border border-brand-border rounded-xl overflow-hidden">
              <div
                ref={listRef}
                className="toc-scroll divide-y divide-brand-border overflow-y-auto max-h-[600px]"
              >
                <AnimatePresence>
                  {articleResults.map((result, index) => {
                    const isActive = index === selectedIndex;

                    return (
                      <motion.div
                        key={result.id}
                        data-selected={isActive}
                        className="search-result-row"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        // The stagger is capped: at 300 results the tail would
                        // otherwise be told to wait six seconds before it fades
                        // in, long after the reader has scrolled to it.
                        transition={{ delay: Math.min(index, 15) * 0.02 }}
                      >
                        {/* A real link, so results are reachable by Tab and
                            open in a new tab on Cmd/middle-click. On a phone a
                            plain click opens the preview sheet instead, but the
                            href stays live for every other way in. */}
                        <Link
                          to={result.url}
                          onMouseEnter={() => setSelectedIndex(index)}
                          onFocus={() => setSelectedIndex(index)}
                          onClick={(event) => {
                            if (
                              window.matchMedia("(max-width: 767px)").matches
                            ) {
                              event.preventDefault();
                              setMobilePreview(result);
                              return;
                            }
                            remember(query);
                          }}
                          className={`block px-5 py-4 transition-colors group ${
                            isActive
                              ? "bg-brand-surface"
                              : "hover:bg-brand-surface-hover"
                          }`}
                        >
                        <div className="flex items-start gap-3">
                          <FileText
                            className={`w-4 h-4 mt-0.5 flex-shrink-0 transition-colors ${
                              isActive
                                ? "text-brand-accent"
                                : "text-brand-dim group-hover:text-brand-accent"
                            }`}
                          />
                          <div className="min-w-0">
                            <p
                              className={`text-sm font-medium leading-snug truncate transition-colors ${
                                isActive
                                  ? "text-brand-accent"
                                  : "text-brand-heading group-hover:text-brand-accent"
                              }`}
                            >
                              {result.title}
                            </p>
                            <p className="text-[10px] font-mono uppercase tracking-widest text-brand-dim mt-1">
                              {getCategoryLabel(result.url)}
                            </p>
                          </div>
                        </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              <div className="hidden md:flex border-l border-brand-border bg-brand-surface p-6 flex-col justify-start min-h-[300px]">
                <AnimatePresence mode="wait">
                  {previewResult ? (
                    <motion.div
                      key={previewResult.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className="flex flex-col gap-5 h-full"
                    >
                      <div>
                        <h2 className="text-base font-bold text-brand-text leading-snug">
                          {highlightedTitle}
                        </h2>
                      </div>

                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-xs text-brand-dim">
                          <FolderOpen className="w-3.5 h-3.5 shrink-0" />
                          <span>{getCategoryLabel(previewResult.url)}</span>
                        </div>
                      </div>

                      {displaySnippets.length > 0 && (
                        <div className="flex-1 flex flex-col gap-2 min-h-0">
                          <p className="text-[10px] font-mono uppercase tracking-widest text-brand-dim mb-1">
                            Pronađeno u tekstu
                            {displayMatchCount > 0
                              ? ` · ${displayMatchCount} ${
                                  displayMatchCount === 1
                                    ? "pogodak"
                                    : "pogotka"
                                }`
                              : ""}
                          </p>

                          <div className="toc-scroll flex-1 overflow-y-auto max-h-[320px] pr-1.5 flex flex-col gap-2.5">
                            {highlightedSnippets.map((snippet, i) => {
                              const source = displaySnippets[i];
                              return (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() =>
                                    openSnippet(previewResult, source)
                                  }
                                  title={
                                    source.headingText
                                      ? `Otvori: ${source.headingText}`
                                      : "Otvori članak"
                                  }
                                  className="group/snip w-full cursor-pointer rounded-lg border border-brand-border bg-brand-surface p-3 text-left text-xs leading-relaxed text-brand-dim transition-colors hover:border-brand-border-strong hover:bg-brand-surface-hover"
                                >
                                  {source.headingText && (
                                    <span className="mb-1.5 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-brand-accent">
                                      <CornerDownRight className="h-3 w-3 shrink-0" />
                                      <span className="truncate">
                                        {source.headingText}
                                      </span>
                                    </span>
                                  )}
                                  {snippet}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => openResult(previewResult)}
                        className="mt-auto w-full py-2.5 text-xs font-medium uppercase tracking-widest border border-brand-border text-brand-dim hover:border-brand-accent hover:text-brand-accent rounded-lg transition-colors"
                      >
                        Otvori članak →
                      </button>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </div>
          )}

          {!isLoading && hasQuery && articleResults.length === 0 && (
            <div className="text-center py-24 text-brand-dim">
              <Search aria-hidden className="w-8 h-8 mx-auto mb-4 opacity-30" />
              <p className="text-sm">
                Nema rezultata za{" "}
                <span className="text-brand-heading">„{query}“</span>
              </p>
            </div>
          )}
        </div>
      </main>

      <AnimatePresence>
        {mobilePreview && activeMobilePreview && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-brand-overlay md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobilePreview(null)}
            />

            <motion.div
              ref={sheetRef}
              role="dialog"
              aria-modal="true"
              aria-label={`Pregled: ${activeMobilePreview.title}`}
              className="fixed inset-x-0 bottom-0 z-50 md:hidden flex max-h-[78vh] flex-col overscroll-contain rounded-t-2xl border border-brand-border bg-brand-surface p-5"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
            >
              <div
                aria-hidden
                className="w-10 h-1 rounded-full bg-brand-border-strong mx-auto mb-4"
              />

              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-base font-bold text-brand-text leading-snug">
                    {highlightText(activeMobilePreview.title, query)}
                  </h2>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-brand-dim mt-2">
                    {getCategoryLabel(activeMobilePreview.url)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setMobilePreview(null)}
                  aria-label="Zatvori pregled"
                  className="shrink-0 rounded-md border border-brand-border p-2 text-brand-dim hover:text-brand-heading hover:border-brand-border-strong transition-colors"
                >
                  <X aria-hidden className="w-4 h-4" />
                </button>
              </div>

              {mobileDisplaySnippets.length > 0 && (
                <div className="flex-1 min-h-0 flex flex-col">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-brand-dim mb-2">
                    Pronađeno u tekstu
                    {mobileDisplayMatchCount > 0
                      ? ` · ${mobileDisplayMatchCount} ${
                          mobileDisplayMatchCount === 1 ? "pogodak" : "pogotka"
                        }`
                      : ""}
                  </p>

                  <div className="toc-scroll flex flex-col gap-2.5 overflow-y-auto overscroll-contain pr-1">
                    {mobileHighlightedSnippets.map((snippet, i) => {
                      const source = mobileDisplaySnippets[i];
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            openSnippet(activeMobilePreview, source);
                            setMobilePreview(null);
                          }}
                          className="w-full cursor-pointer rounded-lg border border-brand-border bg-brand-surface p-3 text-left text-xs leading-relaxed text-brand-dim"
                        >
                          {source.headingText && (
                            <span className="mb-1.5 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-brand-accent">
                              <CornerDownRight className="h-3 w-3 shrink-0" />
                              <span className="truncate">
                                {source.headingText}
                              </span>
                            </span>
                          )}
                          {snippet}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  openResult(activeMobilePreview);
                  setMobilePreview(null);
                }}
                className="mt-4 w-full py-3 text-xs font-medium uppercase tracking-widest border border-brand-border text-brand-dim hover:border-brand-accent hover:text-brand-accent rounded-lg transition-colors"
              >
                Otvori članak →
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
