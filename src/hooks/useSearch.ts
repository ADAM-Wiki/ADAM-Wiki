import { useEffect, useRef, useState, useCallback } from "react";
import type { SearchResult } from "../utils/searchShared";

type WorkerMessage =
  | { type: "READY" }
  | {
      type: "RESULTS";
      requestId: number;
      results: SearchResult[];
      /** How many articles matched in total, before the list was capped. */
      totalArticles: number;
    };

/**
 * The search index is expensive to build, so a single worker is shared by every
 * consumer and kept alive across route changes rather than being spun up and
 * torn down per component mount.
 */
let sharedWorker: Worker | null = null;
let workerReady = false;

function getSharedWorker(): Worker {
  if (!sharedWorker) {
    sharedWorker = new Worker(
      new URL("../workers/search.worker.ts", import.meta.url),
      { type: "module" },
    );
  }
  return sharedWorker;
}

/**
 * Starts the worker before anyone has asked it for results.
 *
 * Creating it pulls down the index chunk and builds the index over ~2000
 * chunks, which is unnoticeable on a desktop and distinctly noticeable on a
 * phone. Nothing triggers that until /search mounts, so the first visitor to
 * click search waits through "Učitavanje pretrage...". Calling this on hover
 * or focus - the moment before the click - usually hides the whole thing.
 *
 * Idempotent: the worker is created once and shared, so every entry point can
 * call it freely.
 */
export function warmSearch(): void {
  // Data Saver is an explicit request not to spend bytes speculatively, and
  // this is the one download on the site that is purely a guess about intent.
  if (
    typeof navigator !== "undefined" &&
    (navigator as { connection?: { saveData?: boolean } }).connection?.saveData
  ) {
    return;
  }

  getSharedWorker();
}

export function useSearch() {
  const latestRequestIdRef = useRef(0);

  const [results, setResults] = useState<SearchResult[]>([]);
  const [totalArticles, setTotalArticles] = useState(0);
  const [isReady, setIsReady] = useState(workerReady);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const worker = getSharedWorker();

    const handleMessage = (e: MessageEvent<WorkerMessage>) => {
      if (e.data.type === "READY") {
        workerReady = true;
        setIsReady(true);
        return;
      }

      if (e.data.type === "RESULTS") {
        if (e.data.requestId !== latestRequestIdRef.current) return;
        setResults(e.data.results);
        setTotalArticles(e.data.totalArticles ?? e.data.results.length);
        setIsSearching(false);
      }
    };

    worker.addEventListener("message", handleMessage);

    // The READY broadcast may have already fired before this consumer mounted.
    if (workerReady) setIsReady(true);

    return () => {
      worker.removeEventListener("message", handleMessage);
    };
  }, []);

  const search = useCallback((query: string) => {
    const trimmed = query.trim();

    if (!trimmed) {
      latestRequestIdRef.current += 1;
      setResults([]);
      setTotalArticles(0);
      setIsSearching(false);
      return;
    }

    const requestId = latestRequestIdRef.current + 1;
    latestRequestIdRef.current = requestId;
    setIsSearching(true);

    getSharedWorker().postMessage({
      type: "SEARCH",
      query: trimmed,
      limit: 20,
      requestId,
    });
  }, []);

  const clear = useCallback(() => {
    latestRequestIdRef.current += 1;
    setResults([]);
    setTotalArticles(0);
    setIsSearching(false);
  }, []);

  return { results, totalArticles, search, clear, isReady, isSearching };
}
