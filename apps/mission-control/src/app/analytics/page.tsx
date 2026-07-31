"use client";

import { useEffect, useState, useMemo } from "react";
import { RequireAuth } from "@eaip/auth";
import { usePlatformStore } from "@eaip/state";
import { EnterpriseShell, LoadingState, ErrorState } from "@eaip/ui-enterprise";
import { Card, CardHeader, CardContent, Tabs } from "@eaip/ui-foundation";
import { SectionTitle } from "@eaip/ui-primitives";
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
import { fetchWorkflowStats, fetchMissionStats, fetchRuntimeMetrics } from "../../services/analytics-service";
import { fetchMissions } from "../../services/missions-service";
import type { WorkflowStats, MissionStats, RuntimeMetrics } from "../../services/analytics-service";

function toBarData(data: { label: string; value: number }[]) {
  return data.map((item) => ({ name: item.label, value: item.value }));
}

function AnalyticsContent() {
  const hasPermission = usePlatformStore((state) => state.hasPermission);
  const [workflowStats, setWorkflowStats] = useState<WorkflowStats>(
    { totalWorkflows: 0, activeRuns: 0, completedRuns: 0, failedRuns: 0, avgDurationMs: 0, runsByDay: [], runsByStatus: [] },
  );
  const [missionStats, setMissionStats] = useState<MissionStats>(
    { totalMissions: 0, activeMissions: 0, completedMissions: 0, successRate: 0, missionsByDay: [], missionsByStatus: [] },
  );
  const [runtimeMetrics, setRuntimeMetrics] = useState<RuntimeMetrics>(
    { activeWorkers: 0, queueDepth: 0, cpuUsage: 0, memoryUsage: 0, healthy: true, throughputPerMinute: 0, latencyP95Ms: 0 },
  );
  const [missions, setMissions] = useState<{ id: string; name: string; status: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    let cancelled = false;

    async function loadAnalytics() {
      setLoading(true);
      setError(null);
      try {
        const [
          missionsResult,
          workflowStatsResult,
          missionStatsResult,
          runtimeResult,
        ] = await Promise.all([
          fetchMissions(),
          fetchWorkflowStats(),
          fetchMissionStats(),
          fetchRuntimeMetrics(),
        ]);
        if (cancelled) return;
        if (missionsResult.error) throw new Error(missionsResult.error);
        if (workflowStatsResult.error) throw new Error(workflowStatsResult.error);
        if (missionStatsResult.error) throw new Error(missionStatsResult.error);
        if (runtimeResult.error) throw new Error(runtimeResult.error);

        setMissions(missionsResult.data.map((m) => ({ id: m.id, name: m.name, status: m.status })));
        setWorkflowStats(workflowStatsResult.data);
        setMissionStats(missionStatsResult.data);
        setRuntimeMetrics(runtimeResult.data);
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

  const combinedStatusDistribution = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of workflowStats.runsByStatus) {
      map.set(item.name, (map.get(item.name) ?? 0) + item.value);
    }
    for (const item of missionStats.missionsByStatus) {
      map.set(item.name, (map.get(item.name) ?? 0) + item.value);
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [workflowStats.runsByStatus, missionStats.missionsByStatus]);

  const healthStatus: TimelineItem["status"] = runtimeMetrics.healthy
    ? "success"
    : "error";

  return (
    <EnterpriseShell
      appId="mission-control"
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
            <p className="mt-3 text-base text-text-secondary max-w-2xl leading-relaxed">Performance, usage, and health metrics for your workflows and missions.</p>
          </div>
        </section>

        <Tabs
          tabs={[
            { id: "overview", label: "Overview", icon: "layoutDashboard" },
            { id: "workflows", label: "Workflows", icon: "workflow" },
            { id: "missions", label: "Missions", icon: "rocket" },
            { id: "runtime", label: "Runtime", icon: "cpu" },
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
                    label="Workflows"
                    value={workflowStats.totalWorkflows}
                    icon="refresh"
                  />
                  <MetricCard
                    label="Active Runs"
                    value={workflowStats.activeRuns}
                    icon="play"
                  />
                  <MetricCard
                    label="Missions"
                    value={missionStats.totalMissions}
                    icon="rocket"
                  />
                  <MetricCard
                    label="Mission Success"
                    value={String(Math.round(missionStats.successRate * 100)) + "%"}
                    icon="checkCircle"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <StatusWidget
                    title="Runtime Health"
                    status={healthStatus}
                    value={runtimeMetrics.healthy ? "Healthy" : "Degraded"}
                    subtitle={
                      String(runtimeMetrics.activeWorkers) +
                      " workers • " +
                      String(runtimeMetrics.queueDepth) +
                      " queued"
                    }
                  />
                  <StatusWidget
                    title="Combined Runs"
                    status={
                      workflowStats.activeRuns > 0 ? "running" : "idle"
                    }
                    value={String(
                      workflowStats.activeRuns + missionStats.activeMissions,
                    )}
                    subtitle="Active workflows and missions"
                  />
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <SectionTitle>Runs Trend</SectionTitle>
                    </CardHeader>
                    <CardContent>
                      <Sparkline
                        data={workflowStats.runsByDay}
                        height={200}
                      />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <SectionTitle>Combined Status</SectionTitle>
                    </CardHeader>
                    <CardContent>
                      <PieChartWidget
                        data={combinedStatusDistribution}
                        height={200}
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === "workflows" && (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <MetricCard
                    label="Total Workflows"
                    value={workflowStats.totalWorkflows}
                    icon="refresh"
                  />
                  <MetricCard
                    label="Active Runs"
                    value={workflowStats.activeRuns}
                    icon="play"
                  />
                  <MetricCard
                    label="Completed Runs"
                    value={workflowStats.completedRuns}
                    icon="check"
                  />
                  <MetricCard
                    label="Avg Duration"
                    value={String(Math.round(workflowStats.avgDurationMs)) + "ms"}
                    icon="clock"
                  />
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <SectionTitle>Runs by Day</SectionTitle>
                    </CardHeader>
                    <CardContent>
                      <BarChartWidget
                        data={toBarData(workflowStats.runsByDay)}
                        height={240}
                      />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <SectionTitle>Runs by Status</SectionTitle>
                    </CardHeader>
                    <CardContent>
                      <PieChartWidget
                        data={workflowStats.runsByStatus}
                        height={240}
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === "missions" && (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <MetricCard
                    label="Total Missions"
                    value={missionStats.totalMissions}
                    icon="rocket"
                  />
                  <MetricCard
                    label="Active Missions"
                    value={missionStats.activeMissions}
                    icon="play"
                  />
                  <MetricCard
                    label="Completed"
                    value={missionStats.completedMissions}
                    icon="check"
                  />
                  <MetricCard
                    label="Success Rate"
                    value={String(Math.round(missionStats.successRate * 100)) + "%"}
                    icon="checkCircle"
                  />
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <SectionTitle>Missions by Day</SectionTitle>
                    </CardHeader>
                    <CardContent>
                      <BarChartWidget
                        data={toBarData(missionStats.missionsByDay)}
                        height={240}
                      />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <SectionTitle>Missions by Status</SectionTitle>
                    </CardHeader>
                    <CardContent>
                      <PieChartWidget
                        data={missionStats.missionsByStatus}
                        height={240}
                      />
                    </CardContent>
                  </Card>
                </div>

                {missions.length > 0 && (
                  <Card>
                    <CardHeader>
                      <SectionTitle>Mission Metrics</SectionTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {missions.slice(0, 3).map((mission) => (
                          <div
                            key={mission.id}
                            className="surface-card flex items-center justify-between p-4"
                          >
                            <div>
                              <p className="font-medium text-text">
                                {mission.name}
                              </p>
                              <p className="text-xs text-text-secondary">
                                {mission.status || "unknown"}
                              </p>
                            </div>
                            <pre className="text-xs text-text-secondary">
                              {JSON.stringify({}, null, 2)}
                            </pre>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {activeTab === "runtime" && (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <MetricCard
                    label="Workers"
                    value={runtimeMetrics.activeWorkers}
                    icon="cpu"
                  />
                  <MetricCard
                    label="Queue Depth"
                    value={runtimeMetrics.queueDepth}
                    icon="archive"
                  />
                  <MetricCard
                    label="Throughput"
                    value={String(runtimeMetrics.throughputPerMinute) + "/min"}
                    icon="zap"
                  />
                  <MetricCard
                    label="Latency P95"
                    value={String(Math.round(runtimeMetrics.latencyP95Ms)) + "ms"}
                    icon="clock"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <StatusWidget
                    title="CPU Usage"
                    status={
                      runtimeMetrics.cpuUsage > 80
                        ? "warning"
                        : runtimeMetrics.cpuUsage > 95
                          ? "error"
                          : "success"
                    }
                    value={String(Math.round(runtimeMetrics.cpuUsage)) + "%"}
                    subtitle="Average CPU utilization"
                  />
                  <StatusWidget
                    title="Memory Usage"
                    status={
                      runtimeMetrics.memoryUsage > 80
                        ? "warning"
                        : runtimeMetrics.memoryUsage > 95
                          ? "error"
                          : "success"
                    }
                    value={String(Math.round(runtimeMetrics.memoryUsage)) + "%"}
                    subtitle="Average memory utilization"
                  />
                </div>

                <Card>
                  <CardHeader>
                    <SectionTitle>Throughput Trend</SectionTitle>
                  </CardHeader>
                  <CardContent>
                    <Sparkline
                      data={workflowStats.runsByDay}
                      height={240}
                      color="var(--color-success)"
                    />
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}

        {!hasPermission("view:workflows") && (
          <div className="surface-card p-6 text-center text-sm text-text-secondary">
            You do not have permission to view workflow analytics.
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
