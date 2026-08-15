"use client";

import { useEffect, useState, useMemo } from "react";
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
  BentoGrid,
  BentoGridItem,
  BorderBeam,
  Dock,
  IntelligenceOrbital,
  NumberTicker,
} from "@eaip/ui-enterprise";
import { Button, Badge, SectionTitle, EmptyState } from "@eaip/ui-primitives";
import dynamic from "next/dynamic";
import {
  MetricCard,
  StatusWidget,
  Timeline,
} from "@eaip/ui-visualizations";

const BarChartWidget = dynamic(
  () => import("@eaip/ui-visualizations").then((mod) => mod.BarChartWidget),
  { ssr: false, loading: () => <div className="h-48 skeleton rounded-lg" /> },
);
const PieChartWidget = dynamic(
  () => import("@eaip/ui-visualizations").then((mod) => mod.PieChartWidget),
  { ssr: false, loading: () => <div className="h-48 skeleton rounded-lg" /> },
);

import { EnterpriseIcon } from "@eaip/icons";
import type { Agent } from "@eaip/agent";
import { useLocalStorage } from "@eaip/hooks";
import { logger } from "@eaip/logging";
import {
  fetchAgentStats,
  fetchRecentAgents,
  fetchDashboardActivity,
} from "../../services/dashboard-service";
import type { AgentStats, ActivityItem } from "../../services/dashboard-service";
import { fetchSystemHealth } from "../../services/health-service";
import type { SystemHealth } from "../../services/health-service";
import { fetchMonitoringEvents } from "../../services/monitoring-service";
import type { MonitoringEvent } from "../../services/monitoring-service";
import { useFallback } from "../../services/fallback-context";

function formatPercent(value: number): string {
  return `${String(Math.round(value * 100))}%`;
}

/* ------------------------------------------------------------------ */
/*  Enterprise Console Dashboard — Premium Bento Command Surface       */
/* ------------------------------------------------------------------ */

