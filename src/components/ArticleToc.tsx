import { useEffect, useMemo, useRef } from "react";
import type { TocItem } from "../utils/articleTypes";
import { smoothScrollTo } from "../utils/smoothScroll";

interface ArticleTocProps {
  tocItems: TocItem[];
  activeHeading: string;
  onActiveChange: (id: string) => void;
}

export default function ArticleToc({
  tocItems,
  activeHeading,
  onActiveChange,
}: ArticleTocProps) {
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const navRef = useRef<HTMLElement | null>(null);

  const arabicNumber = useMemo(() => new Intl.NumberFormat("ar-u-nu-arab"), []);
  const shouldScroll = tocItems.length > 10;

  // Keep the active item visible inside the sidebar's own scroller.
  useEffect(() => {
    // Only when the nav actually scrolls. Otherwise scrollIntoView walks up to
    // the nearest scrollable ancestor - the document - and yanks the page
    // out from under whoever is reading.
    if (!shouldScroll || tocItems.length === 0) return;

    const activeIndex = tocItems.findIndex((item) => item.id === activeHeading);
    const activeEl = itemRefs.current[activeHeading];
    const navEl = navRef.current;

    if (!activeEl || !navEl) return;

    if (activeIndex <= 0) {
      navEl.scrollTop = 0;
      return;
    }

    // Scroll the container directly rather than asking the browser to find one.
    const itemTop = activeEl.offsetTop;
    const itemBottom = itemTop + activeEl.offsetHeight;
    const viewTop = navEl.scrollTop;
    const viewBottom = viewTop + navEl.clientHeight;

    if (itemTop < viewTop) navEl.scrollTop = itemTop - 8;
    else if (itemBottom > viewBottom)
      navEl.scrollTop = itemBottom - navEl.clientHeight + 8;
  }, [activeHeading, tocItems, shouldScroll]);

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

    // While this runs, ArticlePage's scroll-spy stands down - see
    // isSmoothScrolling in utils/smoothScroll.
    smoothScrollTo(el, 110, 800);
  };

  return (
    <aside className="hidden lg:block self-start sticky top-28">
      <div className="border-y border-[var(--color-brand-muted)] bg-[var(--color-brand-bg)] p-4">
        <nav
          ref={navRef}
          aria-label="Sadržaj članka"
          className={`toc-scroll space-y-1 pr-1 ${
            shouldScroll
              ? "toc-fade max-h-[420px] overflow-y-auto pt-4 pb-3"
              : ""
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
                      // The active tint was a hardcoded rgba blue, which stayed
                      // blue on the paper theme where the accent is umber.
                      className={`mr-3 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border text-[11px] font-medium transition-colors ${
                        isActive
                          ? "border-brand-accent bg-brand-accent/10 text-brand-accent"
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
                  // No nested translate: the button already shifts 3px on
                  // hover, and both together moved sub-items twice as far as
                  // top-level ones.
                  <div className="flex min-w-0 w-full items-center gap-3">
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
