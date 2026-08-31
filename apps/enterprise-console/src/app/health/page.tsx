"use client";

import { useEffect, useState } from "react";
import { RequireAuth } from "@eaip/auth";
import { EnterpriseShell, LoadingState, ErrorState } from "@eaip/ui-enterprise";
import { Card, CardHeader, CardContent } from "@eaip/ui-foundation";
import { Badge, SectionTitle, ProgressBar } from "@eaip/ui-primitives";
import { StatusWidget, StatusRing } from "@eaip/ui-visualizations";
import { EnterpriseIcon } from "@eaip/icons";
import { fetchSystemHealth, fetchAdminHealth } from "../../services/health-service";
import { getDefaultClient } from "@eaip/api";
import type { SystemHealth, AdminHealth, HealthDependency } from "../../services/health-service";
import { useFallback } from "../../services/fallback-context";

function AdminHealthPanel() {
  const [adminData, setAdminData] = useState<AdminHealth | null>(null);

  useEffect(() => {
    fetchAdminHealth()
      .then((res) => {
        if (res.source === "live") setAdminData(res.data);
      })
      .catch(console.error);
  }, []);

  if (!adminData) return null;

  return (
    <Card className="border-primary/20 mt-8">
      <CardHeader>
        <SectionTitle>Platform Operations & Diagnostics (Admin)</SectionTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="bg-surface-raised border-border rounded-lg border p-4">
            <div className="text-text-secondary mb-1 text-xs tracking-wider uppercase">
              Operations Status
            </div>
            <div className="text-primary text-xl font-bold">
              {adminData.operations_status || "unknown"}
            </div>
          </div>
          <div className="bg-surface-raised border-border rounded-lg border p-4">
            <div className="text-text-secondary mb-1 text-xs tracking-wider uppercase">
              Dependency Nodes
            </div>
            <div className="text-xl font-bold">{adminData.dependencies.length || 0}</div>
          </div>
          <div className="bg-surface-raised border-border rounded-lg border p-4">
            <div className="text-text-secondary mb-1 text-xs tracking-wider uppercase">
              Total Components
            </div>
            <div className="text-xl font-bold">{adminData.components.length || 0}</div>
          </div>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold">Dependency Graph Visualization</h4>
          <div className="h-48 overflow-auto rounded-lg bg-black/90 p-4 font-mono text-xs text-green-400">
            {adminData.dependencies.length > 0 ? (
              adminData.dependencies.map((dep: HealthDependency, i: number) => (
                <div key={i}>
                  [{dep.component}] {dep.type === "core" ? "(CORE)" : "(EXT)"} - status:{" "}
                  {dep.status || "healthy"}
                </div>
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

function HealthCenterPanel() {
  const [center, setCenter] = useState<{
    overall: string;
    checks: { component: string; status: string }[];
  } | null>(null);
  const [incidents, setIncidents] = useState<
    { incident_id: string; severity: string; title: string; status: string }[]
  >([]);
  useEffect(() => {
    void getDefaultClient()
      .get("/health-center/health")
      .then((r: unknown) => {
        const data = (r as { data?: unknown }).data ?? r;
        if (data)
          setCenter(data as { overall: string; checks: { component: string; status: string }[] });
      })
      .catch(() => {});
    void getDefaultClient()
      .get("/health-center/incidents")
      .then((r: unknown) => {
        const data = (r as { data?: unknown }).data ?? r;
        if (Array.isArray(data)) setIncidents(data as typeof incidents);
      })
      .catch(() => {});
  }, []);
  if (!center && incidents.length === 0) return null;
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <SectionTitle>Health Center (tenant-filtered)</SectionTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {center ? (
              <>
                <p className="text-text text-sm">
                  Overall: <Badge variant="default">{center.overall}</Badge>
                </p>
                <div className="space-y-1">
                  {center.checks.slice(0, 10).map((c) => (
                    <div
                      key={c.component}
                      className="border-border flex items-center justify-between rounded border px-3 py-1 text-xs"
                    >
                      <span>{c.component}</span>
                      <Badge variant="default">{c.status}</Badge>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-text-muted text-sm">No center data</p>
            )}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <SectionTitle>Incidents</SectionTitle>
        </CardHeader>
        <CardContent>
          {incidents.length === 0 ? (
            <p className="text-text-muted text-sm">No incidents</p>
          ) : (
            <div className="space-y-1">
              {incidents.map((i) => (
                <div
                  key={i.incident_id}
                  className="border-border flex items-center justify-between rounded border px-3 py-1 text-xs"
                >
                  <span>{i.title}</span>
                  <Badge variant="default">
                    {i.severity} · {i.status}
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
    return () => {
      cancelled = true;
    };
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
        <ErrorState
          message={error}
          onRetry={() => {
            window.location.reload();
          }}
        />
      ) : health ? (
        <div className="space-y-8">
          <section className="surface-hero relative overflow-hidden p-8 lg:p-10">
            <div
              className="from-primary-subtle/50 absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br to-transparent blur-3xl"
              aria-hidden="true"
            />
            <div
              className="from-accent-glow/30 absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-gradient-to-tr to-transparent blur-2xl"
              aria-hidden="true"
            />
            <div className="relative">
              <div className="text-primary mb-4 flex items-center gap-2 text-xs font-semibold tracking-widest uppercase">
                <EnterpriseIcon name="activity" size={14} />
                System Health
              </div>
              <h1 className="text-text text-3xl font-bold tracking-tight">System Health</h1>
              <p className="text-text-secondary mt-3 max-w-2xl text-base leading-relaxed">
                Monitor service status, uptime, and resource utilization across your enterprise
                platform.
              </p>
            </div>
          </section>
          <StatusWidget
            title="Overall System Status"
            status={
              health.overall === "healthy"
                ? "success"
                : health.overall === "degraded"
                  ? "warning"
                  : "error"
            }
            description={`Uptime: ${health.uptime}`}
            metrics={[
              {
                label: "Status",
                value:
                  health.overall === "healthy"
                    ? "All Systems Operational"
                    : health.overall === "degraded"
                      ? "Degraded Performance"
                      : "Service Disruption",
              },
            ]}
          />

          <Card>
            <CardHeader>
              <SectionTitle>Services</SectionTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-border divide-y">
                {health.services.map((service) => (
                  <div
                    key={service.name}
                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <StatusRing
                        status={
                          service.status === "healthy"
                            ? "success"
                            : service.status === "degraded"
                              ? "warning"
                              : "error"
                        }
                        size="sm"
                      />
                      <div>
                        <span className="text-text text-sm font-medium">{service.name}</span>
                        {service.message && (
                          <p className="text-text-muted text-xs">{service.message}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-text-secondary flex items-center gap-4 text-xs">
                      <span>{service.uptime}</span>
                      <span>{service.latency}</span>
                      <Badge
                        variant={
                          service.status === "healthy"
                            ? "success"
                            : service.status === "degraded"
                              ? "warning"
                              : "danger"
                        }
                      >
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
                      <span className="text-text-secondary text-sm">{metric.label}</span>
                      <span className="text-text text-sm font-medium">
                        {metric.value}
                        {metric.unit}
                      </span>
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

          <HealthCenterPanel />
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
