import { Link } from "react-router-dom";

/**
 * Every entry here is a link rather than a button that calls navigate().
 * As buttons they carried no href, so middle-click, Cmd-click and "open in new
 * tab" all did nothing, and crawlers could not follow them at all.
 */
export default function Footer() {
  return (
    <footer className="py-24 print:hidden border-t border-brand-border bg-brand-bg/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-16 mb-20">

          <div className="col-span-2">
            <Link
              to="/"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="text-2xl font-medium tracking-[0.2em] uppercase block mb-8 hover:text-brand-dim transition-colors"
            >
              Adam
            </Link>
            <p className="text-brand-dim font-light max-w-sm leading-relaxed">
              Arhiva naučnih dokaza i istraživanja posvećena istini u doba sumnje.
              Transparentnost, integritet i dokumentovana istorija.
            </p>
          </div>

          <nav aria-label="Legalno">
            <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-8 text-brand-dim">Legalno</h2>
            <ul className="space-y-4 text-sm text-brand-dim">
              <li>
                <Link to="/privatnost" className="hover:text-brand-heading transition-colors">
                  Privatnost
                </Link>
              </li>
              <li>
                <Link to="/uslovi" className="hover:text-brand-heading transition-colors">
                  Uslovi korišćenja
                </Link>
              </li>
              <li>
                <Link to="/kolacici" className="hover:text-brand-heading transition-colors">
                  Politika kolačića
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Navigacija">
            <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-8 text-brand-dim">Navigacija</h2>
            <ul className="space-y-4 text-sm text-brand-dim">
              <li>
                <Link to="/kontakt" className="hover:text-brand-heading transition-colors">
                  Kontakt
                </Link>
              </li>

              <li>
                <Link to="/about" className="hover:text-brand-heading transition-colors">
                  O Projektu
                </Link>
              </li>
            </ul>
          </nav>

        </div>

        <div className="pt-12 border-t border-brand-border flex flex-col md:flex-row justify-between items-center gap-8">
          <span className="text-[10px] tracking-[0.2em] uppercase text-brand-dim">
            © {__BUILD_YEAR__} ADAM RESEARCH DATABASE — SVA PRAVA ZADRŽANA
          </span>
          <div className="flex gap-8">
            <a href="https://www.youtube.com/@asocijacija-adam" target="_blank" rel="noopener noreferrer" className="text-[10px] tracking-[0.2em] text-brand-dim hover:text-brand-heading transition-colors">YOUTUBE</a>
            <a href="https://www.facebook.com/asocijacijaadam" target="_blank" rel="noopener noreferrer" className="text-[10px] tracking-[0.2em] text-brand-dim hover:text-brand-heading transition-colors">FACEBOOK</a>
            <a href="https://www.tiktok.com/@asocijacija.adam" target="_blank" rel="noopener noreferrer" className="text-[10px] tracking-[0.2em] text-brand-dim hover:text-brand-heading transition-colors">TIKTOK</a>
          </div>
        </div>

      </div>
    </footer>
  );
}