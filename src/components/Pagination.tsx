import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const GAP = "gap" as const;
type Slot = number | typeof GAP;

/**
 * Page numbers to display: always the first and last page plus a window around
 * the current one, with gaps collapsed to an ellipsis.
 *
 * Rendering every page worked at three pages and broke at seven - the bar
 * overflowed its container on mobile and clipped the "next" button.
 */
export function buildPageSlots(current: number, total: number): Slot[] {
  // Up to 7 pages still fits comfortably, so show them all.
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const wanted = new Set<number>([
    1,
    total,
    current,
    current - 1,
    current + 1,
  ]);

  // Keep the bar a constant width by padding the ends, where the window is
  // clipped by the start or end of the range.
  if (current <= 3) [2, 3, 4].forEach((p) => wanted.add(p));
  if (current >= total - 2)
    [total - 3, total - 2, total - 1].forEach((p) => wanted.add(p));

  const pages = [...wanted]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);

  const slots: Slot[] = [];
  let previous = 0;

  for (const page of pages) {
    if (previous && page - previous > 1) slots.push(GAP);
    slots.push(page);
    previous = page;
  }

  return slots;
}

/**
 * Mobile page chooser.
 *
 * A native <select> would be simpler, but its open state is drawn by the OS and
 * cannot be styled, so this is a custom popover. It opens upward because the
 * pagination bar sits near the bottom of the page.
 */
function PagePicker({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const choose = (page: number) => {
    setOpen(false);
    onPageChange(page);
  };

  return (
    <div ref={wrapperRef} className="relative sm:hidden">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Strana ${currentPage} od ${totalPages}. Izaberi stranicu`}
        className={`flex min-h-11 items-center gap-2.5 rounded-lg border bg-brand-surface px-4 transition-colors ${
          open
            ? "border-brand-accent"
            : "border-brand-border hover:border-brand-border-strong"
        }`}
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-brand-dim">
          Strana
        </span>
        <span className="font-serif text-lg leading-none text-brand-accent">
          {currentPage}
        </span>
        <span className="font-mono text-xs text-brand-dim">/ {totalPages}</span>
        <ChevronDown
          aria-hidden
          className={`ml-0.5 h-3.5 w-3.5 shrink-0 text-brand-dim transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Stranice"
          className="absolute bottom-full left-1/2 z-30 mb-2 w-56 -translate-x-1/2 overflow-hidden rounded-xl border border-brand-border bg-brand-surface shadow-2xl"
        >
          <p className="border-b border-brand-border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-brand-dim">
            Idi na stranu
          </p>

          <div className="toc-scroll max-h-56 overflow-y-auto p-1.5">
            {pages.map((page) => {
              const active = page === currentPage;
              return (
                <button
                  key={page}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => choose(page)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                    active
                      ? "bg-brand-surface-hover text-brand-accent"
                      : "text-brand-text hover:bg-brand-surface-hover hover:text-brand-heading"
                  }`}
                >
                  <span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-brand-dim">
                      Strana{" "}
                    </span>
                    {page}
                  </span>
                  {active && <Check aria-hidden className="h-4 w-4 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const slots = buildPageSlots(currentPage, totalPages);

  return (
    <nav
      aria-label="Stranice"
      className="not-prose mt-16 flex items-center justify-between gap-3 border-t border-brand-border pt-8"
    >
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Prethodna stranica"
        className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm text-brand-dim transition-colors hover:text-brand-heading disabled:cursor-not-allowed disabled:opacity-40 sm:px-4"
      >
        <span aria-hidden>←</span>
        <span className="hidden sm:inline">Prethodna</span>
      </button>

      {/* Numbers need room; below sm a compact counter replaces them. */}
      <div className="hidden items-center gap-1.5 sm:flex">
        {slots.map((slot, index) =>
          slot === GAP ? (
            <span
              key={`gap-${index}`}
              aria-hidden
              className="px-1 text-sm text-brand-dim"
            >
              …
            </span>
          ) : (
            <button
              key={slot}
              type="button"
              onClick={() => onPageChange(slot)}
              aria-label={`Stranica ${slot}`}
              aria-current={slot === currentPage ? "page" : undefined}
              className={`min-w-[2.25rem] rounded-lg border px-3 py-2 text-sm transition-colors ${
                slot === currentPage
                  ? "border-brand-border bg-brand-surface text-brand-heading"
                  : "border-transparent text-brand-dim hover:border-brand-border hover:text-brand-heading"
              }`}
            >
              {slot}
            </button>
          ),
        )}
      </div>

      <PagePicker
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Sledeća stranica"
        className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm text-brand-dim transition-colors hover:text-brand-heading disabled:cursor-not-allowed disabled:opacity-40 sm:px-4"
      >
        <span className="hidden sm:inline">Sledeća</span>
        <span aria-hidden>→</span>
      </button>
    </nav>
  );
}
