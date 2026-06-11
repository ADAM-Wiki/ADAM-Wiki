import type { SearchResult } from "../utils/searchUtils";

export interface SearchWorkerRequest {
  query: string;
  limit?: number;
}

export interface SearchWorkerResponse {
  query: string;
  results: SearchResult[];
}