import { getDefaultClient, type ApiClient } from "@eaip/api";

// ---------------------------------------------------------------------------
// Types — derived from backend notifications_router.py
// ---------------------------------------------------------------------------

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

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  summary: string;
  severity: NotificationSeverity;
  category: NotificationCategory;
  createdAt: string;
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

export interface ListNotificationsResponse {
  notifications: Notification[];
  total: number;
  unreadCount: number;
  counts: NotificationCounts;
  categoryCounts: Record<string, number>;
  severityCounts: Record<string, number>;
}

export interface ListNotificationsOptions {
  unread?: boolean;
  severity?: NotificationSeverity;
  category?: NotificationCategory;
  search?: string;
  groupKey?: string;
  limit?: number;
  offset?: number;
}

export interface NotificationsClient {
  listNotifications(options?: ListNotificationsOptions): Promise<ListNotificationsResponse>;
  getNotification(notificationId: string): Promise<Notification>;
  getUnreadCount(): Promise<number>;
  getCounts(): Promise<NotificationCounts>;
  getCategoryCounts(): Promise<Record<string, number>>;
  getSeverityCounts(): Promise<Record<string, number>>;
  markAsRead(notificationId: string): Promise<void>;
  markReadBatch(ids: string[]): Promise<{ count: number }>;
  markAllAsRead(): Promise<{ count: number }>;
  acknowledge(notificationId: string): Promise<void>;
  dismiss(notificationId: string): Promise<void>;
  deleteNotification(notificationId: string): Promise<void>;
  createNotification(notification: {
    type: string;
    title: string;
    message: string;
    summary?: string;
    severity?: NotificationSeverity;
    category?: NotificationCategory;
    source?: string;
    deepLink?: string;
    relatedEntityId?: string;
    relatedEntityType?: string;
    groupKey?: string;
  }): Promise<Notification>;
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

export class ApiNotificationsClient implements NotificationsClient {
  private client: ApiClient;

  constructor(client?: ApiClient) {
    this.client = client ?? getDefaultClient();
  }

  async listNotifications(options?: ListNotificationsOptions): Promise<ListNotificationsResponse> {
    const params: Record<string, string> = {};
    if (options?.unread !== undefined) params.unread = String(options.unread);
    if (options?.severity !== undefined) params.severity = options.severity;
    if (options?.category !== undefined) params.category = options.category;
    if (options?.search !== undefined) params.search = options.search;
    if (options?.groupKey !== undefined) params.group_key = options.groupKey;
    if (options?.limit !== undefined) params.limit = String(options.limit);
    if (options?.offset !== undefined) params.offset = String(options.offset);

    const response = await this.client.get<ListNotificationsResponse>("/notifications", params);
    if (response.error) throw response.error;
    return response.data ?? {
      notifications: [],
      total: 0,
      unreadCount: 0,
      counts: { total: 0, unread: 0, acknowledged: 0, dismissed: 0 },
      categoryCounts: {},
      severityCounts: {},
    };
  }

  async getNotification(notificationId: string): Promise<Notification> {
    const response = await this.client.get<Notification>(`/notifications/${notificationId}`);
    if (response.error) throw response.error;
    if (!response.data) throw new Error("Notification not found");
    return response.data;
  }

  async getUnreadCount(): Promise<number> {
    const response = await this.client.get<{ count: number }>("/notifications/unread-count");
    if (response.error) throw response.error;
    return response.data?.count ?? 0;
  }

  async getCounts(): Promise<NotificationCounts> {
    const response = await this.client.get<NotificationCounts>("/notifications/counts");
    if (response.error) throw response.error;
    return response.data ?? { total: 0, unread: 0, acknowledged: 0, dismissed: 0 };
  }

  async getCategoryCounts(): Promise<Record<string, number>> {
    const response = await this.client.get<Record<string, number>>("/notifications/categories");
    if (response.error) throw response.error;
    return response.data ?? {};
  }

  async getSeverityCounts(): Promise<Record<string, number>> {
    const response = await this.client.get<Record<string, number>>("/notifications/severities");
    if (response.error) throw response.error;
    return response.data ?? {};
  }

  async markAsRead(notificationId: string): Promise<void> {
    const response = await this.client.post<Record<string, unknown>>(`/notifications/${notificationId}/read`, {});
    if (response.error) throw response.error;
  }

  async markReadBatch(ids: string[]): Promise<{ count: number }> {
    const response = await this.client.post<{ status: string; count: number }>("/notifications/read", { ids });
    if (response.error) throw response.error;
    return { count: response.data?.count ?? 0 };
  }

  async markAllAsRead(): Promise<{ count: number }> {
    const response = await this.client.post<{ status: string; count: number }>("/notifications/read-all", {});
    if (response.error) throw response.error;
    return { count: response.data?.count ?? 0 };
  }

  async acknowledge(notificationId: string): Promise<void> {
    const response = await this.client.post<Record<string, unknown>>(`/notifications/${notificationId}/acknowledge`, {});
    if (response.error) throw response.error;
  }

  async dismiss(notificationId: string): Promise<void> {
    const response = await this.client.post<Record<string, unknown>>(`/notifications/${notificationId}/dismiss`, {});
    if (response.error) throw response.error;
  }

  async deleteNotification(notificationId: string): Promise<void> {
    const response = await this.client.delete<Record<string, unknown>>(`/notifications/${notificationId}`);
    if (response.error) throw response.error;
  }

  async createNotification(notification: {
    type: string;
    title: string;
    message: string;
    summary?: string;
    severity?: NotificationSeverity;
    category?: NotificationCategory;
    source?: string;
    deepLink?: string;
    relatedEntityId?: string;
    relatedEntityType?: string;
    groupKey?: string;
  }): Promise<Notification> {
    const response = await this.client.post<Notification>("/notifications", notification);
    if (response.error) throw response.error;
    if (!response.data) throw new Error("Empty response on notification creation");
    return response.data;
  }
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function createNotificationsClient(client?: ApiClient): NotificationsClient {
  return new ApiNotificationsClient(client);
}
