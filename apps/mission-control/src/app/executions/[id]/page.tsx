"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { RequireAuth } from "@eaip/auth";
import { EnterpriseShell, LoadingState, ErrorState } from "@eaip/ui-enterprise";
import { Card, CardHeader, CardContent } from "@eaip/ui-foundation";
import { SectionTitle } from "@eaip/ui-primitives";
import { MetricCard, Timeline } from "@eaip/ui-visualizations";
import { fetchExecution } from "../../../services/executions-service";
import type { ExecutionDetails } from "../../../services/executions-service";

function ExecutionContent() {
  const params = useParams();
  const executionId = String(params.id);
  const [execution, setExecution] = useState<ExecutionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"logs" | "events" | "errors">("logs");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchExecution(executionId);
      setExecution(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load execution");
    } finally {
      setLoading(false);
    }
  }, [executionId]);

  useEffect(() => { void load(); }, [load]);

  return (
    <EnterpriseShell
      appId="mission-control"
      pageTitle={`Execution ${executionId}`}
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Executions", href: "/queue" },
        { label: executionId },
      ]}
    >
      {loading ? (
        <LoadingState message="Loading execution..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => { void load(); }} />
      ) : execution ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <MetricCard label="Status" value={execution.status} icon="activity" />
            <MetricCard label="Duration" value={`${String(execution.duration)}ms`} icon="clock" />
            <MetricCard label="Retries" value={execution.retries} icon="refresh" />
            <MetricCard label="Errors" value={execution.errors.length} icon="alert" />
            <MetricCard label="Agent" value={execution.agentId} icon="robot" />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <SectionTitle>Input</SectionTitle>
              </CardHeader>
              <CardContent>
                <pre className="max-h-48 overflow-auto rounded bg-surface-secondary p-3 text-xs text-text">
                  {execution.input}
                </pre>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <SectionTitle>Output</SectionTitle>
              </CardHeader>
              <CardContent>
                <pre className="max-h-48 overflow-auto rounded bg-surface-secondary p-3 text-xs text-text">
                  {execution.output ?? "No output"}
                </pre>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setActiveTab("logs"); }}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    activeTab === "logs" ? "bg-primary text-text-inverse" : "text-text-secondary hover:bg-surface-tertiary"
                  }`}
                >
                  Logs ({execution.logs.length})
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab("events"); }}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    activeTab === "events" ? "bg-primary text-text-inverse" : "text-text-secondary hover:bg-surface-tertiary"
                  }`}
                >
                  Events ({execution.events.length})
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab("errors"); }}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    activeTab === "errors" ? "bg-primary text-text-inverse" : "text-text-secondary hover:bg-surface-tertiary"
                  }`}
                >
                  Errors ({execution.errors.length})
                </button>
              </div>
            </CardHeader>
            <CardContent>
              {activeTab === "logs" ? (
                <div className="space-y-1 max-h-96 overflow-y-auto">
                  {execution.logs.map((log, idx) => (
                    <div key={idx} className="flex gap-2 rounded px-2 py-1 text-xs font-mono hover:bg-surface-tertiary">
                      <span className="shrink-0 text-text-muted">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      <span className={`shrink-0 font-medium ${
                        log.level === "error" ? "text-danger" :
                        log.level === "warn" ? "text-warning" :
                        "text-text-secondary"
                      }`}>
                        [{log.level.toUpperCase()}]
                      </span>
                      <span className="text-text">{log.message}</span>
                    </div>
                  ))}
                </div>
              ) : activeTab === "events" ? (
                <Timeline items={execution.events.map((e) => ({
                  id: e.type,
                  title: e.type,
                  description: JSON.stringify(e.data),
                  timestamp: e.timestamp,
                  status: "success" as const,
                }))} />
              ) : (
                <div className="space-y-2">
                  {execution.errors.length === 0 ? (
                    <p className="text-sm text-text-secondary">No errors recorded.</p>
                  ) : (
                    execution.errors.map((err, idx) => (
                      <div key={idx} className="rounded border border-danger/20 bg-danger/5 p-3">
                        <p className="text-sm font-medium text-danger">{err.message}</p>
                        <p className="text-xs text-text-secondary mt-1">{new Date(err.timestamp).toLocaleString()}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </EnterpriseShell>
  );
}

export default function ExecutionPage() {
  return <RequireAuth><ExecutionContent /></RequireAuth>;
}
