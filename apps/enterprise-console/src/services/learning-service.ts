import { getDefaultClient } from "@eaip/api";
import type { ServiceResult } from "./service-result";
import { liveResult, fallbackResult, isNetworkError } from "./service-result";

async function get<T>(path: string, params?: Record<string, string>): Promise<ServiceResult<T>> {
  try {
    const c = getDefaultClient();
    const r = await c.get<T>(path, params);
    if (r.error) throw r.error;
    return liveResult(r.data as T);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult(null as unknown as T, "Backend unavailable");
    throw err;
  }
}
async function post<T>(
  path: string,
  body: Record<string, unknown> = {},
): Promise<ServiceResult<T>> {
  try {
    const c = getDefaultClient();
    const r = await c.post<T>(path, body);
    if (r.error) throw r.error;
    return liveResult(r.data as T);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult(null as unknown as T, "Backend unavailable");
    throw err;
  }
}

export const fetchLearningHistory = (sourceType?: string) =>
  get<unknown[]>("/learning/history", sourceType ? { source_type: sourceType } : undefined);

export const fetchLessons = () => get<unknown[]>("/learning/lessons");

export const fetchLesson = (lessonId: string) =>
  get<unknown>(`/learning/lessons/${encodeURIComponent(lessonId)}`);

export const fetchFeedbackSummary = () => get<unknown>("/learning/feedback/summary");

export const fetchAdaptations = () => get<unknown[]>("/learning/adaptations");

export const observeLearning = (
  sourceType: string,
  sourceId: string,
  observation: Record<string, unknown>,
) =>
  post<unknown>("/learning/observe", { source_type: sourceType, source_id: sourceId, observation });
