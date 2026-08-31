"use client";

import { useState, useEffect, useCallback } from "react";
import { RequireAuth } from "@eaip/auth";
import { EnterpriseShell, LoadingState, ErrorState } from "@eaip/ui-enterprise";
import { Button, Badge, Input, EmptyState } from "@eaip/ui-primitives";
import { EnterpriseIcon } from "@eaip/icons";
import { usePlatformStore } from "@eaip/state";
import { fetchSwarms, createSwarm, executeSwarm, type Swarm } from "../../services/swarms-service";

function SwarmsContent() {
  const addToast = usePlatformStore((s) => s.addToast);
  const [swarms, setSwarms] = useState<Swarm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    pattern: "parallel",
    autonomy_level: "SUGGEST",
    tasks: "Task A; Task B; Task C",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetchSwarms();
      setSwarms(r.data);
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
        pageTitle="Swarms"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Swarms" }]}
      >
        <LoadingState message="Loading swarms..." />
      </EnterpriseShell>
    );
  if (error)
    return (
      <EnterpriseShell
        appId="enterprise-console"
        pageTitle="Swarms"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Swarms" }]}
      >
        <ErrorState message={error} onRetry={() => void load()} />
      </EnterpriseShell>
    );

  return (
    <EnterpriseShell
      appId="enterprise-console"
      pageTitle="Swarms"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Swarms" }]}
    >
      <div className="space-y-8">
        <section className="surface-hero relative overflow-hidden p-8 lg:p-10">
          <div
            className="from-primary-subtle/50 absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br to-transparent blur-3xl"
            aria-hidden="true"
          />
          <div className="relative">
            <div className="text-primary mb-4 flex items-center gap-2 text-xs font-semibold tracking-widest uppercase">
              <EnterpriseIcon name="activity" size={14} /> Autonomous Swarms
            </div>
            <h1 className="text-text text-3xl font-bold tracking-tight">Agent Swarms</h1>
            <p className="text-text-secondary mt-3 max-w-2xl text-base leading-relaxed">
              Coordinator + specialists, delegation, parallel/sequential, bounded autonomy,
              auditable.
            </p>
          </div>
        </section>

        <div className="rounded-card border-border bg-surface space-y-4 border p-5">
          <h3 className="text-text font-semibold">Create swarm</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              placeholder="Swarm name"
              value={form.name}
              onChange={(e) => {
                setForm((f) => ({ ...f, name: e.target.value }));
              }}
            />
            <select
              value={form.pattern}
              onChange={(e) => {
                setForm((f) => ({ ...f, pattern: e.target.value }));
              }}
              className="border-border bg-surface rounded-lg border px-3 py-2 text-sm"
            >
              <option value="parallel">Parallel</option>
              <option value="sequential">Sequential</option>
              <option value="debate">Debate</option>
              <option value="handoff">Handoff</option>
              <option value="consensus">Consensus</option>
            </select>
            <select
              value={form.autonomy_level}
              onChange={(e) => {
                setForm((f) => ({ ...f, autonomy_level: e.target.value }));
              }}
              className="border-border bg-surface rounded-lg border px-3 py-2 text-sm"
            >
              <option value="READ_ONLY">READ_ONLY</option>
              <option value="SUGGEST">SUGGEST</option>
              <option value="APPROVAL_REQUIRED">APPROVAL_REQUIRED</option>
              <option value="BOUNDED_EXECUTE">BOUNDED_EXECUTE</option>
            </select>
            <Input
              placeholder="Tasks (semicolon separated)"
              value={form.tasks}
              onChange={(e) => {
                setForm((f) => ({ ...f, tasks: e.target.value }));
              }}
            />
          </div>
          <div className="flex justify-end">
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                if (!form.name.trim()) {
                  addToast({ type: "error", title: "Name required" });
                  return;
                }
                const tasks = form.tasks
                  .split(";")
                  .map((t) => t.trim())
                  .filter(Boolean)
                  .map((description, i) => ({ task_id: `task-${String(i)}`, description }));
                void createSwarm({
                  name: form.name,
                  pattern: form.pattern,
                  autonomy_level: form.autonomy_level,
                  tasks,
                }).then((r) => {
                  if (r.source === "fallback")
                    addToast({ type: "error", title: "Backend unavailable" });
                  else {
                    addToast({ type: "success", title: "Swarm created" });
                    void load();
                  }
                });
              }}
            >
              Create
            </Button>
          </div>
        </div>

        <section>
          <h3 className="text-text mb-3 font-semibold">Swarms</h3>
          {swarms.length === 0 ? (
            <EmptyState icon="activity" title="No swarms" description="Create one above." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {swarms.map((s) => (
                <div key={s.swarm_id} className="rounded-card border-border bg-surface border p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-text text-sm font-semibold">{s.name}</h4>
                    <Badge variant={s.status === "completed" ? "success" : "default"}>
                      {s.status}
                    </Badge>
                  </div>
                  <p className="text-text-secondary mt-1 text-xs">
                    {s.pattern} · {s.autonomy_level} · {Array.isArray(s.tasks) ? s.tasks.length : 0}{" "}
                    tasks
                  </p>
                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() =>
                        void executeSwarm(s.swarm_id, {}).then((r) => {
                          addToast({ type: "success", title: `Executed: ${r.data.status}` });
                          void load();
                        })
                      }
                    >
                      Execute
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

export default function SwarmsPage() {
  return (
    <RequireAuth>
      <SwarmsContent />
    </RequireAuth>
  );
}
