import { Helmet } from "react-helmet-async";
import Navbar from "./Navbar";
import Footer from "./Footer";
import BackToTop from "./BackToTop";
import { SITE_NAME } from "../utils/siteConfig";

export default function UsloviPage() {
  return (
    <div className="min-h-screen bg-brand-bg">
      <Helmet>
        <title>{`Uslovi korišćenja | ${SITE_NAME}`}</title>
      </Helmet>
      <Navbar />
      <main className="pt-20">
        <section className="py-20">
          <div className="max-w-3xl mx-auto px-6">
            <div className="flex items-center gap-4 mb-10">
              <span className="text-xs font-mono text-brand-dim">LEGALNO</span>
              <h1 className="text-3xl font-serif font-medium">Uslovi Korišćenja</h1>
            </div>
            <div className="space-y-8 text-brand-dim leading-relaxed">
              <div>
                <h2 className="text-white font-medium mb-3">Upotreba sadržaja</h2>
                <p>Sav sadržaj na ovoj stranici je namijenjen isključivo u informativne i edukativne svrhe. Dozvoljeno je kopiranje i redistribucija bez navođenja izvora.</p>
              </div>
              <div>
                <h2 className="text-white font-medium mb-3">Odgovornost</h2>
                <p>Trudimo se da svi podaci budu tačni i provereni. Čitaoci se pozivaju da sami provere navedene izvore.</p>
              </div>
              <div>
                <h2 className="text-white font-medium mb-3">Izmene</h2>
                <p>Zadržavamo pravo izmene ovih uslova u bilo kom trenutku. Nastavak korištenja sajta podrazumeva prihvatanje izmenjenih uslova.</p>
              </div>
              <p className="text-xs text-white/20 pt-4 border-t border-white/5">
                Posljednje ažuriranje: {new Date().getFullYear()}
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