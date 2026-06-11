import { motion } from "motion/react";
import { FileText, ArrowRight, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SearchResult } from "../utils/searchUtils";

interface SearchResultsProps {
  results: SearchResult[];
  query: string;
  onClose: () => void;
}

function cleanSnippet(text: string): string {
  return text
    .replace(/\[(QUOTE|IMPORTANT|LINK|IMAGE|WARNING)\]/gi, "")
    .replace(/\[QURAN:([^\]]+)\]/gi, "$1")
    .replace(/\[BIBLE:([^\]]+)\]/gi, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeForSearch(str: string): string {
  const refs: string[] = [];

  const normalizedDashes = str
    .replace(/[\u2010\u2011\u2012\u2013\u2014\u2212]/g, "-")
    .replace(/[:]\s*(\d+)\s*-\s*(\d+)/g, ":$1-$2");

  const protectedStr = normalizedDashes.replace(/\b\d+:\d+(?:-\d+)?\b/g, (match) => {
    const key = `quranrefplaceholder${refs.length}`;
    refs.push(match.toLowerCase());
    return ` ${key} `;
  });

  let normalized = protectedStr
    .toLowerCase()
    .replace(/\[([^\]]*)\]/g, "$1")
    .replace(/[-/_]/g, " ")
    .replace(/dž/gi, "dz")
    .replace(/đ/gi, "d")
    .replace(/dj/gi, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s:]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

  refs.forEach((ref, index) => {
    normalized = normalized.replace(`quranrefplaceholder${index}`, ref);
  });

  return normalized;
}

function compactNormalize(str: string): string {
  return normalizeForSearch(str).replace(/\s+/g, "");
}

function expandArabicStyleQuery(query: string): string {
  return query
    .replace(/^(al|el|ibn|bin|abu|abd)(?=[a-z])/g, "$1 ")
    .replace(/([a-z])(al|el|ibn|bin|abu|abd)(?=[a-z])/g, "$1 $2 ");
}

function expandSurahAliases(tokens: string[]): string[] {
  const aliasMap: Record<string, string[]> = {
    zilzal: ["zilzal", "zalzal", "zalzalah", "zalzala"],
    zalzalah: ["zilzal", "zalzal", "zalzalah", "zalzala"],
    baqara: ["baqara", "baqarah"],
    fatiha: ["fatiha", "fatihah"],
    ikhlas: ["ikhlas", "ihlas"],
    yasin: ["yasin", "yaseen"],
  };

  const extra: string[] = [];

  for (const token of tokens) {
    const compact = token.replace(/\s+/g, "");
    const stripped = compact.replace(/^(al|el|ez|az)/, "");

    for (const aliases of Object.values(aliasMap)) {
      if (aliases.includes(compact) || aliases.includes(stripped)) {
        extra.push(...aliases);
      }
    }
  }

  return [...new Set(extra)];
}

function getQueryTokens(query: string): string[] {
  const normalized = normalizeForSearch(query);
  const referenceTokens = normalized.match(/\b\d+:\d+(?:-\d+)?\b/g) ?? [];

  const expanded = expandArabicStyleQuery(
    normalized.replace(/\b\d+:\d+(?:-\d+)?\b/g, " ")
  );

  const baseTokens = expanded.split(/\s+/).filter(Boolean);
  const extra: string[] = [];

  for (const token of baseTokens) {
    if (
      (token.startsWith("al") ||
        token.startsWith("el") ||
        token.startsWith("ez") ||
        token.startsWith("az")) &&
      token.length > 2
    ) {
      extra.push(token.slice(2));
    }
    if (token.startsWith("ibn") && token.length > 3) extra.push(token.slice(3));
    if (token.startsWith("bin") && token.length > 3) extra.push(token.slice(3));
    if (token.startsWith("abu") && token.length > 3) extra.push(token.slice(3));
    if (token.startsWith("abd") && token.length > 3) extra.push(token.slice(3));
  }

  const aliasTokens = expandSurahAliases([...baseTokens, ...extra]);

  return [...new Set([...referenceTokens, ...baseTokens, ...extra, ...aliasTokens])].filter(
    (token) => token.length >= 2
  );
}

function findMatchRanges(text: string, query: string): Array<{ start: number; end: number }> {
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

const highlightText = (text: string, query: string): React.ReactElement => {
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
        </span>
      );
    }

    parts.push(
      <span
        key={`highlight-${index}-${range.start}`}
        className="text-blue-400 font-semibold"
      >
        {text.slice(range.start, range.end)}
      </span>
    );

    lastIndex = range.end;
  });

  if (lastIndex < text.length) {
    parts.push(
      <span key={`text-end-${lastIndex}`}>
        {text.slice(lastIndex)}
      </span>
    );
  }

  return <>{parts}</>;
};

export default function SearchResults({
  results,
  query,
  onClose,
}: SearchResultsProps) {
  const navigate = useNavigate();

  const handleResultClick = (result: SearchResult) => {
    navigate(result.url);
    onClose();
  };

  if (results.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-full left-0 right-0 mt-2 bg-brand-bg/95 backdrop-blur-md border border-white/10 rounded-lg shadow-xl max-h-96 overflow-y-auto"
      >
        <div className="p-6 text-center text-brand-dim">
          <Search className="w-8 h-8 mx-auto mb-3 opacity-50" />
          <p>Nema rezultata za "{query}"</p>
          <p className="text-sm mt-1">
            Pokušajte drugačije formulisati pretragu
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-full left-0 right-0 mt-2 bg-brand-bg/95 backdrop-blur-md border border-white/10 rounded-lg shadow-xl max-h-96 overflow-y-auto"
    >
      <div className="p-4 border-b border-white/5">
        <p className="text-sm text-brand-dim">
          {results.length} rezultat{results.length !== 1 ? "a" : ""} za "{query}"
        </p>
      </div>

      <div className="divide-y divide-white/5">
        {results.map((result, index) => (
          <motion.div
            key={result.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.02 }}
            className="p-4 hover:bg-white/[0.02] cursor-pointer transition-colors group"
            onClick={() => handleResultClick(result)}
          >
            <div className="flex items-start gap-3">
              <FileText className="w-4 h-4 text-brand-dim group-hover:text-brand-accent transition-colors mt-0.5 flex-shrink-0" />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-medium text-white group-hover:text-brand-accent transition-colors truncate">
                    {highlightText(result.title, query)}
                  </h3>

                  <span
                    className={`text-xs uppercase tracking-wider px-2 py-0.5 rounded flex-shrink-0 ${
                      result.type === "article"
                        ? "bg-blue-500/20 text-blue-400"
                        : result.type === "category"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-purple-500/20 text-purple-400"
                    }`}
                  >
                    {result.type}
                  </span>
                </div>

                {(result.snippet || result.excerpt) && (
                  <p className="text-xs text-brand-dim leading-relaxed line-clamp-2">
                    {highlightText(cleanSnippet(result.snippet || result.excerpt || ""), query)}
                  </p>
                )}
              </div>

              <ArrowRight className="w-4 h-4 text-brand-dim group-hover:text-white group-hover:translate-x-1 transition-all flex-shrink-0" />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}