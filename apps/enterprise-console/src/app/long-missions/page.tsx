"use client";

import { useState, useEffect, useCallback } from "react";
import { RequireAuth } from "@eaip/auth";
import { EnterpriseShell, LoadingState, ErrorState } from "@eaip/ui-enterprise";
import { Button, Badge, Input, EmptyState } from "@eaip/ui-primitives";
import { EnterpriseIcon } from "@eaip/icons";
import { usePlatformStore } from "@eaip/state";
import {
  fetchLongMissions,
  createLongMission,
  pauseLongMission,
  resumeLongMission,
  checkpointLongMission,
  type LongMission,
} from "../../services/long-missions-service";

function LongMissionsContent() {
  const addToast = usePlatformStore((s) => s.addToast);
  const [missions, setMissions] = useState<LongMission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    autonomy_level: "SUGGEST",
    steps: "Step 1; Step 2; Step 3",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetchLongMissions();
      setMissions(r.data);
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
        pageTitle="Long Missions"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Long Missions" }]}
      >
        <LoadingState message="Loading missions..." />
      </EnterpriseShell>
    );
  if (error)
    return (
      <EnterpriseShell
        appId="enterprise-console"
        pageTitle="Long Missions"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Long Missions" }]}
      >
        <ErrorState message={error} onRetry={() => void load()} />
      </EnterpriseShell>
    );

  return (
    <EnterpriseShell
      appId="enterprise-console"
      pageTitle="Long Missions"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Long Missions" }]}
    >
      <div className="space-y-8">
        <section className="surface-hero relative overflow-hidden p-8 lg:p-10">
          <div
            className="from-primary-subtle/50 absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br to-transparent blur-3xl"
            aria-hidden="true"
          />
          <div className="relative">
            <div className="text-primary mb-4 flex items-center gap-2 text-xs font-semibold tracking-widest uppercase">
              <EnterpriseIcon name="activity" size={14} /> Long-Running Missions
            </div>
            <h1 className="text-text text-3xl font-bold tracking-tight">Long Missions</h1>
            <p className="text-text-secondary mt-3 max-w-2xl text-base leading-relaxed">
              Checkpoint, resume, pause, recovery, bounded autonomy, approval-gated workflow
              composition.
            </p>
          </div>
        </section>

        <div className="rounded-card border-border bg-surface space-y-4 border p-5">
          <h3 className="text-text font-semibold">Create mission</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              placeholder="Mission name"
              value={form.name}
              onChange={(e) => {
                setForm((f) => ({ ...f, name: e.target.value }));
              }}
            />
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
              placeholder="Steps (semicolon separated)"
              value={form.steps}
              onChange={(e) => {
                setForm((f) => ({ ...f, steps: e.target.value }));
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
                const steps = form.steps
                  .split(";")
                  .map((s) => s.trim())
                  .filter(Boolean)
                  .map((description) => ({ description }));
                void createLongMission({
                  name: form.name,
                  autonomy_level: form.autonomy_level,
                  steps,
                }).then((r) => {
                  if (r.source === "fallback")
                    addToast({ type: "error", title: "Backend unavailable" });
                  else {
                    addToast({ type: "success", title: "Mission created" });
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
          <h3 className="text-text mb-3 font-semibold">Missions</h3>
          {missions.length === 0 ? (
            <EmptyState icon="activity" title="No missions" description="Create one above." />
          ) : (
            <div className="space-y-3">
              {missions.map((m) => (
                <div
                  key={m.mission_id}
                  className="rounded-card border-border bg-surface border p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-text text-sm font-semibold">{m.name}</h4>
                    <Badge
                      variant={
                        m.status === "completed"
                          ? "success"
                          : m.status === "paused"
                            ? "warning"
                            : "default"
                      }
                    >
                      {m.status}
                    </Badge>
                  </div>
                  <p className="text-text-secondary mt-1 text-xs">
                    step {m.current_step} · {m.autonomy_level}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => void pauseLongMission(m.mission_id).then(() => void load())}
                    >
                      Pause
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => void resumeLongMission(m.mission_id).then(() => void load())}
                    >
                      Resume
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        void checkpointLongMission(m.mission_id, { step: m.current_step }).then(
                          () => {
                            addToast({ type: "success", title: "Checkpoint saved" });
                            void load();
                          },
                        )
                      }
                    >
                      Checkpoint
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

export default function LongMissionsPage() {
  return (
    <RequireAuth>
      <LongMissionsContent />
    </RequireAuth>
  );
}
