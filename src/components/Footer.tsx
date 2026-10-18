import { Link, useLocation } from "react-router-dom";
import { ArrowUp, Search } from "lucide-react";
import { KURAN_PATH } from "../utils/kuranPromo";

/**
 * Every entry here is a link rather than a button that calls navigate().
 * As buttons they carried no href, so middle-click, Cmd-click and "open in new
 * tab" all did nothing, and crawlers could not follow them at all.
 */
const LINK_CLASS =
  "hover:text-brand-accent transition-colors py-1 inline-block";

export default function Footer() {
  const { pathname } = useLocation();

  // Prerendered routes are served as directories ("/tags/"), so the trailing
  // slash is trimmed before comparing — otherwise the current page never
  // matches and aria-current is never set.
  const isCurrent = (path: string) => {
    const trim = (p: string) => (p.length > 1 ? p.replace(/\/+$/, "") : p);
    return trim(pathname) === trim(path);
  };

  const toTop = () => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <footer className="py-16 print:hidden border-t border-brand-border bg-brand-bg/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-12">

          <div>
            <Link
              to="/"
              aria-current={isCurrent("/") ? "page" : undefined}
              className="font-serif text-3xl block mb-8 hover:text-brand-accent transition-colors"
            >
              Adam
            </Link>
            <p className="text-brand-dim max-w-sm leading-relaxed text-sm">
              Arhiva naučnih dokaza i istraživanja posvećena istini u doba sumnje.
              Transparentnost, integritet i dokumentovana istorija.
            </p>
          </div>

          <nav aria-label="Arhiva">
            <h2 className="font-mono text-xs uppercase tracking-[0.1em] font-normal mb-8 text-brand-dim">Arhiva</h2>
            <ul className="space-y-4 text-sm text-brand-dim">
              <li>
                <Link to="/categories" aria-current={isCurrent("/categories") ? "page" : undefined} className={LINK_CLASS}>
                  Kategorije
                </Link>
              </li>
              <li>
                <Link to="/tags" aria-current={isCurrent("/tags") ? "page" : undefined} className={LINK_CLASS}>
                  Tagovi
                </Link>
              </li>
              <li>
                <Link to="/search" aria-current={isCurrent("/search") ? "page" : undefined} className={LINK_CLASS}>
                  Pretraga
                </Link>
              </li>
              <li>
                <Link to={KURAN_PATH} aria-current={isCurrent(KURAN_PATH) ? "page" : undefined} className={LINK_CLASS}>
                  Besplatan Kur’an
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="O projektu">
            <h2 className="font-mono text-xs uppercase tracking-[0.1em] font-normal mb-8 text-brand-dim">O projektu</h2>
            <ul className="space-y-4 text-sm text-brand-dim">
              <li>
                <Link to="/kontakt" aria-current={isCurrent("/kontakt") ? "page" : undefined} className={LINK_CLASS}>
                  Kontakt
                </Link>
              </li>

              <li>
                <Link to="/about" aria-current={isCurrent("/about") ? "page" : undefined} className={LINK_CLASS}>
                  O nama
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Legalno">
            <h2 className="font-mono text-xs uppercase tracking-[0.1em] font-normal mb-8 text-brand-dim">Legalno</h2>
            <ul className="space-y-4 text-sm text-brand-dim">
              <li>
                <Link to="/privatnost" aria-current={isCurrent("/privatnost") ? "page" : undefined} className={LINK_CLASS}>
                  Privatnost
                </Link>
              </li>
              <li>
                <Link to="/uslovi" aria-current={isCurrent("/uslovi") ? "page" : undefined} className={LINK_CLASS}>
                  Uslovi korištenja
                </Link>
              </li>
              <li>
                <Link to="/kolacici" aria-current={isCurrent("/kolacici") ? "page" : undefined} className={LINK_CLASS}>
                  Politika kolačića
                </Link>
              </li>
            </ul>
          </nav>

        </div>

        {/* Continuation: the highest-intent moment on a Read surface is the
            moment the reader finishes. One ranked exit, not a second sitemap. */}
        <div className="flex flex-wrap items-center gap-3 pb-12 print:hidden">
          <Link
            to="/search"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-brand-border bg-transparent px-4 font-mono text-xs uppercase tracking-[0.1em] text-brand-dim transition-colors hover:border-brand-accent hover:text-brand-accent"
          >
            <Search aria-hidden className="h-4 w-4 shrink-0" />
            Pretraži arhivu
          </Link>
          <button
            type="button"
            onClick={toTop}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-brand-border bg-transparent px-4 font-mono text-xs uppercase tracking-[0.1em] text-brand-dim transition-colors hover:border-brand-accent hover:text-brand-accent"
          >
            <ArrowUp aria-hidden className="h-4 w-4 shrink-0" />
            Nazad na vrh
          </button>
        </div>

        <div className="pt-8 border-t border-brand-border flex flex-col md:flex-row justify-between items-center gap-8">
          <span className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.1em] text-brand-dim">
            <span aria-hidden className="h-1.5 w-1.5 rotate-45 bg-brand-accent shrink-0" />
            © {__BUILD_YEAR__} ADAM RESEARCH DATABASE — SVA PRAVA ZADRŽANA
          </span>
          <div className="flex gap-8">
            <a href="https://www.youtube.com/@asocijacija-adam" target="_blank" rel="noopener noreferrer" aria-label="ADAM na YouTubeu" className="py-2 font-mono text-xs uppercase tracking-[0.2em] text-brand-dim hover:text-brand-accent transition-colors">Youtube</a>
            <a href="https://www.facebook.com/asocijacijaadam" target="_blank" rel="noopener noreferrer" aria-label="ADAM na Facebooku" className="py-2 font-mono text-xs uppercase tracking-[0.2em] text-brand-dim hover:text-brand-accent transition-colors">Facebook</a>
            <a href="https://www.tiktok.com/@asocijacija.adam" target="_blank" rel="noopener noreferrer" aria-label="ADAM na TikToku" className="py-2 font-mono text-xs uppercase tracking-[0.2em] text-brand-dim hover:text-brand-accent transition-colors">Tiktok</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
