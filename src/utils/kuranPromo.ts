/** Where the promo and the navigation both point. */
export const KURAN_PATH = "/kuran-cirilica";

/**
 * Remembers that the reader closed the promo, so it is offered once rather
 * than on every page of a 206-article archive.
 */
export const KURAN_PROMO_KEY = "adam-kuran-promo";

export type PromoState = "dismissed" | "requested";

export function readPromoState(): PromoState | null {
  try {
    const value = localStorage.getItem(KURAN_PROMO_KEY);
    return value === "dismissed" || value === "requested" ? value : null;
  } catch {
    // Private mode or blocked storage: the promo simply shows again.
    return null;
  }
}

export function writePromoState(state: PromoState): void {
  try {
    localStorage.setItem(KURAN_PROMO_KEY, state);
  } catch {
    // Nothing to do - the reader still dismissed it for this page view.
  }
}
