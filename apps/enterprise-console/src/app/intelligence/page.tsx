"use client";

import { useState, useEffect, useCallback } from "react";
import { RequireAuth } from "@eaip/auth";
import { EnterpriseShell, LoadingState, ErrorState } from "@eaip/ui-enterprise";
import { Badge, EmptyState } from "@eaip/ui-primitives";
import { EnterpriseIcon } from "@eaip/icons";
import {
  fetchCapabilities,
  fetchKernelHealth,
  fetchCognitionContext,
} from "../../services/intelligence-service";
import {
  fetchMethodologies,
  fetchOpsInsights,
  fetchImprovements,
} from "../../services/wave2-service";

function IntelligenceContent() {
  const [caps, setCaps] = useState<unknown[]>([]);
  const [health, setHealth] = useState<unknown>(null);
  const [ctx, setCtx] = useState<unknown>(null);
  const [methodologies, setMethodologies] = useState<unknown[]>([]);
  const [insights, setInsights] = useState<unknown[]>([]);
  const [improvements, setImprovements] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [a, b, c, d, e, f] = await Promise.all([
        fetchCapabilities(),
        fetchKernelHealth(),
        fetchCognitionContext(),
        fetchMethodologies().catch((): { data: unknown[]; source: "fallback" } => ({
          data: [],
          source: "fallback",
        })),
        fetchOpsInsights().catch((): { data: unknown[]; source: "fallback" } => ({
          data: [],
          source: "fallback",
        })),
        fetchImprovements().catch((): { data: unknown[]; source: "fallback" } => ({
          data: [],
          source: "fallback",
        })),
      ]);
      setCaps(a.data);
      setHealth(b.data);
      setCtx(c.data);
      setMethodologies(d.data);
      setInsights(e.data);
      setImprovements(f.data);
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
        pageTitle="Intelligence"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Intelligence" }]}
      >
        <LoadingState message="Loading intelligence..." />
      </EnterpriseShell>
    );
  if (error)
    return (
      <EnterpriseShell
        appId="enterprise-console"
        pageTitle="Intelligence"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Intelligence" }]}
      >
        <ErrorState message={error} onRetry={() => void load()} />
      </EnterpriseShell>
    );
  return (
    <EnterpriseShell
      appId="enterprise-console"
      pageTitle="Intelligence"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Intelligence" }]}
    >
      <div className="space-y-8">
        <section className="surface-hero relative overflow-hidden p-8 lg:p-10">
          <div
            className="from-primary-subtle/50 absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br to-transparent blur-3xl"
            aria-hidden="true"
          />
          <div className="relative">
            <div className="text-primary mb-4 flex items-center gap-2 text-xs font-semibold tracking-widest uppercase">
              <EnterpriseIcon name="activity" size={14} /> Enterprise Intelligence
            </div>
            <h1 className="text-text text-3xl font-bold tracking-tight">Intelligence Kernel</h1>
            <p className="text-text-secondary mt-3 max-w-2xl text-base leading-relaxed">
              Capability registry, unified context, governed execution, cognitive analysis,
              methodologies, and operational intelligence.
            </p>
          </div>
        </section>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-card border-border bg-surface border p-5">
            <h3 className="text-text mb-3 font-semibold">Capabilities</h3>
            {(caps as { capability_id: string; name: string; category: string }[]).length === 0 ? (
              <EmptyState
                icon="activity"
                title="No capabilities"
                description="Register a capability."
              />
            ) : (
              <div className="space-y-2">
                {(caps as { capability_id: string; name: string; category: string }[])
                  .slice(0, 10)
                  .map((c) => (
                    <div
                      key={c.capability_id}
                      className="border-border flex items-center justify-between rounded-lg border px-3 py-2"
                    >
                      <span className="text-text text-sm">{c.name}</span>
                      <Badge variant="default">{c.category}</Badge>
                    </div>
                  ))}
              </div>
            )}
          </div>
          <div className="rounded-card border-border bg-surface border p-5">
            <h3 className="text-text mb-3 font-semibold">Situational Awareness</h3>
            <pre className="bg-surface-tertiary max-h-64 overflow-auto rounded p-3 text-xs">
              {JSON.stringify(ctx ?? health ?? {}, null, 2)}
            </pre>
          </div>
        </div>
        {(methodologies.length > 0 || insights.length > 0 || improvements.length > 0) && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-card border-border bg-surface border p-5">
              <h3 className="text-text mb-3 font-semibold">
                Methodologies ({String(methodologies.length)})
              </h3>
              {methodologies.length === 0 ? (
                <EmptyState
                  icon="layers"
                  title="No methodologies"
                  description="Register via /api/methodologies."
                />
              ) : (
                <div className="space-y-2">
                  {(methodologies as { methodology_id: string; name: string; category: string }[])
                    .slice(0, 6)
                    .map((m) => (
                      <div
                        key={m.methodology_id}
                        className="border-border flex items-center justify-between rounded border px-3 py-2"
                      >
                        <span className="text-text text-sm">{m.name}</span>
                        <Badge variant="default">{m.category}</Badge>
                      </div>
                    ))}
                </div>
              )}
            </div>
            <div className="rounded-card border-border bg-surface border p-5">
              <h3 className="text-text mb-3 font-semibold">
                Ops Insights ({String(insights.length)})
              </h3>
              {insights.length === 0 ? (
                <EmptyState
                  icon="activity"
                  title="No insights"
                  description="Ingest events to detect insights."
                />
              ) : (
                <div className="space-y-2">
                  {(insights as { insight_id: string; type: string; severity: string }[])
                    .slice(0, 6)
                    .map((i) => (
                      <div
                        key={i.insight_id}
                        className="border-border flex items-center justify-between rounded border px-3 py-2"
                      >
                        <span className="text-text text-sm">{i.type}</span>
                        <Badge variant="default">{i.severity}</Badge>
                      </div>
                    ))}
                </div>
              )}
            </div>
            <div className="rounded-card border-border bg-surface border p-5">
              <h3 className="text-text mb-3 font-semibold">
                Improvements ({String(improvements.length)})
              </h3>
              {improvements.length === 0 ? (
                <EmptyState
                  icon="layers"
                  title="No proposals"
                  description="Propose via /api/improvements."
                />
              ) : (
                <div className="space-y-2">
                  {(improvements as { proposal_id: string; status: string; source: string }[])
                    .slice(0, 6)
                    .map((p) => (
                      <div
                        key={p.proposal_id}
                        className="border-border flex items-center justify-between rounded border px-3 py-2"
                      >
                        <span className="text-text text-sm">{p.proposal_id}</span>
                        <Badge variant="default">{p.status}</Badge>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </EnterpriseShell>
  );
}

export default function IntelligencePage() {
  return (
    <RequireAuth>
      <IntelligenceContent />
    </RequireAuth>
  );
}
