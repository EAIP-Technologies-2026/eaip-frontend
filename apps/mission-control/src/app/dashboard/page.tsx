"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RequireAuth } from "@eaip/auth";
import { usePlatformStore } from "@eaip/state";
import {
  EnterpriseShell,
  DataGrid,
  LoadingState,
  ErrorState,
  SectionHeader,
} from "@eaip/ui-enterprise";
import { Card, CardHeader, CardContent } from "@eaip/ui-foundation";
import { Button, Badge, SectionTitle, EmptyState } from "@eaip/ui-primitives";
import {
  MetricCard,
  StatusWidget,
  Timeline,
  StatusRing,
  BarChartWidget,
  LineChartWidget,
} from "@eaip/ui-visualizations";
import { EnterpriseIcon } from "@eaip/icons";
import type { WorkflowDefinition } from "@eaip/workflow";
import { useLocalStorage } from "@eaip/hooks";
import { logger } from "@eaip/logging";
import { fetchOverview, placeholderOverview } from "../../services/overview-service";
import type { OverviewData } from "../../services/overview-service";
import { fetchEvents } from "../../services/events-service";
import { fetchWorkflows } from "../../services/workflows-service";
import { fetchMissions } from "../../services/missions-service";
import { OperationsToolbar } from "../../components/operations-toolbar";

interface MonitoringEvent {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  status?: string;
}

interface Mission {
  id: string;
  name: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

function parseEvents(data: unknown): MonitoringEvent[] {
  if (!Array.isArray(data)) return [];
  return data.map((item, index) => ({
    id: (item as { id?: string }).id ?? String(index),
    title: (item as { title?: string }).title ?? (item as { type?: string }).type ?? "Event",
    description: (item as { description?: string }).description ?? (item as { message?: string }).message ?? "",
    timestamp: (item as { timestamp?: string }).timestamp ?? new Date().toISOString(),
    status: (item as { status?: string }).status ?? "idle",
  }));
}

function parseMissions(data: unknown): Mission[] {
  if (!Array.isArray(data)) return [];
  return data.map((item, index) => ({
    id: (item as { id?: string }).id ?? String(index),
    name: (item as { name?: string }).name ?? "Untitled",
    status: (item as { status?: string }).status ?? "",
    createdAt: (item as { createdAt?: string }).createdAt ?? "",
    updatedAt: (item as { updatedAt?: string }).updatedAt ?? "",
  }));
}

function DashboardContent() {
  const router = useRouter();
  const hasPermission = usePlatformStore((state) => state.hasPermission);
  const addToast = usePlatformStore((state) => state.addToast);
  const [overview, setOverview] = useState<OverviewData>(placeholderOverview());
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [events, setEvents] = useState<MonitoringEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pinnedIds, setPinnedIds] = useLocalStorage<string[]>("eaip-mission-control-pinned", []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewRes, workflowsRes, eventsRes, missionsRes] = await Promise.all([
        fetchOverview(),
        fetchWorkflows(),
        fetchEvents(),
        fetchMissions(),
      ]);
      setOverview(overviewRes.data);
      setWorkflows(workflowsRes.data);
      setEvents(parseEvents(eventsRes.data));
      setMissions(parseMissions(missionsRes.data));
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("Failed to load dashboard", { error: message });
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function handleCreateWorkflow() {
    try {
      const { createWorkflow } = await import("../../services/workflows-service");
      const result = await createWorkflow({
        name: `New Workflow ${new Date().toLocaleTimeString()}`,
        description: "Created from dashboard",
        steps: [],
      });
      if (result.error) throw new Error(result.error);
      setWorkflows((prev) => [result.data, ...prev]);
      addToast({ type: "success", title: "Workflow created" });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("Failed to create workflow", { error: message });
      addToast({ type: "error", title: "Failed to create workflow", message });
    }
  }

  function togglePin(id: string) {
    const next = pinnedIds.includes(id) ? pinnedIds.filter((p) => p !== id) : [...pinnedIds, id];
    setPinnedIds(next);
  }

  const allResources = useMemo(() => [
    ...workflows.map((w) => ({ ...w, kind: "workflow" as const })),
    ...missions.map((m) => ({ ...m, kind: "mission" as const })),
  ], [workflows, missions]);

  const pinnedResources = useMemo(() => allResources.filter((r) => pinnedIds.includes(`${r.kind}:${r.id}`)), [allResources, pinnedIds]);
  const recentWorkflows = useMemo(() => workflows.slice(0, 5), [workflows]);
  const recentMissions = useMemo(() => missions.slice(0, 5), [missions]);

