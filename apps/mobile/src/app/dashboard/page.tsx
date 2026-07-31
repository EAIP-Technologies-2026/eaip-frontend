"use client";

import { useEffect, useState, useMemo, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RequireAuth, useAuth } from "@eaip/auth";
import { usePlatformStore } from "@eaip/state";
import { getDefaultClient } from "@eaip/api";
import { LoadingState, ErrorState, Card, CardHeader, CardContent } from "@eaip/ui-enterprise";
import { SectionTitle, EmptyState } from "@eaip/ui-primitives";
import {
  MetricCard,
  StatusWidget,
  Timeline,
  type TimelineItem,
} from "@eaip/ui-visualizations";
import { EnterpriseIcon } from "@eaip/icons";
import { createMemoryClient, type MemoryEntry } from "@eaip/memory";
import { useLocalStorage } from "@eaip/hooks";
import { logger } from "@eaip/logging";

interface ActivityEvent {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  status?: "idle" | "running" | "success" | "warning" | "error";
}

interface QuickAction {
  id: string;
  label: string;
  icon: ReactNode;
  href: string;
}

const defaultQuickActions: QuickAction[] = [
  { id: "memory", label: "View Memory", icon: <EnterpriseIcon name="brain" size={20} />, href: "/memory" },
  { id: "actions", label: "Run Action", icon: <EnterpriseIcon name="bolt" size={20} />, href: "/actions" },
];

function parseActivityEvents(data: unknown): ActivityEvent[] {
  if (!Array.isArray(data)) return [];
  return data.map((item, index) => ({
    id: (item as { id?: string }).id ?? String(index),
    title:
      (item as { title?: string }).title ??
      (item as { type?: string }).type ??
      "Activity",
    description:
      (item as { description?: string }).description ??
      (item as { message?: string }).message ??
      "",
    timestamp:
      (item as { timestamp?: string }).timestamp ??
      (item as { createdAt?: string }).createdAt ??
      new Date().toISOString(),
    status: ((item as { status?: string }).status ?? "idle") as TimelineItem["status"],
  }));
}

function getGreeting(name?: string): string {
  const hour = new Date().getHours();
  const greeting =
    hour >= 5 && hour < 12 ? "Good morning" :
    hour >= 12 && hour < 18 ? "Good afternoon" :
    "Good evening";
  return name ? `${greeting}, ${name}` : greeting;
}

function getWelcomeSubtitle(memoryCount: number, eventCount: number): string {
  if (memoryCount === 0 && eventCount === 0) {
    return "Access memory and quick actions on the go.";
  }
  if (eventCount > 0 && memoryCount > 0) {
    return `You have ${String(memoryCount)} memory entries and ${String(eventCount)} recent activities.`;
  }
  if (eventCount > 0) {
    return `You have ${String(eventCount)} recent activities. Keep up the momentum.`;
  }
    return `You have ${String(memoryCount)} memory entries stored. Ready to take action?`;
}

