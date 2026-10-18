import { FolderOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import PageShell from "./PageShell";
import { SITE_NAME } from "../utils/siteConfig";
import { getCategoryStats } from "../utils/articleIndex";
import { CLANAK, pluralForm } from "../utils/plurals";

const DESCRIPTION =
  "Sve kategorije na Adam-Wiki, sa brojem članaka i kratkim opisom svake.";

/** Serbian plural forms; the rule lives in utils/plurals. */
const articleCount = (n: number): string => `${n} ${pluralForm(n, CLANAK)}`;

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
    <PageShell>
      <Helmet>
        <title>{`Kategorije | ${SITE_NAME}`}</title>
        <meta name="description" content={DESCRIPTION} />
      </Helmet>

        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="page-rise mb-4 flex items-center gap-4">
              <h1 className="text-3xl font-serif font-medium text-brand-heading">
                Sve kategorije
              </h1>
            </div>

            <p
              className="page-rise mb-8 max-w-2xl text-sm leading-relaxed text-brand-dim"
              style={{ animationDelay: "40ms" }}
            >
              Odaberite temu koja vas zanima. Najjače zastupljene kategorije su
              često i najkorisniji ulaz u arhivu, dok su manje teme dobra opcija
              za fokusirano istraživanje.
            </p>

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
                    className={`group flex h-full flex-col rounded-xl border p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-border-strong hover:bg-brand-surface-hover ${
                      category.count >= 25
                        ? "border-brand-accent/40 bg-brand-surface"
                        : "border-brand-border bg-brand-surface/80"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-md border border-brand-border bg-brand-bg/60 text-brand-dim transition-colors group-hover:border-brand-border-strong group-hover:text-brand-accent">
                        <FolderOpen aria-hidden className="h-4 w-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <span className="min-w-0 text-xs font-medium uppercase tracking-widest text-brand-heading transition-colors group-hover:text-brand-accent">
                            {category.title}
                          </span>
                          <span className="shrink-0 font-mono text-[11px] text-brand-dim transition-colors group-hover:text-brand-accent">
                            {category.count}
                          </span>
                        </div>
                        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-brand-dim">
                          {category.count >= 25 ? "Najčešće" : "Tema"}
                        </p>
                      </div>
                    </div>

                    <p className="mt-4 text-sm leading-relaxed text-brand-dim">
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
    </PageShell>
  );
}
