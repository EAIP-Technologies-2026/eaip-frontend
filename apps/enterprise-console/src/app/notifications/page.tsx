"use client";

/* eslint-disable @typescript-eslint/no-unnecessary-condition, @typescript-eslint/no-non-null-assertion, @typescript-eslint/require-await, @typescript-eslint/no-misused-promises */

import { useState, useMemo, useEffect } from "react";
import { RequireAuth } from "@eaip/auth";
import { usePlatformStore } from "@eaip/state";
import { EnterpriseShell } from "@eaip/ui-enterprise";
import { Card, CardHeader, CardContent } from "@eaip/ui-foundation";
import { Badge, Button, EmptyState, SectionTitle } from "@eaip/ui-primitives";
import { EnterpriseIcon } from "@eaip/icons";
import { useRouter } from "next/navigation";
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../../services/notifications-service";
import type { NotificationItem } from "../../services/notifications-service";
import { useFallback } from "../../services/fallback-context";

function NotificationsContent() {
  const router = useRouter();
  const storeNotifications = usePlatformStore((state) => state.notifications);
  const [apiNotifications, setApiNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const { setFallback } = useFallback();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const result = await fetchNotifications();
        if (!cancelled) {
          setFallback("notifications", result.source === "fallback");
          setApiNotifications(result.data);
        }
      } catch {
        if (!cancelled) setApiNotifications([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [setFallback]);

  const allNotifications = useMemo(() => {
    const combined = [...apiNotifications];
    for (const n of storeNotifications) {
      if (!combined.some((c) => c.id === n.id)) {
        combined.push({ id: n.id, title: n.title, message: n.message ?? "", timestamp: n.timestamp, read: n.read });
      }
    }
    return combined.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [apiNotifications, storeNotifications]);

  const displayed = filter === "all" ? allNotifications : allNotifications.filter((n) => !n.read);
  const unreadCount = allNotifications.filter((n) => !n.read).length;

  const grouped = useMemo(() => {
    const groups: Record<string, NotificationItem[]> = {};
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const thisWeek = new Date(today);
    thisWeek.setDate(thisWeek.getDate() - 7);

    for (const n of displayed) {
      const date = new Date(n.timestamp);
      let key = "Earlier";
      if (date.toDateString() === today.toDateString()) key = "Today";
      else if (date.toDateString() === yesterday.toDateString()) key = "Yesterday";
      else if (date >= thisWeek) key = "This Week";
      else if (date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()) key = "This Month";
      groups[key] ??= [];
      groups[key]!.push(n);
    }
    return groups;
  }, [displayed]);

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
    setApiNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  async function handleMarkRead(id: string) {
    try {
      await markNotificationRead([id]);
    } catch {
      // still update locally
    }
    const store = usePlatformStore.getState();
    if (store) store.markNotificationRead(id);
    setApiNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  }

  async function removeNotification(id: string) {
    const store = usePlatformStore.getState();
    store.removeNotification(id);
    setApiNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  return (
    <EnterpriseShell
      appId="enterprise-console"
      pageTitle="Notifications"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Notifications" }]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-surface p-0.5">
            <button
              type="button"
              onClick={() => { setFilter("all"); }}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === "all" ? "bg-primary text-text-inverse" : "text-text-secondary hover:bg-surface-tertiary"
              }`}
            >
              All ({allNotifications.length})
            </button>
            <button
              type="button"
              onClick={() => { setFilter("unread"); }}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === "unread" ? "bg-primary text-text-inverse" : "text-text-secondary hover:bg-surface-tertiary"
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 ? (
              <span className="text-xs text-text-secondary">{unreadCount} unread</span>
            ) : null}
            <Button variant="secondary" size="sm" onClick={handleMarkAllRead}>
              Mark All Read
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="skeleton h-20 rounded-card" />
            ))}
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <Card>
            <CardContent>
              <EmptyState
                icon="bell"
                title="All caught up!"
                description={filter === "unread" ? "No unread notifications." : "No notifications yet."}
                action={
                  filter === "unread" ? (
                    <Button variant="secondary" size="sm" onClick={() => { setFilter("all"); }}>Show All</Button>
                  ) : (
                    <Button variant="secondary" iconLeft="robot" size="sm" onClick={() => { router.push("/agents"); }}>Browse Agents</Button>
                  )
                }
              />
            </CardContent>
          </Card>
        ) : (
          Object.entries(grouped).map(([groupLabel, items]) => (
            <Card key={groupLabel}>
              <CardHeader>
                <SectionTitle>{groupLabel}</SectionTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y divide-border">
                  {items.map((n) => (
                    <div
                      key={n.id}
                      className={`flex items-start gap-3 py-3 first:pt-0 last:pb-0 ${
                        !n.read ? "bg-primary/[0.02]" : ""
                      }`}
                    >
                      <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                        n.read ? "bg-transparent" : "bg-primary"
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm ${n.read ? "text-text-secondary" : "font-medium text-text"}`}>
                            {n.title}
                          </p>
                          {!n.read && (
                            <Badge variant="primary">New</Badge>
                          )}
                        </div>
                        {n.message ? (
                          <p className="mt-0.5 text-xs text-text-secondary line-clamp-2">{n.message}</p>
                        ) : null}
                        <p className="mt-1 text-[10px] text-text-muted">
                          {new Date(n.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {!n.read ? (
                          <button
                            type="button"
                            onClick={() => handleMarkRead(n.id)}
                            className="rounded p-1 text-text-secondary hover:bg-surface-tertiary"
                            title="Mark as read"
                          >
                            <EnterpriseIcon name="check" size={14} />
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => removeNotification(n.id)}
                          className="rounded p-1 text-text-secondary hover:bg-surface-tertiary hover:text-danger"
                          title="Remove"
                        >
                          <EnterpriseIcon name="x" size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
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
