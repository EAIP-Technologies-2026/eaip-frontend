"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { RequireAuth } from "@eaip/auth";
import { EnterpriseShell, LoadingState, ErrorState } from "@eaip/ui-enterprise";
import { Card, CardContent } from "@eaip/ui-foundation";
import { Badge, EmptyState } from "@eaip/ui-primitives";
import { MetricCard } from "@eaip/ui-visualizations";
import { EnterpriseIcon } from "@eaip/icons";
import { fetchQueue } from "../../services/queue-service";
import type { QueueItem } from "../../services/queue-service";
import { OperationsToolbar } from "../../components/operations-toolbar";

const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };

function QueueContent() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchQueue();
      setItems(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load queue");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((i) => i.status === filter);
  }, [items, filter]);

  const sorted = useMemo(() => [...filtered].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]), [filtered]);

  const stats = useMemo(() => ({
    pending: items.filter((i) => i.status === "pending").length,
    running: items.filter((i) => i.status === "running").length,
    completed: items.filter((i) => i.status === "completed").length,
    failed: items.filter((i) => i.status === "failed").length,
    total: items.length,
  }), [items]);

  return (
    <EnterpriseShell
      appId="mission-control"
      pageTitle="Queue Monitor"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Queue" }]}
    >
      <div className="space-y-8">
        <section className="surface-hero relative overflow-hidden p-8 lg:p-10">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br from-primary-subtle/50 to-transparent blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-gradient-to-tr from-accent-glow/30 to-transparent blur-2xl" aria-hidden="true" />
          <div className="relative">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-primary uppercase mb-4">
              <EnterpriseIcon name="activity" size={14} />
              Queue Monitor
            </div>
            <h1 className="text-3xl font-bold text-text tracking-tight">Queue Monitor</h1>
            <p className="mt-3 text-base text-text-secondary max-w-2xl leading-relaxed">Track pending, running, and completed jobs across your operational queue.</p>
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <MetricCard label="Total" value={stats.total} icon="list" />
          <MetricCard label="Pending" value={stats.pending} icon="clock" />
          <MetricCard label="Running" value={stats.running} icon="play" />
          <MetricCard label="Completed" value={stats.completed} icon="check" />
          <MetricCard label="Failed" value={stats.failed} icon="alert" />
        </div>

        <OperationsToolbar onRefresh={() => { void load(); }} />

        <div className="flex gap-1 rounded-lg border border-border p-0.5 w-fit">
          {["all", "pending", "running", "completed", "failed"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => { setFilter(s); }}
              className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                filter === s ? "bg-primary text-text-inverse" : "text-text-secondary hover:bg-surface-tertiary"
              }`}
            >
              {s} {s === "all" ? `(${String(stats.total)})` : `(${String(stats[s as keyof typeof stats])})`}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingState message="Loading queue..." />
        ) : error ? (
          <ErrorState message={error} onRetry={() => { void load(); }} />
        ) : sorted.length === 0 ? (
          <Card><CardContent><EmptyState icon="inbox" title="Queue is empty" description="No items in the queue." /></CardContent></Card>
        ) : (
          <Card>
            <CardContent>
              <div className="divide-y divide-border">
                {sorted.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`h-2 w-2 shrink-0 rounded-full ${
                        item.status === "running" ? "bg-primary animate-pulse" :
                        item.status === "completed" ? "bg-success" :
                        item.status === "failed" ? "bg-danger" :
                        "bg-text-muted"
                      }`} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-text truncate">{item.name}</span>
                          <Badge variant={
                            item.priority === "critical" ? "danger" :
                            item.priority === "high" ? "warning" :
                            "default"
                          }>{item.priority}</Badge>
                          <Badge variant={
                            item.status === "running" ? "primary" :
                            item.status === "completed" ? "success" :
                            item.status === "failed" ? "danger" :
                            "default"
                          }>{item.status}</Badge>
                        </div>
                        <p className="text-xs text-text-secondary mt-0.5">
                          {item.type} · Queued: {new Date(item.enqueuedAt).toLocaleString()}
                          {item.retryCount > 0 ? ` · Retries: ${String(item.retryCount)}` : ""}
                          {item.duration ? ` · Duration: ${String(item.duration)}ms` : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </EnterpriseShell>
  );
}

export default function QueuePage() {
  return <RequireAuth><QueueContent /></RequireAuth>;
}
