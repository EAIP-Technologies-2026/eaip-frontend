"use client";

import { useEffect, useState } from "react";
import { RequireAuth } from "@eaip/auth";
import { EnterpriseShell, LoadingState, ErrorState } from "@eaip/ui-enterprise";
import { Card, CardHeader, CardContent } from "@eaip/ui-foundation";
import { Badge, SectionTitle, ProgressBar } from "@eaip/ui-primitives";
import { StatusWidget, StatusRing } from "@eaip/ui-visualizations";
import { EnterpriseIcon } from "@eaip/icons";
import { fetchSystemHealth, fetchAdminHealth } from "../../services/health-service";
import type { SystemHealth } from "../../services/health-service";
import { useFallback } from "../../services/fallback-context";

function AdminHealthPanel() {
  const [adminData, setAdminData] = useState<any>(null);

  useEffect(() => {
    fetchAdminHealth().then(res => {
      if (res.source === "live") setAdminData(res.data);
    }).catch(console.error);
  }, []);

  if (!adminData) return null;

  return (
    <Card className="mt-8 border-primary/20">
      <CardHeader>
        <SectionTitle>Platform Operations & Diagnostics (Admin)</SectionTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="p-4 rounded-lg bg-surface-raised border border-border">
            <div className="text-xs text-text-secondary uppercase tracking-wider mb-1">Operations Status</div>
            <div className="text-xl font-bold text-primary">{adminData.operations_status || "unknown"}</div>
          </div>
          <div className="p-4 rounded-lg bg-surface-raised border border-border">
            <div className="text-xs text-text-secondary uppercase tracking-wider mb-1">Dependency Nodes</div>
            <div className="text-xl font-bold">{adminData.dependencies?.length || 0}</div>
          </div>
          <div className="p-4 rounded-lg bg-surface-raised border border-border">
            <div className="text-xs text-text-secondary uppercase tracking-wider mb-1">Total Components</div>
            <div className="text-xl font-bold">{adminData.components?.length || 0}</div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-3">Dependency Graph Visualization</h4>
          <div className="h-48 bg-black/90 rounded-lg p-4 font-mono text-xs overflow-auto text-green-400">
            {adminData.dependencies && adminData.dependencies.length > 0 ? (
              adminData.dependencies.map((dep: any, i: number) => (
                <div key={i}>[{dep.component}] {dep.type === "core" ? "(CORE)" : "(EXT)"} - status: {dep.status || "healthy"}</div>
              ))
            ) : (
              <div className="text-gray-500">No dependencies registered in aggregator.</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function HealthContent() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setFallback } = useFallback();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchSystemHealth();
        if (cancelled) return;
        setFallback("health", result.source === "fallback");
        setHealth(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load health data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [setFallback]);

  return (
    <EnterpriseShell
      appId="enterprise-console"
      pageTitle="System Health"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "System Health" }]}
    >
      {loading ? (
        <LoadingState message="Loading system health..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => { window.location.reload(); }} />
      ) : health ? (
        <div className="space-y-8">
          <section className="surface-hero relative overflow-hidden p-8 lg:p-10">
            <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br from-primary-subtle/50 to-transparent blur-3xl" aria-hidden="true" />
            <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-gradient-to-tr from-accent-glow/30 to-transparent blur-2xl" aria-hidden="true" />
            <div className="relative">
              <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-primary uppercase mb-4">
                <EnterpriseIcon name="activity" size={14} />
                System Health
              </div>
              <h1 className="text-3xl font-bold text-text tracking-tight">System Health</h1>
              <p className="mt-3 text-base text-text-secondary max-w-2xl leading-relaxed">Monitor service status, uptime, and resource utilization across your enterprise platform.</p>
            </div>
          </section>
          <StatusWidget
            title="Overall System Status"
            status={health.overall === "healthy" ? "success" : health.overall === "degraded" ? "warning" : "error"}
            description={`Uptime: ${health.uptime}`}
            metrics={[{ label: "Status", value: health.overall === "healthy" ? "All Systems Operational" : health.overall === "degraded" ? "Degraded Performance" : "Service Disruption" }]}
          />

          <Card>
            <CardHeader>
              <SectionTitle>Services</SectionTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                {health.services.map((service) => (
                  <div key={service.name} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <StatusRing
                        status={service.status === "healthy" ? "success" : service.status === "degraded" ? "warning" : "error"}
                        size="sm"
                      />
                      <div>
                        <span className="text-sm font-medium text-text">{service.name}</span>
                        {service.message && (
                          <p className="text-xs text-text-muted">{service.message}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-text-secondary">
                      <span>{service.uptime}</span>
                      <span>{service.latency}</span>
                      <Badge variant={service.status === "healthy" ? "success" : service.status === "degraded" ? "warning" : "danger"}>
                        {service.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <SectionTitle>System Metrics</SectionTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {health.metrics.map((metric) => (
                  <div key={metric.label} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-text-secondary">{metric.label}</span>
                      <span className="text-sm font-medium text-text">{metric.value}{metric.unit}</span>
                    </div>
                    <ProgressBar
                      value={metric.value}
                      max={metric.threshold * 1.25}
                      variant={metric.status === "healthy" ? "success" : "warning"}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <AdminHealthPanel />
        </div>
      ) : null}
    </EnterpriseShell>
  );
}

export default function HealthPage() {
  return (
    <RequireAuth>
      <HealthContent />
    </RequireAuth>
  );
}
