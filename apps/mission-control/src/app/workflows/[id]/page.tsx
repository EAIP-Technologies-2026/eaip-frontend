"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { RequireAuth } from "@eaip/auth";
import { usePlatformStore } from "@eaip/state";
import { EnterpriseShell, LoadingState, ErrorState, DataGrid } from "@eaip/ui-enterprise";
import { Button } from "@eaip/ui-primitives";
import { createWorkflowClient, type WorkflowDefinition, type WorkflowRun } from "@eaip/workflow";
import { logger } from "@eaip/logging";

function WorkflowDetailPageContent() {
  const params = useParams();
  const workflowId = String(params.id);
  const hasPermission = usePlatformStore((state) => state.hasPermission);
  const [workflow, setWorkflow] = useState<WorkflowDefinition | null>(null);
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    async function loadWorkflow() {
      try {
        const client = createWorkflowClient();
        const [workflowData, runsData] = await Promise.all([
          client.getWorkflow(workflowId),
          client.listRuns(workflowId),
        ]);
        setWorkflow(workflowData);
        setRuns(runsData);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        logger.error("Failed to load workflow", { error: message });
        setError(message);
      } finally {
        setLoading(false);
      }
    }
    void loadWorkflow();
  }, [workflowId]);

  async function handleStart() {
    if (!hasPermission("manage:workflows")) return;
    setStarting(true);
    try {
      const client = createWorkflowClient();
      const run = await client.startWorkflow(workflowId);
      setRuns((prev) => [run, ...prev]);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("Failed to start workflow", { error: message });
      setError(message);
    } finally {
      setStarting(false);
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
        <ErrorState
          message={error}
          onRetry={() => {
            window.location.reload();
          }}
        />
      ) : (
        <div className="space-y-6">
          <div className="rounded-lg border p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold">{workflow?.name}</h2>
                <p className="text-sm text-gray-500">{workflow?.steps.length} steps</p>
              </div>
              {hasPermission("manage:workflows") ? (
                <Button
                  onClick={() => {
                    void handleStart();
                  }}
                  loading={starting}
                >
                  Start workflow
                </Button>
              ) : null}
            </div>
          </div>

          <div className="rounded-lg border p-6">
            <h3 className="mb-3 text-base font-medium">Steps</h3>
            <ul className="divide-y">
              {workflow?.steps.map((step, index) => (
                <li key={step.id} className="py-3">
                  <p className="font-medium">
                    {index + 1}. {step.name}
                  </p>
                  <p className="text-sm text-gray-500">Agent: {step.agentId}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border p-6">
            <h3 className="mb-3 text-base font-medium">Execution History</h3>
            {runs.length === 0 ? (
              <p className="text-sm text-gray-500">No executions yet.</p>
            ) : (
              <DataGrid
                data={runs}
                keyExtractor={(run) => run.id}
                columns={[
                  { key: "id", header: "Run ID" },
                  { key: "status", header: "Status" },
                  {
                    key: "currentStep",
                    header: "Current Step",
                    render: (run) => run.currentStep ?? "—",
                  },
                ]}
              />
            )}
          </div>
        </div>
      )}
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
