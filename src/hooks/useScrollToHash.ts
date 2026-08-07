import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scrolls to the heading named in the URL hash.
 *
 * Article pages assign heading ids in an effect that runs after the MDX body
 * has rendered, so the target element does not exist on the first frame. Rather
 * than guess a delay, this polls across animation frames until the id appears
 * or the budget runs out.
 *
 * Headings carry `scroll-mt-32`, so the fixed navbar is already accounted for.
 */
export function useScrollToHash(ready: boolean = true) {
  const { hash, pathname } = useLocation();

  useEffect(() => {
    if (!hash) return;

    const id = decodeURIComponent(hash.slice(1));
    if (!id) return;

    let cancelled = false;
    let frames = 0;

    const findAndScroll = () => {
      if (cancelled) return;

      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }

      // ~1s at 60fps; enough for lazy route chunks plus the id-assigning effect.
      if (frames++ < 60) requestAnimationFrame(findAndScroll);
    };

    findAndScroll();

    return () => {
      cancelled = true;
    };
  }, [hash, pathname, ready]);
}
