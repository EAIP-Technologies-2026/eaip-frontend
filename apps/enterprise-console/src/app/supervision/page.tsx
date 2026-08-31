"use client";

import { useState, useEffect, useCallback } from "react";
import { RequireAuth } from "@eaip/auth";
import { EnterpriseShell, LoadingState, ErrorState } from "@eaip/ui-enterprise";
import { Button, Badge, Input, EmptyState } from "@eaip/ui-primitives";
import { EnterpriseIcon } from "@eaip/icons";
import { usePlatformStore } from "@eaip/state";
import { fetchSupervision } from "../../services/intelligence-service";
import { getDefaultClient } from "@eaip/api";

function SupervisionContent() {
  const addToast = usePlatformStore((s) => s.addToast);
  const [records, setRecords] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ agent_id: "", goal: "" });
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetchSupervision();
      setRecords(r.data);
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
        pageTitle="Supervision"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Supervision" }]}
      >
        <LoadingState message="Loading supervision..." />
      </EnterpriseShell>
    );
  if (error)
    return (
      <EnterpriseShell
        appId="enterprise-console"
        pageTitle="Supervision"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Supervision" }]}
      >
        <ErrorState message={error} onRetry={() => void load()} />
      </EnterpriseShell>
    );
  return (
    <EnterpriseShell
      appId="enterprise-console"
      pageTitle="Supervision"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Supervision" }]}
    >
      <div className="space-y-8">
        <section className="surface-hero relative overflow-hidden p-8 lg:p-10">
          <div
            className="from-primary-subtle/50 absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br to-transparent blur-3xl"
            aria-hidden="true"
          />
          <div className="relative">
            <div className="text-primary mb-4 flex items-center gap-2 text-xs font-semibold tracking-widest uppercase">
              <EnterpriseIcon name="activity" size={14} /> Agent Supervision
            </div>
            <h1 className="text-text text-3xl font-bold tracking-tight">Supervision Center</h1>
            <p className="text-text-secondary mt-3 max-w-2xl text-base leading-relaxed">
              Active agents, health, progress, warnings, escalation, and intervention.
            </p>
          </div>
        </section>
        <div className="rounded-card border-border bg-surface space-y-4 border p-5">
          <h3 className="text-text font-semibold">Track agent</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              placeholder="Agent ID"
              value={form.agent_id}
              onChange={(e) => {
                setForm((f) => ({ ...f, agent_id: e.target.value }));
              }}
            />
            <Input
              placeholder="Goal"
              value={form.goal}
              onChange={(e) => {
                setForm((f) => ({ ...f, goal: e.target.value }));
              }}
            />
          </div>
          <div className="flex justify-end">
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                if (!form.agent_id.trim()) {
                  addToast({ type: "error", title: "Agent ID required" });
                  return;
                }
                void getDefaultClient()
                  .post("/intelligence/supervision", { agent_id: form.agent_id, goal: form.goal })
                  .then(() => {
                    addToast({ type: "success", title: "Agent tracked" });
                    void load();
                  });
              }}
            >
              Track
            </Button>
          </div>
        </div>
        <section>
          <h3 className="text-text mb-3 font-semibold">Active supervision</h3>
          {(
            records as {
              record_id: string;
              agent_id: string;
              progress: number;
              confidence: number;
              state: string;
              escalation: string;
            }[]
          ).length === 0 ? (
            <EmptyState
              icon="activity"
              title="No supervised agents"
              description="Track an agent above."
            />
          ) : (
            <div className="space-y-3">
              {(
                records as {
                  record_id: string;
                  agent_id: string;
                  progress: number;
                  confidence: number;
                  state: string;
                  escalation: string;
                  warnings: string[];
                }[]
              ).map((r) => (
                <div key={r.record_id} className="rounded-card border-border bg-surface border p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-text text-sm font-semibold">{r.agent_id}</h4>
                    <Badge variant={r.state === "escalated" ? "danger" : "default"}>
                      {r.state}
                    </Badge>
                  </div>
                  <p className="text-text-secondary mt-1 text-xs">
                    progress {(r.progress * 100).toFixed(0)}% · confidence{" "}
                    {(r.confidence * 100).toFixed(0)}% · {r.escalation || "no escalation"}
                  </p>
                  {r.warnings.length ? (
                    <p className="text-warning mt-1 text-xs">{r.warnings.join("; ")}</p>
                  ) : null}
                  <div className="mt-3 flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        void getDefaultClient()
                          .post(`/intelligence/supervision/${r.record_id}/intervene`, {
                            action: "pause",
                          })
                          .then(() => void load())
                      }
                    >
                      Pause
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        void getDefaultClient()
                          .post(`/intelligence/supervision/${r.record_id}/intervene`, {
                            action: "stop",
                          })
                          .then(() => void load())
                      }
                    >
                      Stop
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

export default function SupervisionPage() {
  return (
    <RequireAuth>
      <SupervisionContent />
    </RequireAuth>
  );
}
