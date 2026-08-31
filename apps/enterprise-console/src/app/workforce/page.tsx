"use client";

import { useState, useEffect, useCallback } from "react";
import { RequireAuth } from "@eaip/auth";
import { EnterpriseShell, LoadingState, ErrorState, SectionHeader } from "@eaip/ui-enterprise";
import { Badge, EmptyState } from "@eaip/ui-primitives";
import { EnterpriseIcon } from "@eaip/icons";
import {
  fetchWorkforceOverview,
  fetchUtilization,
  fetchWorkload,
  fetchCapacity,
  fetchBottlenecks,
  fetchRecommendations,
  type WorkforceOverview,
  type UtilizationPoint,
  type WorkloadEntry,
  type Bottleneck,
  type Recommendation,
  type Capacity,
} from "../../services/workforce-service";
import { useFallback } from "../../services/fallback-context";

function WorkforceContent() {
  const { setFallback } = useFallback();
  const [overview, setOverview] = useState<WorkforceOverview | null>(null);
  const [utilization, setUtilization] = useState<UtilizationPoint[]>([]);
  const [workload, setWorkload] = useState<WorkloadEntry[]>([]);
  const [capacity, setCapacity] = useState<Capacity | null>(null);
  const [bottlenecks, setBottlenecks] = useState<Bottleneck[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ov, util, wl, cap, bn, rec] = await Promise.all([
        fetchWorkforceOverview(),
        fetchUtilization(7),
        fetchWorkload(),
        fetchCapacity(),
        fetchBottlenecks(),
        fetchRecommendations(),
      ]);
      setFallback("workforce", ov.source === "fallback");
      setOverview(ov.data);
      setUtilization(util.data);
      setWorkload(wl.data);
      setCapacity(cap.data);
      setBottlenecks(bn.data);
      setRecommendations(rec.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [setFallback]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading)
    return (
      <EnterpriseShell
        appId="enterprise-console"
        pageTitle="Workforce"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Workforce" }]}
      >
        <LoadingState message="Loading workforce intelligence..." />
      </EnterpriseShell>
    );
  if (error)
    return (
      <EnterpriseShell
        appId="enterprise-console"
        pageTitle="Workforce"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Workforce" }]}
      >
        <ErrorState message={error} onRetry={() => void load()} />
      </EnterpriseShell>
    );

  return (
    <EnterpriseShell
      appId="enterprise-console"
      pageTitle="Workforce"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Workforce" }]}
    >
      <div className="space-y-8">
        <section className="surface-hero relative overflow-hidden p-8 lg:p-10">
          <div
            className="from-primary-subtle/50 absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br to-transparent blur-3xl"
            aria-hidden="true"
          />
          <div className="relative">
            <div className="text-primary mb-4 flex items-center gap-2 text-xs font-semibold tracking-widest uppercase">
              <EnterpriseIcon name="activity" size={14} /> Workforce Intelligence
            </div>
            <h1 className="text-text text-3xl font-bold tracking-tight">Workforce Intelligence</h1>
            <p className="text-text-secondary mt-3 max-w-2xl text-base leading-relaxed">
              Utilization, capacity, bottlenecks, and staffing recommendations grounded in live
              platform data.
            </p>
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-card border-border bg-surface border p-5">
            <p className="text-text-secondary text-xs font-semibold tracking-wider uppercase">
              Utilization
            </p>
            <p className="text-text mt-2 text-2xl font-bold">
              {overview ? `${(overview.utilization * 100).toFixed(1)}%` : "—"}
            </p>
            <p className="text-text-secondary mt-1 text-xs">
              {overview?.active_workers ?? 0} active · {overview?.idle_workers ?? 0} idle
            </p>
          </div>
          <div className="rounded-card border-border bg-surface border p-5">
            <p className="text-text-secondary text-xs font-semibold tracking-wider uppercase">
              Total Workers
            </p>
            <p className="text-text mt-2 text-2xl font-bold">{overview?.total_workers ?? 0}</p>
            <p className="text-text-secondary mt-1 text-xs">
              {overview?.ai_agents ?? 0} AI · {overview?.human_workers ?? 0} human ·{" "}
              {overview?.hybrid_workers ?? 0} hybrid
            </p>
          </div>
          <div className="rounded-card border-border bg-surface border p-5">
            <p className="text-text-secondary text-xs font-semibold tracking-wider uppercase">
              Queue Depth
            </p>
            <p className="text-text mt-2 text-2xl font-bold">{overview?.queue_depth ?? 0}</p>
            <p className="text-text-secondary mt-1 text-xs">
              throughput {overview?.throughput ?? 0}
            </p>
          </div>
          <div className="rounded-card border-border bg-surface border p-5">
            <p className="text-text-secondary text-xs font-semibold tracking-wider uppercase">
              Health
            </p>
            <p className="text-text mt-2 text-2xl font-bold">
              {overview ? `${(overview.completion_rate * 100).toFixed(1)}%` : "—"}{" "}
              <span className="text-text-secondary text-sm font-normal">completion</span>
            </p>
            <p className="text-text-secondary mt-1 text-xs">
              failure {overview ? (overview.failure_rate * 100).toFixed(1) : "0"}% · overloaded{" "}
              {overview?.overloaded_workers ?? 0}
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-card border-border bg-surface border p-5">
            <h3 className="text-text mb-3 flex items-center gap-2 font-semibold">
              <EnterpriseIcon name="chart" size={14} /> Utilization (7d)
            </h3>
            {utilization.length === 0 ? (
              <EmptyState
                icon="chart"
                title="No utilization data"
                description="Data appears after workers handle assignments."
              />
            ) : (
              <div className="space-y-2">
                {utilization.map((p) => (
                  <div key={p.date} className="flex items-center gap-3">
                    <span className="text-text-secondary w-24 text-xs">{p.date}</span>
                    <div className="bg-surface-tertiary h-2 flex-1 overflow-hidden rounded-full">
                      <div
                        className="bg-primary h-full rounded-full"
                        style={{ width: `${String(Math.round(p.utilization * 100))}%` }}
                      />
                    </div>
                    <span className="text-text w-10 text-right text-xs">
                      {(p.utilization * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="rounded-card border-border bg-surface border p-5">
            <SectionHeader icon="activity" title="Capacity" />
            {capacity ? (
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Total capacity</span>
                  <span className="text-text font-medium">{capacity.total_capacity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Used</span>
                  <span className="text-text">{capacity.used_capacity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Available</span>
                  <span className="text-text">{capacity.available_capacity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Demand</span>
                  <span className="text-text">{capacity.demand}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Shortage</span>
                  <Badge variant={capacity.shortage > 0 ? "danger" : "success"}>
                    {capacity.shortage > 0 ? `${String(capacity.shortage)} shortage` : "ok"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Utilization</span>
                  <span className="text-text">{capacity.utilization_pct.toFixed(1)}%</span>
                </div>
              </div>
            ) : (
              <p className="text-text-secondary text-sm">No capacity data</p>
            )}
          </div>
        </div>

        <div className="rounded-card border-border bg-surface border p-5">
          <h3 className="text-text mb-3 font-semibold">Workload Distribution</h3>
          {workload.length === 0 ? (
            <EmptyState
              icon="activity"
              title="No workload data"
              description="Register workers and assign tasks to see distribution."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-text-secondary text-left">
                    <th className="py-2 font-medium">Worker</th>
                    <th className="py-2 font-medium">Load</th>
                    <th className="py-2 font-medium">Utilization</th>
                    <th className="py-2 font-medium">Capacity</th>
                  </tr>
                </thead>
                <tbody>
                  {workload.slice(0, 12).map((w) => (
                    <tr key={w.worker_id} className="border-border border-t">
                      <td className="text-text py-2">{w.name}</td>
                      <td className="text-text-secondary py-2">{w.load}</td>
                      <td className="py-2">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs ${w.utilization_pct > 80 ? "bg-danger/10 text-danger" : w.utilization_pct > 50 ? "bg-warning/10 text-warning" : "bg-success/10 text-success"}`}
                        >
                          {w.utilization_pct.toFixed(1)}%
                        </span>
                      </td>
                      <td className="text-text-secondary py-2">
                        {w.active_count}/{w.max_concurrent}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-card border-border bg-surface border p-5">
            <h3 className="text-text mb-3 flex items-center gap-2 font-semibold">
              <EnterpriseIcon name="alert" size={14} /> Bottlenecks
            </h3>
            {bottlenecks.length === 0 ? (
              <p className="text-text-secondary text-sm">No bottlenecks detected.</p>
            ) : (
              <div className="space-y-3">
                {bottlenecks.map((b, i) => (
                  <div key={i} className="border-border rounded-lg border p-3">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          b.severity === "critical"
                            ? "danger"
                            : b.severity === "high"
                              ? "warning"
                              : "default"
                        }
                      >
                        {b.severity}
                      </Badge>
                      <span className="text-text-secondary text-xs">{b.type}</span>
                    </div>
                    <p className="text-text mt-2 text-sm">{b.description}</p>
                    <p className="text-text-secondary mt-1 text-xs">{b.suggested_action}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="rounded-card border-border bg-surface border p-5">
            <h3 className="text-text mb-3 font-semibold">Recommendations</h3>
            {recommendations.length === 0 ? (
              <p className="text-text-secondary text-sm">No recommendations at this time.</p>
            ) : (
              <div className="space-y-3">
                {recommendations.map((r) => (
                  <div key={r.id} className="border-border rounded-lg border p-3">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          r.priority === "high"
                            ? "danger"
                            : r.priority === "medium"
                              ? "warning"
                              : "default"
                        }
                      >
                        {r.priority}
                      </Badge>
                      <span className="text-text text-sm font-medium">{r.title}</span>
                    </div>
                    <p className="text-text-secondary mt-1 text-xs">{r.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </EnterpriseShell>
  );
}

export default function WorkforcePage() {
  return (
    <RequireAuth>
      <WorkforceContent />
    </RequireAuth>
  );
}
