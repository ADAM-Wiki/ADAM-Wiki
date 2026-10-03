import type { ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "./Navbar";
import Footer from "./Footer";
import BackToTop from "./BackToTop";
import { SITE_NAME, SITE_URL } from "../utils/siteConfig";

export interface LegalSection {
  title: string;
  body: ReactNode;
}

interface LegalPageProps {
  /** Page heading; also the document title ahead of the site name. */
  title: string;
  /** The line under the heading, reused as the meta description. */
  description: string;
  /** Route of this page, for og:url. */
  path: string;
  sections: LegalSection[];
}

/**
 * Shared shell for the three legal pages, which differ only in their text.
 *
 * They started as three copies of the same markup and had already drifted:
 * one pulled in a different navbar, none carried a meta description or the
 * selection colours, and all three set their body copy a step lighter than
 * every other page on the site. Centralising it means the next edit lands on
 * all three at once.
 *
 * Layout follows the About and Kontakt pages - centred header, max-w-3xl,
 * numbered sections in the site's serif - rather than the listing pages, since
 * this is prose to read rather than a grid to scan.
 */
export default function LegalPage({
  title,
  description,
  path,
  sections,
}: LegalPageProps) {
  // Build-time literal, not the clock - see __BUILD_YEAR__ in vite.config.ts.
  const year = __BUILD_YEAR__;

  return (
    <div className="min-h-screen bg-brand-bg selection:bg-brand-accent selection:text-brand-on-accent">
      <Helmet>
        <title>{`${title} | ${SITE_NAME}`}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={`${title} | ${SITE_NAME}`} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={`${SITE_URL}${path}`} />
      </Helmet>

      <Navbar />

      <main id="glavni-sadrzaj" tabIndex={-1} className="pt-24 pb-20">
        <div className="mx-auto max-w-3xl px-6">
          <header className="page-rise text-center">
            <span className="font-mono text-xs uppercase tracking-widest text-brand-dim">
              Legalno
            </span>
            <h1 className="mt-2 font-serif text-3xl font-medium text-brand-heading">
              {title}
            </h1>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-brand-dim">
              {description}
            </p>
          </header>

          <div className="mt-14 space-y-10">
            {sections.map((section, index) => (
              <section
                key={section.title}
                className="page-rise"
                style={{ animationDelay: `${80 + index * 45}ms` }}
              >
                <span className="font-mono text-xs text-brand-accent">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h2 className="mt-2 font-serif text-xl text-brand-heading">
                  {section.title}
                </h2>
                {/* A div, not a p: `body` is a ReactNode and the cookie page
                    already passes a fragment through it. Any block element in
                    there would be hoisted out of a <p> by the parser, splitting
                    the section in two. */}
                <div className="mt-3 leading-relaxed text-brand-text">
                  {section.body}
                </div>
              </section>
            ))}
          </div>

          <p className="mt-16 border-t border-brand-border pt-8 text-center font-mono text-xs uppercase tracking-widest text-brand-dim">
            Posljednje ažuriranje: {year}
          </p>
        </div>
      </main>

      <BackToTop />
      <Footer />
    </div>
  );
}
