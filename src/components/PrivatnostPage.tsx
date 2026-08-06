import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import StaticNavbar from "./StaticNavbar";
import Footer from "./Footer";
import BackToTop from "./BackToTop";
import { SITE_NAME } from "../utils/siteConfig";

export default function PrivatnostPage() {
  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-brand-bg">
      <Helmet>
        <title>{`Privatnost | ${SITE_NAME}`}</title>
      </Helmet>
      <StaticNavbar />
      <main className="pt-20">
        <section className="py-20">
          <div className="max-w-3xl mx-auto px-6">

            <div className="flex items-center gap-4 mb-10">
              <span className="text-xs font-mono text-brand-dim">LEGALNO</span>
              <h1 className="text-3xl font-serif font-medium">Politika Privatnosti</h1>
            </div>

            <div className="space-y-8 text-brand-dim leading-relaxed">
              <div>
                <h2 className="text-white font-medium mb-3">Prikupljanje podataka</h2>
                <p>
                  Ova stranica ne prikuplja lične podatke posetilaca.
                  Ne koristimo forme za registraciju niti čuvamo korisničke podatke.
                </p>
              </div>

              <div>
                <h2 className="text-white font-medium mb-3">Kolačići</h2>
                <p>
                  Koristimo isključivo tehničke kolačiće potrebne za funkcionisanje sajta.
                  Ne koristimo kolačiće za praćenje.
                </p>
              </div>

              <div>
                <h2 className="text-white font-medium mb-3">Analitika</h2>
                <p>
                  Možemo koristiti anonimne analitičke podatke isključivo
                  u svrhu poboljšanja sadržaja.
                </p>
              </div>

              <div>
                <h2 className="text-white font-medium mb-3">Kontakt</h2>
                <p>
                  Za sva pitanja vezana za privatnost,{" "}
                  <Link to="/kontakt" className="underline hover:text-white transition-colors">
                    kontaktirajte nas
                  </Link>
                  .
                </p>
              </div>

              <p className="text-xs text-white/20 pt-4 border-t border-white/5">
                Posljednje ažuriranje: {year}
              </p>
            </div>

          </div>
        </section>
      </main>
      <BackToTop />
      <Footer />
    </div>
  );
}