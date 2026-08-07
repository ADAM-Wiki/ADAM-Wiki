import { useNavigate } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="py-24 border-t border-brand-border bg-brand-bg/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-16 mb-20">

          <div className="col-span-2">
            <button
              onClick={() => { navigate("/"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="text-2xl font-medium tracking-[0.2em] uppercase block mb-8 hover:text-brand-dim transition-colors"
            >
              Adam
            </button>
            <p className="text-brand-dim font-light max-w-sm leading-relaxed">
              Arhiva naučnih dokaza i istraživanja posvećena istini u doba sumnje.
              Transparentnost, integritet i dokumentovana istorija.
            </p>
          </div>

          <div>
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-8 text-brand-dim">Legalno</h4>
            <ul className="space-y-4 text-sm text-brand-dim">
              <li>
                <button onClick={() => navigate("/privatnost")} className="hover:text-brand-heading transition-colors">
                  Privatnost
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/uslovi")} className="hover:text-brand-heading transition-colors">
                  Uslovi korišćenja
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/kolacici")} className="hover:text-brand-heading transition-colors">
                  Politika kolačića
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-8 text-brand-dim">Navigacija</h4>
            <ul className="space-y-4 text-sm text-brand-dim">
              <li>
                <button onClick={() => navigate("/kontakt")} className="hover:text-brand-heading transition-colors">
                  Kontakt
                </button>
              </li>
              
              <li>
                <button onClick={() => navigate("/about")} className="hover:text-brand-heading transition-colors">
                  O Projektu
                </button>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-12 border-t border-brand-border flex flex-col md:flex-row justify-between items-center gap-8">
          <span className="text-[10px] tracking-[0.2em] uppercase text-brand-dim">
            © {new Date().getFullYear()} ADAM RESEARCH DATABASE — SVA PRAVA ZADRŽANA
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