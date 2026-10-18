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
      /** Matched articles per category segment - honest counts behind a filter. */
      categoryCounts?: Record<string, number>;
    };

/**
 * The search index is expensive to build, so a single worker is shared by every
 * consumer and kept alive across route changes rather than being spun up and
 * torn down per component mount.
 *
 * NOTE: the worker must be constructed with `new Worker(new URL(...))`
 * inline. Splitting the URL out so it can be fetched for progress makes Vite
 * emit the raw .ts source as a static asset instead of the bundled worker,
 * which breaks search entirely.
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

function dropSharedWorker(): void {
  sharedWorker?.terminate();
  sharedWorker = null;
  workerReady = false;
}

/**
 * Starts the worker before anyone has asked it for results.
 *
 * Fires on hover, focus, or press of a search entry point - the moment before
 * the click - so the index download overlaps the route-chunk download and the
 * tap delay instead of serializing behind them. The route chunk rides along
 * for the same reason: small next to the index, but still a round trip on 3G.
 *
 * Idempotent: everything here is created once and shared, so every entry
 * point can call it freely.
 */
export function warmSearch(): void {
  // Data Saver is an explicit request not to spend bytes speculatively, and
  // both of these downloads are a guess about intent.
  if (
    typeof navigator !== "undefined" &&
    (navigator as { connection?: { saveData?: boolean } }).connection?.saveData
  ) {
    return;
  }

  getSharedWorker();
  void import("../components/SearchPage");
}

export function useSearch() {
  const latestRequestIdRef = useRef(0);

  const [results, setResults] = useState<SearchResult[]>([]);
  const [totalArticles, setTotalArticles] = useState(0);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [isReady, setIsReady] = useState(workerReady);
  const [isSearching, setIsSearching] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

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
        setCategoryCounts(e.data.categoryCounts ?? {});
        setIsSearching(false);
      }
    };

    // A failed download or a killed worker used to leave an endless spinner;
    // surface it with a way back instead.
    const handleWorkerError = () => {
      latestRequestIdRef.current += 1;
      setIsSearching(false);
      setLoadError(
        "Pretraga trenutno nije dostupna. Proverite vezu pa pokušajte ponovo.",
      );
    };

    worker.addEventListener("message", handleMessage);
    worker.addEventListener("error", handleWorkerError);

    // The worker posts READY once at startup; if it was warmed from the
    // landing page, that fired before this listener existed and is lost.
    // Ask again so this consumer always learns readiness.
    worker.postMessage({ type: "PING" });

    // The READY broadcast may have already fired before this consumer mounted.
    if (workerReady) setIsReady(true);

    return () => {
      worker.removeEventListener("message", handleMessage);
      worker.removeEventListener("error", handleWorkerError);
    };
  }, [retryToken]);

  const search = useCallback((query: string, limit = 20) => {
    const trimmed = query.trim();

    if (!trimmed) {
      latestRequestIdRef.current += 1;
      setResults([]);
      setTotalArticles(0);
      setCategoryCounts({});
      setIsSearching(false);
      return;
    }

    const requestId = latestRequestIdRef.current + 1;
    latestRequestIdRef.current = requestId;
    setIsSearching(true);
    setLoadError(null);

    // Posting before the worker finishes loading is safe: the browser queues
    // the message until evaluation completes.
    getSharedWorker().postMessage({
      type: "SEARCH",
      query: trimmed,
      limit,
      requestId,
    });
  }, []);

  const clear = useCallback(() => {
    latestRequestIdRef.current += 1;
    setResults([]);
    setTotalArticles(0);
    setCategoryCounts({});
    setIsSearching(false);
  }, []);

  const retry = useCallback(() => {
    dropSharedWorker();
    setLoadError(null);
    setIsReady(false);
    setRetryToken((t) => t + 1);
  }, []);

  return {
    results,
    totalArticles,
    categoryCounts,
    search,
    clear,
    isReady,
    isSearching,
    loadError,
    retry,
  };
}
