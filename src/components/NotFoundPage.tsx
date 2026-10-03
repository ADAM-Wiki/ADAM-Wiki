import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { SITE_NAME } from "../utils/siteConfig";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-brand-bg relative selection:bg-brand-accent selection:text-brand-on-accent">
      <Helmet>
        <title>{`404 — Stranica nije pronađena | ${SITE_NAME}`}</title>
        <meta name="description" content="Tražena stranica ne postoji." />
      </Helmet>

      <Navbar />

      <main id="glavni-sadrzaj" tabIndex={-1} className="pt-20">
        <section className="py-32">
          <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center">

            {/* aria-hidden and no negative margin: the numeral is decoration
                that the heading names in words, and -mt-6 was pulling the h1
                24px up into it, so the two overlapped at every width. */}
            <span
              aria-hidden
              className="text-[120px] font-serif font-medium leading-none text-brand-border select-none"
            >
              404
            </span>

            <h1 className="mt-4 mb-4 text-3xl font-serif font-medium text-brand-heading">
              Stranica nije pronađena
            </h1>

            <p className="text-brand-dim text-sm max-w-md mb-10 leading-relaxed">
              Stranica koju tražite ne postoji, možda je uklonjena ili je URL
              neispravan.
            </p>

            {/* A 404 on a 206-article archive is worth more than one button
                back to the top of the site. */}
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to="/search"
                className="px-6 py-3 bg-brand-accent text-brand-on-accent text-sm rounded-lg transition-opacity hover:opacity-90"
              >
                Pretraži arhivu
              </Link>
              <Link
                to="/categories"
                className="px-6 py-3 bg-brand-surface border border-brand-border text-brand-heading text-sm rounded-lg hover:bg-brand-surface-hover transition-colors"
              >
                Sve kategorije
              </Link>
              <Link
                to="/"
                className="px-6 py-3 bg-brand-surface border border-brand-border text-brand-heading text-sm rounded-lg hover:bg-brand-surface-hover transition-colors"
              >
                Početna
              </Link>
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}