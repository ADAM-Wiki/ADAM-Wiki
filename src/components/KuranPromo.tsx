import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { BookOpenText, X } from "lucide-react";

import {
  KURAN_PATH,
  readPromoState,
  writePromoState,
} from "../utils/kuranPromo";

/**
 * Give a first-time visitor time to understand the archive before the offer
 * appears. It remains available through the navigation in the meantime.
 */
const DELAY_MS = 30000;

/** Routes where offering the book would be redundant or intrusive. */
const HIDDEN_ON = [
  KURAN_PATH,
  "/kontakt",
  "/privatnost",
  "/uslovi",
  "/kolacici",
];

/**
 * Standing offer of the free Cyrillic Qur'an.
 *
 * Bottom right rather than top right: the top right corner is already the
 * theme toggle and the search button in a fixed navbar, so a panel there either
 * covers them or fights them for the same space. The bottom right corner is
 * also where readers expect a dismissible offer rather than an alert.
 *
 * Not a dialog: it takes no focus, traps nothing and blocks nothing. It is an
 * offer sitting in the corner, so it is a polite status region that a reader
 * can ignore entirely.
 */
export default function KuranPromo() {
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);
  const [closed, setClosed] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const suppressed =
    closed ||
    HIDDEN_ON.some((path) => pathname === path || pathname === `${path}/`);

  useEffect(() => {
    if (suppressed) return;
    // Already dismissed, or already asked for a copy.
    if (readPromoState()) return;

    let revealOnScroll: (() => void) | undefined;
    const timer = window.setTimeout(() => {
      revealOnScroll = () => {
        if (window.scrollY < window.innerHeight) return;
        setVisible(true);
        window.removeEventListener("scroll", revealOnScroll!);
      };

      window.addEventListener("scroll", revealOnScroll, { passive: true });
      revealOnScroll();
    }, DELAY_MS);

    return () => {
      window.clearTimeout(timer);
      if (revealOnScroll) {
        window.removeEventListener("scroll", revealOnScroll);
      }
    };
  }, [suppressed]);

  const dismiss = useCallback(() => {
    setVisible(false);
    setClosed(true);
    writePromoState("dismissed");
  }, []);

  useEffect(() => {
    if (!visible) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [visible, dismiss]);

  /**
   * Publishes its own height so BackToTop can sit above it.
   *
   * Both are fixed to the bottom right corner, and on a phone the card spans
   * the full width, so without this the two overlap and the scroll buttons end
   * up underneath the panel.
   */
  useEffect(() => {
    const node = cardRef.current;
    const root = document.documentElement;

    if (!visible || !node) {
      root.style.removeProperty("--promo-offset");
      return;
    }

    const measure = () => {
      root.style.setProperty("--promo-offset", `${node.offsetHeight + 16}px`);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);

    return () => {
      observer.disconnect();
      root.style.removeProperty("--promo-offset");
    };
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && !suppressed && (
        <motion.div
          ref={cardRef}
          // role="status" announces it once, politely, when it appears - a
          // reader who cannot see the corner otherwise never learns it is there.
          role="status"
          aria-label="Ponuda: besplatan Kur'an na ćirilici"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          // Full width on a phone, a card on the right from sm up. The inset
          // uses env() so it clears the iOS home indicator.
          className="fixed inset-x-3 bottom-3 z-40 rounded-xl border border-brand-border bg-brand-surface p-4 shadow-2xl print:hidden sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-80 sm:p-5"
          style={{
            bottom: "max(0.75rem, env(safe-area-inset-bottom))",
          }}
        >
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-accent/15">
              <BookOpenText
                aria-hidden
                className="h-4 w-4 shrink-0 text-brand-accent"
              />
            </span>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium leading-snug text-brand-heading">
                Želite besplatan Kur&rsquo;an na ćirilici?
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-brand-dim">
                Knjigu ne naplaćujemo — plaćate samo poštarinu.
              </p>
            </div>

            <button
              type="button"
              onClick={dismiss}
              aria-label="Zatvori obaveštenje"
              // 44px target: this is the one control a reader taps to make the
              // panel go away, and a small one is worse than no panel at all.
              className="-m-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-brand-dim transition-colors hover:text-brand-heading"
            >
              <X aria-hidden className="h-4 w-4 shrink-0" />
            </button>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <Link
              to={KURAN_PATH}
              // Following the offer counts as answering it: the page itself
              // carries the contact links, so re-offering would only nag.
              onClick={() => {
                setVisible(false);
                writePromoState("requested");
              }}
              className="flex min-h-11 flex-1 items-center justify-center rounded-lg bg-brand-accent px-4 text-xs font-medium uppercase tracking-widest text-brand-on-accent transition-opacity hover:opacity-90"
            >
              Želim primerak
            </Link>
            <button
              type="button"
              onClick={dismiss}
              className="flex min-h-11 items-center justify-center rounded-lg border border-brand-border px-4 text-xs font-medium uppercase tracking-widest text-brand-dim transition-colors hover:border-brand-border-strong hover:text-brand-heading"
            >
              Ne, hvala
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
