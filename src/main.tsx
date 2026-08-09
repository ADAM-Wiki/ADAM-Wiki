import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { HelmetProvider } from "react-helmet-async";
import "./index.css";
import BackToTop from "./components/BackToTop.tsx";

/**
 * createRoot, not hydrateRoot, despite every route being prerendered.
 *
 * Hydration was tried and reverted. Routes are code-split with React.lazy, so
 * hydration starts from the Suspense fallback - an empty div - while the
 * prerendered HTML holds the finished page. React reports that mismatch
 * (error #418) on every single route and discards the markup anyway, so it
 * bought nothing and added an error to every page load. Verified: the settled
 * client render is byte-identical to the prerendered HTML, so the problem is
 * purely that the first render has not loaded the route chunk yet.
 *
 * Adopting the prerendered markup would mean giving up per-route splitting -
 * the article chunks are 200 kB+ each - or replacing React.lazy with a loader
 * that resolves the current route before mounting.
 */
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
    <BackToTop />
  </StrictMode>,
);