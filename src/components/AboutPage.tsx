import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "./Navbar";
import Footer from "./Footer";
import BackToTop from "./BackToTop";
import { SITE_NAME } from "../utils/siteConfig";
import { Link } from "react-router-dom";

export default function AboutPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-brand-bg">
      <Helmet>
        <title>{`O Projektu | ${SITE_NAME}`}</title>
      </Helmet>
      <Navbar />
      <main className="pt-20">
        <section className="py-20">
          <div className="max-w-3xl mx-auto px-6">
            <div className="flex items-center gap-4 mb-10">
              <span className="text-xs font-mono text-brand-dim">O NAMA</span>
              <h1 className="text-3xl font-serif font-medium">O Projektu</h1>
            </div>
            <div className="space-y-6 text-brand-dim leading-relaxed">
              <p>
                <strong className="text-white">Adam Research Database</strong>{" "}
                je projekat posvećen istraživanju i dokumentovanju naučnih,
                istorijskih i teoloških tema sa fokusom na islamsku tradiciju i
                komparativnu religiju.
              </p>
              <p>
                Cilj projekta je pružiti čitaocima pristup proverenim
                informacijama, izvorima i analizama koje su često teško dostupne
                na jezicima ex-Yu prostora.
              </p>
              <p>
                Svi članci su pisani sa namerom da budu edukativni, objektivni i
                utemeljeni na primarnim izvorima. Svaki tekst navodi izvore i
                poziva čitaoca na samostalno istraživanje.
              </p>

              {/* YouTube section */}
              <div className="border border-white/5 rounded-lg p-6 bg-white/[0.01] mt-10">
                <h2 className="text-white font-medium mb-3">YouTube Kanal</h2>
                <p className="text-sm mb-4">
                  Pored pisanog sadržaja, pratite nas i na YouTube kanalu gde
                  objavljujemo video materijale o islamskoj teologiji, istoriji
                  i komparativnoj religiji.
                </p>
                <a
                  href="https://www.youtube.com/@asocijacija-adam"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2 text-sm border border-white/10 rounded-lg hover:border-red-500 hover:text-red-400 transition-colors"
                >
                  ▶ Posetite naš YouTube kanal
                </a>
              </div>
              <div className="border border-white/5 rounded-lg p-6 bg-white/[0.01] mt-10">
                <h2 className="text-white font-medium mb-3">
                  Kontaktirajte nas
                </h2>
                <p className="text-sm">Za pitanja, predloge ili saradnju:</p>
                <button
                  onClick={() => navigate("/kontakt")}
                  className="mt-4 px-5 py-2 text-sm border border-white/10 rounded-lg hover:border-white/30 hover:text-white transition-colors"
                >
                  Kontakt forma →
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <BackToTop />
      <Footer />
    </div>
  );
}
