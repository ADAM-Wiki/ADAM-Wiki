import { useState } from "react";
import { Search, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigate = useNavigate();

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

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 border-b border-brand-border bg-brand-bg/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 grid grid-cols-[auto_1fr_auto] items-center gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden flex items-center justify-center w-10 h-10 text-brand-dim hover:text-brand-heading transition-colors shrink-0"
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
              className="text-brand-heading font-bold text-sm uppercase tracking-widest whitespace-nowrap"
            >
              Adam
            </button>
          </div>

          <div className="hidden md:flex items-center justify-center gap-6 min-w-0">
            {["Tagovi", "Kategorije", "O nama"].map((item) => (
              <button
                key={item}
                onClick={() => handleNavigation(item)}
                className="text-xs uppercase tracking-widest text-brand-dim hover:text-brand-heading transition-colors whitespace-nowrap"
              >
                {item}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-end gap-2 min-w-0">
            <ThemeToggle />

            <button
              onClick={() => navigate("/search")}
              aria-label="Pretraga"
              className="flex items-center gap-3 rounded-full border border-brand-border bg-brand-surface px-2.5 py-2.5 text-xs uppercase tracking-widest text-brand-heading hover:bg-brand-surface-hover transition whitespace-nowrap"
            >
              <Search className="w-4 h-4 shrink-0" />
            </button>
          </div>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-brand-bg pt-16">
          {["Početna", "Tagovi", "Kategorije", "O nama"].map((item, index) => (
            <button
              key={item}
              onClick={() => handleNavigation(item)}
              style={{ animationDelay: `${index * 0.1}s` }}
              className="block w-full text-left px-6 py-4 text-brand-heading uppercase tracking-widest hover:bg-brand-surface-hover transition-colors border-b border-brand-border"
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
