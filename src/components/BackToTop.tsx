import { useState, useEffect } from "react";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Nazad na vrh"
      className="fixed bottom-8 right-8 z-40 w-10 h-10 flex items-center justify-center rounded-full border border-brand-border bg-brand-bg text-brand-dim hover:text-brand-heading hover:border-brand-border-strong transition-all shadow-lg"
    >
      ↑
    </button>
  );
}