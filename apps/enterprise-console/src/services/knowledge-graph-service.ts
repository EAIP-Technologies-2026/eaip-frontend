import { getDefaultClient } from "@eaip/api";
import type { ServiceResult } from "./service-result";
import { liveResult, fallbackResult, isNetworkError } from "./service-result";

export interface GraphEntity {
  id: string;
  type: string;
  name: string;
  description: string;
  properties: Record<string, unknown>;
  source: string;
  confidence: number;
  metadata: Record<string, unknown>;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface GraphRelationship {
  id: string;
  type: string;
  sourceEntityId: string;
  targetEntityId: string;
  weight: number;
  bidirectional: boolean;
  properties: Record<string, unknown>;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface GraphStats {
  totalEntities: number;
  totalRelationships: number;
  entityTypeCounts: Record<string, number>;
  relationshipTypeCounts: Record<string, number>;
}

export interface GraphPath {
  nodes: string[];
  edges: string[];
  distance: number;
}

export interface GraphQueryResult {
  entities: GraphEntity[];
  relationships: GraphRelationship[];
  paths: GraphPath[];
  totalCount: number;
  durationMs: number;
}

export async function fetchGraphEntities(
  options?: { type?: string; q?: string; limit?: number }
): Promise<ServiceResult<GraphEntity[]>> {
  try {
    const client = getDefaultClient();
    const params: Record<string, string> = {};
    if (options?.type) params.type_filter = options.type;
    if (options?.q) params.q = options.q;
    if (options?.limit) params.limit = String(options.limit);
    const response = await client.get<GraphEntity[]>("/knowledge-graph/entities", params);
    if (response.error) throw response.error;
    return liveResult(response.data ?? []);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult([], err instanceof Error ? err.message : "Backend unavailable");
    }
    throw err;
  }
}

export async function fetchGraphEntity(entityId: string): Promise<ServiceResult<GraphEntity | null>> {
  try {
    const client = getDefaultClient();
    const response = await client.get<GraphEntity>(`/knowledge-graph/entities/${entityId}`);
    if (response.error) throw response.error;
    return liveResult(response.data ?? null);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(null, err instanceof Error ? err.message : "Backend unavailable");
    }
    throw err;
  }
}

export async function createGraphEntity(
  body: Partial<GraphEntity>
): Promise<ServiceResult<GraphEntity>> {
  try {
    const client = getDefaultClient();
    const response = await client.post<GraphEntity>("/knowledge-graph/entities", body);
    if (response.error) throw response.error;
    return liveResult(response.data!);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(
        null as never,
        err instanceof Error ? err.message : "Backend unavailable"
      );
    }
    throw err;
  }
}

export async function fetchGraphRelationships(
  options?: { type?: string; sourceId?: string; targetId?: string; limit?: number }
): Promise<ServiceResult<GraphRelationship[]>> {
  try {
    const client = getDefaultClient();
    const params: Record<string, string> = {};
    if (options?.type) params.type_filter = options.type;
    if (options?.sourceId) params.source_id = options.sourceId;
    if (options?.targetId) params.target_id = options.targetId;
    if (options?.limit) params.limit = String(options.limit);
    const response = await client.get<GraphRelationship[]>("/knowledge-graph/relationships", params);
    if (response.error) throw response.error;
    return liveResult(response.data ?? []);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult([], err instanceof Error ? err.message : "Backend unavailable");
    }
    throw err;
  }
}

export async function createGraphRelationship(
  body: Partial<GraphRelationship>
): Promise<ServiceResult<GraphRelationship>> {
  try {
    const client = getDefaultClient();
    const response = await client.post<GraphRelationship>("/knowledge-graph/relationships", body);
    if (response.error) throw response.error;
    return liveResult(response.data!);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(
        null as never,
        err instanceof Error ? err.message : "Backend unavailable"
      );
    }
    throw err;
  }
}

export async function queryGraph(
  query: {
    query: string;
    entityTypes?: string[];
    relationshipTypes?: string[];
    maxDepth?: number;
    minConfidence?: number;
    startEntityId?: string;
  }
): Promise<ServiceResult<GraphQueryResult>> {
  try {
    const client = getDefaultClient();
    const response = await client.post<GraphQueryResult>("/knowledge-graph/query", query);
    if (response.error) throw response.error;
    return liveResult(response.data!);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(
        { entities: [], relationships: [], paths: [], totalCount: 0, durationMs: 0 },
        err instanceof Error ? err.message : "Backend unavailable"
      );
    }
    throw err;
  }
}

export async function traverseGraph(
  entityId: string,
  options?: { depth?: number; direction?: string }
): Promise<ServiceResult<{ entities: GraphEntity[]; relationships: GraphRelationship[] }>> {
  try {
    const client = getDefaultClient();
    const response = await client.post<{ entities: GraphEntity[]; relationships: GraphRelationship[] }>(
      `/knowledge-graph/traversal/${entityId}`,
      options ?? {}
    );
    if (response.error) throw response.error;
    return liveResult(response.data!);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(
        { entities: [], relationships: [] },
        err instanceof Error ? err.message : "Backend unavailable"
      );
    }
    throw err;
  }
}

export async function fetchGraphPath(
  sourceId: string,
  targetId: string,
  maxDepth?: number
): Promise<ServiceResult<{ path: GraphPath | null; found: boolean }>> {
  try {
    const client = getDefaultClient();
    const params: Record<string, string> = { source_id: sourceId, target_id: targetId };
    if (maxDepth) params.max_depth = String(maxDepth);
    const response =
      await client.get<{ path: GraphPath | null; found: boolean }>("/knowledge-graph/shortest-path", params);
    if (response.error) throw response.error;
    return liveResult(response.data!);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(
        { path: null, found: false },
        err instanceof Error ? err.message : "Backend unavailable"
      );
    }
    throw err;
  }
}

export async function fetchGraphStats(): Promise<ServiceResult<GraphStats>> {
  try {
    const client = getDefaultClient();
    const response = await client.get<GraphStats>("/knowledge-graph/stats");
    if (response.error) throw response.error;
    return liveResult(response.data ?? {
      totalEntities: 0,
      totalRelationships: 0,
      entityTypeCounts: {},
      relationshipTypeCounts: {},
    });
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(
        {
          totalEntities: 0,
          totalRelationships: 0,
          entityTypeCounts: {},
          relationshipTypeCounts: {},
        },
        err instanceof Error ? err.message : "Backend unavailable"
      );
    }
    throw err;
  }
}

export async function fetchGraphSubgraph(
  entityIds: string[],
  depth?: number
): Promise<ServiceResult<{ entities: GraphEntity[]; relationships: GraphRelationship[] }>> {
  try {
    const client = getDefaultClient();
    const params: Record<string, string> = { entity_ids: entityIds.join(",") };
    if (depth) params.depth = String(depth);
    const response = await client.get<{ entities: GraphEntity[]; relationships: GraphRelationship[] }>(
      "/knowledge-graph/subgraph",
      params
    );
    if (response.error) throw response.error;
    return liveResult(response.data!);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(
        { entities: [], relationships: [] },
        err instanceof Error ? err.message : "Backend unavailable"
      );
    }
    throw err;
  }
}
