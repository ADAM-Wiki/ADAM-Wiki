import { useEffect, useState } from "react";
import { Search, Menu, X, ArrowUpRight } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import ThemeToggle from "./ThemeToggle";

const NAV_ITEMS = [
  { label: "Početna", path: "/" },
  { label: "Tagovi", path: "/tags" },
  { label: "Kategorije", path: "/categories" },
  { label: "O nama", path: "/about" },
];

/** Desktop keeps the compact set; "Početna" is reachable via the wordmark. */
const DESKTOP_ITEMS = NAV_ITEMS.filter((item) => item.path !== "/");

/**
 * Prerendered routes are served as directories, so the browser lands on
 * "/tags/" while the nav item is "/tags". Without trimming the trailing slash
 * the current page never matches and nothing is ever highlighted.
 */
function samePath(a: string, b: string): boolean {
  const trim = (p: string) => (p.length > 1 ? p.replace(/\/+$/, "") : p);
  return trim(a) === trim(b);
}

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Close on navigation, so tapping the current page still dismisses the panel.
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 border-b border-brand-border bg-brand-bg/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 grid grid-cols-[auto_1fr_auto] items-center gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden flex items-center justify-center w-10 h-10 text-brand-dim hover:text-brand-heading transition-colors shrink-0"
              aria-label={mobileMenuOpen ? "Zatvori meni" : "Otvori meni"}
              aria-expanded={mobileMenuOpen}
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
            {DESKTOP_ITEMS.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-xs uppercase tracking-widest transition-colors whitespace-nowrap ${
                  samePath(pathname, item.path)
                    ? "text-brand-heading"
                    : "text-brand-dim hover:text-brand-heading"
                }`}
              >
                {item.label}
              </Link>
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

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="fixed inset-0 z-40 flex flex-col bg-brand-bg pt-16 md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Glavni meni"
          >
            <nav className="flex-1 overflow-y-auto px-6 pt-6">
              {NAV_ITEMS.map((item, index) => {
                const active = samePath(pathname, item.path);

                return (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.04 + index * 0.05,
                      duration: 0.25,
                      ease: "easeOut",
                    }}
                  >
                    <Link
                      to={item.path}
                      className="group flex items-center gap-4 border-b border-brand-border py-5"
                    >
                      <span
                        className={`font-mono text-[10px] tracking-widest ${
                          active ? "text-brand-accent" : "text-brand-dim"
                        }`}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <span
                        className={`font-serif text-3xl leading-none transition-colors ${
                          active
                            ? "text-brand-accent"
                            : "text-brand-heading group-hover:text-brand-accent"
                        }`}
                      >
                        {item.label}
                      </span>

                      <ArrowUpRight
                        aria-hidden
                        className={`ml-auto h-4 w-4 shrink-0 transition-colors ${
                          active ? "text-brand-accent" : "text-brand-border-strong"
                        }`}
                      />
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.24, duration: 0.25 }}
              className="px-6 pb-10 pt-6"
            >
              <Link
                to="/search"
                className="flex items-center justify-center gap-2.5 rounded-lg border border-brand-border bg-brand-surface py-3.5 text-xs font-medium uppercase tracking-widest text-brand-heading transition-colors hover:border-brand-accent hover:text-brand-accent"
              >
                <Search className="h-4 w-4 shrink-0" />
                Pretraži arhivu
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
