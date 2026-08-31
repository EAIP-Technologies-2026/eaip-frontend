"use client";

import { useState, useEffect, useCallback } from "react";
import { RequireAuth } from "@eaip/auth";
import { EnterpriseShell, LoadingState, ErrorState } from "@eaip/ui-enterprise";
import { Button, Badge, Input, EmptyState } from "@eaip/ui-primitives";
import { EnterpriseIcon } from "@eaip/icons";
import { usePlatformStore } from "@eaip/state";
import { fetchCoordinationPlans } from "../../services/intelligence-service";
import { getDefaultClient } from "@eaip/api";

function CoordinationContent() {
  const addToast = usePlatformStore((s) => s.addToast);
  const [plans, setPlans] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ objective: "", priority: "operational" });
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetchCoordinationPlans();
      setPlans(r.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  if (loading)
    return (
      <EnterpriseShell
        appId="enterprise-console"
        pageTitle="Coordination"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Coordination" }]}
      >
        <LoadingState message="Loading coordination..." />
      </EnterpriseShell>
    );
  if (error)
    return (
      <EnterpriseShell
        appId="enterprise-console"
        pageTitle="Coordination"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Coordination" }]}
      >
        <ErrorState message={error} onRetry={() => void load()} />
      </EnterpriseShell>
    );
  return (
    <EnterpriseShell
      appId="enterprise-console"
      pageTitle="Coordination"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Coordination" }]}
    >
      <div className="space-y-8">
        <section className="surface-hero relative overflow-hidden p-8 lg:p-10">
          <div
            className="from-primary-subtle/50 absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br to-transparent blur-3xl"
            aria-hidden="true"
          />
          <div className="relative">
            <div className="text-primary mb-4 flex items-center gap-2 text-xs font-semibold tracking-widest uppercase">
              <EnterpriseIcon name="activity" size={14} /> Enterprise Coordination
            </div>
            <h1 className="text-text text-3xl font-bold tracking-tight">Coordination Center</h1>
            <p className="text-text-secondary mt-3 max-w-2xl text-base leading-relaxed">
              Objectives, agents, delegation, resources, conflicts, priorities, and verified
              outcomes.
            </p>
          </div>
        </section>
        <div className="rounded-card border-border bg-surface space-y-4 border p-5">
          <h3 className="text-text font-semibold">Create coordination plan</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              placeholder="Objective"
              value={form.objective}
              onChange={(e) => {
                setForm((f) => ({ ...f, objective: e.target.value }));
              }}
            />
            <select
              value={form.priority}
              onChange={(e) => {
                setForm((f) => ({ ...f, priority: e.target.value }));
              }}
              className="border-border bg-surface rounded-lg border px-3 py-2 text-sm"
            >
              <option value="operational">Operational</option>
              <option value="urgent">Urgent</option>
              <option value="strategic">Strategic</option>
              <option value="compliance">Compliance</option>
            </select>
          </div>
          <div className="flex justify-end">
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                if (!form.objective.trim()) {
                  addToast({ type: "error", title: "Objective required" });
                  return;
                }
                void getDefaultClient()
                  .post("/intelligence/coordination/plans", {
                    objective: form.objective,
                    priority: form.priority,
                  })
                  .then(() => {
                    addToast({ type: "success", title: "Plan created" });
                    void load();
                  });
              }}
            >
              Create
            </Button>
          </div>
        </div>
        <section>
          <h3 className="text-text mb-3 font-semibold">Plans</h3>
          {(
            plans as {
              plan_id: string;
              objective: string;
              status: string;
              priority: string;
              outcome: string;
            }[]
          ).length === 0 ? (
            <EmptyState icon="activity" title="No plans" description="Create one above." />
          ) : (
            <div className="space-y-3">
              {(
                plans as {
                  plan_id: string;
                  objective: string;
                  status: string;
                  priority: string;
                  outcome: string;
                }[]
              ).map((p) => (
                <div key={p.plan_id} className="rounded-card border-border bg-surface border p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-text text-sm font-semibold">{p.objective}</h4>
                    <Badge variant={p.status === "completed" ? "success" : "default"}>
                      {p.status}
                    </Badge>
                  </div>
                  <p className="text-text-secondary mt-1 text-xs">
                    priority {p.priority} · {p.outcome || "—"}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        void getDefaultClient()
                          .post(`/intelligence/coordination/plans/${p.plan_id}/delegate`, {
                            capabilities: ["agent-1"],
                          })
                          .then(() => void load())
                      }
                    >
                      Delegate
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        void getDefaultClient()
                          .post(`/intelligence/coordination/plans/${p.plan_id}/verify`, {
                            outcome: "verified",
                            success: true,
                          })
                          .then(() => void load())
                      }
                    >
                      Verify
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </EnterpriseShell>
  );
}

export default function CoordinationPage() {
  return (
    <RequireAuth>
      <CoordinationContent />
    </RequireAuth>
  );
}
