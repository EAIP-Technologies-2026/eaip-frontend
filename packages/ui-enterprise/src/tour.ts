/**
 * EAIP Conductor Phase 8 — Guided Tour types and API client.
 *
 * The tour is a capability of the existing Personal Assistant. It uses the
 * existing Conductor API pipeline and does not create a parallel voice runtime.
 */

export type TourState =
  | "idle"
  | "intro"
  | "navigating"
  | "explaining"
  | "demonstrating"
  | "waiting"
  | "paused"
  | "error"
  | "completed"
  | "cancelled";

export type TourCommand =
  | "start"
  | "pause"
  | "resume"
  | "next"
  | "previous"
  | "skip"
  | "stop"
  | "repeat"
  | "explain"
  | "explain_simple"
  | "what_does_this_do"
  | "go_to"
  | "try_myself"
  | "most_important";

export interface TourStep {
  id: string;
  order: number;
  route: string;
  application: string;
  title: string;
  narration: string;
  why_it_matters: string;
  demo_description: string;
  demo_fixture_type: string;
  demo_safe: boolean;
}

export interface TourResponse {
  tour_session_id: string;
  state: TourState;
  current_step: TourStep | null;
  current_step_index: number;
  total_steps: number;
  narration: string;
  route: string;
  application: string;
  fixtures: unknown[];
  voice_narration: string;
  error?: string | null;
}

export interface TourPreferences {
  tour_completed: boolean;
}

const TOUR_API = "/api/tour";

export async function startTour(options?: {
  theme?: string;
  voiceEnabled?: boolean;
}): Promise<TourResponse> {
  const res = await fetch(`${TOUR_API}/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      theme: options?.theme ?? "light",
      voice_enabled: options?.voiceEnabled ?? false,
    }),
  });
  if (!res.ok) throw new Error(`Tour start failed: ${String(res.status)}`);
  return res.json() as Promise<TourResponse>;
}

export async function sendTourCommand(
  sessionId: string,
  command: TourCommand,
  options?: { stepId?: string; route?: string },
): Promise<TourResponse> {
  const res = await fetch(`${TOUR_API}/${sessionId}/command`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      command,
      step_id: options?.stepId,
      route: options?.route,
    }),
  });
  if (!res.ok) throw new Error(`Tour command failed: ${String(res.status)}`);
  return res.json() as Promise<TourResponse>;
}

export async function endTour(
  sessionId: string,
  cancelled = false,
): Promise<TourResponse> {
  const res = await fetch(`${TOUR_API}/${sessionId}/end`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cancelled }),
  });
  if (!res.ok) throw new Error(`Tour end failed: ${String(res.status)}`);
  return res.json() as Promise<TourResponse>;
}

export async function getTourPreferences(): Promise<TourPreferences> {
  try {
    const res = await fetch(`${TOUR_API}/preferences`);
    if (!res.ok) {
      return { tour_completed: false };
    }
    return (await res.json()) as TourPreferences;
  } catch {
    return { tour_completed: false };
  }
}
