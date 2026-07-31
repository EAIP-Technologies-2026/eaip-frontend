"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { RequireAuth } from "@eaip/auth";
import { EnterpriseShell, LoadingState, ErrorState } from "@eaip/ui-enterprise";
import { Card, CardHeader, CardContent } from "@eaip/ui-foundation";
import { EmptyState } from "@eaip/ui-primitives";
import { Timeline } from "@eaip/ui-visualizations";
import { Input } from "@eaip/ui-primitives";
import { EnterpriseIcon } from "@eaip/icons";
import { fetchEvents } from "../../services/events-service";
import type { TimelineEvent } from "../../services/events-service";
import { OperationsToolbar } from "../../components/operations-toolbar";

const typeColors: Record<string, string> = {
  agent_started: "bg-primary",
  workflow_started: "bg-accent",
  knowledge_updated: "bg-success",
  alert: "bg-warning",
  failure: "bg-danger",
  recovery: "bg-info",
  system_event: "bg-text-muted",
};

const typeLabels: Record<string, string> = {
  agent_started: "Agent Started",
  workflow_started: "Workflow Started",
  knowledge_updated: "Knowledge Updated",
  alert: "Alert",
  failure: "Failure",
  recovery: "Recovery",
  system_event: "System Event",
};

function EventsContent() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchEvents();
      setEvents(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load events");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(() => {
    let list = events;
    if (typeFilter !== "all") list = list.filter((e) => e.type === typeFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((e) => e.title.toLowerCase().includes(q) || (e.description?.toLowerCase().includes(q) ?? false));
    }
    return list;
  }, [events, typeFilter, search]);

  const timelineItems = useMemo(() => filtered.slice(0, 100).map((e) => {
    const status: "error" | "warning" | "success" = e.severity === "critical" || e.severity === "error" ? "error" : e.severity === "warning" ? "warning" : "success";
    return { id: e.id, title: e.title, description: e.description, timestamp: e.timestamp, status };
  }), [filtered]);

  const types = useMemo(() => Array.from(new Set(events.map((e) => e.type))), [events]);

  return (
    <EnterpriseShell
      appId="mission-control"
      pageTitle="Live Event Timeline"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Events" }]}
    >
      <div className="space-y-8">
        <section className="surface-hero relative overflow-hidden p-8 lg:p-10">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br from-primary-subtle/50 to-transparent blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-gradient-to-tr from-accent-glow/30 to-transparent blur-2xl" aria-hidden="true" />
          <div className="relative">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-primary uppercase mb-4">
              <EnterpriseIcon name="activity" size={14} />
              Event Timeline
            </div>
            <h1 className="text-3xl font-bold text-text tracking-tight">Events</h1>
            <p className="mt-3 text-base text-text-secondary max-w-2xl leading-relaxed">Review chronological event history, filter by type, and analyze operational patterns.</p>
          </div>
        </section>

        <OperationsToolbar onRefresh={() => { void load(); }} />

        {/* Executive Summary Strip (Layer 2) */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border border-border bg-surface px-5 py-3">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <EnterpriseIcon name="activity" size={16} />
            <span><strong className="text-text">{String(events.length)}</strong> events</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <EnterpriseIcon name="alert" size={16} />
            <span><strong className="text-text">{String(events.filter((e) => e.type === "alert").length)}</strong> alerts</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <EnterpriseIcon name="checkCircle" size={16} />
            <span><strong className="text-text">{String(events.filter((e) => e.type === "failure").length)}</strong> failures</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <EnterpriseIcon name="shield" size={16} />
            <span><strong className="text-text">{String(events.filter((e) => e.type === "recovery").length)}</strong> recoveries</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <EnterpriseIcon name="search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <Input
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setSearch(e.target.value); }}
              placeholder="Search events..."
              className="w-full pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-1 rounded-lg border border-border p-0.5">
            <button
              type="button"
              onClick={() => { setTypeFilter("all"); }}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                typeFilter === "all" ? "bg-primary text-text-inverse" : "text-text-secondary hover:bg-surface-tertiary"
              }`}
            >
              All ({events.length})
            </button>
            {types.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => { setTypeFilter(t); }}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  typeFilter === t ? "bg-primary text-text-inverse" : "text-text-secondary hover:bg-surface-tertiary"
                }`}
              >
                {typeLabels[t] ?? t} ({events.filter((e) => e.type === t).length})
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <LoadingState message="Loading events..." />
        ) : error ? (
          <ErrorState message={error} onRetry={() => { void load(); }} />
        ) : timelineItems.length === 0 ? (
          <Card variant="elevated" padding="none"><CardContent className="px-5 py-4"><EmptyState icon="activity" title="No events" description={search ? "Try a different search term." : "No events recorded yet."} /></CardContent></Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2" variant="elevated" padding="none">
              <CardHeader className="px-5 py-4">
                <h3 className="text-sm font-medium text-text">Event Timeline</h3>
              </CardHeader>
              <CardContent className="px-5 py-4">
                <Timeline items={timelineItems.slice(0, 50)} />
              </CardContent>
            </Card>
            <Card variant="elevated" padding="none">
              <CardHeader className="px-5 py-4">
                <h3 className="text-sm font-medium text-text">Event Types</h3>
              </CardHeader>
              <CardContent className="px-5 py-4">
                <div className="space-y-2">
                  {types.map((t) => {
                    const count = events.filter((e) => e.type === t).length;
                    return (
                      <div key={t} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className={`h-2.5 w-2.5 rounded-full ${typeColors[t] ?? "bg-text-muted"}`} />
                          <span className="text-text-secondary">{typeLabels[t] ?? t}</span>
                        </div>
                        <span className="font-medium text-text">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </EnterpriseShell>
  );
}

export default function EventsPage() {
  return <RequireAuth><EventsContent /></RequireAuth>;
}
