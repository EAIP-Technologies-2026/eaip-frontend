"use client";
import { useState, useEffect, useCallback } from "react";
import { RequireAuth } from "@eaip/auth";
import { EnterpriseShell } from "@eaip/ui-enterprise";
import { Button, Badge, Input } from "@eaip/ui-primitives";
import { EnterpriseIcon } from "@eaip/icons";
import {
  fetchDeploymentPacks,
  createDeploymentPack,
  fetchDeploymentConfigs,
  createDeploymentConfig,
  validateDeploymentConfig,
  fetchOnboardingSessions,
  createOnboardingSession,
  advanceOnboarding,
} from "../../services/m7-service";

function DeploymentsContent() {
  const [packs, setPacks] = useState<unknown[]>([]);
  const [configs, setConfigs] = useState<unknown[]>([]);
  const [sessions, setSessions] = useState<unknown[]>([]);
  const [validation, setValidation] = useState<unknown>(null);
  const [packName, setPackName] = useState("");
  const [company, setCompany] = useState("");
  const load = useCallback(async () => {
    try {
      const [p, c, s] = await Promise.all([
        fetchDeploymentPacks().catch(() => []),
        fetchDeploymentConfigs().catch(() => []),
        fetchOnboardingSessions().catch(() => []),
      ]);
      setPacks(Array.isArray(p) ? p : []);
      setConfigs(Array.isArray(c) ? c : []);
      setSessions(Array.isArray(s) ? s : []);
    } catch {
      /* ignore */
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  return (
    <EnterpriseShell
      appId="enterprise-console"
      pageTitle="Deployments"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Deployments" }]}
    >
      <div className="space-y-8">
        <section className="surface-hero relative overflow-hidden p-8">
          <div className="text-primary mb-4 flex items-center gap-2 text-xs font-semibold tracking-widest uppercase">
            <EnterpriseIcon name="layers" size={14} />
            M7 Deployment Ecosystem
          </div>
          <h1 className="text-text text-3xl font-bold tracking-tight">Deployment Packs</h1>
          <p className="text-text-secondary mt-3 max-w-2xl text-base">
            EAIP Core → Industry Pack → Deployment Pack → Customer Environment
          </p>
        </section>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-card border-border bg-surface border p-5">
            <h3 className="text-text font-semibold">Create Deployment Pack</h3>
            <div className="mt-4 flex gap-2">
              <Input
                placeholder="Pack name"
                value={packName}
                onChange={(e) => setPackName(e.target.value)}
              />
              <Button
                size="sm"
                onClick={() => {
                  void (async () => {
                    if (!packName) return;
                    await createDeploymentPack({ name: packName, industry: "general" });
                    setPackName("");
                    void load();
                  })();
                }}
              >
                Create
              </Button>
            </div>
            <div className="mt-4 space-y-2">
              {packs.slice(0, 5).map((p: unknown) => {
                const x = p as Record<string, string>;
                return (
                  <div
                    key={x.pack_id}
                    className="border-border flex items-center justify-between rounded border px-3 py-2 text-sm"
                  >
                    <span>{x.name}</span>
                    <Badge variant="default">{x.industry}</Badge>
                  </div>
                );
              })}
              {packs.length === 0 && <p className="text-text-muted text-sm">No packs yet</p>}
            </div>
          </div>
          <div className="rounded-card border-border bg-surface border p-5">
            <h3 className="text-text font-semibold">Deployment Config</h3>
            <Button
              size="sm"
              className="mt-3"
              onClick={() => {
                void (async () => {
                  const c = (await createDeploymentConfig({
                    environment: "development",
                    region: "us-east-1",
                  })) as Record<string, string>;
                  void load();
                  const v = (await validateDeploymentConfig(c.config_id ?? "")) as Record<
                    string,
                    unknown
                  >;
                  setValidation(v);
                })();
              }}
            >
              Create & Validate
            </Button>
            {validation ? (
              <pre className="bg-surface-tertiary mt-3 overflow-auto rounded p-2 text-xs">
                {JSON.stringify(validation, null, 2)}
              </pre>
            ) : null}
            <div className="mt-3 space-y-1 text-xs">
              {configs.slice(0, 3).map((c: unknown) => {
                const x = c as Record<string, string>;
                return (
                  <div key={x.config_id} className="text-text-secondary">
                    {x.environment} · {x.region} · {x.runtime}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="rounded-card border-border bg-surface border p-5">
            <h3 className="text-text font-semibold">Onboarding</h3>
            <div className="mt-3 flex gap-2">
              <Input
                placeholder="Company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
              <Button
                size="sm"
                onClick={() => {
                  void (async () => {
                    if (!company) return;
                    await createOnboardingSession({
                      company_name: company,
                      industry: "consultancy",
                    });
                    setCompany("");
                    void load();
                  })();
                }}
              >
                Start
              </Button>
            </div>
            <div className="mt-4 space-y-2">
              {sessions.slice(0, 5).map((s: unknown) => {
                const x = s as Record<string, unknown>;
                return (
                  <div
                    key={String(x.session_id)}
                    className="border-border flex items-center justify-between rounded border px-3 py-2 text-sm"
                  >
                    <span>{String(x.company_name) || "—"}</span>
                    <Badge variant="default">
                      {String(x.current_step)} {String(x.progress)}%
                    </Badge>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        void (async () => {
                          await advanceOnboarding(String(x.session_id));
                          void load();
                        })();
                      }}
                    >
                      Advance
                    </Button>
                  </div>
                );
              })}
              {sessions.length === 0 && <p className="text-text-muted text-sm">No sessions</p>}
            </div>
          </div>
        </div>
      </div>
    </EnterpriseShell>
  );
}
export default function DeploymentsPage() {
  return (
    <RequireAuth>
      <DeploymentsContent />
    </RequireAuth>
  );
}
