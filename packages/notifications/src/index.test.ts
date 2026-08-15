import { describe, it, expect } from "vitest";
import { ApiNotificationsClient } from "./index";
import type { Notification, NotificationSeverity, NotificationCategory } from "./index";

describe("notifications", () => {
  it("package loads without error", () => {
    expect(typeof ApiNotificationsClient).toBe("function");
  });

  it("ApiNotificationsClient can be instantiated with a mock client", () => {
    const mockClient = {
      get: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
      post: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
      put: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
      delete: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
      patch: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
    };
    // @ts-expect-error — partial mock for unit testing
    const client = new ApiNotificationsClient(mockClient);
    expect(client).toBeDefined();
  });

  it("Notification type has all required fields", () => {
    const notification: Notification = {
      id: "n1",
      type: "system",
      title: "Test",
      message: "Message",
      summary: "Summary",
      severity: "info",
      category: "system",
      createdAt: new Date().toISOString(),
      read: false,
      acknowledged: false,
      dismissed: false,
      source: "test",
      deepLink: "/dashboard",
      relatedEntityId: null,
      relatedEntityType: null,
      groupKey: null,
    };
    expect(notification.id).toBe("n1");
    expect(notification.severity).toBe("info");
    expect(notification.category).toBe("system");
    expect(notification.acknowledged).toBe(false);
    expect(notification.dismissed).toBe(false);
    expect(notification.deepLink).toBe("/dashboard");
  });

  it("NotificationSeverity includes all expected values", () => {
    const severities: NotificationSeverity[] = ["info", "success", "warning", "error", "critical"];
    expect(severities).toHaveLength(5);
  });

  it("NotificationCategory includes all expected values", () => {
    const categories: NotificationCategory[] = [
      "system",
      "security",
      "operations",
      "approvals",
      "automation",
      "workflow",
      "deployment",
      "knowledge",
      "conductor",
    ];
    expect(categories).toHaveLength(9);
  });

  it("listNotifications passes filter options correctly", async () => {
    let capturedParams: Record<string, string> = {};
    const mockClient = {
      get: (_path: string, params?: Record<string, string>) => {
        capturedParams = params ?? {};
        return Promise.resolve({
          data: { notifications: [], total: 0, unreadCount: 0, counts: { total: 0, unread: 0, acknowledged: 0, dismissed: 0 }, categoryCounts: {}, severityCounts: {} },
          error: null,
          status: 200,
          headers: new Headers(),
        });
      },
      post: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
      put: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
      delete: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
      patch: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
    };
    // @ts-expect-error — partial mock for unit testing
    const client = new ApiNotificationsClient(mockClient);
    await client.listNotifications({
      unread: true,
      severity: "error",
      category: "security",
      search: "alert",
      limit: 10,
      offset: 0,
    });
    expect(capturedParams.unread).toBe("true");
    expect(capturedParams.severity).toBe("error");
    expect(capturedParams.category).toBe("security");
    expect(capturedParams.search).toBe("alert");
    expect(capturedParams.limit).toBe("10");
  });

  it("getCounts returns notification counts", async () => {
    const mockClient = {
      get: () => Promise.resolve({
        data: { total: 10, unread: 3, acknowledged: 5, dismissed: 2 },
        error: null,
        status: 200,
        headers: new Headers(),
      }),
      post: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
      put: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
      delete: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
      patch: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
    };
    // @ts-expect-error — partial mock for unit testing
    const client = new ApiNotificationsClient(mockClient);
    const counts = await client.getCounts();
    expect(counts.total).toBe(10);
    expect(counts.unread).toBe(3);
    expect(counts.acknowledged).toBe(5);
    expect(counts.dismissed).toBe(2);
  });

  it("acknowledge sends POST to correct endpoint", async () => {
    let capturedPath = "";
    const mockClient = {
      get: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
      post: (path: string) => {
        capturedPath = path;
        return Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() });
      },
      put: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
      delete: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
      patch: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
    };
    // @ts-expect-error — partial mock for unit testing
    const client = new ApiNotificationsClient(mockClient);
    await client.acknowledge("n1");
    expect(capturedPath).toBe("/notifications/n1/acknowledge");
  });

  it("dismiss sends POST to correct endpoint", async () => {
    let capturedPath = "";
    const mockClient = {
      get: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
      post: (path: string) => {
        capturedPath = path;
        return Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() });
      },
      put: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
      delete: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
      patch: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
    };
    // @ts-expect-error — partial mock for unit testing
    const client = new ApiNotificationsClient(mockClient);
    await client.dismiss("n1");
    expect(capturedPath).toBe("/notifications/n1/dismiss");
  });

  it("createNotification sends all new fields", async () => {
    let capturedBody: Record<string, unknown> = {};
    const mockClient = {
      get: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
      post: (_path: string, body?: Record<string, unknown>) => {
        capturedBody = body ?? {};
        return Promise.resolve({
          data: { id: "n1", ...body },
          error: null,
          status: 200,
          headers: new Headers(),
        });
      },
      put: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
      delete: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
      patch: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
    };
    // @ts-expect-error — partial mock for unit testing
    const client = new ApiNotificationsClient(mockClient);
    await client.createNotification({
      type: "alert",
      title: "Test",
      message: "Message",
      summary: "Summary",
      severity: "warning",
      category: "deployment",
      source: "deploy-service",
      deepLink: "/deployments/1",
      relatedEntityId: "deploy-1",
      relatedEntityType: "deployment",
      groupKey: "deploy-group",
    });
    expect(capturedBody.severity).toBe("warning");
    expect(capturedBody.category).toBe("deployment");
    expect(capturedBody.source).toBe("deploy-service");
    expect(capturedBody.deepLink).toBe("/deployments/1");
    expect(capturedBody.groupKey).toBe("deploy-group");
  });
});
