"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { RequireAuth } from "@eaip/auth";
import { usePlatformStore } from "@eaip/state";
import {
  EnterpriseShell,
  LoadingState,
  ErrorState,
  DataGrid,
  useConfirm,
  ConfirmDialog,
  SectionHeader,
} from "@eaip/ui-enterprise";
import { MetricCard } from "@eaip/ui-visualizations";
import { Button, Input, Badge } from "@eaip/ui-primitives";
import { EnterpriseIcon } from "@eaip/icons";
import type { Agent, AgentExecution, AgentEvent } from "@eaip/agent";
import { useRealtime } from "@eaip/realtime";
import { logger } from "@eaip/logging";
import {
  getAgent,
  listExecutions,
  getAgentEvents,
  executeAgent,
  pauseExecution,
  resumeExecution,
  stopExecution,
  retryExecution,
} from "../../../services/agents-service";
import { useFallback } from "../../../services/fallback-context";

function StatusBadge({ status }: { status: string }) {
  const variant =
    status === "running"
      ? "primary"
      : status === "completed"
        ? "success"
        : status === "failed"
          ? "danger"
          : "default";
  return (
    <Badge variant={variant} className="capitalize">
      {status}
    </Badge>
  );
}

function AgentDetailPageContent() {
  const params = useParams();
  const agentId = String(params.id);
  const router = useRouter();
  const hasPermission = usePlatformStore((state) => state.hasPermission);
  const addToast = usePlatformStore((state) => state.addToast);
  const { setFallback } = useFallback();
  const { confirm, state: confirmState, cancel } = useConfirm();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [executions, setExecutions] = useState<AgentExecution[]>([]);
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [executing, setExecuting] = useState(false);

  const loadAgent = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [agentResult, executionResult, eventResult] = await Promise.all([
        getAgent(agentId),
        listExecutions(agentId),
        getAgentEvents(agentId, 50),
      ]);
      if (agentResult.source === "fallback" || executionResult.source === "fallback" || eventResult.source === "fallback") {
        setFallback("agents", true);
      }
      setAgent(agentResult.data);
      setExecutions(executionResult.data);
      setEvents(eventResult.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("Failed to load agent", { error: message });
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [agentId, setFallback]);

  useEffect(() => {
    void loadAgent();
  }, [loadAgent]);

  useRealtime({
    channels: ["agent"],
    onMessage: (channel, data) => {
      if (channel === "agent") {
        const event = data as { agent_id?: string; event_type?: string } | undefined;
        if (event?.agent_id === agentId) {
          void loadAgent();
        }
      }
    },
    enabled: typeof window !== "undefined",
  });

  async function handleExecute() {
    if (!hasPermission("manage:agents")) return;
    setExecuting(true);
    try {
      const result = await executeAgent(agentId, input);
      setExecutions((prev) => [result.data, ...prev]);
      setInput("");
      addToast({ type: "success", title: "Agent executed", message: result.data.id });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("Failed to execute agent", { error: message });
      addToast({ type: "error", title: "Execution failed", message });
    } finally {
      setExecuting(false);
    }
  }

  async function handleControl(
    execution: AgentExecution,
    action: "pause" | "resume" | "stop" | "retry",
  ) {
    try {
      if (action === "pause") {
        await pauseExecution(agentId, execution.id);
        addToast({ type: "success", title: "Execution paused" });
      } else if (action === "resume") {
        await resumeExecution(agentId, execution.id);
        addToast({ type: "success", title: "Execution resumed" });
      } else if (action === "stop") {
        await stopExecution(agentId, execution.id);
        addToast({ type: "success", title: "Execution stopped" });
      } else {
        const result = await retryExecution(agentId, execution.id);
        setExecutions((prev) => [result.data, ...prev]);
        addToast({ type: "success", title: "Execution retried", message: result.data.id });
      }
      void loadAgent();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      addToast({ type: "error", title: `Failed to ${action} execution`, message });
    }
  }

  async function handleDelete() {
    const confirmed = await confirm({
      title: "Delete agent",
      message: `Are you sure you want to delete "${agent?.name ?? agentId}"?`,
      variant: "danger",
      confirmLabel: "Delete",
    });
    if (!confirmed) return;
    try {
      const { deleteAgent } = await import("../../../services/agents-service");
      await deleteAgent(agentId);
      addToast({ type: "success", title: "Agent deleted" });
      router.push("/agents");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      addToast({ type: "error", title: "Failed to delete agent", message });
    }
  }

  const successRate = executions.length > 0
    ? Math.round((executions.filter((e) => e.status === "completed").length / executions.length) * 100)
    : 0;

  const avgDuration = executions.length > 0
    ? Math.round(executions.reduce((sum, e) => sum + (e.duration ?? 0), 0) / executions.length)
    : 0;

  const lastRunTime = executions[0]?.startedAt
    ? new Date(executions[0].startedAt).toLocaleString()
    : "—";

  return (
    <EnterpriseShell
      appId="enterprise-console"
      pageTitle={agent?.name ?? "Agent details"}
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Agents", href: "/agents" },
        { label: agent?.name ?? agentId },
      ]}
    >
      {loading ? (
        <LoadingState message="Loading agent..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => { void loadAgent(); }} />
      ) : (
        <div className="space-y-8">
          <section className="surface-hero relative overflow-hidden p-8 lg:p-10">
            <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br from-primary-subtle/50 to-transparent blur-3xl" aria-hidden="true" />
            <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-gradient-to-tr from-accent-glow/30 to-transparent blur-2xl" aria-hidden="true" />
            <div className="relative">
              <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-primary uppercase mb-4">
                <EnterpriseIcon name="activity" size={14} />
                Agent Detail
              </div>
              <h1 className="text-3xl font-bold text-text tracking-tight">{agent?.name}</h1>
              <p className="mt-3 text-base text-text-secondary max-w-2xl leading-relaxed">
                Monitor executions, review events, and manage this agent&apos;s operational state.
              </p>
            </div>
          </section>

          {/* Executive Summary Strip */}
          <section className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard label="Total Executions" value={executions.length} icon={<EnterpriseIcon name="barChart" size={20} />} />
              <MetricCard label="Success Rate" value={`${String(successRate)}%`} icon={<EnterpriseIcon name="check" size={20} />} />
              <MetricCard label="Avg Duration" value={`${String(avgDuration)}ms`} icon={<EnterpriseIcon name="clock" size={20} />} />
              <MetricCard label="Last Run" value={lastRunTime} icon={<EnterpriseIcon name="activity" size={20} />} />
            </div>
          </section>

          {/* Main Workspace */}
          <section className="space-y-4">
            <SectionHeader icon="zap" title="Agent Workspace" />
            <div className="grid gap-4 lg:grid-cols-3">
              {/* Left column — 2/3 */}
              <div className="lg:col-span-2 space-y-4">
                {/* Agent Profile */}
                <div className="surface-card p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-text">{agent?.name}</h2>
                      <p className="mt-1 text-sm text-text-secondary flex items-center gap-2">
                        <EnterpriseIcon name="activity" size={14} />
                        Status: <StatusBadge status={agent?.status ?? "unknown"} />
                      </p>
                    </div>
                    {hasPermission("manage:agents") ? (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        iconLeft="trash"
                        onClick={() => { void handleDelete(); }}
                      >
                        Delete
                      </Button>
                    ) : null}
                  </div>
                  {agent?.description ? (
                    <p className="mt-4 text-sm text-text-secondary leading-relaxed">{agent.description}</p>
                  ) : null}
                  {agent?.systemPrompt ? (
                    <div className="mt-4 rounded-lg bg-surface-secondary border border-border/60 p-4">
                      <p className="text-xs font-semibold tracking-wide text-text-muted uppercase">Operating Instructions</p>
                      <p className="mt-2 text-sm text-text-secondary leading-relaxed">{agent.systemPrompt}</p>
                    </div>
                  ) : null}
                </div>

                {/* Execute Agent */}
                {hasPermission("manage:agents") ? (
                  <div className="surface-card p-6">
                    <h3 className="mb-3 text-base font-semibold text-text">Execute Agent</h3>
                    <div className="flex gap-2">
                      <Input
                        value={input}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                          setInput(event.target.value);
                        }}
                        placeholder="Enter task or input..."
                        className="flex-1"
                      />
                      <Button
                        onClick={() => { void handleExecute(); }}
                        loading={executing}
                        iconLeft="play"
                      >
                        Execute
                      </Button>
                    </div>
                  </div>
                ) : null}

                {/* Execution History */}
                <div className="surface-card p-6">
                  <h3 className="mb-4 text-base font-semibold text-text">Execution History</h3>
                  <DataGrid
                    data={executions}
                    keyExtractor={(execution) => execution.id}
                    pageSize={5}
                    columns={[
                      { key: "id", header: "Run ID", sortable: true, filterable: true },
                      {
                        key: "status",
                        header: "Status",
                        sortable: true,
                        render: (execution) => <StatusBadge status={execution.status} />,
                      },
                      { key: "input", header: "Input", filterable: true },
                      {
                        key: "output",
                        header: "Output",
                        render: (execution) => (
                          <span className="max-w-xs truncate block text-text-secondary">{execution.output ?? "—"}</span>
                        ),
                      },
                      {
                        key: "duration",
                        header: "Duration",
                        render: (execution) => `${String(execution.duration ?? 0)}ms`,
                      },
                      {
                        key: "actions",
                        header: "Actions",
                        render: (execution) => (
                          <div className="flex items-center gap-3">
                            {execution.status === "running" ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => { void handleControl(execution, "pause"); }}
                                  className="text-xs text-primary hover:text-primary-hover transition-smooth"
                                >
                                  Pause
                                </button>
                                <button
                                  type="button"
                                  onClick={() => { void handleControl(execution, "stop"); }}
                                  className="text-xs text-danger hover:text-danger/80 transition-smooth"
                                >
                                  Stop
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() => { void handleControl(execution, "retry"); }}
                                className="text-xs text-primary hover:text-primary-hover transition-smooth"
                              >
                                Retry
                              </button>
                            )}
                          </div>
                        ),
                      },
                    ]}
                  />
                </div>
              </div>

              {/* Right column — 1/3: Events Feed */}
              <div className="surface-card p-6">
                <h3 className="mb-4 text-base font-semibold text-text">Event Stream</h3>
                {events.length === 0 ? (
                  <p className="text-sm text-text-muted text-center py-8">No events recorded yet.</p>
                ) : (
                  <ul className="max-h-96 space-y-3 overflow-y-auto">
                    {events.map((event) => (
                      <li key={event.id} className="rounded-lg border border-border/60 p-4 text-sm bg-surface-secondary/50">
                        <p className="font-medium text-text">{event.type}</p>
                        <p className="text-xs text-text-muted mt-1">{event.timestamp}</p>
                        <pre className="mt-2 max-w-full overflow-x-auto rounded bg-surface-tertiary p-2 text-xs text-text-secondary">
                          {JSON.stringify(event.data, null, 2)}
                        </pre>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>
        </div>
      )}

      <ConfirmDialog
        open={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        variant={confirmState.variant}
        confirmLabel={confirmState.confirmLabel}
        cancelLabel={confirmState.cancelLabel}
        onConfirm={() => { confirmState.onConfirm?.(); }}
        onCancel={cancel}
      />
    </EnterpriseShell>
  );
}

export default function AgentDetailPage() {
  return (
    <RequireAuth>
      <AgentDetailPageContent />
    </RequireAuth>
  );
}
