import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  X,
  Loader2,
  FileText,
  Calendar,
  FolderOpen,
} from "lucide-react";
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

function getDateFromUrl(url: string): string | null {
  // url format: categories/hadis/article/slug
  // date not in URL, so we skip — pass date from meta if available
  return null;
}

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("sr-Latn-RS", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(dateString));
}

// Arabic-aware highlight (reused from your SearchResults logic)
function normalizeForSearch(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim() || !text) return <span>{text}</span>;
  const normalized = normalizeForSearch(text);
  const normalizedQuery = normalizeForSearch(query);
  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
  if (!tokens.length) return <span>{text}</span>;

  const pattern = tokens
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
  const regex = new RegExp(`(${pattern})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            className="bg-brand-accent/25 text-brand-accent rounded px-0.5 not-italic font-medium"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [hoveredResult, setHoveredResult] = useState<SearchResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const { results, search, clear, isReady, isSearching } = useSearch();

  useEffect(() => {
    window.scrollTo(0, 0);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), 200);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const trimmed = debouncedQuery.trim();
    if (!trimmed) {
      clear();
      setHoveredResult(null);
      return;
    }
    search(trimmed);
  }, [debouncedQuery, search, clear]);

  const handleClear = () => {
    setQuery("");
    setDebouncedQuery("");
    clear();
    setHoveredResult(null);
  };

  const filteredResults: SearchResult[] = results;

  const articleResults = results.filter((r) => r.type === "article");

  const isLoading = query.trim().length > 0 && (!isReady || isSearching);
  const hasQuery = query.trim().length > 0;

  // Auto-select first result as preview
  const previewResult = hoveredResult ?? articleResults[0] ?? null;

  return (
    <div className="min-h-screen bg-brand-bg relative selection:bg-brand-accent selection:text-white">
      <Helmet>
        <title>Pretraga | {SITE_NAME}</title>
        <meta name="description" content="Pretražite sve članke." />
      </Helmet>

      <Navbar onSearch={() => {}} />

      <main className="pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-6">
          {/* Header */}
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

          {/* Search input */}
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

          {/* Result count */}
          {hasQuery && !isLoading && (
            <p className="text-xs text-brand-dim font-mono mb-4 uppercase tracking-widest">
              {articleResults.length}{" "}
              {articleResults.length === 1 ? "rezultat" : "rezultata"}
            </p>
          )}

          {/* Empty / loading state */}
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

          {/* TWO-PANEL RESULTS */}
          {!isLoading && hasQuery && articleResults.length > 0 && (
            <div className="grid md:grid-cols-[1fr_400px] gap-0 border border-white/10 rounded-xl overflow-hidden">
              {/* LEFT: Result list */}
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
                        onClick={() => navigate(`/${result.url}`)}
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
                            {/* Article title */}
                            <p
                              className={`text-sm font-medium leading-snug truncate transition-colors ${
                                isActive
                                  ? "text-brand-accent"
                                  : "text-white group-hover:text-brand-accent"
                              }`}
                            >
                              {result.title}
                            </p>
                            {/* Category */}
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

              {/* RIGHT: Preview panel */}
              <div className="border-l border-white/10 bg-white/[0.015] p-6 hidden md:flex flex-col justify-start min-h-[300px]">
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
                      {/* Title */}
                      <div>
                        <p className="text-[10px] font-mono uppercase tracking-widest text-brand-dim mb-2">
                          Članak
                        </p>
                        <h2 className="text-base font-serif font-medium text-white leading-snug">
                          {highlightText(previewResult.title, query)}
                        </h2>
                      </div>

                      {/* Meta */}
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-xs text-brand-dim">
                          <FolderOpen className="w-3.5 h-3.5 shrink-0" />
                          <span>{getCategoryLabel(previewResult.url)}</span>
                        </div>
                      </div>

                      {/* Matched text snippet */}
                      {(previewResult.snippet || previewResult.excerpt) && (
                        <div className="flex-1">
                          <p className="text-[10px] font-mono uppercase tracking-widest text-brand-dim mb-2">
                            Pronađeno u tekstu
                          </p>
                          <div className="text-xs text-brand-dim leading-relaxed bg-white/[0.03] border border-white/5 rounded-lg p-4">
                            {highlightText(
                              previewResult.snippet ??
                                previewResult.excerpt ??
                                "",
                              query,
                            )}
                          </div>
                        </div>
                      )}

                      {/* Open button */}
                      <button
                        type="button"
                        onClick={() => navigate(`/${previewResult.url}`)}
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

          {/* No results */}
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

      <Footer />
    </div>
  );
}
