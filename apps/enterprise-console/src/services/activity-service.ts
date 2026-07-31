import { getDefaultClient } from "@eaip/api";
import type { ServiceResult } from "./service-result";
import { liveResult, fallbackResult, isNetworkError } from "./service-result";
import { createMockActivityFeed } from "../mock-data/data";

export interface ActivityItem {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  type: string;
  actor?: string;
}

export async function fetchActivityFeed(): Promise<ServiceResult<ActivityItem[]>> {
  try {
    const client = getDefaultClient();
    const res = await client.get<ActivityItem[]>("/activity");
    if (res.error) throw res.error;
    return liveResult(res.data ?? []);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(
        createMockActivityFeed().map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          timestamp: item.timestamp,
          type: item.type ?? "info",
          actor: item.actor,
        })),
        "Backend unavailable, showing cached activity",
      );
    }
    throw err;
  }
}
