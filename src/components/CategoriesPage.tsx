import { FolderOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "./Navbar";
import Footer from "./Footer";
import BackToTop from "./BackToTop";
import { SITE_NAME } from "../utils/siteConfig";
import { getCategoryStats } from "../utils/articleIndex";

const DESCRIPTION =
  "Sve kategorije na Adam-Wiki, sa brojem članaka i kratkim opisom svake.";

/** Serbian counts: 1 članak, 2-4 članka, 5+ članaka. */
function articleCount(n: number): string {
  const lastTwo = n % 100;
  if (lastTwo >= 11 && lastTwo <= 14) return `${n} članaka`;
  const last = n % 10;
  if (last === 1) return `${n} članak`;
  if (last >= 2 && last <= 4) return `${n} članka`;
  return `${n} članaka`;
}

/**
 * The category index.
 *
 * Two things this page used to get wrong. It showed no article counts, which
 * are the one thing you actually choose on - the home page had them and this
 * page, the one dedicated to choosing, did not. And it linked every category
 * including the five with nothing in them, so a third of the grid led to an
 * empty listing. Those are now named as pending rather than dressed up as
 * destinations.
 */
export default function CategoriesPage() {
  const stats = getCategoryStats();
  const populated = stats.filter((category) => category.count > 0);
  const pending = stats.filter((category) => category.count === 0);

  return (
    <div className="min-h-screen bg-brand-bg relative selection:bg-brand-accent selection:text-brand-on-accent">
      <Helmet>
        <title>{`Kategorije | ${SITE_NAME}`}</title>
        <meta name="description" content={DESCRIPTION} />
      </Helmet>

      <Navbar />

      <main id="glavni-sadrzaj" tabIndex={-1} className="pt-20">
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="page-rise flex items-center gap-4 mb-3">
              <span className="text-xs font-mono text-brand-dim">01</span>
              <h1 className="text-3xl font-serif font-medium">
                Sve kategorije
              </h1>
            </div>

            <p
              className="page-rise mb-12 font-mono text-xs uppercase tracking-widest text-brand-dim"
              style={{ animationDelay: "40ms" }}
            >
              {populated.length} kategorija ·{" "}
              {articleCount(
                populated.reduce((sum, category) => sum + category.count, 0),
              )}
            </p>

            {/* .page-rise rather than Motion: this page is prerendered, so a
                JS entrance only starts once React takes over - well after the
                grid has already been painted. The delay trails the heading,
                which runs the same animation with no delay. */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {populated.map((category, index) => (
                <div
                  key={category.id}
                  style={{ animationDelay: `${80 + index * 45}ms` }}
                  className="page-rise"
                >
                  <Link
                    to={category.url}
                    className="group flex h-full flex-col rounded-lg border border-brand-border bg-brand-surface p-5 transition-colors hover:border-brand-border-strong hover:bg-brand-surface-hover"
                  >
                    <div className="flex items-start gap-4">
                      <FolderOpen
                        aria-hidden
                        className="mt-0.5 h-5 w-5 shrink-0 text-brand-dim transition-colors group-hover:text-brand-accent"
                      />

                      <span className="min-w-0 flex-1 text-xs font-medium uppercase tracking-widest transition-colors group-hover:text-brand-heading">
                        {category.title}
                      </span>

                      <span className="shrink-0 font-mono text-xs text-brand-dim transition-colors group-hover:text-brand-accent">
                        {category.count}
                      </span>
                    </div>

                    <p className="mt-3 text-sm leading-relaxed text-brand-dim">
                      {category.description}
                    </p>
                  </Link>
                </div>
              ))}
            </div>

            {pending.length > 0 && (
              <div
                className="page-rise mt-16 border-t border-brand-border pt-8"
                style={{ animationDelay: `${80 + populated.length * 45}ms` }}
              >
                <h2 className="font-mono text-[10px] uppercase tracking-widest text-brand-dim">
                  U pripremi
                </h2>

                {/* Deliberately not links. Each of these listings is empty, and
                    a link that lands on "još nema članaka" wastes a click and
                    reads as a broken section rather than an unfinished one. */}
                <ul className="mt-4 flex flex-wrap gap-2">
                  {pending.map((category) => (
                    <li
                      key={category.id}
                      title={category.description}
                      className="rounded-lg border border-dashed border-brand-border px-3 py-1.5 text-xs uppercase tracking-widest text-brand-dim/70"
                    >
                      {category.title}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      </main>

      <BackToTop />
      <Footer />
    </div>
  );
}
