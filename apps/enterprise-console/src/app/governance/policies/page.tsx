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

interface Policy {
  id: string;
  name: string;
  type: string;
  description: string;
  enabled: boolean;
}

interface PolicyResponse {
  policies: Policy[];
}

function PoliciesContent() {
  const [policies, setPolicies] = useState<Policy[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadPolicies() {
      const response = await getDefaultClient().get<PolicyResponse>("/governance/policies");
      if (cancelled) return;
      if (response.error) {
        setError(response.error.message);
        return;
      }
      setPolicies(response.data?.policies ?? []);
    }
    void loadPolicies().catch((reason: unknown) => {
      if (!cancelled)
        setError(reason instanceof Error ? reason.message : "Unable to load policies");
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <EnterpriseShell
      appId="enterprise-console"
      pageTitle="Policies"
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Governance", href: "/governance" },
        { label: "Policies" },
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-text text-2xl font-bold tracking-tight">Governance Policies</h1>
            <p className="text-text-secondary text-sm">
              Enterprise organization governance, access control, and compliance policies.
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
            <CardTitle>Registered Policies</CardTitle>
          </CardHeader>
          <CardContent className="mt-4">
            {policies === null ? (
              <Skeleton className="h-24 w-full" />
            ) : policies.length === 0 ? (
              <p className="text-text-muted text-sm">No policies registered.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-border text-text-muted border-b text-xs font-semibold tracking-wider uppercase">
                      <th className="p-3">Policy Name</th>
                      <th className="p-3">Category / Type</th>
                      <th className="p-3">Description</th>
                      <th className="p-3">Enforcement Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-border divide-y">
                    {policies.map((policy) => (
                      <tr
                        key={policy.id}
                        className="hover:bg-surface-secondary/50 transition-colors"
                      >
                        <td className="text-text p-3 font-medium">{policy.name}</td>
                        <td className="p-3">
                          <Badge variant="glass">{policy.type}</Badge>
                        </td>
                        <td className="text-text-secondary p-3">{policy.description}</td>
                        <td className="p-3">
                          <Badge variant={policy.enabled ? "success" : "default"}>
                            {policy.enabled ? "Active" : "Disabled"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </EnterpriseShell>
  );
}

export default function PoliciesPage() {
  return (
    <RequireRole requiredRole="admin">
      <PoliciesContent />
    </RequireRole>
  );
}