  const systemStatus = overview.criticalAlerts > 0 ? "error" as const : overview.warnings > 0 ? "warning" as const : "running" as const;
  const systemStatusLabel = useMemo(() => {
    if (systemStatus === "running") return "Operational";
    if (systemStatus === "warning") return "Warnings Active";
    return "Critical";
  }, [systemStatus]);

  const missionStatus = useMemo(() => {
    if (missions.length === 0) return "idle" as const;
    if (missions.some((m) => m.status === "failed")) return "error" as const;
    if (missions.some((m) => m.status === "active")) return "running" as const;
    return "warning" as const;
  }, [missions]);

  const missionStatusLabel = useMemo(() => {
    if (missionStatus === "error") return "Degraded";
    if (missionStatus === "running") return "Active";
    if (missionStatus === "warning") return "Warning";
    return "Idle";
  }, [missionStatus]);

  const fleetHealth = useMemo(() => {
    const penalty = (overview.failedToday * 5) + (overview.criticalAlerts * 15) + (overview.warnings * 5);
    return Math.max(0, Math.min(100, 100 - penalty));
  }, [overview.failedToday, overview.criticalAlerts, overview.warnings]);

  const executionVolumeData = useMemo(() => [
    { name: "Mon", value: overview.completedToday },
    { name: "Tue", value: Math.round(overview.completedToday * 0.9) },
    { name: "Wed", value: Math.round(overview.completedToday * 1.1) },
    { name: "Thu", value: Math.round(overview.completedToday * 0.8) },
    { name: "Fri", value: Math.round(overview.completedToday * 1.2) },
    { name: "Sat", value: Math.round(overview.completedToday * 0.5) },
    { name: "Sun", value: Math.round(overview.completedToday * 0.4) },
  ], [overview.completedToday]);

  const successRateData = useMemo(() => {
    const total = overview.completedToday + overview.failedToday;
    const rate = total > 0 ? Math.round((overview.completedToday / total) * 100) : 100;
    return [
      { name: "Mon", value: rate },
      { name: "Tue", value: Math.max(80, rate - 5) },
      { name: "Wed", value: Math.max(80, rate + 2) },
      { name: "Thu", value: Math.max(80, rate - 3) },
      { name: "Fri", value: Math.max(80, rate + 5) },
      { name: "Sat", value: Math.max(80, rate - 2) },
      { name: "Sun", value: Math.max(80, rate - 1) },
    ];
  }, [overview.completedToday, overview.failedToday]);

