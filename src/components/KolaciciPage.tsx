import { Helmet } from "react-helmet-async";
import Navbar from "./Navbar";
import Footer from "./Footer";
import BackToTop from "./BackToTop";
import { SITE_NAME } from "../utils/siteConfig";

export default function KolaciciPage() {
  return (
    <div className="min-h-screen bg-brand-bg">
      <Helmet>
        <title>{`Politika Kolačića | ${SITE_NAME}`}</title>
      </Helmet>
      <Navbar />
      <main className="pt-20">
        <section className="py-20">
          <div className="max-w-3xl mx-auto px-6">
            <div className="flex items-center gap-4 mb-10">
              <span className="text-xs font-mono text-brand-dim">LEGALNO</span>
              <h1 className="text-3xl font-serif font-medium">Politika Kolačića</h1>
            </div>
            <div className="space-y-8 text-brand-dim leading-relaxed">
              <div>
                <h2 className="text-brand-heading font-medium mb-3">Šta su kolačići?</h2>
                <p>Kolačići su male tekstualne datoteke koje web stranice pohranjuju na vašem uređaju kako bi zapamtile određene informacije o vašoj poseti.</p>
              </div>
              <div>
                <h2 className="text-brand-heading font-medium mb-3">Koje kolačiće koristimo?</h2>
                <p>Koristimo isključivo funkcionalne kolačiće koji su neophodni za ispravno prikazivanje stranice.</p>
              </div>
              <div>
                <h2 className="text-brand-heading font-medium mb-3">Upravljanje kolačićima</h2>
                <p>Možete onemogućiti kolačiće u postavkama vašeg pretraživača. Napominjemo da onemogućavanje kolačića može uticati na funkcionalnost stranice.</p>
              </div>
              <p className="text-xs text-brand-border-strong pt-4 border-t border-brand-border">
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