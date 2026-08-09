let currentAnimationId: number | null = null;

/**
 * True while a programmatic scroll is running.
 *
 * Scroll-spy observers should ignore what they see during one: the click
 * already decided the destination, and reporting every heading the page flies
 * past just makes the highlight flicker.
 */
export const isSmoothScrolling = () => currentAnimationId !== null;

export const smoothScrollTo = (
  target: number | HTMLElement,
  offset = 110,
  duration = 800, // Adjustable duration in milliseconds (e.g., 800ms)
  onDone?: () => void,
) => {
  if (currentAnimationId !== null) {
    cancelAnimationFrame(currentAnimationId);
    currentAnimationId = null;
  }

  const resolveY = () => {
    const y =
      typeof window !== "undefined" && target instanceof window.HTMLElement
        ? target.getBoundingClientRect().top + window.scrollY - offset
        : (target as number) - offset;
    const maxY = Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight,
    );
    return Math.min(Math.max(0, y), maxY);
  };

  // Someone who asked the system for less motion gets the destination, not the
  // journey. The CSS rule below only covers native anchor scrolling.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.scrollTo(0, resolveY());
    onDone?.();
    return;
  }

  // Temporarily disable CSS smooth scrolling to prevent conflicts
  const originalScrollBehavior = document.documentElement.style.scrollBehavior;
  document.documentElement.style.scrollBehavior = "auto";

  const startY = window.scrollY;
  let startTime: number | null = null;

  const isElement =
    typeof window !== "undefined" && target instanceof window.HTMLElement;

  // Gentle ease-in and ease-out curve
  const easeInOutCubic = (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  const step = (timestamp: number) => {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeInOutCubic(progress);

    // Recalculate target Y on every frame to adapt to loaded images
    let targetY = 0;
    if (isElement) {
      targetY =
        (target as HTMLElement).getBoundingClientRect().top +
        window.scrollY -
        offset;
    } else {
      targetY = (target as number) - offset;
    }

    const maxScrollY = Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight,
    );
    const safeTargetY = Math.min(Math.max(0, targetY), maxScrollY);

    // Calculate current distance dynamically from start point to the potentially shifted target
    const currentDistance = safeTargetY - startY;

    window.scrollTo(0, startY + currentDistance * eased);

    if (progress < 1) {
      currentAnimationId = requestAnimationFrame(step);
    } else {
      currentAnimationId = null;
      document.documentElement.style.scrollBehavior = originalScrollBehavior;
      onDone?.();
    }
  };

  currentAnimationId = requestAnimationFrame(step);
};
