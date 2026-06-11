/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import TopicsGrid from "./components/TopicsGrid";
import ArticleSection from "./components/ArticleSection";
import Footer from "./components/Footer";
import SearchPage from "./components/SearchPage";

import HadisPage from "./components/HadisPage";
import HadisArticlePage from "./components/HadisArticlePage";
import AteizamPage from "./components/AteizamPage";
import AteizamArticlePage from "./components/AteizamArticlePage";
import HriscanstvoPage from "./components/HriscanstvoPage";
import HriscanstvoArticlePage from "./components/HriscanstvoArticlePage";
import HinduizamPage from "./components/HinduizamPage";
import HinduizamArticlePage from "./components/HinduizamArticlePage";
import IslamPage from "./components/IslamPage";
import IslamArticlePage from "./components/IslamArticlePage";
import IstorijaPage from "./components/IstorijaPage";
import IstorijaArticlePage from "./components/IstorijaArticlePage";
import AhmedijePage from "./components/AhmedijePage";
import AhmedijeArticlePage from "./components/AhmedijeArticlePage";
import OdgovoriPage from "./components/OdgovoriPage";
import OdgovoriArticlePage from "./components/OdgovoriArticlePage";
import OpovrgavanjePage from "./components/OpovrgavanjePage";
import OpovrgavanjeArticlePage from "./components/OpovrgavanjeArticlePage";
import NaukaPage from "./components/NaukaPage";
import NaukaArticlePage from "./components/NaukaArticlePage";
import MuhammedPage from "./components/MuhammedPage";
import MuhammedArticlePage from "./components/MuhammedArticlePage";

import CategoriesPage from "./components/CategoriesPage";
import ScrollToTop from "./components/ScrollToTop";
import NotFoundPage from "./components/NotFoundPage";
import TagsPage from "./components/TagsPage";
import AboutPage from "./components/AboutPage";
import KontaktPage from "./components/KontaktPage";
import PrivatnostPage from "./components/PrivatnostPage";
import UsloviPage from "./components/UsloviPage";
import KolaciciPage from "./components/KolaciciPage";

function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-brand-bg relative selection:bg-brand-accent selection:text-white">
      <Navbar onSearch={setSearchQuery} />

      <main>
        <Hero />
        <TopicsGrid query={searchQuery} />
        <ArticleSection />
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />

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
        <Route path="/categories/opovrgavanje" element={<OpovrgavanjePage />} />
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
    </Router>
  );
}
