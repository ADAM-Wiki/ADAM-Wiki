import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { BookMarked, X } from "lucide-react";
import { smoothScrollTo } from "../../utils/smoothScroll";

interface FootnoteEntry {
  id: string;
  node: ReactNode;
}

interface FootnoteApi {
  /** Called during render; returns this marker's 1-based number. */
  register(id: string, node: ReactNode): number;
  entries: FootnoteEntry[];
}

const FootnoteContext = createContext<FootnoteApi | null>(null);

export const footnoteAnchorId = (n: number) => `izvor-${n}`;
export const footnoteMarkerId = (n: number) => `izvor-ref-${n}`;

/**
 * Animated jump between a marker and its entry, matching the table of
 * contents' 800ms ease. Both ends are small - a bracketed number and one line
 * of a list - so the target flashes on arrival; without it you land on a wall
 * of text with no idea which line you were sent to.
 */
function jumpToAnchor(id: string) {
  const el = document.getElementById(id);
  if (!el) return;

  window.history.replaceState(null, "", `#${id}`);

  smoothScrollTo(el, 140, 800, () => {
    el.classList.remove("anchor-flash");
    // Reading offsetWidth restarts the animation if the same target is
    // revisited before the previous flash has finished.
    void el.offsetWidth;
    el.classList.add("anchor-flash");
    window.setTimeout(() => el.classList.remove("anchor-flash"), 1600);
  });
}

/**
 * Collects every <Ref> in an article so the list at the foot can be built
 * automatically and the numbers stay in document order.
 *
 * Registration happens during render rather than in an effect, because that is
 * the only pass whose order is guaranteed to match the order the markers appear
 * in the text. Re-registering the same id is a no-op, so a StrictMode double
 * render does not produce duplicates.
 *
 * Mount this with key={slug}: navigating between articles must start the
 * numbering over, and the registry is deliberately append-only.
 */
export function FootnoteProvider({ children }: { children: ReactNode }) {
  const orderRef = useRef<string[]>([]);
  const nodesRef = useRef(new Map<string, ReactNode>());
  const flushPendingRef = useRef(false);
  const [version, bump] = useReducer((n: number) => n + 1, 0);

  const register = useCallback((id: string, node: ReactNode) => {
    nodesRef.current.set(id, node);

    let index = orderRef.current.indexOf(id);
    if (index === -1) {
      orderRef.current.push(id);
      index = orderRef.current.length - 1;

      // Deferred so the list re-renders after this pass; setting state straight
      // from another component's render is a React error.
      if (!flushPendingRef.current) {
        flushPendingRef.current = true;
        queueMicrotask(() => {
          flushPendingRef.current = false;
          bump();
        });
      }
    }

    return index + 1;
  }, []);

  const value = useMemo<FootnoteApi>(
    () => ({
      register,
      entries: orderRef.current.map((id) => ({
        id,
        node: nodesRef.current.get(id),
      })),
    }),
    // version is the signal that a new marker appeared.
    [register, version],
  );

  return (
    <FootnoteContext.Provider value={value}>
      {children}
    </FootnoteContext.Provider>
  );
}

