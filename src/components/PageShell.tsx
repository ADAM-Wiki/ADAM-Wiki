import type { ReactNode } from "react";

import Navbar from "./Navbar";
import Footer from "./Footer";
import BackToTop from "./BackToTop";

interface PageShellProps {
  children: ReactNode;
  /** Hides the global noise overlay (body:has(.page-no-grid)::before). */
  noGrid?: boolean;
  /** Overrides <main>'s classes; pages with a taller header use "pt-24 pb-20". */
  mainClassName?: string;
}

/**
 * The page frame every route shares: outer themed div, Navbar,
 * main#glavni-sadrzaj (the skip-link target), BackToTop, Footer.
 *
 * Page-specific <Helmet> meta stays in the page and renders as the first
 * child - react-helmet-async collects it from anywhere in the tree, so the
 * shell needs no meta API.
 */
export default function PageShell({
  children,
  noGrid,
  mainClassName = "pt-20",
}: PageShellProps) {
  return (
    <div
      className={`${noGrid ? "page-no-grid " : ""}min-h-screen bg-brand-bg relative selection:bg-brand-accent selection:text-brand-on-accent`}
    >
      <Navbar />
      <main id="glavni-sadrzaj" tabIndex={-1} className={mainClassName}>
        {children}
      </main>
      <BackToTop />
      <Footer />
    </div>
  );
}
