"use client";

import { useState, useEffect, useCallback } from "react";
import { RequireAuth } from "@eaip/auth";
import { getDefaultClient } from "@eaip/api";
import {
  EnterpriseShell,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  StatCard,
  ErrorState,
} from "@eaip/ui-enterprise";
import { Button, Badge, Input, Skeleton } from "@eaip/ui-primitives";
import { EnterpriseIcon } from "@eaip/icons";
import { usePlatformStore } from "@eaip/state";
import { fetchDecisions } from "../../services/intelligence-service";
import { DecisionLineage } from "../../components/decision-lineage";
import { ExplainThis } from "../../components/explain-this";

interface DecisionEntry {
  id: string;
  agent: string;
  action: string;
  confidence: number;
  status: "approved" | "pending" | "rejected" | "overridden";
  riskLevel: "low" | "medium" | "high";
  timestamp: string;
}

function DecisionsContent() {
  const addToast = usePlatformStore((s) => s.addToast);
  const [decisions, setDecisions] = useState<DecisionEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [intel, setIntel] = useState<unknown[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", objective: "" });

  const loadAll = useCallback(async () => {
    try {
      const client = getDefaultClient();
      const res = await client.get<{ items: DecisionEntry[] }>("/decisions");
      if (res.data?.items) setDecisions(res.data.items);
      else setDecisions([]);
      const r2 = await fetchDecisions();
      setIntel(r2.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load decisions");
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const totalDecisions = decisions?.length ?? 0;
  const approvedCount = decisions?.filter((d) => d.status === "approved").length ?? 0;
  const pendingCount = decisions?.filter((d) => d.status === "pending").length ?? 0;

  return (
    <EnterpriseShell
      appId="enterprise-console"
      pageTitle="Decisions Audit"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Decisions Audit" }]}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-text text-2xl font-bold tracking-tight">Decisions Audit Log</h1>
          <p className="text-text-secondary text-sm">
            Traceable AI execution audit trail, risk classification, and human-in-the-loop
            governance overrides.
          </p>
        </div>

        {error ? <ErrorState message={error} /> : null}

        <div className="rounded-card border-border bg-surface space-y-4 border p-5">
          <h3 className="text-text font-semibold">Create intelligence decision</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              placeholder="Title"
              value={form.title}
              onChange={(e) => {
                setForm((f) => ({ ...f, title: e.target.value }));
              }}
            />
            <Input
              placeholder="Objective"
              value={form.objective}
              onChange={(e) => {
                setForm((f) => ({ ...f, objective: e.target.value }));
              }}
            />
          </div>
          <div className="flex justify-end">
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                if (!form.title.trim()) {
                  addToast({ type: "error", title: "Title required" });
                  return;
                }
                void getDefaultClient()
                  .post("/intelligence/decisions", { title: form.title, objective: form.objective })
                  .then(() => {
                    addToast({ type: "success", title: "Decision created" });
                    void loadAll();
                  });
              }}
            >
              Create
            </Button>
          </div>
        </div>

        {intel.length > 0 ? (
          <Card liquid padding="md">
            <CardHeader>
              <CardTitle>Intelligence Decisions</CardTitle>
            </CardHeader>
            <CardContent className="mt-4 space-y-2">
              {(
                intel as {
                  decision_id: string;
                  title: string;
                  status: string;
                  recommendation: string;
                }[]
              )
                .slice(0, 5)
                .map((d) => (
                  <div
                    key={d.decision_id}
                    className="border-border flex items-center justify-between rounded-lg border px-3 py-2"
                  >
                    <span className="text-text text-sm">{d.title}</span>
                    <Badge variant={d.status === "approved" ? "success" : "default"}>
                      {d.status}
                      {d.recommendation ? ` → ${d.recommendation}` : ""}
                    </Badge>
                  </div>
                ))}
            </CardContent>
          </Card>
        ) : null}

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            label="Total Logged Decisions"
            value={totalDecisions}
            icon={<EnterpriseIcon name="shield" size={18} />}
          />
          <StatCard
            label="Auto-Approved"
            value={approvedCount}
            icon={<EnterpriseIcon name="check" size={18} />}
          />
          <StatCard
            label="Pending Approval"
            value={pendingCount}
            icon={<EnterpriseIcon name="clock" size={18} />}
          />
        </div>

        <Card liquid padding="md">
          <CardHeader>
            <CardTitle>Autonomous Decision History</CardTitle>
          </CardHeader>
          <CardContent className="mt-4">
            {decisions === null ? (
              <Skeleton className="h-32 w-full" />
            ) : decisions.length === 0 ? (
              <p className="text-text-muted text-sm">No decisions logged.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-border text-text-muted border-b text-xs font-semibold tracking-wider uppercase">
                      <th className="p-3">Decision ID</th>
                      <th className="p-3">Agent</th>
                      <th className="p-3">Proposed Action</th>
                      <th className="p-3">Confidence</th>
                      <th className="p-3">Risk Level</th>
                      <th className="p-3">Governance Status</th>
                      <th className="p-3">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-border divide-y">
                    {decisions.map((dec) => (
                      <tr
                        key={dec.id}
                        onClick={() => {
                          setSelected(dec.id);
                        }}
                        className="hover:bg-surface-secondary/50 cursor-pointer transition-colors"
                      >
                        <td className="text-primary p-3 font-mono text-xs">{dec.id}</td>
                        <td className="text-text p-3 font-medium">{dec.agent}</td>
                        <td className="text-text-secondary p-3">{dec.action}</td>
                        <td className="text-text p-3 font-semibold">
                          {Math.round(dec.confidence * 100)}%
                        </td>
                        <td className="p-3">
                          <Badge
                            variant={
                              dec.riskLevel === "high"
                                ? "danger"
                                : dec.riskLevel === "medium"
                                  ? "warning"
                                  : "glass"
                            }
                          >
                            {dec.riskLevel.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge
                            variant={
                              dec.status === "approved"
                                ? "success"
                                : dec.status === "pending"
                                  ? "warning"
                                  : "default"
                            }
                          >
                            {dec.status.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="text-text-muted p-3 text-xs">{dec.timestamp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
        {selected ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Decision lineage — {selected}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelected(null);
                }}
              >
                Close
              </Button>
            </div>
            <DecisionLineage decisionId={selected} />
            <ExplainThis entityId={selected} entityType="decision" />
          </div>
        ) : null}
      </div>
    </EnterpriseShell>
  );
}

export default function DecisionsPage() {
  return (
    <RequireAuth>
      <DecisionsContent />
    </RequireAuth>
  );
}
