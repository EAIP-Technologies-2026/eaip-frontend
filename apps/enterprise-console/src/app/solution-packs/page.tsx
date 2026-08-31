"use client";

import { useState, useEffect, useCallback } from "react";
import { RequireAuth } from "@eaip/auth";
import { EnterpriseShell, LoadingState, ErrorState } from "@eaip/ui-enterprise";
import { Button, Badge, EmptyState } from "@eaip/ui-primitives";
import { EnterpriseIcon } from "@eaip/icons";
import { usePlatformStore } from "@eaip/state";
import {
  fetchSolutionPacks,
  installSolutionPack,
  type SolutionPack,
} from "../../services/solution-packs-service";

function SolutionPacksContent() {
  const addToast = usePlatformStore((s) => s.addToast);
  const [packs, setPacks] = useState<SolutionPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [installing, setInstalling] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetchSolutionPacks();
      setPacks(r.data);
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
        pageTitle="Solution Packs"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Solution Packs" }]}
      >
        <LoadingState message="Loading solution packs..." />
      </EnterpriseShell>
    );
  if (error)
    return (
      <EnterpriseShell
        appId="enterprise-console"
        pageTitle="Solution Packs"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Solution Packs" }]}
      >
        <ErrorState message={error} onRetry={() => void load()} />
      </EnterpriseShell>
    );

  return (
    <EnterpriseShell
      appId="enterprise-console"
      pageTitle="Solution Packs"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Solution Packs" }]}
    >
      <div className="space-y-8">
        <section className="surface-hero relative overflow-hidden p-8 lg:p-10">
          <div
            className="from-primary-subtle/50 absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br to-transparent blur-3xl"
            aria-hidden="true"
          />
          <div className="relative">
            <div className="text-primary mb-4 flex items-center gap-2 text-xs font-semibold tracking-widest uppercase">
              <EnterpriseIcon name="activity" size={14} /> Industry Packs
            </div>
            <h1 className="text-text text-3xl font-bold tracking-tight">Solution Packs</h1>
            <p className="text-text-secondary mt-3 max-w-2xl text-base leading-relaxed">
              Vertical operating configurations — agents, workflows, knowledge, KPIs, and simulation
              per industry.
            </p>
          </div>
        </section>

        {packs.length === 0 ? (
          <EmptyState icon="activity" title="No packs" description="No solution packs available." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {packs.map((p) => (
              <div
                key={p.pack_id}
                className="rounded-card border-border bg-surface hover:border-primary/40 transition-smooth border p-5"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-text text-sm font-semibold">{p.name}</h3>
                  <Badge variant="default">{p.industry}</Badge>
                </div>
                <p className="text-text-secondary mt-2 line-clamp-2 text-xs">{p.description}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Badge variant="default">
                    {Array.isArray(p.agents) ? p.agents.length : 0} agents
                  </Badge>
                  <Badge variant="default">
                    {Array.isArray(p.workflows) ? p.workflows.length : 0} workflows
                  </Badge>
                  <Badge variant="default">v{p.version}</Badge>
                </div>
                <div className="mt-4">
                  <Button
                    variant="primary"
                    size="sm"
                    loading={installing === p.pack_id}
                    onClick={() => {
                      setInstalling(p.pack_id);
                      void installSolutionPack(p.pack_id, {})
                        .then((r) => {
                          if (r.source === "fallback")
                            addToast({ type: "error", title: "Backend unavailable" });
                          else addToast({ type: "success", title: `${p.name} installed` });
                          setInstalling(null);
                        })
                        .catch((e: unknown) => {
                          addToast({
                            type: "error",
                            title: "Install failed",
                            message: e instanceof Error ? e.message : String(e),
                          });
                          setInstalling(null);
                        });
                    }}
                  >
                    Install
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </EnterpriseShell>
  );
}

export default function SolutionPacksPage() {
  return (
    <RequireAuth>
      <SolutionPacksContent />
    </RequireAuth>
  );
}
