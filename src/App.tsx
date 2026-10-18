/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense, type ComponentType } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { MotionConfig } from "motion/react";

// The home page is what a first-time visitor lands on, so it stays in the main
// bundle. Every other route is split out and fetched on navigation.
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import TopicsGrid from "./components/TopicsGrid";
import ArticleSection from "./components/ArticleSection";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
// Mounted at the root rather than per page: the offer follows the reader
// across the archive, and it decides for itself where to stay quiet.
import KuranPromo from "./components/KuranPromo";
import { KURAN_PATH } from "./utils/kuranPromo";
import { CATEGORIES } from "./utils/categoriesData";

const SearchPage = lazy(() => import("./components/SearchPage"));

// Every category listing shares one component; only the MDX behind an article
// is category-specific, so those stay as separate lazily-loaded chunks.
const CategoryPage = lazy(() => import("./components/CategoryPage"));

// The 13 per-category article pages, keyed by the registry. Naming convention
// is <PascalCase(categoryId)>ArticlePage.tsx - check:registry fails the build
// if a registry entry has no matching component. The generic ArticlePage.tsx
// matches the glob too but is never looked up, since no category id is empty.
const articlePageModules = import.meta.glob("./components/*ArticlePage.tsx");

const CATEGORY_ARTICLE_ROUTES = CATEGORIES.map(({ id }) => {
  const fileName = `${id.charAt(0).toUpperCase()}${id.slice(1)}ArticlePage`;
  const load = articlePageModules[`./components/${fileName}.tsx`];
  if (!load) {
    // check:registry gates the build, so this only fires in dev when a
    // category was added without its component - better a loud error than a
    // silently 404-ing route.
    throw new Error(
      `Missing src/components/${fileName}.tsx for category "${id}"`,
    );
  }
  const ArticlePage = lazy(load as () => Promise<{ default: ComponentType }>);
  return (
    <Route
      key={id}
      path={`/categories/${id}/article/:slug`}
      element={<ArticlePage />}
    />
  );
});

const CategoriesPage = lazy(() => import("./components/CategoriesPage"));
const NotFoundPage = lazy(() => import("./components/NotFoundPage"));
const TagsPage = lazy(() => import("./components/TagsPage"));
const TagPage = lazy(() => import("./components/TagPage"));
const KuranPage = lazy(() => import("./components/KuranPage"));
const AboutPage = lazy(() => import("./components/AboutPage"));
const KontaktPage = lazy(() => import("./components/KontaktPage"));
const PrivatnostPage = lazy(() => import("./components/PrivatnostPage"));
const UsloviPage = lazy(() => import("./components/UsloviPage"));
const KolaciciPage = lazy(() => import("./components/KolaciciPage"));

/**
 * Shown while a route chunk downloads. Deliberately minimal - it matches the
 * page background so a fast connection shows no visible flash.
 */
function RouteFallback() {
  return <div className="min-h-screen bg-brand-bg" />;
}

function HomePage() {
  return (
    <div className="home-page min-h-screen bg-brand-bg relative selection:bg-brand-accent selection:text-brand-on-accent">
      <Navbar />

      <main id="glavni-sadrzaj" tabIndex={-1}>
        <Hero />
        <TopicsGrid />
        <ArticleSection />
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    // reducedMotion="user" makes every motion component on the site honour the
    // system setting: transform and layout animations are dropped, opacity
    // fades are kept. One switch here rather than a useReducedMotion() call in
    // each of the six components that animate.
    <MotionConfig reducedMotion="user">
      <Router basename="/ADAM-Wiki">
        <ScrollToTop />
        <KuranPromo />

        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />

            {/* CATEGORY PAGES */}
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/categories/:categoryId" element={<CategoryPage />} />

            {/* ARTICLE PAGES - one route per registry entry, from the glob above */}
            {CATEGORY_ARTICLE_ROUTES}

            {/* UTILITY PAGES */}
            <Route path="/tags" element={<TagsPage />} />
            <Route path="/tags/:tag" element={<TagPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/kontakt" element={<KontaktPage />} />
            <Route path="/privatnost" element={<PrivatnostPage />} />
            <Route path="/uslovi" element={<UsloviPage />} />
            <Route path="/kolacici" element={<KolaciciPage />} />
            <Route path={KURAN_PATH} element={<KuranPage />} />
            <Route path="*" element={<NotFoundPage />} />
            <Route path="/search" element={<SearchPage />} />
          </Routes>
        </Suspense>
      </Router>
    </MotionConfig>
  );
}
