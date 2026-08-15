"use client";

import { useEffect, useState, useCallback } from "react";
import { RequireAuth } from "@eaip/auth";
import { EnterpriseShell, LoadingState, ErrorState } from "@eaip/ui-enterprise";
import { Card, CardHeader, CardContent } from "@eaip/ui-foundation";
import { Badge, SectionTitle, ProgressBar } from "@eaip/ui-primitives";
import { StatusWidget, StatusRing } from "@eaip/ui-visualizations";
import { EnterpriseIcon } from "@eaip/icons";
import { fetchSystemHealth } from "../../services/health-service";
import type { SystemHealthData } from "../../services/health-service";
import { OperationsToolbar } from "../../components/operations-toolbar";

function HealthContent() {
  const [health, setHealth] = useState<SystemHealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchSystemHealth();
      if (result.error) {
        setError(result.error);
      } else {
        setHealth(result.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load health data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return (
    <EnterpriseShell
      appId="mission-control"
      pageTitle="System Health"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "System Health" }]}
    >
      <div className="space-y-8">
        <section className="surface-hero relative overflow-hidden p-8 lg:p-10">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br from-primary-subtle/50 to-transparent blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-gradient-to-tr from-accent-glow/30 to-transparent blur-2xl" aria-hidden="true" />
          <div className="relative">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-primary uppercase mb-4">
              <EnterpriseIcon name="activity" size={14} />
              Platform Health
            </div>
            <h1 className="text-3xl font-bold text-text tracking-tight">Health</h1>
            <p className="mt-3 text-base text-text-secondary max-w-2xl leading-relaxed">Monitor system health, service status, and operational readiness.</p>
          </div>
        </section>

        {loading ? (
          <LoadingState message="Loading system health..." />
        ) : error ? (
          <ErrorState message={error} onRetry={() => { void load(); }} />
        ) : health ? (
          <div className="space-y-6">
            <OperationsToolbar onRefresh={() => { void load(); }} />

            <StatusWidget
              title="Overall System Status"
              status={health.overall === "healthy" ? "success" : health.overall === "degraded" ? "warning" : "error"}
              value={health.overall === "healthy" ? "All Systems Operational" : health.overall === "degraded" ? "Degraded Performance" : "Service Disruption"}
              subtitle={`Uptime: ${health.uptime}`}
            />

            <Card>
              <CardHeader>
                <SectionTitle>Services</SectionTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {health.services.map((service) => (
                    <div key={service.name} className="rounded-lg border border-border p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <StatusRing status={service.status === "healthy" ? "success" : service.status === "degraded" ? "warning" : "error"} size="sm" />
                          <span className="text-sm font-medium text-text">{service.name}</span>
                        </div>
                        <Badge variant={service.status === "healthy" ? "success" : service.status === "degraded" ? "warning" : "danger"}>{service.status}</Badge>
                      </div>
                      <div className="mt-2 flex justify-between text-xs text-text-secondary">
                        <span>{service.uptime}</span>
                        <span>{service.latency}</span>
                      </div>
                      {service.message ? (
                        <p className="mt-1 text-xs text-text-muted">{service.message}</p>
                      ) : null}
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
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
          </div>
        ) : (
          <div className="text-center py-12 text-text-secondary">
            <p>No health data available.</p>
          </div>
        )}
      </div>
    </EnterpriseShell>
  );
}

export default function HealthPage() {
  return <RequireAuth><HealthContent /></RequireAuth>;
}
