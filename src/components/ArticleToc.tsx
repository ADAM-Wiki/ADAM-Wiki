import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { List, X } from "lucide-react";
import type { TocItem } from "../utils/articleTypes";
import { smoothScrollTo } from "../utils/smoothScroll";
import { useFocusTrap } from "../hooks/useFocusTrap";

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
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);

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

  // The sheet stops the page behind it from scrolling, the way the lightbox
  // does, and Escape dismisses it - the focus trap covers Tab but not closing.
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  // The trigger is `lg:hidden`, so the only way to have the sheet open at
  // desktop width is a resize. Close it there rather than leave a dialog
  // nobody can see holding the focus trap.
  useEffect(() => {
    if (!open) return;

    const wide = window.matchMedia("(min-width: 1024px)");
    const close = () => setOpen(false);
    wide.addEventListener("change", close);
    return () => wide.removeEventListener("change", close);
  }, [open]);

  useFocusTrap(open, sheetRef);

  if (tocItems.length === 0) return null;

  // The pill doubles as a position readout: after 15 minutes of scrolling a
  // phone reader can see which section they are in without opening the sheet.
  const activeItem = tocItems.find((item) => item.id === activeHeading);

  // Headings are clamped by CSS (line-clamp-2) rather than cut at a character
  // count. A fixed 32 characters cut "Prvo - Ebu Bekr je samo postupio…" while
  // the 300px sidebar had room to spare, and it guessed at a width only the
  // browser actually knows. The full text stays on the title attribute.

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;

    onActiveChange(id);
    window.history.replaceState(null, "", `#${id}`);

    // While this runs, ArticlePage's scroll-spy stands down - see
    // isSmoothScrolling in utils/smoothScroll.
    smoothScrollTo(el, 110, 800);
    setOpen(false);
  };

  /**
   * One item, two surfaces.
   *
   * The ref belongs to the sidebar alone: both lists would otherwise write the
   * same key, and unmounting the sheet would null out the entry the sidebar's
   * keep-visible pass reads. `min-h-11` / `py-3` is the sheet's touch row and
   * `lg:` hands it back to the sidebar's 28px density.
   */
  const renderItem = (item: TocItem, index: number, withRef: boolean) => {
    const isActive = activeHeading === item.id;
    const h2Index = tocItems
      .slice(0, index + 1)
      .filter((i) => i.level === 2).length;

    return (
      <button
        key={item.id}
        ref={
          withRef
            ? (el) => {
                itemRefs.current[item.id] = el;
              }
            : undefined
        }
        type="button"
        title={item.text}
        // "location" rather than "true": this marks where in the
        // document the reader is, not the current page in a set.
        aria-current={isActive ? "location" : undefined}
        aria-posinset={index + 1}
        aria-setsize={tocItems.length}
        onClick={() => handleClick(item.id)}
        className={`toc-item group relative flex w-full min-h-11 items-center rounded-lg py-3 text-left transition-[background-color,color,transform] duration-200 lg:min-h-0 lg:py-1.5 ${
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

            <span className="min-w-0 flex-1 line-clamp-2 text-[12px] leading-snug">
              {item.text}
            </span>
            <span className="sr-only">
              odeljak {index + 1} od {tocItems.length}
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
              className={`min-w-0 flex-1 line-clamp-2 text-[12px] leading-snug transition-colors ${
                isActive
                  ? "text-[var(--color-brand-accent)]"
                  : "text-[var(--color-brand-text)] group-hover:text-[var(--color-brand-accent)]"
              }`}
            >
              {item.text}
            </span>
            <span className="sr-only">
              odeljak {index + 1} od {tocItems.length}
            </span>
          </div>
        )}
      </button>
    );
  };

  return (
    <>
      <aside className="article-toc hidden lg:block self-start sticky top-28">
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
            {tocItems.map((item, index) => renderItem(item, index, true))}
          </nav>
        </div>
      </aside>

      {/*
        Bottom-left, opposite BackToTop's cluster, and behind neither: both
        carry the promo offset, because on a phone KuranPromo spans the full
        width and would otherwise sit on top of them.
      */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        className="print:hidden lg:hidden fixed z-40 flex h-11 items-center gap-2 rounded-full border border-brand-border bg-brand-bg/85 px-4 text-xs font-medium text-brand-heading shadow-lg backdrop-blur-sm transition-colors hover:border-brand-border-strong"
        style={{
          left: "max(2rem, env(safe-area-inset-left))",
          bottom:
            "calc(max(2rem, env(safe-area-inset-bottom)) + var(--promo-offset, 0px))",
        }}
      >
        <List aria-hidden className="h-4 w-4 shrink-0 text-brand-dim" />
        <span className="max-w-44 truncate">
          {activeItem ? activeItem.text : "Sadržaj"}
        </span>
      </button>

      {open &&
        createPortal(
          <div
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-label="Sadržaj članka"
            className="print:hidden fixed inset-0 z-[100] flex flex-col"
          >
            <div
              aria-hidden
              onClick={() => setOpen(false)}
              className="flex-1 bg-brand-overlay backdrop-blur-sm"
            />

            <div
              className="page-rise max-h-[70vh] shrink-0 overflow-hidden rounded-t-2xl border-t border-brand-border bg-brand-bg"
              style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
            >
              <div className="flex items-center justify-between gap-3 border-b border-brand-border px-4 py-2">
                <span className="font-mono text-xs uppercase tracking-widest text-brand-dim">
                  Sadržaj članka
                </span>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Zatvori sadržaj"
                  className="-mr-2 flex h-11 w-11 shrink-0 items-center justify-center text-brand-dim transition-colors hover:text-brand-heading"
                >
                  <X aria-hidden className="h-5 w-5" />
                </button>
              </div>

              <div className="toc-scroll max-h-[calc(70vh-3.5rem)] space-y-1 overflow-y-auto overscroll-contain px-2 py-2">
                {tocItems.map((item, index) => renderItem(item, index, false))}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
