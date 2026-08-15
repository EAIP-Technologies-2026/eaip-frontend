import type { ServiceResult } from "./service-result";
import { liveResult, fallbackResult, isNetworkError } from "./service-result";
import {
  createSearchClient,
  type SearchCapabilitiesResponse,
  type SearchSuggestion,
  type RecentSearch,
  type SavedSearch,
} from "@eaip/global-search";
import { getDefaultClient } from "@eaip/api";

export interface SearchResult {
  id: string;
  title: string;
  category: string;
  href: string;
  description?: string;
  excerpt?: string;
  score?: number;
  source?: string;
  timestamp?: string;
  query?: string;
}

export interface InvestigationEvidence {
  citations: {
    id: string;
    documentId: string;
    collection: string;
    content: string;
    score: number;
  }[];
  events: unknown[];
  failures: unknown[];
  notifications: unknown[];
}

export async function fetchSearchResults(
  query: string,
  category?: string,
  collection?: string,
): Promise<ServiceResult<SearchResult[]>> {
  try {
    const client = createSearchClient();
    const data = await client.search({ query, category, collection });
    const mapped: SearchResult[] = data.results.map((r) => ({
      id: r.id,
      title: r.title,
      category: r.category,
      href: resultHref(r.category),
      description: r.description ?? r.excerpt ?? "",
      excerpt: r.excerpt ?? "",
      score: r.score,
      source: r.source,
      timestamp: r.timestamp,
      query: r.query ?? query,
    }));
    return liveResult(mapped);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult([], "Backend unavailable");
    }
    throw err;
  }
}

export async function fetchSearchCapabilities(): Promise<
  ServiceResult<SearchCapabilitiesResponse>
> {
  try {
    const client = createSearchClient();
    const data = await client.getCapabilities();
    return liveResult(data);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult({ engineAvailable: false, sources: [] }, "Backend unavailable");
    }
    throw err;
  }
}

export async function fetchSearchSuggestions(
  query: string,
): Promise<ServiceResult<SearchSuggestion[]>> {
  try {
    const client = createSearchClient();
    const data = await client.getSuggestions(query);
    return liveResult(data);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult([], "Backend unavailable");
    }
    throw err;
  }
}

export async function fetchRecentSearches(): Promise<ServiceResult<RecentSearch[]>> {
  try {
    const client = createSearchClient();
    const data = await client.getRecentSearches();
    return liveResult(data);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult([], "Backend unavailable");
    }
    throw err;
  }
}

export async function saveRecentSearch(
  query: string,
  category?: string,
): Promise<ServiceResult<{ id: string }>> {
  try {
    const client = createSearchClient();
    const data = await client.saveRecentSearch(query, category);
    return liveResult(data);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult({ id: "" }, "Backend unavailable");
    }
    throw err;
  }
}

export async function fetchSavedSearches(): Promise<ServiceResult<SavedSearch[]>> {
  try {
    const client = createSearchClient();
    const data = await client.getSavedSearches();
    return liveResult(data);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult([], "Backend unavailable");
    }
    throw err;
  }
}

export async function saveSearch(
  query: string,
  name?: string,
  category?: string,
  filters?: Record<string, unknown>,
): Promise<ServiceResult<{ id: string }>> {
  try {
    const client = createSearchClient();
    const data = await client.saveSearch(query, name, category, filters);
    return liveResult(data);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult({ id: "" }, "Backend unavailable");
    }
    throw err;
  }
}

export async function deleteSavedSearch(searchId: string): Promise<ServiceResult<void>> {
  try {
    const client = createSearchClient();
    await client.deleteSavedSearch(searchId);
    return liveResult(undefined);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(undefined, "Backend unavailable");
    }
    throw err;
  }
}

export async function fetchInvestigationEvidence(
  query: string,
  limit = 20,
): Promise<ServiceResult<InvestigationEvidence>> {
  try {
    const client = getDefaultClient();
    const [citationsRes, eventsRes, failuresRes, notificationsRes] = await Promise.all([
      client.get<{ citations: InvestigationEvidence["citations"]; total: number }>(
        "/knowledge/citations",
        { query, limit: String(limit) },
      ),
      client.get<unknown[]>("/events/activity", { limit: String(limit) }),
      client.get<{ failures: unknown[] }>("/operations/failures", { limit: String(limit) }),
      client.get<unknown[]>("/notifications", { limit: String(limit) }),
    ]);
    return liveResult({
      citations: citationsRes.data?.citations ?? [],
      events: eventsRes.data ?? [],
      failures: failuresRes.data?.failures ?? [],
      notifications: notificationsRes.data ?? [],
    });
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(
        { citations: [], events: [], failures: [], notifications: [] },
        "Backend unavailable",
      );
    }
    throw err;
  }
}

function resultHref(category: string): string {
  switch (category) {
    case "knowledge":
      return "/knowledge";
    case "agent":
    case "agents":
      return "/agents";
    case "workflow":
    case "workflows":
      return "/workflows";
    case "notifications":
      return "/notifications";
    case "monitoring":
      return "/monitoring";
    default:
      return "/search";
  }
}
