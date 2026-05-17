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
import HadisPage from "./components/HadisPage";
import HadisArticlePage from "./components/HadisArticlePage";
import AteizmaPage from "./components/AteizmaPage";
import AteizmaArticlePage from "./components/AteizmaArticlePage";
import HriscanstvoPage from "./components/HriscanstvoPage";
import HriscanstvoArticlePage from "./components/HriscanstvoArticlePage";
import HinduizamPage from "./components/HinduizamPage";
import HinduizamArticlePage from "./components/HinduizamArticlePage";
import SeriatPage from "./components/SeriatPage";
import SeriatArticlePage from "./components/SeriatArticlePage";
import KuranPage from "./components/KuranPage";
import KuranArticlePage from "./components/KuranArticlePage";
import RavnaZemjaPage from "./components/RavnaZemjaPage";
import RavnaZemjaArticlePage from "./components/RavnaZemjaArticlePage";
import NemoralPage from "./components/NemoralPage";
import NemoralArticlePage from "./components/NemoralArticlePage";
import CategoriesPage from "./components/CategoriesPage";
import ScrollToTop from "./components/ScrollToTop";
import NotFoundPage from "./components/NotFoundPage";
import TagsPage from "./components/TagsPage";
import AboutPage      from "./components/AboutPage";
import KontaktPage    from "./components/KontaktPage";
import PrivatnostPage from "./components/PrivatnostPage";
import UsloviPage     from "./components/UsloviPage";
import KolaciciPage   from "./components/KolaciciPage";

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
        <Route path="/hadis" element={<HadisPage />} />
        <Route path="/hadis/article/:slug" element={<HadisArticlePage />} />
        <Route path="/ateizma" element={<AteizmaPage />} />
        <Route path="/ateizma/article/:slug" element={<AteizmaArticlePage />} />
        <Route path="/hriscanstvo" element={<HriscanstvoPage />} />
        <Route path="/hriscanstvo/article/:slug" element={<HriscanstvoArticlePage />} />
        <Route path="/hinduizam" element={<HinduizamPage />} />
        <Route path="/hinduizam/article/:slug" element={<HinduizamArticlePage />} />
        <Route path="/serijat" element={<SeriatPage />} />
        <Route path="/serijat/article/:slug" element={<SeriatArticlePage />} />
        <Route path="/kuran" element={<KuranPage />} />
        <Route path="/kuran/article/:slug" element={<KuranArticlePage />} />
        <Route path="/ravna-zemlja" element={<RavnaZemjaPage />} />
        <Route path="/ravna-zemlja/article/:slug" element={<RavnaZemjaArticlePage />} />
        <Route path="/nemoral" element={<NemoralPage />} />
        <Route path="/nemoral/article/:slug" element={<NemoralArticlePage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="*" element={<NotFoundPage />} />
        <Route path="/tags" element={<TagsPage />} />
        <Route path="/about"      element={<AboutPage />} />
        <Route path="/kontakt"    element={<KontaktPage />} />
        <Route path="/privatnost" element={<PrivatnostPage />} />
        <Route path="/uslovi"     element={<UsloviPage />} />
        <Route path="/kolacici"   element={<KolaciciPage />} />
      </Routes>
    </Router>
  );
}

