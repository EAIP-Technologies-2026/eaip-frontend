import { getDefaultClient } from "@eaip/api";
import type { ServiceResult } from "./service-result";
import { liveResult, fallbackResult, isNetworkError } from "./service-result";
import { createMockNotifications } from "../mock-data/data";

export type NotificationSeverity = "info" | "success" | "warning" | "error" | "critical";

export type NotificationCategory =
  | "system"
  | "security"
  | "operations"
  | "approvals"
  | "automation"
  | "workflow"
  | "deployment"
  | "knowledge"
  | "conductor";

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  summary: string;
  severity: NotificationSeverity;
  category: NotificationCategory;
  timestamp: string;
  read: boolean;
  acknowledged: boolean;
  dismissed: boolean;
  source: string;
  deepLink: string | null;
  relatedEntityId: string | null;
  relatedEntityType: string | null;
  groupKey: string | null;
}

export interface NotificationCounts {
  total: number;
  unread: number;
  acknowledged: number;
  dismissed: number;
}

export interface FetchNotificationsOptions {
  unread?: boolean;
  severity?: NotificationSeverity;
  category?: NotificationCategory;
  search?: string;
  groupKey?: string;
  limit?: number;
  offset?: number;
}

export interface FetchNotificationsResult {
  notifications: NotificationItem[];
  total: number;
  unreadCount: number;
  counts: NotificationCounts;
  categoryCounts: Record<string, number>;
  severityCounts: Record<string, number>;
}

export async function fetchNotifications(
  options?: FetchNotificationsOptions
): Promise<ServiceResult<FetchNotificationsResult>> {
  try {
    const client = getDefaultClient();
    const params: Record<string, string> = {};
    if (options?.unread !== undefined) params.unread = String(options.unread);
    if (options?.severity !== undefined) params.severity = options.severity;
    if (options?.category !== undefined) params.category = options.category;
    if (options?.search !== undefined && options.search !== "") params.search = options.search;
    if (options?.groupKey !== undefined) params.group_key = options.groupKey;
    if (options?.limit !== undefined) params.limit = String(options.limit);
    if (options?.offset !== undefined) params.offset = String(options.offset);

    const res = await client.get<{
      notifications?: NotificationItem[];
      total?: number;
      unreadCount?: number;
      counts?: NotificationCounts;
      categoryCounts?: Record<string, number>;
      severityCounts?: Record<string, number>;
    }>("/notifications", params);
    if (res.error) throw res.error;
    const items = Array.isArray(res.data)
      ? res.data
      : (Array.isArray(res.data?.notifications) ? res.data.notifications : []);
    return liveResult({
      notifications: items,
      total: res.data?.total ?? items.length,
      unreadCount: res.data?.unreadCount ?? 0,
      counts: res.data?.counts ?? { total: 0, unread: 0, acknowledged: 0, dismissed: 0 },
      categoryCounts: res.data?.categoryCounts ?? {},
      severityCounts: res.data?.severityCounts ?? {},
    });
  } catch (err) {
    if (isNetworkError(err)) {
      const mockData = createMockNotifications();
      const mockItems = mockData.map((n) => ({
        id: n.id,
        type: "system",
        title: n.title,
        message: n.message,
        summary: n.message,
        severity: "info" as NotificationSeverity,
        category: "system" as NotificationCategory,
        timestamp: n.timestamp,
        read: n.read,
        acknowledged: false,
        dismissed: false,
        source: "mock",
        deepLink: null,
        relatedEntityId: null,
        relatedEntityType: null,
        groupKey: null,
      }));
      return fallbackResult(
        {
          notifications: mockItems,
          total: mockItems.length,
          unreadCount: mockItems.filter((n) => !n.read).length,
          counts: { total: mockItems.length, unread: mockItems.filter((n) => !n.read).length, acknowledged: 0, dismissed: 0 },
          categoryCounts: {},
          severityCounts: {},
        },
        "Backend unavailable, showing cached notifications"
      );
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

export async function acknowledgeNotification(id: string): Promise<ServiceResult<void>> {
  try {
    const client = getDefaultClient();
    const res = await client.post(`/notifications/${id}/acknowledge`, {});
    if (res.error) throw res.error;
    return liveResult(undefined);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(undefined, "Backend unavailable");
    }
    throw err;
  }
}

export async function dismissNotification(id: string): Promise<ServiceResult<void>> {
  try {
    const client = getDefaultClient();
    const res = await client.post(`/notifications/${id}/dismiss`, {});
    if (res.error) throw res.error;
    return liveResult(undefined);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(undefined, "Backend unavailable");
    }
    throw err;
  }
}
