import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Youtube, Mail, ArrowUpRight } from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import BackToTop from "./BackToTop";
import { SITE_NAME, SITE_URL } from "../utils/siteConfig";
import { getTotalArticleCount, getCategoryStats } from "../utils/articleIndex";

const DESCRIPTION =
  "Adam Research Database — projekat posvećen istraživanju i dokumentovanju naučnih, istorijskih i teoloških tema sa fokusom na islamsku tradiciju i komparativnu religiju.";

/** Drawn from the project's own description of how articles are written. */
const PRINCIPLES = [
  {
    title: "Edukativno",
    body: "Tekstovi su pisani da objasne, ne da ubede — sa kontekstom koji čitalac može da proveri.",
  },
  {
    title: "Objektivno",
    body: "Tvrdnje se iznose onako kako stoje u izvorima, uključujući i one koje idu uz i protiv.",
  },
  {
    title: "Primarni izvori",
    body: "Svaki tekst navodi izvore i poziva čitaoca na samostalno istraživanje.",
  },
];

export default function AboutPage() {
  const totalArticles = getTotalArticleCount();
  const totalCategories = getCategoryStats().filter((c) => c.count > 0).length;

  return (
    <div className="min-h-screen bg-brand-bg selection:bg-brand-accent selection:text-brand-on-accent">
      <Helmet>
        <title>{`O Projektu | ${SITE_NAME}`}</title>
        <meta name="description" content={DESCRIPTION} />
        <meta property="og:title" content={`O Projektu | ${SITE_NAME}`} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:url" content={`${SITE_URL}/about`} />
      </Helmet>

      <Navbar />

      <main className="pt-24 pb-20">
        <div className="mx-auto max-w-3xl px-6">
          <header className="text-center">
            <span className="font-mono text-xs uppercase tracking-widest text-brand-dim">
              O NAMA
            </span>
            <h1 className="mt-2 font-serif text-3xl font-medium text-brand-heading">
              O Projektu
            </h1>

            <p className="mt-4 flex flex-wrap items-baseline justify-center gap-x-3 font-mono text-xs uppercase tracking-widest text-brand-dim">
              <span className="font-serif text-2xl tracking-normal text-brand-accent">
                {totalArticles}
              </span>
              članaka
              <span className="text-brand-border-strong">·</span>
              <span className="font-serif text-2xl tracking-normal text-brand-accent">
                {totalCategories}
              </span>
              kategorija
            </p>
          </header>

          <div className="mt-14 space-y-6 leading-relaxed text-brand-text">
            <p className="text-lg">
              <strong className="font-medium text-brand-heading">
                Adam Research Database
              </strong>{" "}
              je projekat posvećen istraživanju i dokumentovanju naučnih,
              istorijskih i teoloških tema sa fokusom na islamsku tradiciju i
              komparativnu religiju.
            </p>
            <p className="text-brand-dim">
              Cilj projekta je pružiti čitaocima pristup proverenim
              informacijama, izvorima i analizama koje su često teško dostupne na
              jezicima ex-Yu prostora.
            </p>
          </div>

          {/* Principles, in the numbered style used across the site. */}
          <div className="mt-16 border-t border-brand-border pt-12">
            <h2 className="mb-8 text-center font-mono text-xs uppercase tracking-widest text-brand-dim">
              Kako pišemo
            </h2>

            <div className="grid gap-8 sm:grid-cols-3">
              {PRINCIPLES.map((principle, index) => (
                <div key={principle.title}>
                  <span className="font-mono text-xs text-brand-accent">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-2 font-serif text-xl text-brand-heading">
                    {principle.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-brand-dim">
                    {principle.body}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Two equal calls to action rather than two stacked look-alike cards. */}
          <div className="mt-16 grid gap-4 sm:grid-cols-2">
            <a
              href="https://www.youtube.com/@asocijacija-adam"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col rounded-lg border border-brand-border bg-brand-surface p-6 transition-colors hover:border-brand-border-strong"
            >
              <div className="flex items-center gap-2.5">
                <Youtube className="h-5 w-5 shrink-0 text-brand-accent" />
                <h2 className="font-medium text-brand-heading">YouTube kanal</h2>
                <ArrowUpRight className="ml-auto h-4 w-4 shrink-0 text-brand-border-strong transition-colors group-hover:text-brand-accent" />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-brand-dim">
                Video materijali o islamskoj teologiji, istoriji i komparativnoj
                religiji.
              </p>
            </a>

            <Link
              to="/kontakt"
              className="group flex flex-col rounded-lg border border-brand-border bg-brand-surface p-6 transition-colors hover:border-brand-border-strong"
            >
              <div className="flex items-center gap-2.5">
                <Mail className="h-5 w-5 shrink-0 text-brand-accent" />
                <h2 className="font-medium text-brand-heading">
                  Kontaktirajte nas
                </h2>
                <ArrowUpRight className="ml-auto h-4 w-4 shrink-0 text-brand-border-strong transition-colors group-hover:text-brand-accent" />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-brand-dim">
                Za pitanja, predloge ili saradnju — pišite nam preko kontakt
                forme.
              </p>
            </Link>
          </div>
        </div>
      </main>

      <BackToTop />
      <Footer />
    </div>
  );
}
