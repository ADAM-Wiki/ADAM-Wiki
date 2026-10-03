import { useCallback, useEffect, useState } from "react";

export const RECENT_SEARCHES_KEY = "adam-recent-searches";

/** Enough to be useful, few enough to stay one or two rows of chips. */
const MAX_ENTRIES = 8;

function read(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;

    // Anything could be under this key - a half-written value, or a different
    // shape from an older build - so the contents are filtered, not trusted.
    return Array.isArray(parsed)
      ? parsed
          .filter((entry): entry is string => typeof entry === "string")
          .slice(0, MAX_ENTRIES)
      : [];
  } catch {
    // Blocked storage, or JSON that will not parse. Either way: no history.
    return [];
  }
}

function write(entries: string[]) {
  try {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(entries));
  } catch {
    // Private mode or a full quota: the list still works for this page view.
  }
}

/**
 * The visitor's own recent searches, kept in localStorage on their device.
 * Nothing is sent anywhere.
 *
 * Reads and writes go through localStorage rather than through React state,
 * which keeps the stored list authoritative - two tabs cannot overwrite each
 * other with a stale in-memory copy.
 */
export function useRecentSearches() {
  const [recent, setRecent] = useState<string[]>([]);

  // Loaded after mount, not as the initial state. /search is prerendered with
  // an empty list baked in, so seeding from storage during the first render
  // would leave the hydrated markup disagreeing with the served HTML.
  useEffect(() => {
    setRecent(read());
  }, []);

  const remember = useCallback((raw: string) => {
    const query = raw.trim();
    if (!query) return;

    // Case-insensitive dedupe, newest first: searching "Hadis" after "hadis"
    // should move the one entry to the front, not add a near-duplicate.
    const next = [
      query,
      ...read().filter((entry) => entry.toLowerCase() !== query.toLowerCase()),
    ].slice(0, MAX_ENTRIES);

    write(next);
    setRecent(next);
  }, []);

  const clearRecent = useCallback(() => {
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {
      // Nothing was stored to begin with.
    }
    setRecent([]);
  }, []);

  return { recent, remember, clearRecent };
}
