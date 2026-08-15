import { getDefaultClient, type ApiClient } from "@eaip/api";

// ---------------------------------------------------------------------------
// Types — derived from backend search_router.py + search_persistence.py
// ---------------------------------------------------------------------------

export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  category: string;
  url?: string;
  score?: number;
  source?: string;
  timestamp?: string;
  excerpt?: string;
  metadata?: Record<string, unknown>;
  query?: string;
}

export interface SearchCapability {
  id: string;
  available: boolean;
  label: string;
  description: string;
}

export interface SearchCapabilitiesResponse {
  engineAvailable: boolean;
  sources: SearchCapability[];
}

export interface SearchSuggestion {
  text: string;
  category?: string;
}

export interface SearchResponse {
  results: SearchResult[];
  suggestions: SearchSuggestion[];
  total: number;
  page: number;
  pageSize: number;
  query: string;
}

export interface RecentSearch {
  id: string;
  query: string;
  category?: string;
  timestamp: string;
}

export interface SavedSearch {
  id: string;
  query: string;
  name?: string;
  category?: string;
  filters?: Record<string, unknown>;
}

export interface SearchOptions {
  query: string;
  category?: string;
  collection?: string;
  page?: number;
  pageSize?: number;
}

// ---------------------------------------------------------------------------
// Client interface
// ---------------------------------------------------------------------------

export interface SearchClient {
  search(options: SearchOptions): Promise<SearchResponse>;
  getCapabilities(): Promise<SearchCapabilitiesResponse>;
  getSuggestions(query: string): Promise<SearchSuggestion[]>;
  getRecentSearches(limit?: number): Promise<RecentSearch[]>;
  saveRecentSearch(query: string, category?: string): Promise<{ id: string }>;
  getSavedSearches(): Promise<SavedSearch[]>;
  saveSearch(
    query: string,
    name?: string,
    category?: string,
    filters?: Record<string, unknown>,
  ): Promise<{ id: string }>;
  deleteSavedSearch(searchId: string): Promise<void>;
}

// ---------------------------------------------------------------------------
// Implementation — maps to GET/POST /api/search/* and /api/search/recent|saved
// ---------------------------------------------------------------------------

export class ApiSearchClient implements SearchClient {
  private client: ApiClient;

  constructor(client?: ApiClient) {
    this.client = client ?? getDefaultClient();
  }

  async search(options: SearchOptions): Promise<SearchResponse> {
    const params: Record<string, string> = { q: options.query };
    if (options.category) params.category = options.category;
    if (options.collection) params.collection = options.collection;
    if (options.page !== undefined) params.page = String(options.page);
    if (options.pageSize !== undefined) params.pageSize = String(options.pageSize);

    const response = await this.client.get<SearchResponse>("/search", params);
    if (response.error) throw response.error;
    return (
      response.data ?? {
        results: [],
        suggestions: [],
        total: 0,
        page: 1,
        pageSize: 20,
        query: options.query,
      }
    );
  }

  async getCapabilities(): Promise<SearchCapabilitiesResponse> {
    const response = await this.client.get<SearchCapabilitiesResponse>("/search/capabilities");
    if (response.error) throw response.error;
    return response.data ?? { engineAvailable: false, sources: [] };
  }

  async getSuggestions(query: string): Promise<SearchSuggestion[]> {
    const response = await this.client.get<{ suggestions: SearchSuggestion[]; query: string }>(
      "/search/suggestions",
      { q: query },
    );
    if (response.error) throw response.error;
    return response.data?.suggestions ?? [];
  }

  async getRecentSearches(limit?: number): Promise<RecentSearch[]> {
    const params: Record<string, string> = {};
    if (limit !== undefined) params.limit = String(limit);
    const response = await this.client.get<{ searches: RecentSearch[] }>("/search/recent", params);
    if (response.error) throw response.error;
    return response.data?.searches ?? [];
  }

  async saveRecentSearch(query: string, category?: string): Promise<{ id: string }> {
    const response = await this.client.post<{ status: string; id: string }>("/search/recent", {
      query,
      ...(category ? { category } : {}),
    });
    if (response.error) throw response.error;
    return { id: response.data?.id ?? "" };
  }

  async getSavedSearches(): Promise<SavedSearch[]> {
    const response = await this.client.get<{ searches: SavedSearch[] }>("/search/saved");
    if (response.error) throw response.error;
    return response.data?.searches ?? [];
  }

  async saveSearch(
    query: string,
    name?: string,
    category?: string,
    filters?: Record<string, unknown>,
  ): Promise<{ id: string }> {
    const response = await this.client.post<{ status: string; id: string }>("/search/saved", {
      query,
      ...(name ? { name } : {}),
      ...(category ? { category } : {}),
      ...(filters ? { filters } : {}),
    });
    if (response.error) throw response.error;
    return { id: response.data?.id ?? "" };
  }

  async deleteSavedSearch(searchId: string): Promise<void> {
    const response = await this.client.delete<Record<string, unknown>>(`/search/saved/${searchId}`);
    if (response.error) throw response.error;
  }
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function createSearchClient(client?: ApiClient): SearchClient {
  return new ApiSearchClient(client);
}
