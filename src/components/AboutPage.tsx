import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Youtube, Mail, ArrowUpRight } from "lucide-react";
import PageShell from "./PageShell";
import { SITE_NAME, SITE_URL } from "../utils/siteConfig";
import { getTotalArticleCount, getCategoryStats } from "../utils/articleIndex";

const DESCRIPTION =
  "Adam Research Database — projekat posvećen istraživanju i dokumentovanju naučnih, istorijskih i teoloških tema sa fokusom na islamsku tradiciju i komparativnu religiju.";

function formatCount(
  count: number,
  forms: readonly [string, string, string],
): string {
  const lastTwo = count % 100;
  if (lastTwo >= 11 && lastTwo <= 14) return `${count} ${forms[2]}`;
  const last = count % 10;
  if (last === 1) return `${count} ${forms[0]}`;
  if (last >= 2 && last <= 4) return `${count} ${forms[1]}`;
  return `${count} ${forms[2]}`;
}

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
    <PageShell noGrid>
      <Helmet>
        <title>{`O Projektu | ${SITE_NAME}`}</title>
        <meta name="description" content={DESCRIPTION} />
        <meta property="og:title" content={`O Projektu | ${SITE_NAME}`} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:url" content={`${SITE_URL}/about`} />
      </Helmet>

        <section className="py-20">
          <div className="mx-auto max-w-7xl px-6">
            <header className="max-w-2xl">
              <h1 className="page-rise mb-4 text-3xl font-serif font-medium text-brand-heading">
                O Projektu
              </h1>

              <div
                className="page-rise mb-8 space-y-4 text-sm leading-relaxed text-brand-dim"
                style={{ animationDelay: "40ms" }}
              >
                <p>
                  <strong className="font-medium text-brand-heading">
                    Adam Research Database
                  </strong>{" "}
                  je projekat posvećen istraživanju i dokumentovanju naučnih,
                  istorijskih i teoloških tema sa fokusom na islamsku tradiciju
                  i komparativnu religiju.
                </p>
                <p>
                  Cilj projekta je pružiti čitaocima pristup proverenim
                  informacijama, izvorima i analizama koje su često teško
                  dostupne na jezicima ex-Yu prostora.
                </p>
              </div>

              <p
                className="page-rise mb-8 font-mono text-xs uppercase tracking-widest text-brand-dim"
                style={{ animationDelay: "60ms" }}
              >
                {formatCount(totalArticles, ["članak", "članka", "članaka"])}
                <span className="px-2 text-brand-border-strong">·</span>
                {formatCount(totalCategories, [
                  "kategorija",
                  "kategorije",
                  "kategorija",
                ])}
              </p>

              <Link
                to="/categories"
                className="page-rise group mb-12 inline-flex items-center gap-2 border-b border-brand-border pb-1 text-sm font-medium text-brand-heading transition-colors hover:border-brand-accent hover:text-brand-accent"
                style={{ animationDelay: "80ms" }}
              >
                Istraži kategorije
                <ArrowUpRight
                  aria-hidden
                  className="h-4 w-4 transition-colors group-hover:text-brand-accent"
                />
              </Link>
            </header>

            <section className="mt-8 border-t border-brand-border pt-8">
              <h2 className="mb-8 font-mono text-[10px] uppercase tracking-widest text-brand-dim">
                Kako pišemo
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {PRINCIPLES.map((principle) => (
                  <div
                    key={principle.title}
                    className="rounded-xl border border-brand-border bg-brand-surface/80 p-5"
                  >
                    <h3 className="text-xs font-medium uppercase tracking-widest text-brand-heading">
                      {principle.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-brand-dim">
                      {principle.body}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <div className="mt-16 grid gap-4 sm:grid-cols-2">
              <a
                href="https://www.youtube.com/@asocijacija-adam"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col rounded-xl border border-brand-border bg-brand-surface/80 p-5 transition-all duration-200 hover:border-brand-border-strong hover:bg-brand-surface-hover"
              >
                <div className="flex items-center gap-2.5">
                  <Youtube className="h-5 w-5 shrink-0 text-brand-accent" />
                  <h2 className="font-medium text-brand-heading">
                    YouTube kanal
                  </h2>
                  <ArrowUpRight className="ml-auto h-4 w-4 shrink-0 text-brand-border-strong transition-colors group-hover:text-brand-accent" />
                </div>
                <p className="mt-3 text-sm leading-relaxed text-brand-dim">
                  Video materijali o islamskoj teologiji, istoriji i
                  komparativnoj religiji.
                </p>
              </a>

              <Link
                to="/kontakt"
                className="group flex flex-col rounded-xl border border-brand-border bg-brand-surface/80 p-5 transition-all duration-200 hover:border-brand-border-strong hover:bg-brand-surface-hover"
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
        </section>
    </PageShell>
  );
}
