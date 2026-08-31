"use client";

import { useState, useEffect, useCallback } from "react";
import { RequireAuth } from "@eaip/auth";
import { EnterpriseShell, LoadingState, ErrorState } from "@eaip/ui-enterprise";
import { Button, Badge, Input, EmptyState } from "@eaip/ui-primitives";
import { EnterpriseIcon } from "@eaip/icons";
import { usePlatformStore } from "@eaip/state";
import {
  createOnboardingSession,
  fetchOnboardingSessions,
  advanceOnboardingSession,
  type OnboardingSession,
} from "../../services/onboarding-service";
import { fetchSolutionPacks, type SolutionPack } from "../../services/solution-packs-service";

function OnboardingContent() {
  const addToast = usePlatformStore((s) => s.addToast);
  const [sessions, setSessions] = useState<OnboardingSession[]>([]);
  const [packs, setPacks] = useState<SolutionPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ company_name: "", industry: "consultancy", pack_id: "" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sess, pks] = await Promise.all([fetchOnboardingSessions(), fetchSolutionPacks()]);
      setSessions(sess.data);
      setPacks(pks.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCreate() {
    if (!form.company_name.trim()) {
      addToast({ type: "error", title: "Company name required" });
      return;
    }
    try {
      const r = await createOnboardingSession({
        company_name: form.company_name,
        industry: form.industry,
        pack_id: form.pack_id,
      });
      if (r.source === "fallback") {
        addToast({ type: "error", title: "Backend unavailable" });
        return;
      }
      addToast({
        type: "success",
        title: "Onboarding started",
        message: `Session ${r.data.session_id}`,
      });
      void load();
    } catch (err) {
      addToast({
        type: "error",
        title: "Failed",
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  if (loading)
    return (
      <EnterpriseShell
        appId="enterprise-console"
        pageTitle="Onboarding"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Onboarding" }]}
      >
        <LoadingState message="Loading onboarding..." />
      </EnterpriseShell>
    );
  if (error)
    return (
      <EnterpriseShell
        appId="enterprise-console"
        pageTitle="Onboarding"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Onboarding" }]}
      >
        <ErrorState message={error} onRetry={() => void load()} />
      </EnterpriseShell>
    );

  return (
    <EnterpriseShell
      appId="enterprise-console"
      pageTitle="Onboarding"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Onboarding" }]}
    >
      <div className="space-y-8">
        <section className="surface-hero relative overflow-hidden p-8 lg:p-10">
          <div
            className="from-primary-subtle/50 absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br to-transparent blur-3xl"
            aria-hidden="true"
          />
          <div className="relative">
            <div className="text-primary mb-4 flex items-center gap-2 text-xs font-semibold tracking-widest uppercase">
              <EnterpriseIcon name="activity" size={14} /> Enterprise Onboarding
            </div>
            <h1 className="text-text text-3xl font-bold tracking-tight">Onboard a Company</h1>
            <p className="text-text-secondary mt-3 max-w-2xl text-base leading-relaxed">
              Company → industry → solution pack → resources → simulation → dashboard. EAIP prepares
              the operating environment.
            </p>
          </div>
        </section>

        <div className="rounded-card border-border bg-surface space-y-4 border p-5">
          <h3 className="text-text font-semibold">Start onboarding</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              placeholder="Company name"
              value={form.company_name}
              onChange={(e) => {
                setForm((f) => ({ ...f, company_name: e.target.value }));
              }}
            />
            <select
              value={form.industry}
              onChange={(e) => {
                setForm((f) => ({ ...f, industry: e.target.value, pack_id: "" }));
              }}
              className="border-border bg-surface rounded-lg border px-3 py-2 text-sm"
            >
              <option value="healthcare">Healthcare</option>
              <option value="financial">Financial Services</option>
              <option value="consultancy">Consultancy</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="retail">Retail / D2C</option>
            </select>
            <select
              value={form.pack_id}
              onChange={(e) => {
                setForm((f) => ({ ...f, pack_id: e.target.value }));
              }}
              className="border-border bg-surface rounded-lg border px-3 py-2 text-sm"
            >
              <option value="">Select pack (optional)</option>
              {packs
                .filter((p) => p.industry === form.industry)
                .map((p) => (
                  <option key={p.pack_id} value={p.pack_id}>
                    {p.name}
                  </option>
                ))}
            </select>
          </div>
          <div className="flex justify-end">
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                void handleCreate();
              }}
            >
              Create onboarding
            </Button>
          </div>
          <p className="text-text-secondary text-xs">
            EAIP will prepare: organization, roles, agents, workflows, knowledge, marketplace picks,
            demo data, simulation.
          </p>
        </div>

        <section>
          <h3 className="text-text mb-3 font-semibold">Sessions</h3>
          {sessions.length === 0 ? (
            <EmptyState
              icon="activity"
              title="No onboarding sessions"
              description="Create one above."
            />
          ) : (
            <div className="space-y-3">
              {sessions.map((s) => (
                <div
                  key={s.session_id}
                  className="rounded-card border-border bg-surface border p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-text text-sm font-semibold">{s.company_name}</h4>
                    <Badge
                      variant={
                        s.status === "completed"
                          ? "success"
                          : s.status === "in_progress"
                            ? "warning"
                            : "default"
                      }
                    >
                      {s.status} · {s.progress}%
                    </Badge>
                  </div>
                  <p className="text-text-secondary mt-1 text-xs">
                    {s.industry || "—"} · {s.pack_id || "no pack"} · step: {s.current_step || "—"}
                  </p>
                  <div className="bg-surface-tertiary mt-2 h-1.5 overflow-hidden rounded-full">
                    <div
                      className="bg-primary h-full rounded-full"
                      style={{ width: `${String(s.progress)}%` }}
                    />
                  </div>
                  <div className="mt-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        void advanceOnboardingSession(s.session_id, {}).then((r) => {
                          if (r.data) {
                            addToast({
                              type: "success",
                              title: `Advanced to ${r.data.current_step}`,
                            });
                            void load();
                          }
                        });
                      }}
                    >
                      Advance
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

export default function OnboardingPage() {
  return (
    <RequireAuth>
      <OnboardingContent />
    </RequireAuth>
  );
}
