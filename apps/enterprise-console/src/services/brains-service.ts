import { getDefaultClient } from "@eaip/api";

export interface BrainTemplate {
  id: string;
  name: string;
  description: string;
  businessFunction: string;
  objectives: string[];
  instructions: string;
  rules: string[];
  tools: string[];
}

export interface BrainRecommendation {
  id: string;
  title: string;
  rationale: string;
  evidence: { source_type: string; source_id: string; content_preview: string; relevance_score: number }[];
  confidence: number;
  status: string;
  approvalRequired: boolean;
  executionStatus: string;
  executionResult?: string;
  missionId?: string;
}

export interface Brain {
  id: string;
  name: string;
  description: string;
  businessFunction: string;
  ownerId: string;
  objectives: string[];
  instructions: string;
  knowledgeSources: string[];
  rules: string[];
  tools: string[];
  approvalRequired: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  recommendations: BrainRecommendation[];
  missionIds: string[];
  memoryIds: string[];
  activity: { id: string; action: string; message: string; timestamp: string }[];
}

const client = () => getDefaultClient();

export async function fetchBrainTemplates(): Promise<BrainTemplate[]> {
  const response = await client().get<BrainTemplate[]>("/brains/templates");
  if (response.error) throw response.error;
  return response.data ?? [];
}

export async function fetchBrains(): Promise<Brain[]> {
  const response = await client().get<Brain[]>("/brains");
  if (response.error) throw response.error;
  return response.data ?? [];
}

export async function createBrain(body: Record<string, unknown>): Promise<Brain> {
  const response = await client().post<Brain>("/brains", body);
  if (response.error || !response.data) throw response.error ?? new Error("Brain creation returned no data");
  return response.data;
}

export async function fetchBrain(brainId: string): Promise<Brain> {
  const response = await client().get<Brain>(`/brains/${brainId}`);
  if (response.error || !response.data) throw response.error ?? new Error("Brain not found");
  return response.data;
}

export async function configureBrain(brainId: string, body: Record<string, unknown>): Promise<Brain> {
  const response = await client().put<Brain>(`/brains/${brainId}/config`, body);
  if (response.error || !response.data) throw response.error ?? new Error("Brain configuration returned no data");
  return response.data;
}

export async function queryBrain(brainId: string, query: string): Promise<{ answer: string; sources: BrainRecommendation["evidence"]; recommendation: BrainRecommendation }> {
  const response = await client().post<{ answer: string; sources: BrainRecommendation["evidence"]; recommendation: BrainRecommendation }>(`/brains/${brainId}/query`, { query });
  if (response.error || !response.data) throw response.error ?? new Error("Brain query returned no data");
  return response.data;
}

export async function approveRecommendation(brainId: string, recommendationId: string): Promise<BrainRecommendation> {
  const response = await client().post<BrainRecommendation>(`/brains/${brainId}/recommendations/${recommendationId}/approve`, {});
  if (response.error || !response.data) throw response.error ?? new Error("Approval failed");
  return response.data;
}

export async function rejectRecommendation(brainId: string, recommendationId: string): Promise<BrainRecommendation> {
  const response = await client().post<BrainRecommendation>(`/brains/${brainId}/recommendations/${recommendationId}/reject`, {});
  if (response.error || !response.data) throw response.error ?? new Error("Rejection failed");
  return response.data;
}

export async function executeAction(brainId: string, recommendationId: string): Promise<{ missionId: string; mission: Record<string, unknown>; executionStatus: string; executionResult: string }> {
  const response = await client().post<{ missionId: string; mission: Record<string, unknown>; executionStatus: string; executionResult: string }>(`/brains/${brainId}/recommendations/${recommendationId}/execute`, {});
  if (response.error || !response.data) throw response.error ?? new Error("Execution failed");
  return response.data;
}

export async function createBrainMission(brainId: string, recommendationId: string): Promise<Record<string, unknown>> {
  const response = await client().post<Record<string, unknown>>(`/brains/${brainId}/recommendations/${recommendationId}/mission`, {});
  if (response.error || !response.data) throw response.error ?? new Error("Mission creation failed");
  return response.data;
}

export async function rememberBrain(brainId: string, content: string): Promise<Record<string, unknown>> {
  const response = await client().post<Record<string, unknown>>(`/brains/${brainId}/memory`, { content });
  if (response.error || !response.data) throw response.error ?? new Error("Memory write failed");
  return response.data;
}
