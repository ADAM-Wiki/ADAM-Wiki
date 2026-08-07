import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { SITE_NAME } from "../utils/siteConfig";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-brand-bg relative selection:bg-brand-accent selection:text-brand-on-accent">
      <Helmet>
        <title>{`404 — Stranica nije pronađena | ${SITE_NAME}`}</title>
        <meta name="description" content="Tražena stranica ne postoji." />
      </Helmet>

      <Navbar />

      <main className="pt-20">
        <section className="py-32">
          <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center">

            <span className="text-[120px] font-serif font-medium leading-none text-brand-border select-none">
              404
            </span>

            <h1 className="text-3xl font-serif font-medium text-brand-heading -mt-6 mb-4">
              Stranica nije pronađena
            </h1>

            <p className="text-brand-dim text-sm max-w-md mb-10 leading-relaxed">
              Stranica koju tražite ne postoji, možda je uklonjena ili je URL neispravan.
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => navigate("/")}
                className="px-6 py-3 bg-brand-surface border border-brand-border text-brand-heading text-sm rounded-lg hover:bg-brand-surface-hover transition"
              >
                Početna
              </button>
              
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}