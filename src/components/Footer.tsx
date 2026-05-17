import { useNavigate } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="py-24 border-t border-white/5 bg-black/50">
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
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-8 text-white/40">Legalno</h4>
            <ul className="space-y-4 text-sm text-brand-dim">
              <li>
                <button onClick={() => navigate("/privatnost")} className="hover:text-white transition-colors">
                  Privatnost
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/uslovi")} className="hover:text-white transition-colors">
                  Uslovi korišćenja
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/kolacici")} className="hover:text-white transition-colors">
                  Politika kolačića
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-8 text-white/40">Navigacija</h4>
            <ul className="space-y-4 text-sm text-brand-dim">
              <li>
                <button onClick={() => navigate("/kontakt")} className="hover:text-white transition-colors">
                  Kontakt
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/saradnja")} className="hover:text-white transition-colors">
                  Saradnja
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/about")} className="hover:text-white transition-colors">
                  O Projektu
                </button>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <span className="text-[10px] tracking-[0.2em] uppercase text-brand-dim">
            © {new Date().getFullYear()} ADAM RESEARCH DATABASE — SVA PRAVA ZADRŽANA
          </span>
          <div className="flex gap-8">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-[10px] tracking-[0.2em] text-brand-dim hover:text-white transition-colors">TWITTER</a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-[10px] tracking-[0.2em] text-brand-dim hover:text-white transition-colors">INSTAGRAM</a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-[10px] tracking-[0.2em] text-brand-dim hover:text-white transition-colors">LINKEDIN</a>
          </div>
        </div>

      </div>
    </footer>
  );
}