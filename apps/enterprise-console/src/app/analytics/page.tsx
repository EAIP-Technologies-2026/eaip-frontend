"use client";

import { useEffect, useState, useMemo } from "react";
import { RequireAuth } from "@eaip/auth";
import { usePlatformStore } from "@eaip/state";
import { EnterpriseShell, LoadingState, ErrorState } from "@eaip/ui-enterprise";
import { Card, CardHeader, CardContent, Tabs } from "@eaip/ui-foundation";
import { SectionTitle, EmptyState, Button } from "@eaip/ui-primitives";
import { useRouter } from "next/navigation";
import {
  MetricCard,
  StatusWidget,
  BarChartWidget,
  PieChartWidget,
  Sparkline,
  type TimelineItem,
} from "@eaip/ui-visualizations";
import { logger } from "@eaip/logging";
import { EnterpriseIcon } from "@eaip/icons";
import { fetchAgentStats } from "../../services/analytics-service";
import type { AgentStats } from "../../services/analytics-service";

function toBarData(data: { label: string; value: number }[]) {
  return data.map((item) => ({ name: item.label, value: item.value }));
}

function toPieData(data: { name: string; value: number }[]) {
  return data.map((item) => ({ name: item.name, value: item.value }));
}

function formatPercent(value: number): string {
  return `${String(Math.round(value * 100))}%`;
}

function formatMs(value: number): string {
  return `${String(Math.round(value))}ms`;
}

