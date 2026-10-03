import { useEffect, type RefObject } from "react";

/**
 * Keyboard containment for a modal overlay.
 *
 * An overlay that only *looks* modal leaves the keyboard behind it: Tab walks
 * out of the dialog and down the page underneath, focusing links the reader
 * cannot see, and closing the overlay drops focus back to the top of the
 * document rather than the control they opened it from.
 *
 * While `active` this moves focus into the container, keeps Tab and Shift+Tab
 * cycling inside it, and on close returns focus to whatever had it before.
 *
 * Escape and click-outside stay with the caller - each overlay dismisses on
 * slightly different terms, and there is nothing to share there.
 *
 * Only for genuinely modal surfaces, the ones carrying `aria-modal="true"`.
 * Trapping a non-modal popover would strand a keyboard reader inside it.
 */

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export function useFocusTrap(
  active: boolean,
  containerRef: RefObject<HTMLElement | null>,
): void {
  useEffect(() => {
    if (!active) return;

    const container = containerRef.current;
    if (!container) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    // getClientRects rather than offsetParent: every one of these overlays is
    // position:fixed, and offsetParent reports null for a fixed element, which
    // would filter out the very elements meant to be trapped.
    const focusable = () =>
      Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((el) => el.getClientRects().length > 0);

    const initial = focusable()[0];

    if (initial) {
      initial.focus();
    } else {
      // Nothing focusable inside, so park focus on the container itself -
      // otherwise it stays on the trigger, behind the overlay.
      container.tabIndex = -1;
      container.focus();
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

      const items = focusable();

      if (items.length === 0) {
        event.preventDefault();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];
      const current = document.activeElement;
      const escaped = !current || !container.contains(current);

      if (event.shiftKey && (escaped || current === first)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (escaped || current === last)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);

      // isConnected guards the case where the trigger itself was unmounted
      // while the overlay was open - a result row that navigated away, say.
      if (previouslyFocused?.isConnected) previouslyFocused.focus();
    };
  }, [active, containerRef]);
}
