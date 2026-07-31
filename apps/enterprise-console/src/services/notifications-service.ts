import { getDefaultClient } from "@eaip/api";
import type { ServiceResult } from "./service-result";
import { liveResult, fallbackResult, isNetworkError } from "./service-result";
import { createMockNotifications } from "../mock-data/data";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export async function fetchNotifications(): Promise<ServiceResult<NotificationItem[]>> {
  try {
    const client = getDefaultClient();
    const res = await client.get<NotificationItem[]>("/notifications");
    if (res.error) throw res.error;
    return liveResult(res.data ?? []);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(createMockNotifications(), "Backend unavailable, showing cached notifications");
    }
    throw err;
  }
}

export async function markNotificationRead(ids: string[]): Promise<ServiceResult<void>> {
  try {
    const client = getDefaultClient();
    const res = await client.post("/notifications/read", { ids });
    if (res.error) throw res.error;
    return liveResult(undefined);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(undefined, "Backend unavailable");
    }
    throw err;
  }
}

export async function markAllNotificationsRead(): Promise<ServiceResult<void>> {
  try {
    const client = getDefaultClient();
    const res = await client.post("/notifications/read-all", {});
    if (res.error) throw res.error;
    return liveResult(undefined);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(undefined, "Backend unavailable");
    }
    throw err;
  }
}
