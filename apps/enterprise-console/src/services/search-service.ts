import { getDefaultClient } from "@eaip/api";
import type { ServiceResult } from "./service-result";
import { liveResult, fallbackResult, isNetworkError } from "./service-result";
import { createMockSearchResults } from "../mock-data/data";

export interface SearchResult {
  id: string;
  title: string;
  category: string;
  href: string;
}

export async function fetchSearchResults(): Promise<ServiceResult<SearchResult[]>> {
  try {
    const client = getDefaultClient();
    const res = await client.get<SearchResult[]>("/search");
    if (res.error) throw res.error;
    return liveResult(res.data ?? []);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(createMockSearchResults(), "Backend unavailable, showing cached search results");
    }
    throw err;
  }
}
