"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RequireRole } from "@eaip/auth";
import { getDefaultClient } from "@eaip/api";
import {
  EnterpriseShell,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ErrorState,
} from "@eaip/ui-enterprise";
import { Badge, Skeleton } from "@eaip/ui-primitives";

interface PoliciesResponse {
  policies: unknown[];
  total: number;
}

interface GovernanceResponse {
  policies: { total: number };
  guardrails: { status: string };
  compliance: { status: string };
  wave2Systems?: unknown[];
  wave2Policies?: unknown[];
}

function GovernanceContent() {
  const [data, setData] = useState<GovernanceResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      const client = getDefaultClient();
      const [policies, guardrails, compliance, wave2Systems, wave2Policies] = await Promise.all([
        client.get<PoliciesResponse>("/governance/policies"),
        client.get<{ status: string }>("/governance/guardrails"),
        client.get<{ status: string }>("/governance/compliance"),
        client
          .get<unknown[]>("/governance2/systems")
          .catch(() => ({ data: [] as unknown[], error: null as unknown })),
        client
          .get<unknown[]>("/governance2/policies")
          .catch(() => ({ data: [] as unknown[], error: null as unknown })),
      ]);
      if (cancelled) return;
      const failed = [policies, guardrails, compliance].find((response) => response.error);
      if (failed?.error) {
        setError(failed.error.message);
        return;
      }
      setData({
        policies: { total: policies.data?.total ?? 0 },
        guardrails: guardrails.data ?? { status: "unavailable" },
        compliance: compliance.data ?? { status: "unavailable" },
        wave2Systems: (wave2Systems as { data?: unknown[] }).data ?? [],
        wave2Policies: (wave2Policies as { data?: unknown[] }).data ?? [],
      });
    }
    void loadData().catch((reason: unknown) => {
      if (!cancelled)
        setError(reason instanceof Error ? reason.message : "Unable to load governance data");
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <EnterpriseShell
      appId="enterprise-console"
      pageTitle="Governance & Compliance"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Governance" }]}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-text text-2xl font-bold tracking-tight">
            Governance &amp; Compliance
          </h1>
          <p className="text-text-secondary text-sm">
            Live policy enforcement, AI guardrails, and enterprise compliance status.
          </p>
        </div>

        {error ? <ErrorState message={error} /> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <StatusCard
            label="Active policies"
            value={data ? String(data.policies.total) : null}
            href="/governance/policies"
          />
          <StatusCard
            label="Guardrails status"
            value={data?.guardrails.status ?? null}
            href="/governance/guardrails"
          />
          <StatusCard label="Compliance posture" value={data?.compliance.status ?? null} />
        </div>
        {(data?.wave2Systems?.length ?? 0) > 0 && (
          <div className="rounded-card border-border bg-surface border p-5">
            <h3 className="text-text font-semibold">
              AI Governance Center — Governed Systems ({String(data?.wave2Systems?.length)})
            </h3>
            <div className="mt-3 space-y-2">
              {(
                data?.wave2Systems as {
                  system_id: string;
                  name: string;
                  risk: string;
                  type: string;
                }[]
              )
                .slice(0, 10)
                .map((s) => (
                  <div
                    key={s.system_id}
                    className="border-border flex items-center justify-between rounded border px-3 py-2"
                  >
                    <span className="text-text text-sm">{s.name}</span>
                    <Badge variant="default">
                      {s.risk} · {s.type}
                    </Badge>
                  </div>
                ))}
            </div>
          </div>
        )}
        {(data?.wave2Policies?.length ?? 0) > 0 && (
          <div className="rounded-card border-border bg-surface border p-5">
            <h3 className="text-text font-semibold">
              Wave 2 Policies ({String(data?.wave2Policies?.length)})
            </h3>
            <div className="mt-3 space-y-2">
              {(
                data?.wave2Policies as { policy_id: string; name: string; risk_threshold: string }[]
              )
                .slice(0, 10)
                .map((p) => (
                  <div
                    key={p.policy_id}
                    className="border-border flex items-center justify-between rounded border px-3 py-2"
                  >
                    <span className="text-text text-sm">{p.name}</span>
                    <Badge variant="default">{p.risk_threshold}</Badge>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </EnterpriseShell>
  );
}

function StatusCard({
  label,
  value,
  href,
}: {
  label: string;
  value: string | null;
  href?: string;
}) {
  const content = (
    <Card liquid padding="md" className="transition-smooth hover:border-primary/50">
      <CardHeader>
        <CardTitle>{label}</CardTitle>
      </CardHeader>
      <CardContent className="mt-2">
        {value === null ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <Badge variant="primary">{value}</Badge>
        )}
      </CardContent>
    </Card>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

export default function GovernanceDashboard() {
  return (
    <RequireRole requiredRole="admin">
      <GovernanceContent />
    </RequireRole>
  );
}
