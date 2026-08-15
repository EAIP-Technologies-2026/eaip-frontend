import { getDefaultClient } from "@eaip/api";
import type { ServiceResult } from "./service-result";
import { liveResult, fallbackResult, isNetworkError } from "./service-result";

export interface CostOverview {
  totalCost: number;
  totalRequests: number;
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  avgCostPerRequest: number;
  modelCount: number;
  currency: string;
}

export interface ModelCostData {
  modelId: string;
  totalCost: number;
  requests: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  avgCostPerRequest: number;
  currency: string;
}

export interface ProviderCostData {
  provider: string;
  totalCost: number;
  requests: number;
  inputTokens: number;
  outputTokens: number;
  modelCount: number;
  currency: string;
}

export interface AgentCostData {
  agentId: string;
  totalCost: number;
  requests: number;
  inputTokens: number;
  outputTokens: number;
  currency: string;
}

export interface WorkflowCostData {
  workflowId: string;
  totalCost: number;
  requests: number;
  inputTokens: number;
  outputTokens: number;
  currency: string;
}

export interface CostTrend {
  date: string;
  cost: number;
  requests: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface BudgetStatus {
  id: string;
  name: string;
  amount: number;
  currentSpend: number;
  percentage: number;
  status: "under" | "warning" | "critical" | "exceeded";
  period: string;
  currency: string;
  enabled: boolean;
}

export interface CostAnomaly {
  modelId: string;
  actualCost: number;
  expectedCost: number;
  deviation: number;
  deviationPercent: number;
  severity: string;
}

export interface CostAlert {
  id: string;
  budgetId: string;
  threshold: number;
  actualSpend: number;
  budgetedAmount: number;
  percentage: number;
  triggeredAt: string;
  acknowledged: boolean;
}

export interface CostIntelligenceData {
  overview: CostOverview;
  byModel: Record<string, { cost: number; tokens: number }>;
  byTenant: Record<string, number>;
}

const defaultCostData: CostIntelligenceData = {
  overview: {
    totalCost: 0,
    totalRequests: 0,
    totalTokens: 0,
    inputTokens: 0,
    outputTokens: 0,
    avgCostPerRequest: 0,
    modelCount: 0,
    currency: "USD",
  },
  byModel: {},
  byTenant: {},
};

export async function fetchCostOverview(): Promise<ServiceResult<CostIntelligenceData>> {
  try {
    const client = getDefaultClient();
    const res = await client.get<CostIntelligenceData>("/cost/overview");
    if (res.error) throw res.error;
    return liveResult(res.data ?? defaultCostData);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(defaultCostData, "Backend unavailable");
    }
    throw err;
  }
}

export async function fetchCostModels(): Promise<ServiceResult<ModelCostData[]>> {
  try {
    const client = getDefaultClient();
    const res = await client.get<{ models: ModelCostData[] }>("/cost/models");
    if (res.error) throw res.error;
    return liveResult(res.data?.models ?? []);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult([], "Backend unavailable");
    }
    throw err;
  }
}

export async function fetchCostProviders(): Promise<ServiceResult<ProviderCostData[]>> {
  try {
    const client = getDefaultClient();
    const res = await client.get<{ providers: ProviderCostData[] }>("/cost/providers");
    if (res.error) throw res.error;
    return liveResult(res.data?.providers ?? []);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult([], "Backend unavailable");
    }
    throw err;
  }
}

export async function fetchCostAgents(): Promise<ServiceResult<AgentCostData[]>> {
  try {
    const client = getDefaultClient();
    const res = await client.get<{ agents: AgentCostData[] }>("/cost/agents");
    if (res.error) throw res.error;
    return liveResult(res.data?.agents ?? []);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult([], "Backend unavailable");
    }
    throw err;
  }
}

export async function fetchCostWorkflows(): Promise<ServiceResult<WorkflowCostData[]>> {
  try {
    const client = getDefaultClient();
    const res = await client.get<{ workflows: WorkflowCostData[] }>("/cost/workflows");
    if (res.error) throw res.error;
    return liveResult(res.data?.workflows ?? []);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult([], "Backend unavailable");
    }
    throw err;
  }
}

export async function fetchCostTrends(days?: number): Promise<ServiceResult<CostTrend[]>> {
  try {
    const client = getDefaultClient();
    const params: Record<string, string> = {};
    if (days) params.days = String(days);
    const res = await client.get<{ trends: CostTrend[] }>("/cost/trends", params);
    if (res.error) throw res.error;
    return liveResult(res.data?.trends ?? []);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult([], "Backend unavailable");
    }
    throw err;
  }
}

export async function fetchCostBudgets(): Promise<ServiceResult<BudgetStatus[]>> {
  try {
    const client = getDefaultClient();
    const res = await client.get<{ budgets: BudgetStatus[] }>("/cost/budgets");
    if (res.error) throw res.error;
    return liveResult(res.data?.budgets ?? []);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult([], "Backend unavailable");
    }
    throw err;
  }
}

export async function fetchCostAnomalies(): Promise<ServiceResult<CostAnomaly[]>> {
  try {
    const client = getDefaultClient();
    const res = await client.get<{ anomalies: CostAnomaly[] }>("/cost/anomalies");
    if (res.error) throw res.error;
    return liveResult(res.data?.anomalies ?? []);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult([], "Backend unavailable");
    }
    throw err;
  }
}

export async function fetchCostAlerts(): Promise<ServiceResult<CostAlert[]>> {
  try {
    const client = getDefaultClient();
    const res = await client.get<{ alerts: CostAlert[] }>("/cost/alerts");
    if (res.error) throw res.error;
    return liveResult(res.data?.alerts ?? []);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult([], "Backend unavailable");
    }
    throw err;
  }
}
