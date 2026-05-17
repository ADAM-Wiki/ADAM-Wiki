import { motion } from "motion/react";
import { FileText, ArrowRight, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SearchResult } from "../utils/searchUtils";

interface SearchResultsProps {
  results: SearchResult[];
  query: string;
  onClose: () => void;
}

// Helper function to highlight search terms

export default function SearchResults({ results, query, onClose }: SearchResultsProps) {
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
          <p className="text-sm mt-1">Pokušajte drugačije formulisati pretragu</p>
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
          {results.length} rezultat{results.length !== 1 ? 'a' : ''} za "{query}"
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
                  <span className={`text-xs uppercase tracking-wider px-2 py-0.5 rounded ${
                    result.type === 'article' ? 'bg-blue-500/20 text-blue-400' :
                    result.type === 'category' ? 'bg-green-500/20 text-green-400' :
                    'bg-purple-500/20 text-purple-400'
                  }`}>
                    {result.type}
                  </span>
                </div>
                {result.excerpt && (
                  <p className="text-xs text-brand-dim leading-relaxed line-clamp-2">
                    {highlightText(result.excerpt, query)}
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

// Strip diacritics for matching only
function stripDiacritics(str: string): string {
  return str
     .replace(/dj/gi, 'd')   // ← first, before anything else touches 'd'
    .replace(/[čć]/gi, 'c')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .replace(/ž/gi, 'z')
    .replace(/š/gi, 's');
}

const highlightText = (text: string, query: string): React.ReactElement => {
  if (!query.trim()) return <span>{text}</span>;

  const strippedText = stripDiacritics(text.toLowerCase());
  const strippedQuery = stripDiacritics(query.trim().toLowerCase());

  const parts: React.ReactElement[] = [];
  let lastIndex = 0;
  let searchFrom = 0;

  while (true) {
    const index = strippedText.indexOf(strippedQuery, searchFrom);
    if (index === -1) break;

    // push non-highlighted part
    if (index > lastIndex) {
      parts.push(<span key={lastIndex}>{text.slice(lastIndex, index)}</span>);
    }

    // push highlighted part (original characters preserved)
    parts.push(
      <span key={index} className="text-blue-400 font-semibold">
        {text.slice(index, index + strippedQuery.length)}
      </span>
    );

    lastIndex = index + strippedQuery.length;
    searchFrom = lastIndex;
  }

  // push remaining text
  if (lastIndex < text.length) {
    parts.push(<span key={lastIndex}>{text.slice(lastIndex)}</span>);
  }

  return <>{parts}</>;
};