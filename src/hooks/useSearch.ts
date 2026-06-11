import { useEffect, useRef, useState, useCallback } from "react";
import type { SearchResult } from "../utils/searchShared";

type WorkerMessage =
  | { type: "READY" }
  | { type: "RESULTS"; requestId: number; results: SearchResult[] };

export function useSearch() {
  const workerRef = useRef<Worker | null>(null);
  const latestRequestIdRef = useRef(0);

  const [results, setResults] = useState<SearchResult[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const worker = new Worker(
      new URL("../workers/search.worker.ts", import.meta.url),
      { type: "module" },
    );

    worker.onmessage = (e: MessageEvent<WorkerMessage>) => {
      if (e.data.type === "READY") {
        setIsReady(true);
        return;
      }

      if (e.data.type === "RESULTS") {
        if (e.data.requestId !== latestRequestIdRef.current) return;
        setResults(e.data.results);
        setIsSearching(false);
      }
    };

    workerRef.current = worker;

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  const search = useCallback((query: string) => {
    const trimmed = query.trim();

    if (!workerRef.current || !trimmed) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const requestId = latestRequestIdRef.current + 1;
    latestRequestIdRef.current = requestId;
    setIsSearching(true);

    workerRef.current.postMessage({
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
