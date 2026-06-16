import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { normalizeForSearch, getQueryTokens } from "../utils/searchShared";
import { Search, X, Loader2, FileText, FolderOpen } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "motion/react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { SITE_NAME } from "../utils/siteConfig";
import { useSearch } from "../hooks/useSearch";
import type { SearchResult } from "../utils/searchUtils";

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

function compactNormalize(str: string): string {
  return normalizeForSearch(str).replace(/\s+/g, "");
}

function findMatchRanges(
  text: string,
  query: string,
): Array<{ start: number; end: number }> {
  const tokens = getQueryTokens(query);
  if (!tokens.length) return [];

  const ranges: Array<{ start: number; end: number }> = [];
  const words = [...text.matchAll(/\S+/g)];

  for (const match of words) {
    const word = match[0];
    const wordStart = match.index ?? 0;
    const normalizedWord = normalizeForSearch(word);
    const compactWord = compactNormalize(word);

    for (const token of tokens) {
      const compactToken = compactNormalize(token);
      let compactIndex = -1;

      if (normalizedWord.includes(token)) {
        compactIndex = compactNormalize(normalizedWord).indexOf(compactToken);
      } else if (compactWord.includes(compactToken)) {
        compactIndex = compactWord.indexOf(compactToken);
      }

      if (compactIndex === -1) continue;

      let seen = 0;
      let visualStart = -1;
      let visualEnd = -1;

      for (let i = 0; i < word.length; i++) {
        const charCompact = compactNormalize(word[i]);
        if (!charCompact) continue;

        if (seen === compactIndex && visualStart === -1) {
          visualStart = wordStart + i;
        }

        seen += charCompact.length;

        if (seen >= compactIndex + compactToken.length) {
          visualEnd = wordStart + i + 1;
          break;
        }
      }

      if (visualStart !== -1 && visualEnd !== -1) {
        ranges.push({ start: visualStart, end: visualEnd });
      }
    }
  }

  ranges.sort((a, b) => a.start - b.start);

  const merged: Array<{ start: number; end: number }> = [];
  for (const range of ranges) {
    const last = merged[merged.length - 1];
    if (last && range.start <= last.end) {
      last.end = Math.max(last.end, range.end);
    } else {
      merged.push({ ...range });
    }
  }

  return merged;
}

function highlightText(text: string, query: string): React.ReactElement {
  if (!query.trim()) return <span>{text}</span>;

  const ranges = findMatchRanges(text, query);
  if (!ranges.length) return <span>{text}</span>;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  ranges.forEach((range, index) => {
    if (range.start > lastIndex) {
      parts.push(
        <span key={`text-${index}-${lastIndex}`}>
          {text.slice(lastIndex, range.start)}
        </span>,
      );
    }

    parts.push(
      <mark
        key={`highlight-${index}-${range.start}`}
        className="bg-brand-accent/25 text-brand-accent rounded px-0.5 not-italic font-medium"
      >
        {text.slice(range.start, range.end)}
      </mark>,
    );

    lastIndex = range.end;
  });

  if (lastIndex < text.length) {
    parts.push(
      <span key={`text-end-${lastIndex}`}>{text.slice(lastIndex)}</span>,
    );
  }

  return <>{parts}</>;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [hoveredResult, setHoveredResult] = useState<SearchResult | null>(null);
  const [mobilePreview, setMobilePreview] = useState<SearchResult | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
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
      setHoveredResult(null);
      setMobilePreview(null);
      return;
    }

    search(trimmed);
  }, [debouncedQuery, search, clear]);

  const handleClear = () => {
    setQuery("");
    setDebouncedQuery("");
    clear();
    setHoveredResult(null);
    setMobilePreview(null);
  };

  const articleResults = results.filter((r) => r.type === "article");
  const isLoading = query.trim().length > 0 && (!isReady || isSearching);
  const hasQuery = query.trim().length > 0;

  const previewResult = hoveredResult ?? articleResults[0] ?? null;
  const activeMobilePreview = mobilePreview;

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

  return (
    <div className="min-h-screen bg-brand-bg relative selection:bg-brand-accent selection:text-white">
      <Helmet>
        <title>Pretraga | {SITE_NAME}</title>
        <meta name="description" content="Pretražite sve članke." />
      </Helmet>

      <Navbar onSearch={() => {}} />

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
              placeholder="Unesite pojam za pretragu..."
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
            <p className="text-xs text-brand-dim font-mono mb-4 uppercase tracking-widest">
              {articleResults.length}{" "}
              {articleResults.length === 1 ? "rezultat" : "rezultata"}
            </p>
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
              <div className="toc-scroll divide-y divide-white/5 overflow-y-auto max-h-[600px]">
                <AnimatePresence>
                  {articleResults.map((result, index) => {
                    const isActive = previewResult?.id === result.id;

                    return (
                      <motion.div
                        key={result.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.02 }}
                        onMouseEnter={() => setHoveredResult(result)}
                        onClick={() => {
                          if (window.innerWidth < 768) {
                            setMobilePreview(result);
                          } else {
                            navigate(result.url);
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
                          {highlightText(previewResult.title, query)}
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
                            {displaySnippets.map((snippetText, i) => (
                              <div
                                key={i}
                                className="text-xs text-brand-dim leading-relaxed bg-white/[0.03] border border-white/5 rounded-lg p-3 hover:bg-white/[0.05] transition-colors"
                              >
                                {highlightText(snippetText, query)}
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
                  <h2 className="text-base font-bold text-brand-texte leading-snug">
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
                    {mobileDisplaySnippets.map((snippetText, i) => (
                      <div
                        key={i}
                        className="text-xs text-brand-dim leading-relaxed bg-white/[0.03] border border-white/5 rounded-lg p-3"
                      >
                        {highlightText(snippetText, query)}
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
