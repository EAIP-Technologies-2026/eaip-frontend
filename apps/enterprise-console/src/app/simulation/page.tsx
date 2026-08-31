"use client";

import { useState, useEffect, useCallback } from "react";
import { RequireAuth } from "@eaip/auth";
import { EnterpriseShell, LoadingState, ErrorState } from "@eaip/ui-enterprise";
import { Button, Badge, EmptyState } from "@eaip/ui-primitives";
import { EnterpriseIcon } from "@eaip/icons";
import { usePlatformStore } from "@eaip/state";
import {
  fetchSimulationEvents,
  triggerSimulationTick,
  fetchAllStates,
  generateSimulationEvent,
  type SimulationEvent,
  type EnterpriseState,
} from "../../services/simulation-service";
import { triggerEnterpriseFlow } from "../../services/enterprise-flow-service";

function SimulationContent() {
  const addToast = usePlatformStore((s) => s.addToast);
  const [events, setEvents] = useState<SimulationEvent[]>([]);
  const [states, setStates] = useState<EnterpriseState[]>([]);
  const [enterprise, setEnterprise] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ticking, setTicking] = useState(false);
  const [flowRunning, setFlowRunning] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ev, st] = await Promise.all([
        fetchSimulationEvents(enterprise !== "all" ? enterprise : undefined, 50),
        fetchAllStates(),
      ]);
      setEvents(ev.data);
      setStates(st.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [enterprise]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleTick() {
    setTicking(true);
    try {
      const res = await triggerSimulationTick();
      if (res.source === "fallback") {
        addToast({ type: "error", title: "Backend unavailable" });
        return;
      }
      addToast({
        type: "success",
        title: `Tick ${String(res.data.tick_count)} — ${String(res.data.events.length)} events`,
      });
      void load();
    } catch (err) {
      addToast({
        type: "error",
        title: "Tick failed",
        message: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setTicking(false);
    }
  }

  async function handleFlow(ent: string) {
    setFlowRunning(ent);
    try {
      const res = await triggerEnterpriseFlow(ent);
      if (res.source === "fallback") {
        addToast({ type: "error", title: "Backend unavailable" });
        return;
      }
      addToast({
        type: "success",
        title: `${ent} flow ${res.data.status}`,
        message: res.data.steps.map((s) => `${s.step}:${s.status}`).join(" · "),
      });
      void load();
    } catch (err) {
      addToast({
        type: "error",
        title: "Flow failed",
        message: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setFlowRunning(null);
    }
  }

  if (loading)
    return (
      <EnterpriseShell
        appId="enterprise-console"
        pageTitle="Simulation"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Simulation" }]}
      >
        <LoadingState message="Loading simulation..." />
      </EnterpriseShell>
    );
  if (error)
    return (
      <EnterpriseShell
        appId="enterprise-console"
        pageTitle="Simulation"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Simulation" }]}
      >
        <ErrorState message={error} onRetry={() => void load()} />
      </EnterpriseShell>
    );

  return (
    <EnterpriseShell
      appId="enterprise-console"
      pageTitle="Simulation"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Simulation" }]}
    >
      <div className="space-y-8">
        <section className="surface-hero relative overflow-hidden p-8 lg:p-10">
          <div
            className="from-primary-subtle/50 absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br to-transparent blur-3xl"
            aria-hidden="true"
          />
          <div className="relative">
            <div className="text-primary mb-4 flex items-center gap-2 text-xs font-semibold tracking-widest uppercase">
              <EnterpriseIcon name="activity" size={14} /> Enterprise Simulation
            </div>
            <h1 className="text-text text-3xl font-bold tracking-tight">Enterprise Simulation</h1>
            <p className="text-text-secondary mt-3 max-w-2xl text-base leading-relaxed">
              Deterministic operating simulations for Apex, Nova, and Meridian — scheduled events,
              workload shifts, and cross-capability flows.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                variant="primary"
                size="sm"
                loading={ticking}
                onClick={() => void handleTick()}
              >
                Run tick
              </Button>
              {["apex", "nova", "meridian"].map((ent) => (
                <Button
                  key={ent}
                  variant="secondary"
                  size="sm"
                  loading={flowRunning === ent}
                  onClick={() => void handleFlow(ent)}
                >
                  Trigger {ent} flow
                </Button>
              ))}
            </div>
          </div>
        </section>

        <div className="grid gap-4 lg:grid-cols-3">
          {states.length === 0 ? (
            <div className="rounded-card border-border bg-surface border p-5 lg:col-span-3">
              <p className="text-text-secondary text-sm">
                No enterprise state — run a tick to generate activity.
              </p>
            </div>
          ) : (
            states.map((s) => (
              <div key={s.enterprise} className="rounded-card border-border bg-surface border p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-text font-semibold capitalize">{s.enterprise}</h3>
                  <Badge variant="default">{s.alerts} alerts</Badge>
                </div>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Workload</span>
                    <span className="text-text font-medium">{(s.workload * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Utilization</span>
                    <span className="text-text font-medium">
                      {(s.utilization * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Active tasks</span>
                    <span className="text-text">{s.active_tasks}</span>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setEnterprise(s.enterprise);
                    }}
                  >
                    View events
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      void generateSimulationEvent(
                        s.enterprise,
                        s.enterprise === "apex"
                          ? "engagement_created"
                          : s.enterprise === "nova"
                            ? "production_incident"
                            : "compliance_event",
                      ).then(() => {
                        addToast({ type: "success", title: "Event generated" });
                        void load();
                      });
                    }}
                  >
                    Generate event
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        <section className="rounded-card border-border bg-surface border p-5">
          <div className="border-border flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-text flex items-center gap-2 font-semibold">
              <EnterpriseIcon name="activity" size={14} /> Event feed
            </h3>
            <div className="border-border flex flex-wrap gap-1 rounded-lg border p-0.5">
              {["all", "apex", "nova", "meridian"].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setEnterprise(c);
                  }}
                  className={`rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors ${enterprise === c ? "bg-primary text-text-inverse" : "text-text-secondary hover:bg-surface-tertiary"}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          {events.length === 0 ? (
            <div className="pt-6">
              <EmptyState
                icon="activity"
                title="No simulation events"
                description="Run a tick or generate an event to see activity."
                action={
                  <Button variant="secondary" size="sm" onClick={() => void handleTick()}>
                    Run tick
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              {events.map((e) => (
                <div key={e.id} className="border-border rounded-lg border p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="default" className="capitalize">
                      {e.enterprise}
                    </Badge>
                    <Badge variant="default">{e.event_type}</Badge>
                    <span className="text-text-secondary text-xs">
                      {new Date(e.created_at).toLocaleString()}
                    </span>
                  </div>
                  <pre className="text-text-secondary mt-2 overflow-x-auto text-xs break-all whitespace-pre-wrap">
                    {JSON.stringify(e.payload, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </EnterpriseShell>
  );
}

export default function SimulationPage() {
  return (
    <RequireAuth>
      <SimulationContent />
    </RequireAuth>
  );
}