function AnalyticsContent() {
  const router = useRouter();
  const hasPermission = usePlatformStore((state) => state.hasPermission);
  const [stats, setStats] = useState<AgentStats>({ totalAgents: 0, activeAgents: 0, totalExecutions: 0, successRate: 0, avgLatencyMs: 0, executionsByDay: [], agentsByStatus: [], agentsByModel: [], topAgents: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    let cancelled = false;

    async function loadAnalytics() {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchAgentStats();
        if (cancelled) return;
        if (result.error) throw new Error(result.error);
        setStats(result.data);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        logger.error("Failed to load analytics", { error: message });
        setError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadAnalytics();
    return () => {
      cancelled = true;
    };
  }, []);

  const healthStatus: TimelineItem["status"] =
    stats.successRate >= 0.95
      ? "success"
      : stats.successRate >= 0.8
        ? "warning"
        : stats.totalAgents > 0
          ? "error"
          : "idle";

  const statusDistribution = useMemo(() => {
    if (stats.agentsByStatus.length > 0) return stats.agentsByStatus;
    return [];
  }, [stats.agentsByStatus]);

  return (
    <EnterpriseShell
      appId="enterprise-console"
      pageTitle="Analytics"
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Analytics" },
      ]}
    >
      <div className="space-y-8">
        <section className="surface-hero relative overflow-hidden p-8 lg:p-10">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br from-primary-subtle/50 to-transparent blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-gradient-to-tr from-accent-glow/30 to-transparent blur-2xl" aria-hidden="true" />
          <div className="relative">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-primary uppercase mb-4">
              <EnterpriseIcon name="activity" size={14} />
              Analytics
            </div>
            <h1 className="text-3xl font-bold text-text tracking-tight">Analytics</h1>
            <p className="mt-3 text-base text-text-secondary max-w-2xl leading-relaxed">Performance, usage, and health metrics for your agents.</p>
          </div>
        </section>

        <Tabs
          tabs={[
            { id: "overview", label: "Overview", icon: "layoutDashboard" },
            { id: "performance", label: "Performance", icon: "activity" },
            { id: "distribution", label: "Distribution", icon: "pieChart" },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {loading ? (
          <LoadingState message="Loading analytics..." />
        ) : error ? (
          <ErrorState
            message={error}
            onRetry={() => {
              window.location.reload();
            }}
          />
        ) : (
          <>
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <MetricCard
                    label="Total Agents"
                    value={stats.totalAgents}
                    icon="robot"
                  />
                  <MetricCard
                    label="Active Agents"
                    value={stats.activeAgents}
                    icon="zap"
                  />
                  <MetricCard
                    label="Total Executions"
                    value={stats.totalExecutions}
                    icon="barChart"
                    sparklineData={stats.executionsByDay}
                  />
                  <MetricCard
                    label="Success Rate"
                    value={formatPercent(stats.successRate)}
                    icon="check"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <StatusWidget
                    title="Agent Health"
                    status={healthStatus}
                    value={formatPercent(stats.successRate)}
                    subtitle="Average execution success rate"
                  />
                  <StatusWidget
                    title="Average Latency"
                    status={stats.avgLatencyMs < 500 ? "success" : "warning"}
                    value={formatMs(stats.avgLatencyMs)}
                    subtitle="Average agent response time"
                  />
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <Card variant="elevated" padding="none">
                    <CardHeader className="px-5 py-4">
                      <SectionTitle>Executions Trend</SectionTitle>
                    </CardHeader>
                    <CardContent className="px-5 py-4">
                      {stats.executionsByDay.length === 0 ? (
                        <EmptyState
                          icon="bar-chart"
                          title="No execution data"
                          description="Execution trends will appear once agents start processing tasks."
                          action={
                            <Button variant="secondary" iconLeft="robot" size="sm" onClick={() => { router.push("/agents"); }}>View Agents</Button>
                          }
                        />
                      ) : (
                        <Sparkline
                          data={stats.executionsByDay}
                          height={280}
                        />
                      )}
                    </CardContent>
                  </Card>
                  <Card variant="elevated" padding="none">
                    <CardHeader className="px-5 py-4">
                      <SectionTitle>Top Agents</SectionTitle>
                    </CardHeader>
                    <CardContent className="px-5 py-4">
                      {stats.topAgents.length === 0 ? (
                        <EmptyState
                          icon="robot"
                          title="No agent performance data"
                          description="Top performing agents will appear here once tasks are executed."
                          action={
                            <Button variant="secondary" iconLeft="robot" size="sm" onClick={() => { router.push("/agents"); }}>View Agents</Button>
                          }
                        />
                      ) : (
                        <BarChartWidget
                          data={stats.topAgents.map((item) => ({ name: item.name, value: item.value }))}
                          height={280}
                        />
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === "performance" && (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <MetricCard
                    label="Success Rate"
                    value={formatPercent(stats.successRate)}
                    icon="check"
                  />
                  <MetricCard
                    label="Avg Latency"
                    value={formatMs(stats.avgLatencyMs)}
                    icon="clock"
                  />
                  <MetricCard
                    label="Total Executions"
                    value={stats.totalExecutions}
                    icon="barChart"
                  />
                </div>

                <Card variant="elevated" padding="none">
                  <CardHeader className="px-5 py-4">
                    <SectionTitle>Execution Latency Trend</SectionTitle>
                  </CardHeader>
                  <CardContent className="px-5 py-4">
                    {stats.executionsByDay.length === 0 ? (
                      <EmptyState
                        icon="bar-chart"
                        title="No latency data"
                        description="Latency metrics will appear once agents begin executing tasks."
                        action={
                          <Button variant="secondary" iconLeft="robot" size="sm" onClick={() => { router.push("/agents"); }}>View Agents</Button>
                        }
                      />
                    ) : (
                      <Sparkline
                        data={stats.executionsByDay}
                        height={280}
                        color="var(--color-warning)"
                      />
                    )}
                  </CardContent>
                </Card>

                <Card variant="elevated" padding="none">
                  <CardHeader className="px-5 py-4">
                    <SectionTitle>Executions by Day</SectionTitle>
                  </CardHeader>
                  <CardContent className="px-5 py-4">
                    {stats.executionsByDay.length === 0 ? (
                      <EmptyState
                        icon="bar-chart"
                        title="No daily execution data"
                        description="Daily execution statistics will appear once tasks are processed."
                        action={
                          <Button variant="secondary" iconLeft="robot" size="sm" onClick={() => { router.push("/agents"); }}>View Agents</Button>
                        }
                      />
                    ) : (
                      <BarChartWidget
                        data={toBarData(stats.executionsByDay)}
                        height={280}
                      />
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "distribution" && (
              <div className="space-y-6">
                <div className="grid gap-4 lg:grid-cols-2">
                  <Card variant="elevated" padding="none">
                    <CardHeader className="px-5 py-4">
                      <SectionTitle>Agents by Status</SectionTitle>
                    </CardHeader>
                    <CardContent className="px-5 py-4">
                      {statusDistribution.length === 0 ? (
                        <EmptyState
                          icon="pie-chart"
                          title="No status distribution"
                          description="Status distribution will appear once agents are deployed."
                          action={
                            <Button variant="secondary" iconLeft="robot" size="sm" onClick={() => { router.push("/agents"); }}>View Agents</Button>
                          }
                        />
                      ) : (
                        <PieChartWidget
                          data={toPieData(statusDistribution)}
                          height={280}
                        />
                      )}
                    </CardContent>
                  </Card>
                  <Card variant="elevated" padding="none">
                    <CardHeader className="px-5 py-4">
                      <SectionTitle>Agents by Model</SectionTitle>
                    </CardHeader>
                    <CardContent className="px-5 py-4">
                      {stats.agentsByModel.length === 0 ? (
                        <EmptyState
                          icon="pie-chart"
                          title="No model distribution"
                          description="Model distribution will appear once agents are deployed."
                          action={
                            <Button variant="secondary" iconLeft="robot" size="sm" onClick={() => { router.push("/agents"); }}>View Agents</Button>
                          }
                        />
                      ) : (
                        <PieChartWidget
                          data={toPieData(stats.agentsByModel)}
                          height={280}
                        />
                      )}
                    </CardContent>
                  </Card>
                </div>

                <Card variant="elevated" padding="none">
                  <CardHeader className="px-5 py-4">
                    <SectionTitle>Status Breakdown</SectionTitle>
                  </CardHeader>
                  <CardContent className="px-5 py-4">
                    {statusDistribution.length === 0 ? (
                      <EmptyState
                        icon="bar-chart"
                        title="No status data"
                        description="Status breakdown will appear once agents are deployed."
                        action={
                          <Button variant="secondary" iconLeft="robot" size="sm" onClick={() => { router.push("/agents"); }}>View Agents</Button>
                        }
                      />
                    ) : (
                      <BarChartWidget
                        data={toBarData(statusDistribution.map((item) => ({ ...item, label: item.name })))}
                        height={280}
                      />
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}

        {!hasPermission("view:agents") && (
          <div className="surface-card p-6 text-center text-sm text-text-secondary">
            You do not have permission to view agent analytics.
          </div>
        )}
      </div>
    </EnterpriseShell>
  );
}

export default function AnalyticsPage() {
  return (
    <RequireAuth>
      <AnalyticsContent />
    </RequireAuth>
  );
}
