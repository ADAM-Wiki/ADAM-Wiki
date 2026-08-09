import { useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getTotalArticleCount, getCategoryStats } from "../utils/articleIndex";

const totalArticles = getTotalArticleCount();
const totalCategories = getCategoryStats().filter((c) => c.count > 0).length;

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <div className="font-serif text-5xl leading-none text-brand-accent sm:text-6xl">
        {value}
      </div>
      <div className="mt-2 font-mono text-sm uppercase tracking-[0.2em] text-brand-dim">
        {label}
      </div>
    </div>
  );
}

export default function Hero() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();
    navigate(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search");
  };

  // On phones the hero fills the viewport so the divider below it lands on the
  // fold instead of leaving dead space. 100svh (not 100vh) is the height with
  // the browser toolbars showing, which is what the reader sees on first paint.
  return (
    <section className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden pb-16 pt-20 sm:block sm:min-h-0 sm:pb-28 sm:pt-36">
      {/*
        Monogram. Sized against the viewport and centred on both axes so the
        section's overflow-hidden never shears its feet flat against the
        divider, and masked at the edges so it dissolves instead of cutting off.
      */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none opacity-[0.07]"
        style={{
          maskImage:
            "radial-gradient(circle, black 50%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(circle, black 50%, transparent 80%)",
        }}
      >
        <span className="block font-serif leading-none text-[min(70vh,34rem)]">
          Å
        </span>
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="font-serif text-[clamp(2.5rem,7vw,6rem)] leading-[1.08] tracking-tight">
            Uspostavljanje
            <br />
            <span className="font-normal italic text-brand-accent">Istine</span>{" "}
            kroz dokaze
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base font-light sm:mt-8 sm:text-lg leading-relaxed text-brand-dim">
            Naučna baza znanja posvećena odbrani islama kroz rukopisne dokaze,
            lingvističke dokaze i autentifikaciju hadisa, izgrađena za tragaoce
            za istinom u doba organizovane sumnje.
          </p>

          {/* Search is what most visitors arrive wanting; the placeholder shows
              the kind of question the archive actually answers. */}
          <form onSubmit={handleSubmit} className="mx-auto mt-6 max-w-2xl sm:mt-12">
            <div className="relative">
              {/* The input keeps its own positioning context so the icon stays
                  centred against the field, not against the field plus the
                  button once that button drops below on mobile. */}
              <div className="relative">
                <Search className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-accent" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Da li je Isus Bog?"
                  aria-label="Pretraga sadržaja"
                  // See SearchPage: under 16px iOS zooms the page on focus.
                  className="w-full rounded-lg border border-brand-border bg-brand-field py-4 pl-12 pr-5 text-base text-brand-heading transition-colors placeholder:text-brand-dim focus:border-brand-accent focus:outline-none sm:pr-56 sm:text-sm"
                />
              </div>

              {/* Sits inside the field on desktop; drops below it as a
                  full-width button on mobile, where there is no room beside
                  the input. */}
              <button
                type="submit"
                className="mt-3 w-full rounded-lg bg-brand-accent px-6 py-3.5 text-xs font-medium uppercase tracking-widest text-brand-on-accent transition-opacity hover:opacity-90 sm:absolute sm:right-2 sm:top-1/2 sm:mt-0 sm:w-auto sm:-translate-y-1/2 sm:rounded-md sm:py-2.5"
              >
                Pronađi odgovor
              </button>
            </div>
          </form>

          <div className="mt-6 flex items-center justify-center gap-10 sm:mt-14 sm:gap-16">
            <Stat value={totalArticles} label="Članaka" />
            <div className="h-12 w-px bg-brand-surface" />
            <Stat value={totalCategories} label="Kategorija" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
