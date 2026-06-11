import { FormEvent, useEffect, useRef, useState } from "react";
import { Search, Menu, X, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SearchResults from "./SearchResults";
import { useSearch } from "../hooks/useSearch";

interface NavbarProps {
  onSearch: (query: string) => void;
}

export default function Navbar({ onSearch }: NavbarProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { results, search, clear, isReady, isSearching } = useSearch();

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query);
    }, 200);

    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const trimmed = debouncedQuery.trim();

    if (!searchOpen) return;

    if (!trimmed) {
      clear();
      return;
    }

    search(trimmed);
  }, [debouncedQuery, searchOpen, search, clear]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchOpen &&
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        resetSearch();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchOpen]);

  const resetSearch = () => {
    setQuery("");
    setDebouncedQuery("");
    clear();
    setSearchOpen(false);
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    onSearch(trimmedQuery);
    resetSearch();
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
      case "O nama":
        navigate("/about");
        break;
      default:
        break;
    }

    setMobileMenuOpen(false);
  };

  const showStatusBox = query.trim().length > 0 && (!isReady || isSearching);
  const showResultsBox = query.trim().length > 0 && isReady && !isSearching;

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 border-b border-white/5 bg-brand-bg/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 grid grid-cols-[auto_1fr_auto] items-center gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden flex items-center justify-center w-10 h-10 text-brand-dim hover:text-white transition-colors shrink-0"
              aria-label={mobileMenuOpen ? "Zatvori meni" : "Otvori meni"}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>

            <button
              onClick={() => {
                navigate("/");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="text-white font-bold text-sm uppercase tracking-widest whitespace-nowrap"
            >
              Adam
            </button>
          </div>

          <div className="hidden md:flex items-center justify-center gap-6 min-w-0">
            {["Tagovi", "Kategorije", "O nama"].map((item) => (
              <button
                key={item}
                onClick={() => handleNavigation(item)}
                className="text-xs uppercase tracking-widest text-brand-dim hover:text-white transition-colors whitespace-nowrap"
              >
                {item}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-end min-w-0">
            <button
              onClick={() => navigate("/search")}
              className="flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-2.5 py-2.5 text-xs uppercase tracking-widest text-white hover:bg-white/20 transition whitespace-nowrap"
            >
              <Search className="w-4 h-4 shrink-0" />
            </button>
          </div>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black pt-16">
          {["Početna", "Tagovi", "Kategorije", "O nama"].map((item, index) => (
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
