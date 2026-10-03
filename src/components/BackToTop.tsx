import { useState, useEffect } from "react";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  const [atTargetEnd, setAtTargetEnd] = useState(false);
  const [hasArticle, setHasArticle] = useState(false);

  useEffect(() => {
    const threshold = 80; // px before the end to consider "at end"

    // Scroll fires far more often than the screen refreshes, and every run of
    // this reads offsetTop/offsetHeight - a forced layout. Coalescing into one
    // rAF means at most one measurement per frame no matter how fast the wheel
    // spins, and the reads then land at a point where nothing has written to
    // the DOM since the last paint.
    let frame = 0;

    const measure = () => {
      frame = 0;

      const y = window.scrollY;
      const target = document.querySelector<HTMLElement>(
        ".article-body article",
      );

      const targetBottom = target
        ? target.offsetTop + target.offsetHeight
        : Math.max(
            document.body.scrollHeight,
            document.documentElement.scrollHeight,
          );

      setVisible(y > 400);
      setHasArticle(Boolean(target));
      setAtTargetEnd(y + window.innerHeight >= targetBottom - threshold);
    };

    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  if (!visible) return null;

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const scrollToBottom = () => {
    const target = document.querySelector(
      ".article-body article",
    ) as HTMLElement | null;

    if (target) {
      const top = Math.max(
        0,
        target.offsetTop + target.offsetHeight - window.innerHeight + 8,
      );
      window.scrollTo({ top, behavior: "smooth" });
      return;
    }

    const doc = document.documentElement;
    const bottom = Math.max(
      document.body.scrollHeight,
      doc.scrollHeight,
      document.body.offsetHeight,
      doc.offsetHeight,
      document.body.clientHeight,
      doc.clientHeight,
    );
    window.scrollTo({ top: bottom, behavior: "smooth" });
  };

  return (
    // Insets keep the buttons clear of the iOS home indicator and of any
    // rounded corner, rather than sitting under them.
    <div
      className="fixed right-8 bottom-8 z-40 flex flex-col items-center gap-3 print:hidden"
      style={{
        right: "max(2rem, env(safe-area-inset-right))",
        // --promo-offset is published by KuranPromo while its panel is on
        // screen. Both are fixed to this corner, and on a phone the panel
        // spans the full width, so without the offset these buttons end up
        // underneath it.
        bottom:
          "calc(max(2rem, env(safe-area-inset-bottom)) + var(--promo-offset, 0px))",
      }}
    >
      {hasArticle && !atTargetEnd && (
        <button
          type="button"
          onClick={scrollToBottom}
          aria-label="Idi na kraj članka"
          className="w-10 h-10 flex items-center justify-center rounded-full border border-brand-border bg-brand-bg/60 text-brand-dim hover:text-brand-heading hover:border-brand-border-strong transition-colors shadow-lg"
        >
          <span aria-hidden>↓</span>
        </button>
      )}

      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Nazad na vrh"
        className="w-10 h-10 flex items-center justify-center rounded-full border border-brand-border bg-brand-bg/60 text-brand-dim hover:text-brand-heading hover:border-brand-border-strong transition-colors shadow-lg"
      >
        <span aria-hidden>↑</span>
      </button>
    </div>
  );
}
