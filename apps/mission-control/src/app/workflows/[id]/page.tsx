"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { RequireAuth } from "@eaip/auth";
import { usePlatformStore } from "@eaip/state";
import {
  EnterpriseShell,
  LoadingState,
  ErrorState,
  DataGrid,
  useConfirm,
  ConfirmDialog,
} from "@eaip/ui-enterprise";
import { Button } from "@eaip/ui-primitives";
import { EnterpriseIcon } from "@eaip/icons";
import type { WorkflowDefinition, WorkflowRun } from "@eaip/workflow";
import { useRealtime } from "@eaip/realtime";
import { logger } from "@eaip/logging";
import { getWorkflow, listRuns, startWorkflow, deleteWorkflow, pauseRun, resumeRun, cancelRun, retryRun } from "../../../services/workflows-service";

function StatusBadge({ status }: { status: string }) {
  const color =
    status === "running"
      ? "bg-primary-subtle text-primary"
      : status === "completed"
        ? "bg-success-subtle text-success"
        : status === "failed"
          ? "bg-danger-subtle text-danger"
          : "bg-surface-secondary text-text-secondary";
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${color}`}>
      {status}
    </span>
  );
}

function WorkflowDetailPageContent() {
  const params = useParams();
  const workflowId = String(params.id);
  const hasPermission = usePlatformStore((state) => state.hasPermission);
  const addToast = usePlatformStore((state) => state.addToast);
  const { confirm, state: confirmState, cancel } = useConfirm();
  const [workflow, setWorkflow] = useState<WorkflowDefinition | null>(null);
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  const loadWorkflow = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [workflowResult, runsResult] = await Promise.all([
        getWorkflow(workflowId),
        listRuns(workflowId),
      ]);
      if (workflowResult.error) throw new Error(workflowResult.error);
      if (runsResult.error) throw new Error(runsResult.error);
      setWorkflow(workflowResult.data);
      setRuns(runsResult.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("Failed to load workflow", { error: message });
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [workflowId]);

  useEffect(() => {
    void loadWorkflow();
  }, [loadWorkflow]);

  useRealtime({
    channels: ["workflow"],
    onMessage: (channel, data) => {
      if (channel === "workflow") {
        const event = data as { workflow_id?: string } | undefined;
        if (event?.workflow_id === workflowId) {
          void loadWorkflow();
        }
      }
    },
    enabled: typeof window !== "undefined",
  });

  async function handleStart() {
    if (!hasPermission("manage:workflows")) return;
    setStarting(true);
    try {
      const result = await startWorkflow(workflowId);
      if (result.error) throw new Error(result.error);
      // result.data is { runId } but WorkflowRun needs full object for setRuns
      addToast({ type: "success", title: "Workflow started", message: result.data.runId });
      void loadWorkflow();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("Failed to start workflow", { error: message });
      addToast({ type: "error", title: "Failed to start workflow", message });
    } finally {
      setStarting(false);
    }
  }

  async function handleControl(run: WorkflowRun, action: "pause" | "resume" | "cancel" | "retry") {
    try {
      if (action === "retry") {
        const result = await retryRun(run.id);
        if (result.error) throw new Error(result.error);
        setRuns((prev) => [result.data, ...prev]);
        addToast({ type: "success", title: "Run retried", message: result.data.id });
      } else {
        const fn = action === "pause" ? pauseRun : action === "resume" ? resumeRun : cancelRun;
        const result = await fn(run.id);
        if (result.error) throw new Error(result.error);
        addToast({ type: "success", title: `Run ${action}d` });
      }
      void loadWorkflow();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      addToast({ type: "error", title: `Failed to ${action} run`, message });
    }
  }

  async function handleDelete() {
    const confirmed = await confirm({
      title: "Delete workflow",
      message: `Are you sure you want to delete "${workflow?.name ?? workflowId}"?`,
      variant: "danger",
      confirmLabel: "Delete",
    });
    if (!confirmed) return;
    try {
      const result = await deleteWorkflow(workflowId);
      if (result.error) throw new Error(result.error);
      addToast({ type: "success", title: "Workflow deleted" });
      window.location.href = "/workflows";
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      addToast({ type: "error", title: "Failed to delete workflow", message });
    }
  }

  return (
    <EnterpriseShell
      appId="mission-control"
      pageTitle={workflow?.name ?? "Workflow details"}
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Workflows", href: "/workflows" },
        { label: workflow?.name ?? workflowId },
      ]}
    >
      {loading ? (
        <LoadingState message="Loading workflow..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => { void loadWorkflow(); }} />
      ) : (
        <div className="space-y-8">
          {/* Executive Summary Strip (Layer 2) */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border border-border bg-surface px-5 py-3">
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <EnterpriseIcon name="activity" size={16} />
              <span><strong className="text-text">{workflow?.status ?? "unknown"}</strong> status</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <EnterpriseIcon name="layers" size={16} />
              <span><strong className="text-text">{String(workflow?.steps.length ?? 0)}</strong> steps</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <EnterpriseIcon name="play" size={16} />
              <span><strong className="text-text">{String(runs.length)}</strong> runs</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <EnterpriseIcon name="check" size={16} />
              <span><strong className="text-text">{String(runs.filter((r) => r.status === "completed").length)}</strong> completed</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <EnterpriseIcon name="alert" size={16} />
              <span><strong className="text-text">{String(runs.filter((r) => r.status === "failed").length)}</strong> failed</span>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div className="rounded-lg border p-6">
                <h3 className="mb-3 text-base font-medium">Steps</h3>
                {workflow && workflow.steps.length > 0 ? (
                  <ul className="divide-y">
                    {workflow.steps.map((step, index) => (
                      <li key={step.id} className="py-3">
                        <p className="font-medium">
                          {index + 1}. {step.name}
                        </p>
                        <p className="text-sm text-text-secondary">Agent: {step.agentId}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-text-secondary">No steps defined.</p>
                )}
              </div>

              <div className="rounded-lg border p-6">
                <h3 className="mb-3 text-base font-medium">Execution History</h3>
                <DataGrid
                  data={runs}
                  keyExtractor={(run) => run.id}
                  pageSize={5}
                  columns={[
                    { key: "id", header: "Run ID", sortable: true, filterable: true },
                    {
                      key: "status",
                      header: "Status",
                      sortable: true,
                      render: (run) => <StatusBadge status={run.status} />,
                    },
                    {
                      key: "currentStep",
                      header: "Current Step",
                      render: (run) => run.currentStep ?? "—",
                    },
                    {
                      key: "actions",
                      header: "Actions",
                      render: (run) => (
                        <div className="flex items-center gap-2">
                          {run.status === "running" ? (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  void handleControl(run, "pause");
                                }}
                                className="text-xs text-primary hover:underline"
                              >
                                Pause
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  void handleControl(run, "cancel");
                                }}
                                className="text-xs text-danger hover:underline"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                void handleControl(run, "retry");
                              }}
                              className="text-xs text-primary hover:underline"
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

            <div className="space-y-6">
              <div className="rounded-lg border p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold break-words">{workflow?.name}</h2>
                    <p className="mt-1 text-sm text-text-secondary">
                      Status: <StatusBadge status={workflow?.status ?? "unknown"} />
                    </p>
                  </div>
                </div>
                {workflow?.description ? (
                  <p className="mt-4 text-sm text-text">{workflow.description}</p>
                ) : null}
              </div>

              <div className="rounded-lg border p-6">
                <h3 className="mb-3 text-base font-medium">Run Controls</h3>
                <div className="flex flex-col gap-2">
                  {hasPermission("manage:workflows") ? (
                    <>
                      <Button
                        onClick={() => {
                          void handleStart();
                        }}
                        loading={starting}
                      >
                        Start workflow
                      </Button>
                      <Link
                        href={`/workflows/${workflowId}/designer`}
                        className="inline-flex items-center justify-center rounded-button bg-surface-secondary px-4 py-2 text-sm font-medium text-text transition-smooth hover:bg-surface-tertiary focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        Designer
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          void handleDelete();
                        }}
                        className="rounded-lg border border-danger px-3 py-2 text-sm text-danger hover:bg-danger-subtle"
                      >
                        Delete
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        variant={confirmState.variant}
        confirmLabel={confirmState.confirmLabel}
        cancelLabel={confirmState.cancelLabel}
        onConfirm={() => {
          confirmState.onConfirm?.();
        }}
        onCancel={cancel}
      />
    </EnterpriseShell>
  );
}

export default function WorkflowDetailPage() {
  return (
    <RequireAuth>
      <WorkflowDetailPageContent />
    </RequireAuth>
  );
}
