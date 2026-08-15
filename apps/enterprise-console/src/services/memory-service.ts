import { getDefaultClient } from "@eaip/api";

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

export async function fetchGovernedMemory(query = ""): Promise<GovernedMemory[]> {
  const response = await getDefaultClient().get<GovernedMemory[]>("/copilot/memory", { q: query || undefined });
  if (response.error) throw response.error;
  return response.data ?? [];
}

export async function forgetMemory(id: string): Promise<void> {
  const response = await getDefaultClient().delete(`/copilot/memory/${encodeURIComponent(id)}`);
  if (response.error) throw response.error;
}
