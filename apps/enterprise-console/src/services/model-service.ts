import { getDefaultClient } from "@eaip/api";
import type { ServiceResult } from "./service-result";
import { liveResult, fallbackResult, isNetworkError } from "./service-result";

export interface ModelRecord {
  id: string;
  tenant_id: string;
  provider: string;
  model_name: string;
  version: string;
  capabilities: string[];
  context_limit: number;
  latency_avg_ms: number;
  cost_per_1k_tokens: number;
  quality_score: number;
  availability: number;
  privacy_level: string;
  locality: string;
  supported_tools: string[];
  supported_modalities: string[];
  status: string;
}

export interface RoutingDecision {
  selected_model_id: string;
  reason: string;
  score: number;
  alternatives: { model_id: string; score: number; provider: string }[];
  factors: Record<string, number>;
  routed_at: string;
}

export interface ModelPerformanceMetrics {
  model_id: string;
  tenant_id: string;
  total_evaluations: number;
  avg_quality: number;
  avg_latency_ms: number;
  avg_cost: number;
  success_rate: number;
  task_type_breakdown: Record<string, { count: number; avg_quality: number; avg_latency: number }>;
}

export interface ModelComparison {
  task_type: string;
  models: {
    model_id: string;
    avg_quality: number;
    avg_latency_ms: number;
    avg_cost: number;
    success_rate: number;
    evaluations: number;
  }[];
  recommendation: string;
}

export interface ExperimentSummary {
  experiment_id: string;
  status: string;
  models: Record<
    string,
    {
      evaluations: number;
      avg_quality: number;
      avg_latency_ms: number;
      avg_cost: number;
      success_rate: number;
    }
  >;
  winner: string;
  recommendation: string;
}

export async function fetchModels(filters?: {
  provider?: string;
  status?: string;
}): Promise<ServiceResult<ModelRecord[]>> {
  try {
    const c = getDefaultClient();
    const params = new URLSearchParams();
    if (filters?.provider) params.set("provider", filters.provider);
    if (filters?.status) params.set("status", filters.status);
    const qs = params.toString();
    const r = await c.get<ModelRecord[]>(`/models${qs ? `?${qs}` : ""}`);
    if (r.error) throw r.error;
    return liveResult(r.data ?? []);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult([], "Backend unavailable");
    throw err;
  }
}

export async function routeModel(body: {
  task_type: string;
  required_capabilities?: string[];
  data_classification?: string;
  max_cost_per_1k?: number;
  min_quality_score?: number;
}): Promise<ServiceResult<RoutingDecision>> {
  try {
    const c = getDefaultClient();
    const r = await c.post<RoutingDecision>("/models/route", body);
    if (r.error) throw r.error;
    return liveResult(
      r.data ?? {
        selected_model_id: "",
        reason: "Backend unavailable",
        score: 0,
        alternatives: [],
        factors: {},
        routed_at: "",
      },
    );
  } catch (err) {
    if (isNetworkError(err))
      return fallbackResult(
        {
          selected_model_id: "",
          reason: "Backend unavailable",
          score: 0,
          alternatives: [],
          factors: {},
          routed_at: "",
        },
        "Backend unavailable",
      );
    throw err;
  }
}

export async function fetchModelPerformance(
  modelId: string,
): Promise<ServiceResult<ModelPerformanceMetrics>> {
  try {
    const c = getDefaultClient();
    const r = await c.get<ModelPerformanceMetrics>(
      `/models/${encodeURIComponent(modelId)}/performance`,
    );
    if (r.error) throw r.error;
    return liveResult(
      r.data ?? {
        model_id: modelId,
        tenant_id: "",
        total_evaluations: 0,
        avg_quality: 0,
        avg_latency_ms: 0,
        avg_cost: 0,
        success_rate: 0,
        task_type_breakdown: {},
      },
    );
  } catch (err) {
    if (isNetworkError(err))
      return fallbackResult(
        {
          model_id: modelId,
          tenant_id: "",
          total_evaluations: 0,
          avg_quality: 0,
          avg_latency_ms: 0,
          avg_cost: 0,
          success_rate: 0,
          task_type_breakdown: {},
        },
        "Backend unavailable",
      );
    throw err;
  }
}

export async function compareModels(
  modelIds: string[],
  taskType: string,
): Promise<ServiceResult<ModelComparison>> {
  try {
    const c = getDefaultClient();
    const r = await c.post<ModelComparison>("/models/compare", {
      model_ids: modelIds,
      task_type: taskType,
    });
    if (r.error) throw r.error;
    return liveResult(
      r.data ?? { task_type: taskType, models: [], recommendation: "Backend unavailable" },
    );
  } catch (err) {
    if (isNetworkError(err))
      return fallbackResult(
        { task_type: taskType, models: [], recommendation: "Backend unavailable" },
        "Backend unavailable",
      );
    throw err;
  }
}

export async function fetchRoutingDecisions(): Promise<ServiceResult<RoutingDecision[]>> {
  try {
    const c = getDefaultClient();
    const r = await c.get<RoutingDecision[]>("/models/routing-decisions");
    if (r.error) throw r.error;
    return liveResult(r.data ?? []);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult([], "Backend unavailable");
    throw err;
  }
}

export async function fetchExperiments(): Promise<ServiceResult<ExperimentSummary[]>> {
  try {
    const c = getDefaultClient();
    const r = await c.get<ExperimentSummary[]>("/models/experiments");
    if (r.error) throw r.error;
    return liveResult(r.data ?? []);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult([], "Backend unavailable");
    throw err;
  }
}