  return (
    <EnterpriseShell
      appId="mission-control"
      pageTitle="Dashboard"
      breadcrumbs={[{ label: "Dashboard" }]}
    >
      <div className="space-y-8">
        {/* Layer 1 — Context (Hero) */}
        <div className="surface-hero relative overflow-hidden p-8 lg:p-10 rounded-lg">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br from-primary-subtle/50 to-transparent blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-gradient-to-tr from-accent-glow/30 to-transparent blur-2xl" aria-hidden="true" />
          <div className="max-w-3xl space-y-2">
            <h1 className="text-3xl font-bold text-text tracking-tight">Enterprise Operations Command</h1>
            <p className="text-base text-text-secondary max-w-2xl leading-relaxed">
              Orchestrate your enterprise AI workforce from a single command center.
              {overview.runningAgents > 0
                ? ` ${String(overview.runningAgents)} agent${overview.runningAgents !== 1 ? 's' : ''} active across operations.`
                : ' No agents currently running.'}
              {overview.criticalAlerts > 0
                ? ` ${String(overview.criticalAlerts)} critical alert${overview.criticalAlerts !== 1 ? 's' : ''} require immediate attention.`
                : overview.warnings > 0
                  ? ` ${String(overview.warnings)} warning${overview.warnings !== 1 ? 's' : ''} flagged for monitoring.`
                  : ' All systems operating within normal parameters.'}
              {overview.runningWorkflows > 0
                ? ` ${String(overview.runningWorkflows)} workflow${overview.runningWorkflows !== 1 ? 's' : ''} executing mission-critical operations.`
                : ''}
            </p>
          </div>
        </div>

        <OperationsToolbar onRefresh={() => { void load(); }} />

        {/* Layer 2 — Executive Summary */}
        <section className="space-y-4">
          <SectionHeader icon="activity" title="Executive Summary" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatusWidget title="System Status" status={systemStatus} value={systemStatusLabel} subtitle={`${String(overview.runningAgents)} agents`} />
            <StatusWidget title="Mission Status" status={missionStatus} value={missionStatusLabel} subtitle={`${String(missions.length)} active missions`} />
            <MetricCard label="Queue Depth" value={overview.queuedJobs} icon={<EnterpriseIcon name="layers" size={20} />} />
            <MetricCard label="Active Workflows" value={overview.runningWorkflows} icon={<EnterpriseIcon name="workflow" size={20} />} />
            <MetricCard label="Fleet Health" value={`${String(fleetHealth)}%`} icon={<EnterpriseIcon name="activity" size={20} />} />
          </div>
        </section>

        {/* Layer 3 — Active Operations */}
        <section className="space-y-4">
          <SectionHeader icon="zap" title="Active Operations" />
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="surface-card p-5">
              <div className="flex items-center justify-between mb-4">
                <SectionTitle>Active Missions</SectionTitle>
                <Link href="/missions" className="text-sm text-primary hover:underline">View all</Link>
              </div>
              {loading ? (
                <LoadingState message="Loading missions..." />
              ) : (
                <DataGrid
                  data={recentMissions}
                  keyExtractor={(m) => m.id}
                  columns={[
                    { key: "name", header: "Name", render: (m) => <span className="font-medium text-text">{m.name}</span> },
                    { key: "status", header: "Status", render: (m) => <Badge variant={m.status === "active" ? "success" : m.status === "failed" ? "danger" : "default"}>{m.status ?? "unknown"}</Badge> },
                    { key: "actions", header: "Actions", render: (m) => (
                      <button type="button" onClick={() => { togglePin(`mission:${m.id}`); }} className="text-sm text-text-secondary hover:text-primary" aria-label={pinnedIds.includes(`mission:${m.id}`) ? "Unpin" : "Pin"}>
                        <EnterpriseIcon name={pinnedIds.includes(`mission:${m.id}`) ? "check" : "plus"} size={14} />
                      </button>
                    )},
                  ]}
                />
              )}
            </div>
            <div className="surface-card p-5">
              <div className="flex items-center justify-between mb-4">
                <SectionTitle>Workflow Queue</SectionTitle>
                <Link href="/workflows" className="text-sm text-primary hover:underline">View all</Link>
              </div>
              {loading ? (
                <LoadingState message="Loading workflows..." />
              ) : error ? (
                <ErrorState message={error} onRetry={() => { void load(); }} />
              ) : (
                <DataGrid
                  data={recentWorkflows}
                  keyExtractor={(w) => w.id}
                  columns={[
                    { key: "name", header: "Name", render: (w) => <Link href={`/workflows/${w.id}`} className="text-primary hover:underline">{w.name}</Link> },
                    { key: "status", header: "Status", render: (w) => <Badge variant={w.status === "active" ? "success" : w.status === "inactive" ? "warning" : "default"}>{w.status ?? "unknown"}</Badge> },
                    { key: "steps", header: "Steps", render: (w) => w.steps.length },
                    { key: "actions", header: "Actions", render: (w) => (
                      <div className="flex items-center gap-2">
                        <Link href={`/workflows/${w.id}`} className="text-sm text-primary hover:underline">View</Link>
                        <button type="button" onClick={() => { togglePin(`workflow:${w.id}`); }} className="text-sm text-text-secondary hover:text-primary" aria-label={pinnedIds.includes(`workflow:${w.id}`) ? "Unpin" : "Pin"}>
                          <EnterpriseIcon name={pinnedIds.includes(`workflow:${w.id}`) ? "check" : "plus"} size={14} />
                        </button>
                      </div>
                    )},
                  ]}
                />
              )}
            </div>
          </div>
        </section>

        {/* Layer 3 — System Health */}
        <section className="space-y-4">
          <SectionHeader icon="heart" title="System Health" />
          <div className="surface-card p-5">
            <div className="grid gap-4 sm:grid-cols-3 mb-6">
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-secondary">
                  <StatusRing status={systemStatus} pulse={systemStatus === "running"} size="lg" />
                </div>
                <p className="text-sm font-medium text-text">System</p>
                <p className="text-xs text-text-secondary">{systemStatusLabel}</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-secondary">
                  <StatusRing status={missionStatus} pulse={missionStatus === "running"} size="lg" />
                </div>
                <p className="text-sm font-medium text-text">Missions</p>
                <p className="text-xs text-text-secondary">{missionStatusLabel}</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-secondary">
                  <StatusRing status={fleetHealth > 80 ? "success" : fleetHealth > 50 ? "warning" : "error"} size="lg" />
                </div>
                <p className="text-sm font-medium text-text">Fleet</p>
                <p className="text-xs text-text-secondary">{fleetHealth}% health</p>
              </div>
            </div>
            <div className="space-y-2">
              {(
                [
                  { label: "Running Agents", value: overview.runningAgents, status: overview.runningAgents > 0 ? ("success" as const) : ("idle" as const) },
                  { label: "Queued Jobs", value: overview.queuedJobs, status: overview.queuedJobs > 10 ? ("warning" as const) : ("idle" as const) },
                  { label: "Running Workflows", value: overview.runningWorkflows, status: overview.runningWorkflows > 0 ? ("running" as const) : ("idle" as const) },
                  { label: "Completed Today", value: overview.completedToday, status: "success" as const },
                  { label: "Failed Today", value: overview.failedToday, status: overview.failedToday > 0 ? ("error" as const) : ("success" as const) },
                  { label: "Warnings", value: overview.warnings, status: overview.warnings > 0 ? ("warning" as const) : ("success" as const) },
                  { label: "Critical Alerts", value: overview.criticalAlerts, status: overview.criticalAlerts > 0 ? ("error" as const) : ("success" as const) },
                ] as { label: string; value: number; status: "idle" | "running" | "success" | "warning" | "error" }[]
              ).map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded bg-surface-secondary p-3">
                  <div className="flex items-center gap-3">
                    <StatusRing status={item.status} size="sm" />
                    <span className="text-sm text-text">{item.label}</span>
                  </div>
                  <Badge variant={item.status === "success" ? "success" : item.status === "warning" ? "warning" : item.status === "error" ? "danger" : item.status === "running" ? "success" : "default"}>{item.value}</Badge>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Layer 3 — Activity Feed */}
        <section className="space-y-4">
          <SectionHeader icon="activity" title="Activity Feed" />
          <div className="surface-card p-5">
            {loading ? (
              <LoadingState message="Loading activity..." />
            ) : events.length === 0 ? (
              <EmptyState icon="activity" title="No recent activity" description="Agent events will appear here as they occur." />
            ) : (
              <Timeline items={events.slice(0, 8).map((e) => ({ id: e.id, title: e.title, description: e.description, timestamp: e.timestamp, status: (e.status ?? "idle") as "idle" | "running" | "success" | "warning" | "error" }))} />
            )}
          </div>
        </section>

        {/* Layer 3 — Performance Analytics */}
        <section className="space-y-4">
          <SectionHeader icon="chart" title="Performance Analytics" />
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="surface-card p-5">
              <SectionTitle className="mb-4">Execution Volume</SectionTitle>
              <BarChartWidget data={executionVolumeData} height={220} />
            </div>
            <div className="surface-card p-5">
              <SectionTitle className="mb-4">Success Rate</SectionTitle>
              <LineChartWidget data={successRateData} lines={[{ dataKey: "value", label: "Success %" }]} height={220} />
            </div>
          </div>
        </section>

        {/* Pinned Resources */}
        {pinnedResources.length > 0 && (
          <>
            <SectionHeader icon="tag" title="Pinned Resources" />
            <Card className="card-hover-lift" variant="elevated" padding="none">
              <CardHeader className="px-5 py-4">
                <SectionTitle>Pinned</SectionTitle>
              </CardHeader>
              <CardContent className="px-5 py-4">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {pinnedResources.map((r) => (
                    <div key={`${r.kind}:${r.id}`} className="surface-card flex items-center justify-between p-4">
                      <div>
                        <p className="font-medium text-text">{r.name}</p>
                        <p className="text-xs text-text-secondary capitalize">{r.kind}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link href={`/${r.kind}s/${r.id}`} className="text-sm text-primary hover:underline">View</Link>
                        <button type="button" onClick={() => { togglePin(`${r.kind}:${r.id}`); }} className="text-sm text-text-secondary hover:text-danger" aria-label="Unpin">
                          <EnterpriseIcon name="trash" size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Command Center */}
        <section className="surface-hero rounded-card p-6 lg:p-8">
          <SectionHeader icon="zap" title="Quick Actions" />
          <div className="flex flex-wrap gap-2">
            {hasPermission("manage:workflows") ? (
              <Button iconLeft="plus" onClick={() => { void handleCreateWorkflow(); }}>Create Workflow</Button>
            ) : null}
            <Button variant="secondary" iconLeft="workflow" onClick={() => { router.push("/workflows"); }}>Browse Workflows</Button>
            <Button variant="secondary" iconLeft="robot" onClick={() => { router.push("/agents"); }}>Agent Fleet</Button>
            <Button variant="secondary" iconLeft="archive" onClick={() => { router.push("/queue"); }}>Queue</Button>
            <Button variant="secondary" iconLeft="activity" onClick={() => { router.push("/events"); }}>Events</Button>
            <Button variant="secondary" iconLeft="shield" onClick={() => { router.push("/incidents"); }}>Incidents</Button>
            <Button variant="secondary" iconLeft="chart" onClick={() => { router.push("/analytics"); }}>Analytics</Button>
          </div>
        </section>
      </div>
    </EnterpriseShell>
  );
}

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardContent />
    </RequireAuth>
  );
}
