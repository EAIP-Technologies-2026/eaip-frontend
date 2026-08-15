"use client";

/* eslint-disable @typescript-eslint/require-await, @typescript-eslint/no-misused-promises */

import { useEffect, useState, useMemo } from "react";
import { RequireAuth } from "@eaip/auth";
import { EnterpriseShell, ErrorState } from "@eaip/ui-enterprise";
import { Card, CardHeader, CardContent } from "@eaip/ui-foundation";
import { Badge, SectionTitle, Button, EmptyState } from "@eaip/ui-primitives";
import { EnterpriseIcon } from "@eaip/icons";
import { MetricCard, PieChartWidget, Timeline } from "@eaip/ui-visualizations";
import { usePlatformStore } from "@eaip/state";
import { fetchMonitoringEvents } from "../../services/monitoring-service";
import type { MonitoringEvent } from "../../services/monitoring-service";
import { useFallback } from "../../services/fallback-context";

function MonitoringContent() {
  const addToast = usePlatformStore((state) => state.addToast);
  const { setFallback } = useFallback();
  const [events, setEvents] = useState<MonitoringEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchMonitoringEvents();
        if (cancelled) return;
        setFallback("monitoring", result.source === "fallback");
        setEvents(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load monitoring data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [setFallback]);

  const filtered = useMemo(() => {
    let result = events;
    if (filter !== "all") result = result.filter((e) => e.severity === filter);
    if (sourceFilter !== "all") result = result.filter((e) => e.source === sourceFilter);
    return result;
  }, [events, filter, sourceFilter]);

  const sources = useMemo(() => Array.from(new Set(events.map((e) => e.source))), [events]);
  const severityCounts = useMemo(() => {
    const counts = { info: 0, warning: 0, error: 0, critical: 0 };
    for (const e of events) counts[e.severity]++;
    return counts;
  }, [events]);

  const unacknowledged = events.filter((e) => !e.acknowledged).length;

  async function acknowledgeAll() {
    try {
      setEvents((prev) => prev.map((e) => ({ ...e, acknowledged: true })));
      addToast({ type: "info", title: "All events acknowledged (local only)", message: "Changes will not persist on refresh — no backend endpoint available." });
    } catch {
      addToast({ type: "error", title: "Failed to acknowledge events" });
    }
  }

  const timelineData = useMemo(
    () => filtered.slice(0, 30).map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      timestamp: e.timestamp,
      status: (e.severity === "critical" || e.severity === "error" ? "error" as const : e.severity === "warning" ? "warning" as const : "success" as const),
    })),
    [filtered],
  );

  return (
    <EnterpriseShell
      appId="enterprise-console"
      pageTitle="Monitoring"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Monitoring" }]}
    >
      <div className="space-y-8">
        <section data-tour="monitoring" className="surface-hero relative overflow-hidden p-8 lg:p-10">
          <div className="relative">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-primary uppercase mb-4">
              <EnterpriseIcon name="activity" size={14} />
              Event Monitor
            </div>
            <h1 className="text-3xl font-bold text-text tracking-tight">Monitoring</h1>
            <p className="mt-3 text-base text-text-secondary max-w-2xl leading-relaxed">Track operational events, alerts, and system telemetry across your platform.</p>
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Total Events" value={loading ? "—" : events.length} icon="activity" />
          <MetricCard label="Unacknowledged" value={loading ? "—" : unacknowledged} icon="alert" />
          <MetricCard label="Critical" value={loading ? "—" : severityCounts.critical} icon="alert" />
          <MetricCard label="Warnings" value={loading ? "—" : severityCounts.warning} icon="alert" />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card variant="elevated" padding="none" className="lg:col-span-2">
            <CardHeader className="px-5 py-4">
              <SectionTitle>Event Timeline</SectionTitle>
            </CardHeader>
            <CardContent className="px-5 py-4">
              {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="skeleton-card h-10" style={{ animationDelay: String(i * 80) + "ms" }} />
                ))}
              </div>
              ) : timelineData.length === 0 ? (
                <EmptyState
                  icon="activity"
                  title="No events"
                  description="No monitoring events match your filters."
                  action={
                    <Button variant="secondary" size="sm" onClick={() => { setFilter("all"); setSourceFilter("all"); }}>Clear Filters</Button>
                  }
                />
              ) : (
                <Timeline items={timelineData} />
              )}
            </CardContent>
          </Card>

          <Card variant="elevated" padding="none">
            <CardHeader className="px-5 py-4">
              <SectionTitle>Severity Distribution</SectionTitle>
            </CardHeader>
            <CardContent className="px-5 py-4">
              <PieChartWidget
                data={[
                  { name: "Info", value: severityCounts.info },
                  { name: "Warning", value: severityCounts.warning },
                  { name: "Error", value: severityCounts.error },
                  { name: "Critical", value: severityCounts.critical },
                ]}
                height={280}
              />
            </CardContent>
          </Card>
        </div>

        <Card variant="elevated" padding="none">
          <CardHeader className="px-5 py-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <SectionTitle>Events</SectionTitle>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex gap-1 rounded-lg border border-border bg-surface p-0.5">
                  {["all", "info", "warning", "error", "critical"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => { setFilter(s); }}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium transition-smooth ${
                        filter === s ? "bg-primary text-text-inverse shadow-sm" : "text-text-secondary hover:bg-surface-tertiary hover:text-text"
                      }`}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
                <select
                  value={sourceFilter}
                  onChange={(e) => { setSourceFilter(e.target.value); }}
                  className="rounded-lg border border-border bg-surface px-2.5 py-1 text-xs text-text"
                >
                  <option value="all">All Sources</option>
                  {sources.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <Button variant="secondary" size="sm" onClick={acknowledgeAll}>
                  Acknowledge All
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-5 py-4">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="skeleton-card h-12" style={{ animationDelay: String(i * 60) + "ms" }} />
                ))}
              </div>
            ) : error ? (
              <ErrorState title="Could not load events" message={error} onRetry={() => { window.location.reload(); }} />
            ) : filtered.length === 0 ? (
              <EmptyState
                icon="activity"
                title="No events"
                description="No monitoring events match your current filters."
                action={
                  <Button variant="secondary" size="sm" onClick={() => { setFilter("all"); setSourceFilter("all"); }}>Clear Filters</Button>
                }
              />
            ) : (
              <div className="divide-y divide-border">
                {filtered.slice(0, 50).map((event) => (
                  <div key={event.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0 transition-smooth hover:bg-surface-secondary rounded-card -mx-2 px-2">
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full ${
                        event.severity === "critical" ? "bg-danger" :
                        event.severity === "error" ? "bg-danger" :
                        event.severity === "warning" ? "bg-warning" : "bg-primary"
                      }`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-text">{event.title}</span>
                          <Badge variant={
                            event.severity === "critical" ? "danger" :
                            event.severity === "error" ? "danger" :
                            event.severity === "warning" ? "warning" : "default"
                          }>
                            {event.severity}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-text-secondary">
                          <span>{event.source}</span>
                          <span>•</span>
                          <span>{new Date(event.timestamp).toLocaleString()}</span>
                          {event.acknowledged ? (
                            <Badge variant="success">Acknowledged</Badge>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    {event.description ? (
                      <p className="hidden max-w-xs text-xs text-text-secondary lg:block">{event.description}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </EnterpriseShell>
  );
}

export default function MonitoringPage() {
  return (
    <RequireAuth>
      <MonitoringContent />
    </RequireAuth>
  );
}
