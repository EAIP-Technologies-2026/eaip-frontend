"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { RequireAuth } from "@eaip/auth";
import { usePlatformStore } from "@eaip/state";
import { EnterpriseShell, NotificationCenter } from "@eaip/ui-enterprise";
import type { CenterNotificationItem, NotificationFilter as NFilter, NotificationSeverity, NotificationCategory } from "@eaip/ui-enterprise";
import { useRouter } from "next/navigation";
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  acknowledgeNotification,
  dismissNotification,
} from "../../services/notifications-service";
import type { NotificationItem, NotificationCounts } from "../../services/notifications-service";
import { useFallback } from "../../services/fallback-context";

function NotificationsContent() {
  const router = useRouter();
  const storeNotifications = usePlatformStore((state) => state.notifications);
  const [apiResult, setApiResult] = useState<{
    notifications: NotificationItem[];
    counts: NotificationCounts;
    categoryCounts: Record<string, number>;
    severityCounts: Record<string, number>;
  }>({
    notifications: [],
    counts: { total: 0, unread: 0, acknowledged: 0, dismissed: 0 },
    categoryCounts: {},
    severityCounts: {},
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<NFilter>("all");
  const [selectedCategory, setSelectedCategory] = useState<NotificationCategory | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<NotificationSeverity | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { setFallback } = useFallback();

  const loadData = useCallback(async (options?: {
    unread?: boolean;
    severity?: NotificationSeverity;
    category?: NotificationCategory;
    search?: string;
  }) => {
    try {
      const result = await fetchNotifications(options);
      if (result.source === "fallback") {
        setFallback("notifications", true);
      }
      setApiResult({
        notifications: result.data.notifications,
        counts: result.data.counts,
        categoryCounts: result.data.categoryCounts,
        severityCounts: result.data.severityCounts,
      });
    } catch {
      setApiResult({
        notifications: [],
        counts: { total: 0, unread: 0, acknowledged: 0, dismissed: 0 },
        categoryCounts: {},
        severityCounts: {},
      });
    } finally {
      setLoading(false);
    }
  }, [setFallback]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const allNotifications = useMemo(() => {
    const combined: CenterNotificationItem[] = apiResult.notifications.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      summary: n.summary,
      severity: n.severity,
      category: n.category,
      timestamp: n.timestamp,
      read: n.read,
      acknowledged: n.acknowledged,
      dismissed: n.dismissed,
      source: n.source,
      deepLink: n.deepLink,
      relatedEntityId: n.relatedEntityId,
      relatedEntityType: n.relatedEntityType,
      groupKey: n.groupKey,
    }));

    for (const n of storeNotifications) {
      if (!combined.some((c) => c.id === n.id)) {
        combined.push({
          id: n.id,
          type: "system",
          title: n.title,
          message: n.message,
          summary: n.summary ?? n.message,
          severity: n.severity ?? "info",
          category: n.category ?? "system",
          timestamp: n.timestamp,
          read: n.read,
          acknowledged: n.acknowledged ?? false,
          dismissed: n.dismissed ?? false,
          source: n.source ?? "store",
          deepLink: n.deepLink ?? null,
          relatedEntityId: n.relatedEntityId ?? null,
          relatedEntityType: n.relatedEntityType ?? null,
          groupKey: n.groupKey ?? null,
        });
      }
    }

    return combined.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [apiResult.notifications, storeNotifications]);

  const counts: NotificationCounts = useMemo(() => {
    const total = allNotifications.length;
    const unread = allNotifications.filter((n) => !n.read && !n.dismissed).length;
    const acknowledged = allNotifications.filter((n) => n.acknowledged).length;
    const dismissed = allNotifications.filter((n) => n.dismissed).length;
    return { total, unread, acknowledged, dismissed };
  }, [allNotifications]);

  async function handleMarkAllRead() {
    try {
      await markAllNotificationsRead();
    } catch {
      // still update locally
    }
    const store = usePlatformStore.getState();
    for (const n of allNotifications.filter((x) => !x.read)) {
      store.markNotificationRead(n.id);
    }
    setApiResult((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    }));
  }

  async function handleMarkRead(id: string) {
    try {
      await markNotificationRead([id]);
    } catch {
      // still update locally
    }
    const store = usePlatformStore.getState();
    if (store) store.markNotificationRead(id);
    setApiResult((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  }

  async function handleAcknowledge(id: string) {
    try {
      await acknowledgeNotification(id);
    } catch {
      // still update locally
    }
    const store = usePlatformStore.getState();
    if (store) store.acknowledgeNotification(id);
    setApiResult((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) =>
        n.id === id ? { ...n, acknowledged: true, read: true } : n
      ),
    }));
  }

  async function handleDismiss(id: string) {
    try {
      await dismissNotification(id);
    } catch {
      // still update locally
    }
    const store = usePlatformStore.getState();
    if (store) store.dismissNotification(id);
    setApiResult((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) =>
        n.id === id ? { ...n, dismissed: true } : n
      ),
    }));
  }

  async function handleRemove(id: string) {
    const store = usePlatformStore.getState();
    store.removeNotification(id);
    setApiResult((prev) => ({
      ...prev,
      notifications: prev.notifications.filter((n) => n.id !== id),
    }));
  }

  function handleNavigate(deepLink: string) {
    router.push(deepLink);
  }

  function handleFilterChange(newFilter: NFilter) {
    setFilter(newFilter);
    const options: Parameters<typeof loadData>[0] = {};
    if (newFilter === "unread") options.unread = true;
    if (selectedSeverity) options.severity = selectedSeverity;
    if (selectedCategory) options.category = selectedCategory;
    if (searchQuery) options.search = searchQuery;
    void loadData(options);
  }

  function handleCategoryChange(category: NotificationCategory | null) {
    setSelectedCategory(category);
    const options: Parameters<typeof loadData>[0] = {};
    if (filter === "unread") options.unread = true;
    if (selectedSeverity) options.severity = selectedSeverity;
    if (category) options.category = category;
    if (searchQuery) options.search = searchQuery;
    void loadData(options);
  }

  function handleSeverityChange(severity: NotificationSeverity | null) {
    setSelectedSeverity(severity);
    const options: Parameters<typeof loadData>[0] = {};
    if (filter === "unread") options.unread = true;
    if (severity) options.severity = severity;
    if (selectedCategory) options.category = selectedCategory;
    if (searchQuery) options.search = searchQuery;
    void loadData(options);
  }

  function handleSearchChange(query: string) {
    setSearchQuery(query);
    const options: Parameters<typeof loadData>[0] = {};
    if (filter === "unread") options.unread = true;
    if (selectedSeverity) options.severity = selectedSeverity;
    if (selectedCategory) options.category = selectedCategory;
    if (query) options.search = query;
    void loadData(options);
  }

  return (
    <EnterpriseShell
      appId="enterprise-console"
      pageTitle="Notifications"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Notifications" }]}
    >
      <div className="rounded-card border border-border bg-surface shadow-elevated overflow-hidden" style={{ minHeight: "70vh" }}>
        <NotificationCenter
          items={allNotifications}
          counts={counts}
          categoryCounts={apiResult.categoryCounts}
          severityCounts={apiResult.severityCounts}
          loading={loading}
          onMarkRead={handleMarkRead}
          onMarkAllRead={handleMarkAllRead}
          onAcknowledge={handleAcknowledge}
          onDismiss={handleDismiss}
          onRemove={handleRemove}
          onNavigate={handleNavigate}
          onFilterChange={handleFilterChange}
          onCategoryChange={handleCategoryChange}
          onSeverityChange={handleSeverityChange}
          onSearchChange={handleSearchChange}
        />
      </div>
    </EnterpriseShell>
  );
}

export default function NotificationsPage() {
  return (
    <RequireAuth>
      <NotificationsContent />
    </RequireAuth>
  );
}