/** Popover anchored to a marker. Portalled so prose overflow cannot clip it. */
function RefPopover({
  anchor,
  number,
  children,
  onClose,
}: {
  anchor: HTMLElement;
  number: number;
  children: ReactNode;
  onClose: () => void;
}) {
  const [style, setStyle] = useState<React.CSSProperties | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const place = () => {
      const rect = anchor.getBoundingClientRect();
      const width = Math.min(360, window.innerWidth - 32);
      const height = boxRef.current?.offsetHeight ?? 120;

      const left = Math.min(
        Math.max(16, rect.left + rect.width / 2 - width / 2),
        window.innerWidth - width - 16,
      );

      const below = rect.bottom + 10;
      const fitsBelow = below + height < window.innerHeight - 16;

      setStyle({
        position: "fixed",
        top: fitsBelow ? below : Math.max(16, rect.top - height - 10),
        left,
        width,
      });
    };

    place();
    // Reposition rather than close, so the box tracks the text while reading.
    window.addEventListener("scroll", place, { passive: true, capture: true });
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, { capture: true });
      window.removeEventListener("resize", place);
    };
  }, [anchor]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const onPointer = (e: MouseEvent) => {
      const target = e.target as Node;
      if (boxRef.current?.contains(target) || anchor.contains(target)) return;
      onClose();
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [anchor, onClose]);

  return createPortal(
    <div
      ref={boxRef}
      role="dialog"
      aria-label={`Izvor ${number}`}
      style={{ ...style, visibility: style ? "visible" : "hidden" }}
      className="z-[70] rounded-lg border border-brand-border-strong bg-brand-surface p-4 shadow-xl"
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="font-mono text-[10px] uppercase tracking-widest text-brand-accent">
          Izvor {number}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Zatvori"
          className="text-brand-dim transition-colors hover:text-brand-heading"
        >
          <X aria-hidden className="h-4 w-4" />
        </button>
      </div>

      <div className="font-lexend text-sm leading-relaxed text-brand-text">
        {children}
      </div>

      <button
        type="button"
        onClick={() => {
          onClose();
          jumpToAnchor(footnoteAnchorId(number));
        }}
        className="mt-3 inline-block font-mono text-[10px] uppercase tracking-widest text-brand-dim transition-colors hover:text-brand-accent"
      >
        Pogledaj u spisku izvora
      </button>
    </div>,
    document.body,
  );
}

/**
 * Inline citation marker: <Ref>El-Kafi, tom 5, str. 34.</Ref>
 *
 * Numbers itself from its position in the article and adds its content to the
 * list at the foot - the author never writes a number.
 */
export function Ref({ children }: { children: ReactNode }) {
  const id = useId();
  const api = useContext(FootnoteContext);
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  // Outside an article there is no list to join, so render nothing rather than
  // a marker that points at a number which does not exist.
  const number = api?.register(id, children) ?? 0;
  if (!api) return null;

  return (
    <sup id={footnoteMarkerId(number)} className="scroll-mt-32 whitespace-nowrap">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={`Izvor ${number}`}
        // No align-super here - the <sup> already raises it, and both together
        // lifted the marker clear of the line.
        className="mx-0.5 rounded px-1 font-mono text-[0.75em] leading-none text-brand-accent transition-colors hover:bg-brand-surface-hover hover:underline"
      >
        [{number}]
      </button>

      {open && buttonRef.current && (
        <RefPopover
          anchor={buttonRef.current}
          number={number}
          onClose={() => setOpen(false)}
        >
          {children}
        </RefPopover>
      )}
    </sup>
  );
}

/** The generated list. Renders nothing when the article cites nothing. */
export function FootnoteList() {
  const api = useContext(FootnoteContext);
  if (!api || api.entries.length === 0) return null;

  return (
    <section
      aria-label="Izvori"
      className="mt-12 border-l-4 border-brand-border-strong px-5 py-4"
    >
      <div className="mb-3 flex items-center gap-2">
        <BookMarked aria-hidden className="h-5 w-5 shrink-0 text-brand-dim" />
        <h2 className="text-sm font-semibold tracking-wide text-brand-dim">
          Izvori
        </h2>
      </div>

      <ol className="space-y-2">
        {api.entries.map((entry, index) => {
          const number = index + 1;
          return (
            <li
              key={entry.id}
              id={footnoteAnchorId(number)}
              className="flex scroll-mt-32 items-start gap-3 text-sm leading-relaxed text-brand-text"
            >
              <a
                href={`#${footnoteMarkerId(number)}`}
                onClick={(e) => {
                  e.preventDefault();
                  jumpToAnchor(footnoteMarkerId(number));
                }}
                aria-label={`Nazad na izvor ${number} u tekstu`}
                className="shrink-0 font-mono text-xs text-brand-accent transition-colors hover:underline"
              >
                {number}. ↩
              </a>
              <span>{entry.node}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