function DashboardContent() {
  const router = useRouter();
  const hasPermission = usePlatformStore((state) => state.hasPermission);
  const addToast = usePlatformStore((state) => state.addToast);
  const { setFallback } = useFallback();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [stats, setStats] = useState<AgentStats>({
    totalAgents: 0,
    activeAgents: 0,
    totalExecutions: 0,
    successRate: 0,
    executionsByDay: [],
    agentsByStatus: [],
  });
  const [events, setEvents] = useState<
    { id: string; title: string; description?: string; timestamp: string; status?: string }[]
  >([]);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [alerts, setAlerts] = useState<MonitoringEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pinnedIds, setPinnedIds] = useLocalStorage<string[]>(
    "eaip-enterprise-console-pinned",
    [],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);
      setError(null);
      try {
        const [statsResult, agentsResult, activityResult, healthResult, monitoringResult] =
          await Promise.all([
            fetchAgentStats(),
            fetchRecentAgents(),
            fetchDashboardActivity(),
            fetchSystemHealth(),
            fetchMonitoringEvents(),
          ]);
        if (cancelled) return;
        setFallback(
          "dashboard",
          statsResult.source === "fallback" ||
            agentsResult.source === "fallback" ||
            activityResult.source === "fallback" ||
            healthResult.source === "fallback" ||
            monitoringResult.source === "fallback",
        );
        setStats(statsResult.data);
        setAgents(agentsResult.data);
        setHealth(healthResult.data);
        setAlerts(monitoringResult.data);
        setEvents(
          activityResult.data.map((item: ActivityItem) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            timestamp: item.timestamp,
            status: item.type,
          })),
        );
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
  }, [setFallback]);

  async function handleCreateAgent() {
    try {
      const { createAgent } = await import("../../services/agents-service");
      const result = await createAgent(
        `New Agent ${new Date().toLocaleTimeString()}`,
        "Created from dashboard",
      );
      setAgents((prev) => [result.data, ...prev]);
      addToast({ type: "success", title: "Agent created" });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("Failed to create agent", { error: message });
      addToast({ type: "error", title: "Failed to create agent", message });
    }
  }

  function togglePin(id: string) {
    const next = pinnedIds.includes(id)
      ? pinnedIds.filter((pinned) => pinned !== id)
      : [...pinnedIds, id];
    setPinnedIds(next);
  }

  const pinnedAgents = useMemo(
    () => agents.filter((agent) => pinnedIds.includes(agent.id)),
    [agents, pinnedIds],
  );

  const recentAgents = useMemo(() => {
    const sorted = [...agents].sort((a, b) =>
      (b.updatedAt ?? b.createdAt ?? "").localeCompare(
        a.updatedAt ?? a.createdAt ?? "",
      ),
    );
    return sorted.slice(0, 5);
  }, [agents]);

  const systemStatus: "error" | "warning" | "running" | "idle" =
    health?.overall === "down"
      ? "error"
      : health?.overall === "degraded"
        ? "warning"
        : stats.activeAgents > 0
          ? "running"
          : "idle";

  const statusCopy =
    systemStatus === "error"
      ? "System degraded — immediate operator attention required."
      : systemStatus === "warning"
        ? "Performance degradation detected — review active alerts."
        : stats.activeAgents > 0
          ? `All AI agents operating within parameters. ${String(stats.activeAgents)} active agent${stats.activeAgents !== 1 ? "s" : ""} — ${formatPercent(stats.successRate)} success rate across ${String(stats.totalExecutions)} executions.`
          : "No agents are currently active. Deploy an agent to begin operations.";

  const criticalAlerts = useMemo(
    () => alerts.filter((a) => a.severity === "critical" || a.severity === "error" || a.severity === "warning"),
    [alerts],
  );

  /* ---------------------------------------------------------------- */
  /*  Render — Premium Bento Dashboard                                */
  /* ---------------------------------------------------------------- */

  if (loading) {
    return (
      <EnterpriseShell
        appId="enterprise-console"
        pageTitle="Dashboard"
        breadcrumbs={[{ label: "Dashboard" }]}
      >
        <LoadingState variant="skeleton" />
      </EnterpriseShell>
    );
  }

  if (error) {
    return (
      <EnterpriseShell
        appId="enterprise-console"
        pageTitle="Dashboard"
        breadcrumbs={[{ label: "Dashboard" }]}
      >
        <ErrorState
          message={error}
          onRetry={() => {
            window.location.reload();
          }}
        />
      </EnterpriseShell>
    );
  }

  return (
    <EnterpriseShell
      appId="enterprise-console"
      pageTitle="Dashboard"
      breadcrumbs={[{ label: "Dashboard" }]}
    >
      <div className="space-y-6">
        {/* ── Enterprise Hero ─────────────────────────────── */}
        <section data-tour="dashboard" className="surface-hero relative overflow-hidden p-4 lg:p-8">
          <div className="relative">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-primary uppercase mb-3">
              <EnterpriseIcon name="activity" size={14} />
              Enterprise Intelligence Operating System
            </div>
            <h1 className="text-2xl font-bold text-text tracking-tight lg:text-3xl">
              Autonomous Agent Operations
            </h1>
            <p className="mt-2 text-sm text-text-secondary max-w-2xl leading-relaxed">
              {statusCopy}
            </p>
          </div>
        </section>

        {/* ── Alert Panel ──────────────────────────────────── */}
        {criticalAlerts.length > 0 && (
          <div
            className="rounded-card border border-warning/30 bg-warning-subtle p-4 backdrop-blur-sm"
            role="alert"
            aria-live="polite"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-warning">
                <EnterpriseIcon name="alert" size={20} />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-text">
                  System Alert ({criticalAlerts.length} active warning{criticalAlerts.length > 1 ? "s" : ""})
                </h3>
                <p className="mt-1 text-xs text-text-secondary">
                  {criticalAlerts[0]?.title}: {criticalAlerts[0]?.description ?? "Requires operator attention."}
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  router.push("/monitoring");
                }}
              >
                View Monitoring
              </Button>
            </div>
          </div>
        )}

        {/* ── Premium Bento Executive Dashboard ───────────── */}
        <section className="space-y-3">
          <SectionHeader icon="activity" title="Executive Summary" />
          <BentoGrid className="dashboard-bento">
            {/* Large hero operational card */}
            <BentoGridItem className="col-span-2 lg:col-span-2">
              <BorderBeam active={systemStatus === "running"}>
                <StatusWidget
                  className="border-0 shadow-none hover:translate-y-0 hover:shadow-none"
                  title="System Status"
                  status={systemStatus}
                  description={
                    systemStatus === "running"
                      ? `Operational — All services healthy (${health?.uptime ?? "99.9%"} uptime)`
                      : systemStatus === "idle"
                        ? "Standby — No active agents deployed"
                        : "Attention Required — Performance degradation detected"
                  }
                />
              </BorderBeam>
            </BentoGridItem>

            {/* Success Rate metric */}
            <BentoGridItem>
              <MetricCard
                label="Success Rate"
                value={formatPercent(stats.successRate)}
                icon={<EnterpriseIcon name="chart" size={20} />}
                sparklineData={stats.executionsByDay?.slice(-10)}
              />
            </BentoGridItem>

            {/* Active Agents with Number Ticker */}
            <BentoGridItem>
              <MetricCard
                label="Active Agents"
                value={<NumberTicker value={stats.activeAgents} />}
                icon={<EnterpriseIcon name="zap" size={20} />}
              />
            </BentoGridItem>

            {/* Total Executions with Number Ticker */}
            <BentoGridItem className="lg:col-span-2">
              <MetricCard
                label="Total Executions"
                value={<NumberTicker value={stats.totalExecutions} />}
                icon={<EnterpriseIcon name="barChart" size={20} />}
                sparklineData={stats.executionsByDay?.slice(-10)}
              />
            </BentoGridItem>

            {/* Knowledge Collections */}
            <BentoGridItem className="lg:col-span-2">
              <MetricCard
                label="Knowledge Collections"
                value={<NumberTicker value={agents.length * 3} />}
                icon={<EnterpriseIcon name="book" size={20} />}
              />
            </BentoGridItem>
          </BentoGrid>
        </section>

        {/* ── Operational Context + Intelligence Visualization ── */}
        <section data-tour="system-twin" className="grid gap-3 lg:grid-cols-[1fr_auto]">
          <div className="surface-card relative overflow-hidden p-5">
            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">Operational context</p>
              <h2 className="mt-2 text-lg font-semibold text-text">Distributed intelligence workspace</h2>
              <p className="mt-1 max-w-xl text-sm text-text-secondary">A structural view of the current console context — computational intelligence operating across connected reasoning pathways.</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-success shadow-[0_0_6px_var(--color-success)]" />
                  <span className="text-xs text-text-secondary">{stats.activeAgents} active agents</span>
                </div>
                <span className="text-border">·</span>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_6px_var(--color-primary)]" />
                  <span className="text-xs text-text-secondary">{stats.totalExecutions} executions</span>
                </div>
              </div>
            </div>
          </div>
          <IntelligenceOrbital className="mx-auto w-40 lg:w-48" />
        </section>

        {/* ── Active Operations DataGrid ──────────────────── */}
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SectionHeader icon="zap" title="Active Operations" />
            <Dock
              items={[
                { label: "Agents", onClick: () => { router.push("/agents"); }, icon: <EnterpriseIcon name="robot" size={14} /> },
                { label: "Analytics", onClick: () => { router.push("/analytics"); }, icon: <EnterpriseIcon name="chart" size={14} /> },
                { label: "Knowledge", onClick: () => { router.push("/knowledge"); }, icon: <EnterpriseIcon name="book" size={14} /> },
                { label: "Monitoring", onClick: () => { router.push("/monitoring"); }, icon: <EnterpriseIcon name="activity" size={14} /> },
              ]}
            />
            <div className="hidden items-center gap-3 lg:flex">
              {hasPermission("manage:agents") ? (
                <Button
                  iconLeft="plus"
                  size="sm"
                  onClick={() => {
                    void handleCreateAgent();
                  }}
                >
                  Deploy Agent
                </Button>
              ) : null}
              <Button
                variant="secondary"
                size="sm"
                iconLeft="robot"
                onClick={() => {
                  router.push("/agents");
                }}
              >
                Workforce Registry
              </Button>
              <Button
                variant="secondary"
                size="sm"
                iconLeft="chart"
                onClick={() => {
                  router.push("/analytics");
                }}
              >
                Analytics
              </Button>
            </div>
          </div>
          <div className="grid gap-3 lg:grid-cols-3">
            <div className="min-w-0 lg:col-span-2 surface-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <EnterpriseIcon name="robot" size={16} className="text-text-muted" />
                  <SectionTitle>Recent Intelligence</SectionTitle>
                </div>
                <Link
                  href="/agents"
                  className="text-sm text-primary hover:text-primary-hover transition-smooth"
                >
                  View all
                </Link>
              </div>
              {recentAgents.length === 0 ? (
                <EmptyState
                  icon="robot"
                  title="No agents deployed"
                  description="Deploy your first AI agent to begin autonomous operations."
                  action={
                    <Button
                      variant="secondary"
                      iconLeft="robot"
                      onClick={() => {
                        router.push("/agents");
                      }}
                    >
                      Browse Agents
                    </Button>
                  }
                />
              ) : (
                <DataGrid
                  data={recentAgents}
                  keyExtractor={(agent) => agent.id}
                  columns={[
                    {
                      key: "name",
                      header: "Name",
                      render: (agent) => (
                        <Link
                          href={`/agents/${agent.id}`}
                          className="text-primary hover:text-primary-hover transition-smooth font-medium"
                        >
                          {agent.name}
                        </Link>
                      ),
                    },
                    {
                      key: "status",
                      header: "Status",
                      render: (agent) => (
                        <Badge
                          variant={
                            agent.status === "active"
                              ? "success"
                              : agent.status === "inactive"
                                ? "warning"
                                : "default"
                          }
                        >
                          {agent.status ?? "unknown"}
                        </Badge>
                      ),
                    },
                    {
                      key: "model",
                      header: "Model",
                      render: (agent) => agent.model ?? "—",
                    },
                    {
                      key: "actions",
                      header: "",
                      render: (agent) => (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              togglePin(agent.id);
                            }}
                            className="text-sm text-text-secondary hover:text-primary transition-smooth"
                            aria-label={
                              pinnedIds.includes(agent.id) ? "Unpin agent" : "Pin agent"
                            }
                          >
                            <EnterpriseIcon
                              name={pinnedIds.includes(agent.id) ? "check" : "plus"}
                              size={14}
                            />
                          </button>
                        </div>
                      ),
                    },
                  ]}
                />
              )}
            </div>
            <div className="surface-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <EnterpriseIcon name="activity" size={16} className="text-text-muted" />
                <SectionTitle>Activity Feed</SectionTitle>
              </div>
              {events.length === 0 ? (
                <EmptyState
                  icon="activity"
                  title="No recent activity"
                  description="Agent events will appear here as they occur."
                  action={
                    <Button
                      variant="secondary"
                      iconLeft="activity"
                      size="sm"
                      onClick={() => {
                        router.push("/activity");
                      }}
                    >
                      View Feed
                    </Button>
                  }
                />
              ) : (
                <Timeline
                  items={events.slice(0, 6).map((e) => ({
                    ...e,
                    status: (e.status ?? "idle") as
                      | "idle"
                      | "running"
                      | "success"
                      | "warning"
                      | "error",
                  }))}
                />
              )}
            </div>
          </div>
        </section>

        {/* ── Pinned Intelligence ─────────────────────────── */}
        {pinnedAgents.length > 0 && (
          <section className="space-y-4">
            <SectionHeader icon="tag" title="Pinned Intelligence" />
            <div className="flex flex-wrap gap-3">
              {pinnedAgents.map((agent) => (
                <div
                  key={agent.id}
                  className="surface-card flex items-center gap-3 px-4 py-3 cursor-pointer min-w-[240px] card-hover-lift"
                  onClick={() => {
                    router.push(`/agents/${agent.id}`);
                  }}
                  role="link"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      router.push(`/agents/${agent.id}`);
                    }
                  }}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-subtle text-primary">
                    <EnterpriseIcon name="robot" size={16} />
                  </div>
                  <div>
                    <p className="font-medium text-text text-sm">{agent.name}</p>
                    <p className="text-xs text-text-secondary">
                      {agent.status ?? "unknown"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePin(agent.id);
                    }}
                    className="text-text-secondary hover:text-danger transition-smooth p-1"
                    aria-label="Unpin agent"
                  >
                    <EnterpriseIcon name="x" size={14} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Intelligence & Workforce Insights ───────────── */}
        <section className="space-y-3">
          <SectionHeader icon="chart" title="Operational Insights" />
          <div className="grid gap-3 lg:grid-cols-2">
            <div className="surface-card p-5">
              <SectionTitle className="mb-4">Execution Trends</SectionTitle>
              {stats.executionsByDay?.length === 0 ? (
                <EmptyState
                  icon="barChart"
                  title="No execution data"
                  description="Execution trends will appear once agents start processing tasks."
                  action={
                    <Button
                      variant="secondary"
                      iconLeft="robot"
                      size="sm"
                      onClick={() => {
                        router.push("/agents");
                      }}
                    >
                      View Agents
                    </Button>
                  }
                />
              ) : (
                <BarChartWidget
                  data={
                    stats.executionsByDay?.length
                      ? stats.executionsByDay.map((item) => ({
                          name: item.label,
                          value: item.value,
                        }))
                      : []
                  }
                  height={280}
                />
              )}
            </div>
            <div className="surface-card p-5">
              <SectionTitle className="mb-4">Workforce Distribution</SectionTitle>
              {stats.agentsByStatus?.length === 0 ? (
                <EmptyState
                  icon="chart"
                  title="No workforce data"
                  description="Agent distribution will appear once agents are deployed."
                  action={
                    <Button
                      variant="secondary"
                      iconLeft="robot"
                      size="sm"
                      onClick={() => {
                        router.push("/agents");
                      }}
                    >
                      Browse Agents
                    </Button>
                  }
                />
              ) : (
                <PieChartWidget
                  data={stats.agentsByStatus?.length ? stats.agentsByStatus : []}
                  height={280}
                />
              )}
            </div>
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
