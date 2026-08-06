import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { SearchResult } from "../utils/searchShared";
import { highlightText } from "../utils/highlight";
import { Search, X, Loader2, FileText, FolderOpen } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "motion/react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { SITE_NAME } from "../utils/siteConfig";
import { useSearch } from "../hooks/useSearch";

const CATEGORY_LABELS: Record<string, string> = {
  hadis: "Hadis",
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

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mobilePreview, setMobilePreview] = useState<SearchResult | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { results, search, clear, isReady, isSearching } = useSearch();

  useEffect(() => {
    window.scrollTo(0, 0);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  useEffect(() => {
    if (!mobilePreview) {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
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

  // A new result set invalidates the old selection.
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  const previewResult = articleResults[selectedIndex] ?? articleResults[0] ?? null;
  const activeMobilePreview = mobilePreview;

  const openResult = useCallback(
    (result: SearchResult) => {
      navigate(result.url);
    },
    [navigate],
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

  const displaySnippets =
    previewResult?.snippets && previewResult.snippets.length > 0
      ? previewResult.snippets
      : previewResult?.snippet
        ? [previewResult.snippet]
        : previewResult?.excerpt
          ? [previewResult.excerpt]
          : [];

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
    () => displaySnippets.map((snippet) => highlightText(snippet, query)),
    [displaySnippets, query],
  );

  const mobileDisplaySnippets =
    activeMobilePreview?.snippets && activeMobilePreview.snippets.length > 0
      ? activeMobilePreview.snippets
      : activeMobilePreview?.snippet
        ? [activeMobilePreview.snippet]
        : activeMobilePreview?.excerpt
          ? [activeMobilePreview.excerpt]
          : [];

  const mobileDisplayMatchCount =
    activeMobilePreview?.matchCount && activeMobilePreview.matchCount > 0
      ? activeMobilePreview.matchCount
      : mobileDisplaySnippets.length;

  const mobileHighlightedSnippets = useMemo(
    () => mobileDisplaySnippets.map((snippet) => highlightText(snippet, query)),
    [mobileDisplaySnippets, query],
  );

  return (
    <div className="min-h-screen bg-brand-bg relative selection:bg-brand-accent selection:text-white">
      <Helmet>
        <title>{`Pretraga | ${SITE_NAME}`}</title>
        <meta name="description" content="Pretražite sve članke." />
      </Helmet>

      <Navbar />

      <main className="pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-10">
            <span className="text-xs font-mono text-brand-dim tracking-widest uppercase">
              PRETRAGA
            </span>
            <h1 className="text-3xl font-serif font-medium text-white mt-2 mb-1">
              Pretražite sadržaj
            </h1>
            <p className="text-sm text-brand-dim">
              Pronađite članke po naslovu ili sadržaju
            </p>
          </div>

          <div className="relative mb-6 max-w-3xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-dim pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Unesite pojam za pretragu..."
              aria-label="Pretraga sadržaja"
              className="w-full bg-white/[0.03] border border-white/10 rounded-lg pl-11 pr-10 py-3 text-sm text-white placeholder:text-brand-dim focus:outline-none focus:border-brand-accent transition-colors"
            />
            {isLoading ? (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-dim animate-spin" />
            ) : query ? (
              <button
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-dim hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            ) : null}
          </div>

          {hasQuery && !isLoading && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
              <p className="text-xs text-brand-dim font-mono uppercase tracking-widest">
                {articleResults.length}{" "}
                {articleResults.length === 1 ? "rezultat" : "rezultata"}
              </p>
              {articleResults.length > 0 && (
                <p className="hidden md:block text-[10px] text-brand-dim/70 font-mono uppercase tracking-widest">
                  ↑↓ kretanje · ↵ otvori · esc poništi
                </p>
              )}
            </div>
          )}

          {hasQuery && !isLoading && categoryResults.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-[10px] font-mono uppercase tracking-widest text-brand-dim">
                Kategorije
              </span>
              {categoryResults.map((result) => (
                <button
                  key={result.id}
                  type="button"
                  onClick={() => navigate(result.url)}
                  className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-brand-dim hover:border-brand-accent hover:text-brand-accent transition-colors"
                >
                  <FolderOpen className="w-3 h-3 shrink-0" />
                  {result.title}
                </button>
              ))}
            </div>
          )}

          {!hasQuery && (
            <div className="text-center py-24 text-brand-dim">
              <Search className="w-8 h-8 mx-auto mb-4 opacity-30" />
              <p className="text-sm">
                Počnite kucati da biste pretražili članke
              </p>
            </div>
          )}

          {isLoading && (
            <div className="text-center py-24 text-brand-dim">
              <Loader2 className="w-8 h-8 mx-auto mb-4 opacity-30 animate-spin" />
              <p className="text-sm">
                {!isReady ? "Učitavanje pretrage..." : "Pretražujem..."}
              </p>
            </div>
          )}

          {!isLoading && hasQuery && articleResults.length > 0 && (
            <div className="grid md:grid-cols-[1fr_400px] gap-0 border border-white/10 rounded-xl overflow-hidden">
              <div
                ref={listRef}
                className="toc-scroll divide-y divide-white/5 overflow-y-auto max-h-[600px]"
              >
                <AnimatePresence>
                  {articleResults.map((result, index) => {
                    const isActive = index === selectedIndex;

                    return (
                      <motion.div
                        key={result.id}
                        data-selected={isActive}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.02 }}
                        onMouseEnter={() => setSelectedIndex(index)}
                        onClick={() => {
                          if (window.innerWidth < 768) {
                            setMobilePreview(result);
                          } else {
                            openResult(result);
                          }
                        }}
                        className={`px-5 py-4 cursor-pointer transition-colors group ${
                          isActive ? "bg-white/[0.04]" : "hover:bg-white/[0.02]"
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
                                  : "text-white group-hover:text-brand-accent"
                              }`}
                            >
                              {result.title}
                            </p>
                            <p className="text-[10px] font-mono uppercase tracking-widest text-brand-dim mt-1">
                              {getCategoryLabel(result.url)}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              <div className="hidden md:flex border-l border-white/10 bg-white/[0.015] p-6 flex-col justify-start min-h-[300px]">
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
                            {highlightedSnippets.map((snippet, i) => (
                              <div
                                key={i}
                                className="text-xs text-brand-dim leading-relaxed bg-white/[0.03] border border-white/5 rounded-lg p-3 hover:bg-white/[0.05] transition-colors"
                              >
                                {snippet}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => navigate(previewResult.url)}
                        className="mt-auto w-full py-2.5 text-xs font-medium uppercase tracking-widest border border-white/10 text-brand-dim hover:border-brand-accent hover:text-brand-accent rounded-lg transition-colors"
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
              <Search className="w-8 h-8 mx-auto mb-4 opacity-30" />
              <p className="text-sm">
                Nema rezultata za <span className="text-white">"{query}"</span>
              </p>
            </div>
          )}
        </div>
      </main>

      <AnimatePresence>
        {mobilePreview && activeMobilePreview && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/60 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobilePreview(null)}
            />

            <motion.div
              className="fixed inset-x-0 bottom-0 z-50 md:hidden rounded-t-2xl border border-white/10 bg-[#0b0b0c] p-5 max-h-[78vh] flex flex-col"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
            >
              <div className="w-10 h-1 rounded-full bg-white/15 mx-auto mb-4" />

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
                  className="shrink-0 rounded-md border border-white/10 p-2 text-brand-dim hover:text-white hover:border-white/20 transition-colors"
                >
                  <X className="w-4 h-4" />
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

                  <div className="toc-scroll overflow-y-auto pr-1 flex flex-col gap-2.5">
                    {mobileHighlightedSnippets.map((snippet, i) => (
                      <div
                        key={i}
                        className="text-xs text-brand-dim leading-relaxed bg-white/[0.03] border border-white/5 rounded-lg p-3"
                      >
                        {snippet}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  navigate(activeMobilePreview.url);
                  setMobilePreview(null);
                }}
                className="mt-4 w-full py-3 text-xs font-medium uppercase tracking-widest border border-white/10 text-brand-dim hover:border-brand-accent hover:text-brand-accent rounded-lg transition-colors"
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
