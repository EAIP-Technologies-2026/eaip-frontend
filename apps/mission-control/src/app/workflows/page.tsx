"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RequireAuth } from "@eaip/auth";
import { usePlatformStore } from "@eaip/state";
import { EnterpriseShell, DataGrid, LoadingState, ErrorState } from "@eaip/ui-enterprise";
import { createWorkflowClient, type WorkflowDefinition } from "@eaip/workflow";
import { logger } from "@eaip/logging";

function WorkflowsPageContent() {
  const hasPermission = usePlatformStore((state) => state.hasPermission);
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadWorkflows() {
      try {
        const client = createWorkflowClient();
        const data = await client.listWorkflows();
        setWorkflows(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        logger.error("Failed to load workflows", { error: message });
        setError(message);
      } finally {
        setLoading(false);
      }
    }
    void loadWorkflows();
  }, []);

  async function handleStart(workflowId: string) {
    if (!hasPermission("manage:workflows")) return;
    try {
      const client = createWorkflowClient();
      await client.startWorkflow(workflowId);
      window.location.reload();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("Failed to start workflow", { error: message });
      setError(message);
    }
  }

  return (
    <EnterpriseShell
      appId="mission-control"
      pageTitle="Workflows"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Workflows" }]}
    >
      <div className="space-y-4">
        {loading ? (
          <LoadingState message="Loading workflows..." />
        ) : error ? (
          <ErrorState
            message={error}
            onRetry={() => {
              window.location.reload();
            }}
          />
        ) : (
          <DataGrid
            data={workflows}
            keyExtractor={(workflow) => workflow.id}
            columns={[
              { key: "name", header: "Name" },
              {
                key: "steps",
                header: "Steps",
                render: (workflow) => workflow.steps.length,
              },
              {
                key: "actions",
                header: "Actions",
                render: (workflow) => (
                  <div className="flex gap-3">
                    <Link
                      href={`/workflows/${workflow.id}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View
                    </Link>
                    {hasPermission("manage:workflows") ? (
                      <button
                        type="button"
                        onClick={() => {
                          void handleStart(workflow.id);
                        }}
                        className="text-sm text-green-600 hover:underline"
                      >
                        Start
                      </button>
                    ) : null}
                  </div>
                ),
              },
            ]}
          />
        )}
      </div>
    </EnterpriseShell>
  );
}

export default function WorkflowsPage() {
  return (
    <RequireAuth>
      <WorkflowsPageContent />
    </RequireAuth>
  );
}
