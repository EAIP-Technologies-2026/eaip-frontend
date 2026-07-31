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
} from "@eaip/ui-enterprise";
import { Button, Badge, SectionTitle, EmptyState } from "@eaip/ui-primitives";
import {
  MetricCard,
  StatusWidget,
  Timeline,
  BarChartWidget,
  PieChartWidget,
} from "@eaip/ui-visualizations";
import { EnterpriseIcon } from "@eaip/icons";
import type { Agent } from "@eaip/agent";
import { useLocalStorage } from "@eaip/hooks";
import { logger } from "@eaip/logging";
import { fetchAgentStats, fetchRecentAgents, fetchDashboardActivity } from "../../services/dashboard-service";
import type { AgentStats, ActivityItem } from "../../services/dashboard-service";
import { useFallback } from "../../services/fallback-context";

function formatPercent(value: number): string {
  return `${String(Math.round(value * 100))}%`;
}

/* ------------------------------------------------------------------ */
/*  Enterprise Dashboard — Intelligence Operating System               */
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
        const [statsResult, agentsResult, activityResult] = await Promise.all([
          fetchAgentStats(),
          fetchRecentAgents(),
          fetchDashboardActivity(),
        ]);
        if (cancelled) return;
        setFallback("dashboard", statsResult.source === "fallback" || agentsResult.source === "fallback" || activityResult.source === "fallback");
        setStats(statsResult.data);
        setAgents(agentsResult.data);
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

  const systemStatus =
    stats.activeAgents > 0 ? "running" : stats.totalAgents > 0 ? "idle" : "warning";

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <EnterpriseShell
      appId="enterprise-console"
      pageTitle="Dashboard"
      breadcrumbs={[{ label: "Dashboard" }]}
    >
      <div className="space-y-8">
        {/* ── Enterprise Overview ───────────────────────────── */}
        <section className="surface-hero relative p-8 lg:p-10">
          <div className="relative">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-primary uppercase mb-4">
              <EnterpriseIcon name="activity" size={14} />
              Enterprise Intelligence Operating System
            </div>
            <h1 className="text-3xl font-bold text-text tracking-tight">
              Autonomous Agent Operations
            </h1>
            <p className="mt-3 text-base text-text-secondary max-w-2xl leading-relaxed">
              All AI agents operating within parameters. {stats.activeAgents} active agent
              {stats.activeAgents !== 1 ? "s" : ""} — {formatPercent(stats.successRate)} success rate across{" "}
              {stats.totalExecutions} executions.
              {stats.successRate >= 0.95
                ? " System healthy."
                : " Review degraded agents."}
            </p>
          </div>
        </section>

        {/* ── Executive Summary ──────────────────────────────── */}
        <section className="space-y-4">
          <SectionHeader icon="activity" title="Executive Summary" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <StatusWidget
                title="System Status"
                status={systemStatus}
                value={systemStatus === "running" ? "Operational" : systemStatus === "idle" ? "Standby" : "Attention Required"}
                subtitle={systemStatus === "running" ? "All agents responding within SLA" : systemStatus === "idle" ? "No agents deployed" : "Degraded performance detected"}
              />
            </div>
            <MetricCard
              label="Success Rate"
              value={formatPercent(stats.successRate)}
              icon={<EnterpriseIcon name="checkCircle" size={20} />}
              sparklineData={stats.executionsByDay?.slice(-10)}
            />
            <MetricCard
              label="Active Agents"
              value={stats.activeAgents}
              icon={<EnterpriseIcon name="zap" size={20} />}
            />
            <MetricCard
              label="Total Executions"
              value={stats.totalExecutions}
              icon={<EnterpriseIcon name="barChart" size={20} />}
              sparklineData={stats.executionsByDay?.slice(-10)}
            />
          </div>
        </section>

        {/* ── Live Operations ────────────────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <SectionHeader icon="zap" title="Active Operations" />
            <div className="flex items-center gap-3">
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
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2 surface-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <EnterpriseIcon name="robot" size={16} className="text-text-muted" />
                  <SectionTitle>Recent Intelligence</SectionTitle>
                </div>
                <Link href="/agents" className="text-sm text-primary hover:text-primary-hover transition-smooth">View all</Link>
              </div>
              {loading ? (
                <LoadingState message="Loading agents..." />
              ) : error ? (
                <ErrorState
                  message={error}
                  onRetry={() => {
                    window.location.reload();
                  }}
                />
              ) : (
                <>
                  {recentAgents.length === 0 ? (
                    <EmptyState
                      icon="robot"
                      title="No agents deployed"
                      description="Deploy your first AI agent to begin autonomous operations."
                      action={
                        <Button variant="secondary" iconLeft="robot" onClick={() => { router.push("/agents"); }}>Browse Agents</Button>
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
                </>
              )}
            </div>
            <div className="surface-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <EnterpriseIcon name="activity" size={16} className="text-text-muted" />
                <SectionTitle>Activity Feed</SectionTitle>
              </div>
              {loading ? (
                <LoadingState message="Loading activity..." />
              ) : events.length === 0 ? (
                <EmptyState
                  icon="activity"
                  title="No recent activity"
                  description="Agent events will appear here as they occur."
                  action={
                    <Button variant="secondary" iconLeft="activity" size="sm" onClick={() => { router.push("/activity"); }}>View Feed</Button>
                  }
                />
              ) : (
                <Timeline items={events.slice(0, 6).map((e) => ({ ...e, status: (e.status ?? "idle") as "idle" | "running" | "success" | "warning" | "error" }))} />
              )}
            </div>
          </div>
        </section>

        {/* ── Pinned Intelligence ────────────────────────────── */}
        {pinnedAgents.length > 0 && (
          <section className="space-y-4">
            <SectionHeader icon="tag" title="Pinned Intelligence" />
            <div className="flex flex-wrap gap-3">
              {pinnedAgents.map((agent) => (
                <div
                  key={agent.id}
                  className="surface-card flex items-center gap-3 px-4 py-3 cursor-pointer min-w-[240px]"
                  onClick={() => { router.push(`/agents/${agent.id}`); }}
                  role="link"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === "Enter") { router.push(`/agents/${agent.id}`); } }}
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

        {/* ── Intelligence Insights ─────────────────────────── */}
        <section className="space-y-4">
          <SectionHeader icon="chart" title="Operational Insights" />
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="surface-card p-5">
              <SectionTitle className="mb-4">Execution Trends</SectionTitle>
              {stats.executionsByDay?.length === 0 ? (
                <EmptyState
                  icon="bar-chart"
                  title="No execution data"
                  description="Execution trends will appear once agents start processing tasks."
                  action={
                    <Button variant="secondary" iconLeft="robot" size="sm" onClick={() => { router.push("/agents"); }}>View Agents</Button>
                  }
                />
              ) : (
                <BarChartWidget
                  data={stats.executionsByDay?.length ? stats.executionsByDay.map((item) => ({ name: item.label, value: item.value })) : []}
                  height={280}
                />
              )}
            </div>
            <div className="surface-card p-5">
              <SectionTitle className="mb-4">Workforce Distribution</SectionTitle>
              {stats.agentsByStatus?.length === 0 ? (
                <EmptyState
                  icon="pie-chart"
                  title="No workforce data"
                  description="Agent distribution will appear once agents are deployed."
                  action={
                    <Button variant="secondary" iconLeft="robot" size="sm" onClick={() => { router.push("/agents"); }}>Browse Agents</Button>
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
