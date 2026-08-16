import { getDefaultClient } from "@eaip/api";
import type { ServiceResult } from "./service-result";
import { liveResult, fallbackResult, isNetworkError } from "./service-result";

export type MemoryDomain = "personal" | "organization" | "operational" | "conversation" | "investigation";

export interface GovernedMemory {
  id: string;
  domain: MemoryDomain;
  content: string;
  source: string;
  provenance: "MEMORY";
  created_at: string;
  updated_at: string;
  accessed_at?: string | null;
  importance: number;
  confidence: number;
  sensitivity: string;
  retention_policy: string;
  expires_at?: string | null;
  status: string;
}

export interface MemoryResult {
  id: string;
  key: string;
  value: string;
  timestamp: string;
}

export async function fetchGovernedMemory(query = ""): Promise<GovernedMemory[]> {
  const response = await getDefaultClient().get<GovernedMemory[]>("/copilot/memory", { q: query || undefined });
  if (response.error) throw response.error;
  return response.data ?? [];
}

export async function forgetMemory(id: string): Promise<void> {
  const response = await getDefaultClient().delete(`/copilot/memory/${encodeURIComponent(id)}`);
  if (response.error) throw response.error;
}

export async function searchMemory(query: string): Promise<ServiceResult<MemoryResult[]>> {
  try {
    const client = getDefaultClient();
    const response = await client.get<unknown>("/memory/search", { q: query });
    if (response.error) throw response.error;
    const raw = Array.isArray(response.data) ? (response.data as unknown[]) : [];
    const results: MemoryResult[] = raw.map((r: unknown) => {
      const obj = (r as Record<string, unknown>) || {};
      return {
        id: String(obj.id || obj.memory_id || ""),
        key: String(obj.key || obj.id || ""),
        value: String(obj.value || obj.content || ""),
        timestamp: String(obj.timestamp || obj.updated_at || new Date().toISOString()),
      };
    });
    return liveResult(results);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult([], err instanceof Error ? err.message : "Backend unavailable");
    }
    throw err;
  }
}

export async function fetchMemory(key: string): Promise<ServiceResult<MemoryResult | null>> {
  try {
    const client = getDefaultClient();
    const response = await client.get<unknown>(`/memory/${encodeURIComponent(key)}`);
    if (response.error) throw response.error;
    const obj = (response.data as Record<string, unknown>) || {};
    const result: MemoryResult = {
      id: String(obj.id || ""),
      key: String(obj.key || key),
      value: String(obj.value || obj.content || ""),
      timestamp: String(obj.timestamp || obj.updated_at || new Date().toISOString()),
    };
    return liveResult(result);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(null, err instanceof Error ? err.message : "Backend unavailable");
    }
    throw err;
  }
}

export async function setMemory(key: string, value: string): Promise<ServiceResult<MemoryResult>> {
  try {
    const client = getDefaultClient();
    const response = await client.put<unknown>(`/memory/${encodeURIComponent(key)}`, { value });
    if (response.error) throw response.error;
    const obj = (response.data as Record<string, unknown>) || {};
    const result: MemoryResult = {
      id: String(obj.id || key),
      key: String(obj.key || key),
      value: String(obj.value || value),
      timestamp: String(obj.timestamp || obj.updatedAt || new Date().toISOString()),
    };
    return liveResult(result);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(
        { id: key, key, value, timestamp: new Date().toISOString() },
        err instanceof Error ? err.message : "Backend unavailable"
      );
    }
    throw err;
  }
}
