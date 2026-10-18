import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface Neighbour {
  slug: string;
  title: string;
}

interface ArticlePrevNextProps {
  basePath: string;
  /** The entry listed before this one — newer, since lists run newest first. */
  previous?: Neighbour | null;
  /** The entry listed after this one — older. */
  next?: Neighbour | null;
  categoryName?: string;
  /** 1-based position of the current article, for the "N od M" caption. */
  position?: { index: number; total: number };
}

export default function ArticlePrevNext({
  basePath,
  previous,
  next,
  categoryName,
  position,
}: ArticlePrevNextProps) {
  if (!previous && !next) return null;

  return (
    <nav
      aria-label={
        categoryName
          ? `Ostali članci u kategoriji ${categoryName}`
          : "Ostali članci u kategoriji"
      }
      className="mt-10 print:hidden border-t border-brand-border pt-8"
    >
      {position && (
        <p className="mb-4 font-mono text-xs uppercase tracking-widest text-brand-dim">
          Članak {position.index} od {position.total}
          {categoryName ? ` u kategoriji ${categoryName}` : ""}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
      {previous ? (
        <Link
          to={`${basePath}/${previous.slug}`}
          className="group flex flex-col gap-2 rounded-lg border border-brand-border bg-brand-surface p-5 transition-colors hover:border-brand-border-strong"
        >
          <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-brand-dim">
            <ArrowLeft aria-hidden className="h-3 w-3 shrink-0" />
            Noviji članak
          </span>
          <span className="text-sm font-medium leading-snug text-brand-heading transition-colors group-hover:text-brand-accent">
            {previous.title}
          </span>
        </Link>
      ) : (
        <span aria-hidden />
      )}

      {next && (
        <Link
          to={`${basePath}/${next.slug}`}
          className="group flex flex-col items-end gap-2 rounded-lg border border-brand-border bg-brand-surface p-5 text-right transition-colors hover:border-brand-border-strong sm:col-start-2"
        >
          <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-brand-dim">
            Stariji članak
            <ArrowRight aria-hidden className="h-3 w-3 shrink-0" />
          </span>
          <span className="text-sm font-medium leading-snug text-brand-heading transition-colors group-hover:text-brand-accent">
            {next.title}
          </span>
        </Link>
      )}
      </div>
    </nav>
  );
}
