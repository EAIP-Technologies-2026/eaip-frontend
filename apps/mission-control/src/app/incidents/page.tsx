"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { RequireAuth } from "@eaip/auth";
import { usePlatformStore } from "@eaip/state";
import { EnterpriseShell, LoadingState, ErrorState } from "@eaip/ui-enterprise";
import { Card, CardContent } from "@eaip/ui-foundation";
import { Badge, Button, EmptyState } from "@eaip/ui-primitives";
import { MetricCard } from "@eaip/ui-visualizations";
import { EnterpriseIcon } from "@eaip/icons";
import { fetchIncidents } from "../../services/incidents-service";
import type { Incident } from "../../services/incidents-service";
import { OperationsToolbar } from "../../components/operations-toolbar";

function IncidentsContent() {
  const addToast = usePlatformStore((state) => state.addToast);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchIncidents();
      setIncidents(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load incidents");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(() => {
    if (filter === "all") return incidents;
    return incidents.filter((i) => i.status === filter);
  }, [incidents, filter]);

  const stats = useMemo(() => ({
    critical: incidents.filter((i) => i.severity === "critical" && i.status !== "resolved").length,
    warning: incidents.filter((i) => i.severity === "warning" && i.status !== "resolved").length,
    info: incidents.filter((i) => i.severity === "information").length,
    open: incidents.filter((i) => i.status === "open").length,
    acknowledged: incidents.filter((i) => i.status === "acknowledged").length,
    resolved: incidents.filter((i) => i.status === "resolved").length,
  }), [incidents]);

  function handleAcknowledge(incident: Incident) {
    setIncidents((prev) => prev.map((i) => i.id === incident.id ? { ...i, status: "acknowledged" } : i));
    addToast({ type: "info", title: "Incident acknowledged (local only)", message: "Change will not persist on refresh — no backend endpoint available." });
  }

  function handleResolve(incident: Incident) {
    setIncidents((prev) => prev.map((i) => i.id === incident.id ? { ...i, status: "resolved", timeline: [...i.timeline, { action: "Resolved", timestamp: new Date().toISOString(), actor: "local" }] } : i));
    addToast({ type: "info", title: "Incident resolved (local only)", message: "Change will not persist on refresh — no backend endpoint available." });
  }

  function severityVariant(s: string): "danger" | "warning" | "default" {
    if (s === "critical") return "danger";
    if (s === "warning") return "warning";
    return "default";
  }

  function statusVariant(s: string): "danger" | "warning" | "success" | "default" {
    if (s === "open") return "danger";
    if (s === "acknowledged") return "warning";
    if (s === "resolved") return "success";
    return "default";
  }

  return (
    <EnterpriseShell
      appId="mission-control"
      pageTitle="Incident Center"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Incidents" }]}
    >
      <div className="space-y-8">
        <section className="surface-hero relative overflow-hidden p-8 lg:p-10">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br from-primary-subtle/50 to-transparent blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-gradient-to-tr from-accent-glow/30 to-transparent blur-2xl" aria-hidden="true" />
          <div className="relative">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-primary uppercase mb-4">
              <EnterpriseIcon name="activity" size={14} />
              Incident Response
            </div>
            <h1 className="text-3xl font-bold text-text tracking-tight">Incidents</h1>
            <p className="mt-3 text-base text-text-secondary max-w-2xl leading-relaxed">Track, triage, and resolve operational incidents and platform anomalies.</p>
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <MetricCard label="Open" value={stats.open} icon="alert" />
          <MetricCard label="Acknowledged" value={stats.acknowledged} icon="check" />
          <MetricCard label="Resolved" value={stats.resolved} icon="check-circle" />
          <MetricCard label="Critical" value={stats.critical} icon="alert" />
          <MetricCard label="Warnings" value={stats.warning} icon="alert" />
          <MetricCard label="Info" value={stats.info} icon="info" />
        </div>

        <OperationsToolbar onRefresh={() => { void load(); }} />

        <div className="flex gap-1 rounded-lg border border-border p-0.5 w-fit">
          {["all", "open", "acknowledged", "resolved"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => { setFilter(s); }}
              className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                filter === s ? "bg-primary text-text-inverse" : "text-text-secondary hover:bg-surface-tertiary"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingState message="Loading incidents..." />
        ) : error ? (
          <ErrorState message={error} onRetry={() => { void load(); }} />
        ) : filtered.length === 0 ? (
          <Card variant="elevated" padding="none"><CardContent className="px-5 py-4"><EmptyState icon="shield" title="No incidents" description="All clear. No incidents match your filter." /></CardContent></Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((incident) => (
              <Card key={incident.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                        incident.severity === "critical" ? "bg-danger" :
                        incident.severity === "warning" ? "bg-warning" : "bg-info"
                      }`} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-text">{incident.title}</span>
                          <Badge variant={severityVariant(incident.severity)}>{incident.severity}</Badge>
                          <Badge variant={statusVariant(incident.status)}>{incident.status}</Badge>
                        </div>
                        {incident.description ? (
                          <p className="mt-1 text-xs text-text-secondary">{incident.description}</p>
                        ) : null}
                        <p className="mt-1 text-[10px] text-text-muted">
                          {incident.source} · {new Date(incident.timestamp).toLocaleString()}
                          {incident.assignedTo ? ` · Assigned to: ${incident.assignedTo}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {incident.status === "open" ? (
                        <Button variant="secondary" size="sm" onClick={() => { handleAcknowledge(incident); }}>
                          Acknowledge
                        </Button>
                      ) : null}
                      {incident.status !== "resolved" ? (
                        <Button variant="secondary" size="sm" onClick={() => { handleResolve(incident); }}>
                          Resolve
                        </Button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => { setExpandedId(expandedId === incident.id ? null : incident.id); }}
                        className="rounded p-1 text-text-secondary hover:bg-surface-tertiary"
                        aria-label="Toggle timeline"
                      >
                        <EnterpriseIcon name={expandedId === incident.id ? "chevronUp" : "chevronDown"} size={14} />
                      </button>
                    </div>
                  </div>
                  {expandedId === incident.id && incident.timeline.length > 0 ? (
                    <div className="mt-4 border-t border-border pt-3">
                      <p className="mb-2 text-xs font-medium text-text-secondary">Timeline</p>
                      <div className="space-y-2">
                        {incident.timeline.map((entry, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                            <span className="text-text-secondary">{entry.actor}</span>
                            <span className="text-text-muted">—</span>
                            <span className="text-text-secondary">{entry.action}</span>
                            <span className="text-text-muted">{new Date(entry.timestamp).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </EnterpriseShell>
  );
}

export default function IncidentsPage() {
  return <RequireAuth><IncidentsContent /></RequireAuth>;
}
