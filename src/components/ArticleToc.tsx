import { useEffect, useMemo, useRef } from "react";
import type { TocItem } from "../utils/articleTypes";
import { smoothScrollTo } from "../utils/smoothScroll";

interface ArticleTocProps {
  tocItems: TocItem[];
  activeHeading: string;
  onActiveChange: (id: string) => void;
}

let scrollAnimationFrame: number | null = null;

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function animateScrollTo(targetY: number, duration = 550) {
  if (scrollAnimationFrame !== null) {
    cancelAnimationFrame(scrollAnimationFrame);
  }

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const maxScrollY = Math.max(
    0,
    document.documentElement.scrollHeight - window.innerHeight
  );

  const safeTargetY = Math.min(Math.max(0, targetY), maxScrollY);

  if (prefersReducedMotion) {
    window.scrollTo(0, safeTargetY);
    return;
  }

  const startY = window.scrollY;
  const distance = safeTargetY - startY;
  const startTime = performance.now();

  const step = (currentTime: number) => {
    const progress = Math.min((currentTime - startTime) / duration, 1);
    const eased = easeOutCubic(progress);

    window.scrollTo(0, startY + distance * eased);

    if (progress < 1) {
      scrollAnimationFrame = requestAnimationFrame(step);
    } else {
      scrollAnimationFrame = null;
    }
  };

  scrollAnimationFrame = requestAnimationFrame(step);
}

export default function ArticleToc({
  tocItems,
  activeHeading,
  onActiveChange,
}: ArticleTocProps) {
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const navRef = useRef<HTMLElement | null>(null);

  const arabicNumber = useMemo(() => new Intl.NumberFormat("ar-u-nu-arab"), []);

  useEffect(() => {
    if (tocItems.length === 0) return;

    const activeIndex = tocItems.findIndex((item) => item.id === activeHeading);
    const activeEl = itemRefs.current[activeHeading];
    const navEl = navRef.current;

    if (!activeEl || !navEl) return;

    if (activeIndex <= 0) {
      navEl.scrollTop = 0;
      return;
    }

    activeEl.scrollIntoView({
      block: "nearest",
      behavior: "auto",
    });
  }, [activeHeading, tocItems]);

  useEffect(() => {
    return () => {
      if (scrollAnimationFrame !== null) {
        cancelAnimationFrame(scrollAnimationFrame);
      }
    };
  }, []);

  if (tocItems.length === 0) return null;

  const truncateText = (text: string, maxLength = 32) => {
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength).trimEnd()}...`;
  };

const handleClick = (id: string) => {
  const el = document.getElementById(id);
  if (!el) return;

  onActiveChange(id);
  window.history.replaceState(null, "", `#${id}`);

  // Calculate position with offset for sticky header (110px)
  const elementPosition = el.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.scrollY - 110;

  smoothScrollTo(offsetPosition, 550);
};

  const shouldScroll = tocItems.length > 10;

  return (
    <aside className="hidden lg:block self-start sticky top-28">
      <div className="border-y border-[var(--color-brand-muted)] bg-[var(--color-brand-bg)] p-4">
        <nav
          ref={navRef}
          aria-label="Table of contents"
          className={`toc-scroll space-y-1 pr-1 ${
            shouldScroll ? "toc-fade max-h-[420px] overflow-y-auto pt-4 pb-3" : ""
          }`}
        >
          {tocItems.map((item, index) => {
            const isActive = activeHeading === item.id;
            const h2Index = tocItems
              .slice(0, index + 1)
              .filter((i) => i.level === 2).length;

            return (
              <button
                key={item.id}
                ref={(el) => {
                  itemRefs.current[item.id] = el;
                }}
                type="button"
                title={item.text}
                aria-current={isActive ? "true" : undefined}
                onClick={() => handleClick(item.id)}
                className={`toc-item group relative flex w-full items-center rounded-lg py-1.5 text-left transition-all duration-200 ${
                  item.level === 3 ? "pl-8 pr-3" : "px-3"
                } ${
                  isActive
                    ? "toc-item-active bg-[var(--color-brand-muted)] text-[var(--color-brand-accent)]"
                    : "bg-transparent text-[var(--color-brand-text)] hover:translate-x-[3px]"
                }`}
              >
                {item.level === 2 ? (
                  <>
                    <span
                      className={`mr-3 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border text-[11px] font-medium transition-colors ${
                        isActive
                          ? "border-[var(--color-brand-accent)] bg-[color:rgba(59,130,246,0.10)] text-[var(--color-brand-accent)]"
                          : "border-[var(--color-brand-dim)] bg-transparent text-[var(--color-brand-text)]"
                      }`}
                    >
                      {arabicNumber.format(h2Index)}
                    </span>

                    <span className="min-w-0 flex-1 truncate text-[12px] leading-none">
                      {truncateText(item.text, 32)}
                    </span>
                  </>
                ) : (
                  <div className="flex min-w-0 w-full items-center gap-3 transition-transform duration-200 group-hover:translate-x-[3px]">
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rotate-45 transition-colors ${
                        isActive
                          ? "bg-[var(--color-brand-accent)]"
                          : "bg-[var(--color-brand-dim)] group-hover:bg-[var(--color-brand-accent)]"
                      }`}
                    />

                    <span
                      className={`min-w-0 flex-1 truncate text-[12px] leading-none transition-colors ${
                        isActive
                          ? "text-[var(--color-brand-accent)]"
                          : "text-[var(--color-brand-text)] group-hover:text-[var(--color-brand-accent)]"
                      }`}
                    >
                      {truncateText(item.text, 34)}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}