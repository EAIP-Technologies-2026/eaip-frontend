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
import { Badge, Button, Skeleton } from "@eaip/ui-primitives";

interface GuardrailResponse {
  status: string;
  details?: Record<string, unknown>;
}

function GuardrailsContent() {
  const [data, setData] = useState<GuardrailResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      const response = await getDefaultClient().get<GuardrailResponse>("/governance/guardrails");
      if (cancelled) return;
      if (response.error) {
        setError(response.error.message);
        return;
      }
      setData(response.data);
    }
    void loadData().catch((reason: unknown) => {
      if (!cancelled)
        setError(reason instanceof Error ? reason.message : "Unable to load guardrails");
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <EnterpriseShell
      appId="enterprise-console"
      pageTitle="AI Guardrails"
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Governance", href: "/governance" },
        { label: "Guardrails" },
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-text text-2xl font-bold tracking-tight">AI Guardrails & Safety</h1>
            <p className="text-text-secondary text-sm">
              Runtime safety rules, hallucination filters, and data leakage protection.
            </p>
          </div>
          <Link href="/governance">
            <Button variant="secondary" size="sm">
              Back to Governance
            </Button>
          </Link>
        </div>

        {error ? <ErrorState message={error} /> : null}

        <Card liquid padding="md">
          <CardHeader>
            <CardTitle>Guardrail Engine Status</CardTitle>
          </CardHeader>
          <CardContent className="mt-4 space-y-4">
            {!data ? (
              <Skeleton className="h-10 w-48" />
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-text-secondary text-sm">Status:</span>
                  <Badge variant={data.status === "healthy" ? "success" : "warning"}>
                    {data.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="rounded-card border-border bg-surface-secondary/70 border p-4">
                  <p className="text-text-muted mb-2 text-xs font-semibold tracking-wider uppercase">
                    Engine Configuration & Diagnostics
                  </p>
                  <pre className="text-text-secondary overflow-auto font-mono text-xs">
                    {JSON.stringify(data.details ?? {}, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </EnterpriseShell>
  );
}

export default function GuardrailsPage() {
  return (
    <RequireRole requiredRole="admin">
      <GuardrailsContent />
    </RequireRole>
  );
}
