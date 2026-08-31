"use client";

import { useState, useEffect, useCallback } from "react";
import { RequireAuth } from "@eaip/auth";
import { EnterpriseShell, LoadingState, ErrorState } from "@eaip/ui-enterprise";
import { Button, Badge, EmptyState } from "@eaip/ui-primitives";
import { EnterpriseIcon } from "@eaip/icons";
import {
  fetchRuntimes,
  fetchAuditChain,
  verifyAuditChain,
  fetchFederatedOrgs,
} from "../../services/runtimes-service";

function RuntimesContent() {
  const [runtimes, setRuntimes] = useState<unknown[]>([]);
  const [audit, setAudit] = useState<unknown[]>([]);
  const [verify, setVerify] = useState<{ valid: boolean; count: number } | null>(null);
  const [orgs, setOrgs] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [rt, ac, vf, fo] = await Promise.all([
        fetchRuntimes(),
        fetchAuditChain(),
        verifyAuditChain(),
        fetchFederatedOrgs(),
      ]);
      setRuntimes(rt.data);
      setAudit(ac.data);
      setVerify(vf.data);
      setOrgs(fo.data);
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
        pageTitle="Enterprise Scale"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Enterprise Scale" }]}
      >
        <LoadingState message="Loading..." />
      </EnterpriseShell>
    );
  if (error)
    return (
      <EnterpriseShell
        appId="enterprise-console"
        pageTitle="Enterprise Scale"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Enterprise Scale" }]}
      >
        <ErrorState message={error} onRetry={() => void load()} />
      </EnterpriseShell>
    );

  return (
    <EnterpriseShell
      appId="enterprise-console"
      pageTitle="Enterprise Scale"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Enterprise Scale" }]}
    >
      <div className="space-y-8">
        <section className="surface-hero relative overflow-hidden p-8 lg:p-10">
          <div
            className="from-primary-subtle/50 absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br to-transparent blur-3xl"
            aria-hidden="true"
          />
          <div className="relative">
            <div className="text-primary mb-4 flex items-center gap-2 text-xs font-semibold tracking-widest uppercase">
              <EnterpriseIcon name="activity" size={14} /> Scale · Trust · Federation
            </div>
            <h1 className="text-text text-3xl font-bold tracking-tight">Enterprise Scale</h1>
            <p className="text-text-secondary mt-3 max-w-2xl text-base leading-relaxed">
              Multi-runtime, verifiable audit chain, federated tenancy, cross-system workflows.
            </p>
          </div>
        </section>

        <section className="rounded-card border-border bg-surface border p-5">
          <h3 className="text-text mb-3 font-semibold">Runtimes</h3>
          {(runtimes as { runtime_id: string; name: string; kind: string; status: string }[])
            .length === 0 ? (
            <EmptyState icon="activity" title="No runtimes" description="Register a runtime." />
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {(
                runtimes as {
                  runtime_id: string;
                  name: string;
                  kind: string;
                  status: string;
                  capabilities: string[];
                }[]
              ).map((r) => (
                <div key={r.runtime_id} className="border-border rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-text text-sm font-medium">{r.name}</span>
                    <Badge variant={r.status === "healthy" ? "success" : "warning"}>
                      {r.status}
                    </Badge>
                  </div>
                  <p className="text-text-secondary mt-1 text-xs">
                    {r.kind} · {r.runtime_id}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {r.capabilities.map((c: string) => (
                      <Badge key={c} variant="default">
                        {c}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-card border-border bg-surface border p-5">
          <h3 className="text-text mb-3 font-semibold">Verifiable Execution</h3>
          <div className="flex items-center gap-2">
            <Badge variant={verify?.valid ? "success" : "danger"}>
              {verify?.valid ? "Chain valid" : "Chain broken"}
            </Badge>
            <span className="text-text-secondary text-sm">{verify?.count ?? 0} records</span>
            <Button variant="secondary" size="sm" onClick={() => void load()}>
              Verify
            </Button>
          </div>
          {(audit as { record_id: string; action: string; actor: string; record_hash: string }[])
            .length > 0 ? (
            <div className="mt-3 max-h-64 space-y-1 overflow-auto">
              {(
                audit as {
                  record_id: string;
                  action: string;
                  actor: string;
                  record_hash: string;
                  timestamp: string;
                }[]
              )
                .slice(0, 20)
                .map((a) => (
                  <div
                    key={a.record_id}
                    className="border-border flex items-center justify-between border-b py-1 text-xs"
                  >
                    <span className="text-text">{a.action}</span>
                    <span className="text-text-secondary">
                      {a.actor} · {a.record_hash.slice(0, 12)}
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-text-secondary mt-2 text-sm">
              No audit records yet — trigger a cross-system workflow via POST
              /api/federation/cross-workflow.
            </p>
          )}
        </section>

        <section className="rounded-card border-border bg-surface border p-5">
          <h3 className="text-text mb-3 font-semibold">Federated Tenancy</h3>
          {(orgs as { org_id: string; name: string; parent_org_id: string }[]).length === 0 ? (
            <p className="text-text-secondary text-sm">
              No federated orgs. Parent orgs can scope child resources.
            </p>
          ) : (
            <div className="space-y-2">
              {(
                orgs as { org_id: string; name: string; parent_org_id: string; tenant_id: string }[]
              ).map((o) => (
                <div key={o.org_id} className="border-border rounded-lg border px-3 py-2">
                  <span className="text-text text-sm font-medium">{o.name}</span>
                  <span className="text-text-secondary ml-2 text-xs">
                    {o.org_id}
                    {o.parent_org_id ? ` ← ${o.parent_org_id}` : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
          <p className="text-text-secondary mt-3 text-xs">
            Existing organizations continue unaffected — federation is additive.
          </p>
        </section>
      </div>
    </EnterpriseShell>
  );
}

export default function RuntimesPage() {
  return (
    <RequireAuth>
      <RuntimesContent />
    </RequireAuth>
  );
}
