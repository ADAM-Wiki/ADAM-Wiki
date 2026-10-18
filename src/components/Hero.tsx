import { useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { warmSearch } from "../hooks/useSearch";
import { getTotalArticleCount, getCategoryStats } from "../utils/articleIndex";

const totalArticles = getTotalArticleCount();
const totalCategories = getCategoryStats().filter((c) => c.count > 0).length;

function countNoun(
  count: number,
  forms: readonly [string, string, string],
): string {
  const lastTwo = count % 100;
  if (lastTwo >= 11 && lastTwo <= 14) return forms[2];
  const last = count % 10;
  if (last === 1) return forms[0];
  if (last >= 2 && last <= 4) return forms[1];
  return forms[2];
}

export default function Hero() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();
    navigate(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search");
  };

  return (
    <section className="relative flex min-h-[calc(100svh-7rem)] flex-col justify-center overflow-hidden pb-10 pt-16 sm:pb-4 sm:pt-24">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none opacity-[0.07]"
        style={{
          maskImage: "radial-gradient(circle, black 50%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(circle, black 50%, transparent 80%)",
        }}
      >
        <span className="block font-serif leading-none text-[min(70vh,34rem)]">
          Å
        </span>
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="mb-6 flex items-center justify-center gap-4 text-[10px] uppercase tracking-[0.28em] text-brand-dim">
            <span className="h-px w-10 bg-brand-border" />
            <span>Naučna baza znanja</span>
            <span className="h-px w-10 bg-brand-border" />
          </div>

          <h1 className="font-serif text-[2.8rem] leading-[0.9] text-brand-heading sm:text-6xl lg:text-7xl">
            Uspostavljanje
            <br />
            <span className="inline-block font-normal italic text-brand-accent">
              Istine
            </span>{" "}
            kroz dokaze
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base font-light leading-relaxed text-brand-dim sm:mt-8 sm:text-lg">
            Naučna baza znanja posvećena odbrani islama kroz rukopisne dokaze,
            lingvističke dokaze i autentifikaciju hadisa, izgrađena za tragaoce
            za istinom u doba organizovane sumnje.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-7 max-w-2xl sm:mt-10"
          >
            <div className="relative">
              <div className="relative rounded-2xl border border-brand-border bg-brand-field/90 shadow-[0_22px_44px_rgba(15,12,10,0.18)]">
                <Search className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-accent" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onFocus={warmSearch}
                  onPointerDown={warmSearch}
                  placeholder="npr. Meka i Jesrib u Bibliji"
                  aria-label="Pretraga sadržaja"
                  name="q"
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full rounded-2xl border-0 bg-transparent py-4 pl-12 pr-5 text-base text-brand-heading placeholder:text-brand-dim focus:outline-none sm:pr-56 sm:text-sm"
                />
              </div>

              <button
                type="submit"
                className="mt-3 w-full rounded-xl bg-brand-accent px-6 py-3.5 text-xs font-medium uppercase tracking-[0.2em] text-brand-on-accent transition-colors duration-150 hover:bg-brand-accent/90 sm:absolute sm:right-2 sm:top-1/2 sm:mt-0 sm:w-auto sm:-translate-y-1/2 sm:rounded-lg sm:py-2.5"
              >
                Pretraži članke
              </button>
            </div>
          </form>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-3 font-mono text-xs uppercase tracking-widest text-brand-dim sm:mt-8">
            <span>
              {totalArticles}{" "}
              {countNoun(totalArticles, ["članak", "članka", "članaka"])}
            </span>
            <span aria-hidden className="text-brand-border-strong">
              ·
            </span>
            <span>
              {totalCategories}{" "}
              {countNoun(totalCategories, [
                "kategorija",
                "kategorije",
                "kategorija",
              ])}
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
