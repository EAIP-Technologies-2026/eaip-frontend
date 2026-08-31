"use client";
import { useState, useEffect, useCallback } from "react";
import { RequireAuth } from "@eaip/auth";
import { EnterpriseShell, LoadingState, ErrorState } from "@eaip/ui-enterprise";
import { Badge, EmptyState } from "@eaip/ui-primitives";
import { fetchMethodologies } from "../../services/wave2-service";

function MethodologiesContent() {
  const [items, setItems] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetchMethodologies();
      setItems(r.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  if (loading)
    return (
      <EnterpriseShell appId="enterprise-console" pageTitle="Methodologies">
        <LoadingState message="Loading methodologies…" />
      </EnterpriseShell>
    );
  if (error)
    return (
      <EnterpriseShell appId="enterprise-console" pageTitle="Methodologies">
        <ErrorState message={error} onRetry={() => void load()} />
      </EnterpriseShell>
    );
  return (
    <EnterpriseShell
      appId="enterprise-console"
      pageTitle="Methodologies"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Methodologies" }]}
    >
      <div className="space-y-6">
        <section className="surface-hero p-8">
          <h1 className="text-text text-2xl font-bold">Intelligence Methodology Platform</h1>
          <p className="text-text-secondary mt-2 text-sm">
            Versioned reasoning, planning, forecasting, and decision methodologies.
          </p>
        </section>
        <div className="rounded-card border-border bg-surface border p-5">
          <h3 className="text-text font-semibold">Methodologies ({String(items.length)})</h3>
          {items.length === 0 ? (
            <EmptyState
              icon="layers"
              title="No methodologies"
              description="Register a methodology."
            />
          ) : (
            <div className="mt-3 space-y-2">
              {(
                items as {
                  methodology_id: string;
                  name: string;
                  category: string;
                  version: string;
                }[]
              )
                .slice(0, 20)
                .map((m) => (
                  <div
                    key={m.methodology_id}
                    className="border-border flex items-center justify-between rounded border px-3 py-2"
                  >
                    <span className="text-text text-sm">
                      {m.name} <span className="text-text-muted">v{m.version}</span>
                    </span>
                    <Badge variant="default">{m.category}</Badge>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </EnterpriseShell>
  );
}
export default function MethodologiesPage() {
  return (
    <RequireAuth>
      <MethodologiesContent />
    </RequireAuth>
  );
}
