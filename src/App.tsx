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

const HadisPage = lazy(() => import("./components/HadisPage"));
const HadisArticlePage = lazy(() => import("./components/HadisArticlePage"));
const AteizamPage = lazy(() => import("./components/AteizamPage"));
const AteizamArticlePage = lazy(
  () => import("./components/AteizamArticlePage"),
);
const HriscanstvoPage = lazy(() => import("./components/HriscanstvoPage"));
const HriscanstvoArticlePage = lazy(
  () => import("./components/HriscanstvoArticlePage"),
);
const HinduizamPage = lazy(() => import("./components/HinduizamPage"));
const HinduizamArticlePage = lazy(
  () => import("./components/HinduizamArticlePage"),
);
const IslamPage = lazy(() => import("./components/IslamPage"));
const IslamArticlePage = lazy(() => import("./components/IslamArticlePage"));
const IstorijaPage = lazy(() => import("./components/IstorijaPage"));
const IstorijaArticlePage = lazy(
  () => import("./components/IstorijaArticlePage"),
);
const AhmedijePage = lazy(() => import("./components/AhmedijePage"));
const AhmedijeArticlePage = lazy(
  () => import("./components/AhmedijeArticlePage"),
);
const OdgovoriPage = lazy(() => import("./components/OdgovoriPage"));
const OdgovoriArticlePage = lazy(
  () => import("./components/OdgovoriArticlePage"),
);
const OpovrgavanjePage = lazy(() => import("./components/OpovrgavanjePage"));
const OpovrgavanjeArticlePage = lazy(
  () => import("./components/OpovrgavanjeArticlePage"),
);
const NaukaPage = lazy(() => import("./components/NaukaPage"));
const NaukaArticlePage = lazy(() => import("./components/NaukaArticlePage"));
const MuhammedPage = lazy(() => import("./components/MuhammedPage"));
const MuhammedArticlePage = lazy(
  () => import("./components/MuhammedArticlePage"),
);

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
    <div className="min-h-screen bg-brand-bg relative selection:bg-brand-accent selection:text-white">
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
          <Route path="/categories/hadis" element={<HadisPage />} />
          <Route path="/categories/ateizam" element={<AteizamPage />} />
          <Route path="/categories/hriscanstvo" element={<HriscanstvoPage />} />
          <Route path="/categories/hinduizam" element={<HinduizamPage />} />
          <Route path="/categories/islam" element={<IslamPage />} />
          <Route path="/categories/istorija" element={<IstorijaPage />} />
          <Route path="/categories/ahmedije" element={<AhmedijePage />} />
          <Route path="/categories/odgovori" element={<OdgovoriPage />} />
          <Route
            path="/categories/opovrgavanje"
            element={<OpovrgavanjePage />}
          />
          <Route path="/categories/nauka" element={<NaukaPage />} />
          <Route path="/categories/muhammed" element={<MuhammedPage />} />
          <Route path="/categories" element={<CategoriesPage />} />

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
