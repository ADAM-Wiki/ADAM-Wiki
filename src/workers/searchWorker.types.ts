import type { SearchResult } from "../utils/searchShared";

export interface SearchWorkerRequest {
  type: "SEARCH";
  query: string;
  limit?: number;
  requestId?: number;
}

export interface SearchWorkerResponse {
  type: "RESULTS" | "READY";
  requestId?: number;
  results?: SearchResult[];
}