function DashboardContent() {
  const { user } = useAuth();
  const router = useRouter();
  const addToast = usePlatformStore((state) => state.addToast);
  const [memory, setMemory] = useState<MemoryEntry[]>([]);
  const [events, setEvents] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pinnedActionIds, setPinnedActionIds] = useLocalStorage<string[]>(
    "eaip-mobile-pinned-actions",
    [],
  );

  const memoryClient = useMemo(() => createMemoryClient(), []);
  const apiClient = useMemo(() => getDefaultClient(), []);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);
      setError(null);
      try {
        const [memoryData, eventsResponse] = await Promise.all([
          memoryClient.list(),
          apiClient.get<unknown>("/events/activity"),
        ]);
        if (cancelled) return;
        setMemory(memoryData);
        setEvents(parseActivityEvents(eventsResponse.data));
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        logger.error("Failed to load dashboard", { error: message });
        setError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadDashboard();
    return () => {
      cancelled = true;
    };
  }, [memoryClient, apiClient]);

  async function handleRunAction() {
    try {
      await memoryClient.set(
        `mobile-action-${String(Date.now())}`,
        { source: "mobile dashboard quick action", ranAt: new Date().toISOString() },
      );
      const entries = await memoryClient.list();
      setMemory(entries);
      addToast({ type: "success", title: "Action completed" });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("Failed to run action", { error: message });
      addToast({ type: "error", title: "Failed to run action", message });
    }
  }

  function togglePin(id: string) {
    const next = pinnedActionIds.includes(id)
      ? pinnedActionIds.filter((pinned) => pinned !== id)
      : [...pinnedActionIds, id];
    setPinnedActionIds(next);
  }

  const pinnedActions = useMemo(
    () => defaultQuickActions.filter((action) => pinnedActionIds.includes(action.id)),
    [pinnedActionIds],
  );

  const recentMemory = useMemo(() => memory.slice(0, 5), [memory]);

  const activityStatus: TimelineItem["status"] =
    events.length > 0 ? "running" : "idle";

  return (
    <div className="space-y-6 pb-safe">
      <section className="space-y-4">
        <Card padding="lg" className="card-hover-lift">
          <CardContent>
            <h1 className="text-lg font-semibold text-text">
              {getGreeting(user?.name)}
            </h1>
            <p className="text-sm text-text-secondary">
              {getWelcomeSubtitle(memory.length, events.length)}
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          <MetricCard
            label="Memory Entries"
            value={memory.length}
            icon={<EnterpriseIcon name="brain" size={20} />}
          />
          <MetricCard
            label="Recent Activity"
            value={events.length}
            icon={<EnterpriseIcon name="activity" size={20} />}
          />
        </div>

        <StatusWidget
          title="Activity Status"
          status={activityStatus}
          value={activityStatus === "running" ? "Active" : "Idle"}
          subtitle={`${String(memory.length)} memory entries stored`}
        />
      </section>

      <section className="space-y-4">
        <hr className="border-0 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />
        <Card className="card-hover-lift">
          <CardHeader>
            <SectionTitle>Quick Actions</SectionTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {defaultQuickActions.map((action) => (
                <div
                  key={action.id}
                  className="surface-card flex items-center justify-between p-4"
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (action.id === "actions") {
                        void handleRunAction();
                      } else {
                        router.push(action.href);
                      }
                    }}
                    className="flex flex-1 items-center gap-3 text-left"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-subtle text-primary">
                      {action.icon}
                    </div>
                    <span className="font-medium text-text">{action.label}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      togglePin(action.id);
                    }}
                    className="text-text-secondary hover:text-primary"
                    aria-label={
                      pinnedActionIds.includes(action.id)
                        ? "Unpin action"
                        : "Pin action"
                    }
                  >
                    <EnterpriseIcon
                      name={
                        pinnedActionIds.includes(action.id) ? "check" : "plus"
                      }
                      size={18}
                    />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {pinnedActions.length > 0 && (
        <section className="space-y-4">
          <hr className="border-0 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />
          <Card className="card-hover-lift">
            <CardHeader>
              <SectionTitle>Pinned Actions</SectionTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {pinnedActions.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => {
                      if (action.id === "actions") {
                        void handleRunAction();
                      } else {
                        router.push(action.href);
                      }
                    }}
                    className="surface-card flex items-center gap-3 p-4 text-left"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-subtle text-primary">
                      {action.icon}
                    </div>
                    <span className="font-medium text-text">{action.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      <section className="space-y-4">
        <hr className="border-0 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />
        <Card className="card-hover-lift">
          <CardHeader>
            <SectionTitle>Recent Memory</SectionTitle>
            <Link
              href="/memory"
              className="text-sm text-primary hover:underline"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <LoadingState message="Loading memory..." />
            ) : error ? (
              <ErrorState
                message={error}
                onRetry={() => {
                  window.location.reload();
                }}
              />
            ) : recentMemory.length === 0 ? (
              <EmptyState
                icon="brain"
                title="No memory entries"
                description="Memory entries will appear here."
              />
            ) : (
              <div className="divide-y divide-border">
                {recentMemory.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between py-3"
                  >
                    <div>
                      <p className="font-medium text-text">{entry.key}</p>
                      <p className="text-xs text-text-secondary">
                        {entry.timestamp}
                      </p>
                    </div>
                    <EnterpriseIcon
                      name="chevronRight"
                      size={16}
                      className="text-text-muted"
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <hr className="border-0 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />
        <Card className="card-hover-lift">
          <CardHeader>
            <SectionTitle>Activity Feed</SectionTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <LoadingState message="Loading activity..." />
            ) : events.length === 0 ? (
              <EmptyState
                icon="activity"
                title="No recent activity"
                description="Activity events will appear here."
              />
            ) : (
              <Timeline items={events.slice(0, 6)} />
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardContent />
    </RequireAuth>
  );
}
