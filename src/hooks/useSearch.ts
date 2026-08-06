import { useEffect, useRef, useState, useCallback } from "react";
import type { SearchResult } from "../utils/searchShared";

type WorkerMessage =
  | { type: "READY" }
  | { type: "RESULTS"; requestId: number; results: SearchResult[] };

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

export function useSearch() {
  const latestRequestIdRef = useRef(0);

  const [results, setResults] = useState<SearchResult[]>([]);
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
    setIsSearching(false);
  }, []);

  return { results, search, clear, isReady, isSearching };
}
