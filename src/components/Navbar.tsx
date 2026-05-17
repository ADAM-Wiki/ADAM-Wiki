import { FormEvent, useEffect, useRef, useState } from "react";
import { Search, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { searchContent, SearchResult } from "../utils/searchUtils";
import SearchResults from "./SearchResults";


interface SearchResultsProps {
  results: SearchResult[];
  onResultClick?: () => void; // add this
}

interface NavbarProps {
  onSearch: (query: string) => void;
}

export default function Navbar({ onSearch }: NavbarProps) {
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      return;
    }
    onSearch(trimmedQuery);
    setSearchOpen(false);
    setSearchResults([]);
  };

  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery);
    if (newQuery.trim()) {
      const results = searchContent(newQuery);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleSearchResultClick = () => {
    setSearchOpen(false);
    setSearchResults([]);
    setQuery("");
  };

  const handleNavigation = (item: string) => {
    switch (item) {
      case "Početna":
        navigate("/");
        break;
      case "Kategorije":
        navigate("/categories");
        break;
      case "Tagovi":
        navigate("/tags");
        break;
      case "Postovi":
        navigate("/posts");
        break;
      case "O nama":
        navigate("/about");
        break;
      default:
        break;
    }
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchOpen && wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
        setSearchResults([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchOpen]);

  return (
  <>
    <nav className="fixed top-0 left-0 w-full z-50 border-b border-white/5 bg-brand-bg/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* LEFT — Hamburger + Logo */}
        <div className="flex items-center gap-4">
        <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden w-5 h-5 text-brand-dim hover:text-white transition-colors"
        >
        {mobileMenuOpen ? <X /> : <Menu />}
        </button>
        <button
        onClick={() => { navigate("/"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
        className="text-white font-bold text-sm uppercase tracking-widest"
        >
    Adam
  </button>
</div>

        {/* CENTER — Nav links (always stays centered) */}
        <div className="hidden md:flex items-center justify-center gap-6 absolute left-1/2 -translate-x-1/2">
          {["Postovi", "Tagovi", "Kategorije", "O nama"].map((item) => (
            <button
              key={item}
              onClick={() => handleNavigation(item)}
              className="text-xs uppercase tracking-widest text-brand-dim hover:text-white transition-colors"
            >
              {item}
            </button>
          ))}
        </div>
          
        {/* RIGHT — Search (fixed width so center never moves) */}
       <div className="flex items-center justify-end w-full" ref={wrapperRef}>
        
       

          {!searchOpen ? (
            
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs uppercase tracking-widest text-white hover:bg-white/20 transition"
            >
              Pretraži <Search className="w-4 h-4" />
            </button>
          ) : (
            <form onSubmit={handleSearchSubmit} className="relative flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 max-w-[calc(100vw-120px)]">
              <input
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                placeholder="Unesite pojam za pretragu..."
                className="min-w-[120px] md:min-w-[220px] bg-transparent text-sm text-white outline-none placeholder:text-brand-dim"
                autoFocus
              />
              <button type="submit" className="text-xs uppercase tracking-widest text-white">
                Pretraži <Search className="w-4 h-4 inline" />
              </button>
              
              {searchResults.length > 0 && (
                <SearchResults results={searchResults} query={query} onClose={handleSearchResultClick}
/>

              )}
              
            </form>
          )}

         
        </div>

      </div>
    </nav>

    {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black pt-16">
          {["Početna", "Postovi", "Tagovi", "Kategorije", "O nama"].map((item, index) => (
            <button
              key={item}
              onClick={() => handleNavigation(item)}
              style={{ animationDelay: `${index * 0.1}s` }}
              className="block w-full text-left px-6 py-4 text-white uppercase tracking-widest hover:bg-white/5 transition-colors border-b border-white/5"
            >
              {item}
            </button>
          ))}
        </div>
      )}
  </>
);
}