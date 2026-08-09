/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// The home page is what a first-time visitor lands on, so it stays in the main
// bundle. Every other route is split out and fetched on navigation.
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import TopicsGrid from "./components/TopicsGrid";
import ArticleSection from "./components/ArticleSection";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";

const SearchPage = lazy(() => import("./components/SearchPage"));

// Every category listing shares one component; only the MDX behind an article
// is category-specific, so those stay as separate lazily-loaded chunks.
const CategoryPage = lazy(() => import("./components/CategoryPage"));

const HadisArticlePage = lazy(() => import("./components/HadisArticlePage"));
const AteizamArticlePage = lazy(
  () => import("./components/AteizamArticlePage"),
);
const HriscanstvoArticlePage = lazy(
  () => import("./components/HriscanstvoArticlePage"),
);
const HinduizamArticlePage = lazy(
  () => import("./components/HinduizamArticlePage"),
);
const IslamArticlePage = lazy(() => import("./components/IslamArticlePage"));
const IstorijaArticlePage = lazy(
  () => import("./components/IstorijaArticlePage"),
);
const AhmedijeArticlePage = lazy(
  () => import("./components/AhmedijeArticlePage"),
);
const OdgovoriArticlePage = lazy(
  () => import("./components/OdgovoriArticlePage"),
);
const OpovrgavanjeArticlePage = lazy(
  () => import("./components/OpovrgavanjeArticlePage"),
);
const NaukaArticlePage = lazy(() => import("./components/NaukaArticlePage"));
const MuhammedArticlePage = lazy(
  () => import("./components/MuhammedArticlePage"),
);
const SpisiArticlePage = lazy(() => import("./components/SpisiArticlePage"));

const CategoriesPage = lazy(() => import("./components/CategoriesPage"));
const NotFoundPage = lazy(() => import("./components/NotFoundPage"));
const TagsPage = lazy(() => import("./components/TagsPage"));
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
    <div className="min-h-screen bg-brand-bg relative selection:bg-brand-accent selection:text-brand-on-accent">
      <Navbar />

      <main>
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
    <Router basename="/ADAM-Wiki">
      <ScrollToTop />

      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />

          {/* CATEGORY PAGES */}
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/categories/:categoryId" element={<CategoryPage />} />

          {/* ARTICLE PAGES */}
          <Route
            path="/categories/hadis/article/:slug"
            element={<HadisArticlePage />}
          />
          <Route
            path="/categories/ateizam/article/:slug"
            element={<AteizamArticlePage />}
          />
          <Route
            path="/categories/hriscanstvo/article/:slug"
            element={<HriscanstvoArticlePage />}
          />
          <Route
            path="/categories/hinduizam/article/:slug"
            element={<HinduizamArticlePage />}
          />
          <Route
            path="/categories/islam/article/:slug"
            element={<IslamArticlePage />}
          />
          <Route
            path="/categories/istorija/article/:slug"
            element={<IstorijaArticlePage />}
          />
          <Route
            path="/categories/ahmedije/article/:slug"
            element={<AhmedijeArticlePage />}
          />
          <Route
            path="/categories/odgovori/article/:slug"
            element={<OdgovoriArticlePage />}
          />
          <Route
            path="/categories/opovrgavanje/article/:slug"
            element={<OpovrgavanjeArticlePage />}
          />
          <Route
            path="/categories/nauka/article/:slug"
            element={<NaukaArticlePage />}
          />
          <Route
            path="/categories/muhammed/article/:slug"
            element={<MuhammedArticlePage />}
          />
          <Route
            path="/categories/spisi/article/:slug"
            element={<SpisiArticlePage />}
          />

          {/* UTILITY PAGES */}
          <Route path="/tags" element={<TagsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/kontakt" element={<KontaktPage />} />
          <Route path="/privatnost" element={<PrivatnostPage />} />
          <Route path="/uslovi" element={<UsloviPage />} />
          <Route path="/kolacici" element={<KolaciciPage />} />
          <Route path="*" element={<NotFoundPage />} />
          <Route path="/search" element={<SearchPage />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
