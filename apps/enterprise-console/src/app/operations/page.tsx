"use client";

import { useEffect, useState, useCallback } from "react";
import { RequireAuth } from "@eaip/auth";
import {
  EnterpriseShell,
  ErrorState,
  StatCard,
  Card,
  CardHeader,
  CardContent,
} from "@eaip/ui-enterprise";
import { Badge, EmptyState } from "@eaip/ui-primitives";
import { EnterpriseIcon } from "@eaip/icons";
import {
  fetchOperationsAnalytics,
  fetchOperationsFailures,
  fetchOperationsHealth,
} from "../../services/operations-service";
import type {
  OperationsAnalyticsData,
  OperationsFailure,
  OperationsHealthData,
  HealthService,
} from "../../services/operations-service";
import { useFallback } from "../../services/fallback-context";

type OperationsTab = "overview" | "agents" | "workflows" | "health" | "events" | "failures";

function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const diff = Date.now() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${String(seconds)}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${String(minutes)}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${String(hours)}h ago`;
  const days = Math.floor(hours / 24);
  return `${String(days)}d ago`;
}

const statusColors: Record<string, string> = {
  healthy: "bg-success",
  degraded: "bg-warning",
  down: "bg-danger",
  success: "bg-success",
  error: "bg-danger",
  warning: "bg-warning",
  info: "bg-primary",
};

const statusBadgeVariant: Record<string, "success" | "warning" | "danger" | "primary" | "default"> = {
  healthy: "success",
  degraded: "warning",
  down: "danger",
  success: "success",
  error: "danger",
  warning: "warning",
  info: "primary",
};

function StatusIndicator({ status }: { status: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs">
      <span className={`h-2 w-2 rounded-full ${statusColors[status] ?? "bg-surface-tertiary"}`} />
      <span className="text-text-secondary capitalize">{status}</span>
    </span>
  );
}

function SuccessRate({ rate }: { rate: number }) {
  const color = rate >= 95 ? "text-success" : rate >= 80 ? "text-warning" : "text-danger";
  return <span className={`text-sm font-semibold ${color}`}>{rate.toFixed(1)}%</span>;
}

function OverviewSection({ data }: { data: OperationsAnalyticsData }) {
  const { overview, agents, workflows, health } = data;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Operations"
          value={overview.totalOperations}
          icon={<EnterpriseIcon name="activity" size={18} />}
        />
        <StatCard
          label="Success Rate"
          value={`${overview.successRate.toFixed(1)}%`}
          icon={<EnterpriseIcon name="checkCircle" size={18} />}
        />
        <StatCard
          label="Active Operations"
          value={overview.activeOperations}
          icon={<EnterpriseIcon name="bolt" size={18} />}
        />
        <StatCard
          label="Uptime"
          value={overview.uptime}
          icon={<EnterpriseIcon name="clock" size={18} />}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text">Agents</h3>
              <StatusIndicator status={agents.error > 0 ? "degraded" : "healthy"} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-2xl font-bold text-text">{String(agents.total)}</p>
                <p className="text-xs text-text-muted">Total</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-success">{String(agents.running)}</p>
                <p className="text-xs text-text-muted">Running</p>
              </div>
              <div>
                <p className="text-lg font-bold text-text">{String(agents.totalExecutions)}</p>
                <p className="text-xs text-text-muted">Executions</p>
              </div>
              <div>
                <SuccessRate rate={agents.successRate} />
                <p className="text-xs text-text-muted">Success Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text">Workflows</h3>
              <StatusIndicator status={workflows.failedExecutions > 0 ? "degraded" : "healthy"} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-2xl font-bold text-text">{String(workflows.total)}</p>
                <p className="text-xs text-text-muted">Total</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-success">{String(workflows.active)}</p>
                <p className="text-xs text-text-muted">Active</p>
              </div>
              <div>
                <p className="text-lg font-bold text-text">{String(workflows.totalExecutions)}</p>
                <p className="text-xs text-text-muted">Executions</p>
              </div>
              <div>
                <SuccessRate rate={workflows.successRate} />
                <p className="text-xs text-text-muted">Success Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text">System Health</h3>
              <StatusIndicator status={health.overall} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-2xl font-bold text-success">{String(health.healthy)}</p>
                <p className="text-xs text-text-muted">Healthy</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-warning">{String(health.degraded)}</p>
                <p className="text-xs text-text-muted">Degraded</p>
              </div>
              <div>
                <p className="text-lg font-bold text-danger">{String(health.down)}</p>
                <p className="text-xs text-text-muted">Down</p>
              </div>
              <div>
                <p className="text-lg font-bold text-text">{String(health.totalServices)}</p>
                <p className="text-xs text-text-muted">Total Services</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AgentsSection({ data: agents }: { data: OperationsAnalyticsData["agents"] }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Agents" value={agents.total} icon={<EnterpriseIcon name="robot" size={18} />} />
        <StatCard label="Running" value={agents.running} icon={<EnterpriseIcon name="bolt" size={18} />} />
        <StatCard label="Executions" value={agents.totalExecutions} icon={<EnterpriseIcon name="activity" size={18} />} />
        <StatCard label="Success Rate" value={`${agents.successRate.toFixed(1)}%`} icon={<EnterpriseIcon name="checkCircle" size={18} />} />
      </div>
      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold text-text">Agent Status Distribution</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-success">{String(agents.running)}</p>
              <p className="text-xs text-text-muted">Running</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-text-secondary">{String(agents.idle)}</p>
              <p className="text-xs text-text-muted">Idle</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-warning">{String(agents.paused)}</p>
              <p className="text-xs text-text-muted">Paused</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-danger">{String(agents.error)}</p>
              <p className="text-xs text-text-muted">Error</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent>
            <div className="text-center">
              <p className="text-3xl font-bold text-text">{String(agents.executionsToday)}</p>
              <p className="text-sm text-text-muted">Executions Today</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="text-center">
              <p className="text-3xl font-bold text-text">{agents.avgLatencyMs.toFixed(0)}ms</p>
              <p className="text-sm text-text-muted">Avg Latency</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function WorkflowsSection({ data: workflows }: { data: OperationsAnalyticsData["workflows"] }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Workflows" value={workflows.total} icon={<EnterpriseIcon name="workflow" size={18} />} />
        <StatCard label="Active" value={workflows.active} icon={<EnterpriseIcon name="bolt" size={18} />} />
        <StatCard label="Executions" value={workflows.totalExecutions} icon={<EnterpriseIcon name="activity" size={18} />} />
        <StatCard label="Success Rate" value={`${workflows.successRate.toFixed(1)}%`} icon={<EnterpriseIcon name="checkCircle" size={18} />} />
      </div>
      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold text-text">Workflow Status Distribution</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-success">{String(workflows.active)}</p>
              <p className="text-xs text-text-muted">Active</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-warning">{String(workflows.paused)}</p>
              <p className="text-xs text-text-muted">Paused</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-text-secondary">{String(workflows.draft)}</p>
              <p className="text-xs text-text-muted">Draft</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-text">{String(workflows.totalExecutions)}</p>
              <p className="text-xs text-text-muted">Executions</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent>
            <div className="text-center">
              <p className="text-3xl font-bold text-text">{String(workflows.executionsToday)}</p>
              <p className="text-sm text-text-muted">Executions Today</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="text-center">
              <p className="text-3xl font-bold text-text">{workflows.avgDurationMs.toFixed(0)}ms</p>
              <p className="text-sm text-text-muted">Avg Duration</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function HealthSection({ healthData }: { healthData: OperationsHealthData | null }) {
  if (!healthData) return null;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Services" value={healthData.summary.total} icon={<EnterpriseIcon name="layers" size={18} />} />
        <StatCard label="Healthy" value={healthData.summary.healthy} icon={<EnterpriseIcon name="checkCircle" size={18} />} />
        <StatCard label="Degraded" value={healthData.summary.degraded} icon={<EnterpriseIcon name="alert" size={18} />} />
        <StatCard label="Down" value={healthData.summary.down} icon={<EnterpriseIcon name="x" size={18} />} />
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text">Service Status</h3>
            <StatusIndicator status={healthData.overall} />
          </div>
        </CardHeader>
        <CardContent>
          {healthData.services.length === 0 ? (
            <EmptyState icon="layers" title="No services" description="No health data available." />
          ) : (
            <div className="divide-y divide-border">
              {healthData.services.map((service: HealthService) => (
                <div key={service.name} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <EnterpriseIcon name="settings" size={16} className="text-text-muted" />
                    <div>
                      <p className="text-sm font-medium text-text">{service.name}</p>
                      {service.message && <p className="text-xs text-text-muted">{service.message}</p>}
                    </div>
                  </div>
                  <Badge variant={statusBadgeVariant[service.status] ?? "default"}>
                    {service.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function EventsSection({ events }: { events: OperationsAnalyticsData["events"] }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text">Recent Events</h3>
            <span className="text-xs text-text-muted">{String(events.total)} total</span>
          </div>
        </CardHeader>
        <CardContent>
          {events.recent.length === 0 ? (
            <EmptyState icon="activity" title="No events" description="No recent events recorded." />
          ) : (
            <div className="divide-y divide-border">
              {events.recent.map((event) => (
                <div key={event.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${statusColors[event.type] ?? "bg-surface-tertiary"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text">{event.title}</p>
                    {event.description && <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{event.description}</p>}
                    <p className="text-[10px] text-text-muted mt-1">{formatRelativeTime(event.timestamp)}</p>
                  </div>
                  <Badge variant="glass" className="text-[10px] shrink-0">{event.type}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function FailuresSection({ failures, loading }: { failures: OperationsFailure[]; loading: boolean }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text">Recent Failures</h3>
            <span className="text-xs text-text-muted">{String(failures.length)} failures</span>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-16 rounded-card" />
              ))}
            </div>
          ) : failures.length === 0 ? (
            <EmptyState icon="checkCircle" title="No failures" description="No recent failures recorded." />
          ) : (
            <div className="divide-y divide-border">
              {failures.map((failure) => (
                <div key={failure.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-danger" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text">{failure.title}</p>
                    {failure.message && <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{failure.message}</p>}
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="danger" className="text-[10px]">{failure.severity}</Badge>
                      {failure.source && <span className="text-[10px] text-text-muted">{failure.source}</span>}
                      <span className="text-[10px] text-text-muted">{formatRelativeTime(failure.timestamp)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function OperationsContent() {
  const { setFallback } = useFallback();
  const [activeTab, setActiveTab] = useState<OperationsTab>("overview");
  const [analytics, setAnalytics] = useState<OperationsAnalyticsData | null>(null);
  const [failures, setFailures] = useState<OperationsFailure[]>([]);
  const [healthData, setHealthData] = useState<OperationsHealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [analyticsResult, failuresResult, healthResult] = await Promise.all([
        fetchOperationsAnalytics(),
        fetchOperationsFailures(),
        fetchOperationsHealth(),
      ]);
      setFallback("operations", analyticsResult.source === "fallback");
      setAnalytics(analyticsResult.data);
      setFailures(failuresResult.data);
      setHealthData(healthResult.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [setFallback]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const tabs: { id: OperationsTab; label: string; icon: string }[] = [
    { id: "overview", label: "Overview", icon: "home" },
    { id: "agents", label: "Agents", icon: "robot" },
    { id: "workflows", label: "Workflows", icon: "workflow" },
    { id: "health", label: "Health", icon: "activity" },
    { id: "events", label: "Events", icon: "history" },
    { id: "failures", label: "Failures", icon: "alert" },
  ];

  return (
    <EnterpriseShell
      appId="enterprise-console"
      pageTitle="Operations Analytics"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Operations" }]}
    >
      <div className="space-y-6">
        <section className="surface-hero relative overflow-hidden p-8 lg:p-10">
          <div className="relative">
            <div className="mb-4 flex items-center gap-2 text-xs font-semibold tracking-widest text-primary uppercase">
              <EnterpriseIcon name="activity" size={14} />
              Operations Analytics
            </div>
            <h1 className="text-3xl font-bold text-text tracking-tight">Operations</h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-text-secondary">
              Monitor system health, agent executions, workflow activity, and operational
              failures across your EAIP platform.
            </p>
            {analytics && (
              <div className="mt-4">
                <StatusIndicator status={analytics.overview.overallStatus} />
              </div>
            )}
          </div>
        </section>

        <div className="scrollbar-thin flex items-center gap-1 overflow-x-auto rounded-lg border border-border bg-surface p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => { setActiveTab(tab.id); }}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-primary text-text-inverse"
                  : "text-text-secondary hover:bg-surface-tertiary"
              }`}
            >
              <EnterpriseIcon name={tab.icon as never} size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <ErrorState
            title="Could not load operations data"
            message={error}
            onRetry={() => { void loadData(); }}
          />
        )}

        {loading && !analytics ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton h-24 rounded-card" />
            ))}
          </div>
        ) : analytics ? (
          <>
            {activeTab === "overview" && <OverviewSection data={analytics} />}
            {activeTab === "agents" && <AgentsSection data={analytics.agents} />}
            {activeTab === "workflows" && <WorkflowsSection data={analytics.workflows} />}
            {activeTab === "health" && <HealthSection healthData={healthData} />}
            {activeTab === "events" && <EventsSection events={analytics.events} />}
            {activeTab === "failures" && <FailuresSection failures={failures} loading={loading} />}
          </>
        ) : null}
      </div>
    </EnterpriseShell>
  );
}

export default function OperationsPage() {
  return (
    <RequireAuth>
      <OperationsContent />
    </RequireAuth>
  );
}
