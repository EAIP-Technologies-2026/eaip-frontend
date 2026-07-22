"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RequireAuth, useAuth } from "@eaip/auth";
import { EnterpriseShell, DataGrid, LoadingState } from "@eaip/ui-enterprise";
import { createWorkflowClient, type WorkflowDefinition } from "@eaip/workflow";
import { logger } from "@eaip/logging";

function DashboardContent() {
  const { user } = useAuth();
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWorkflows() {
      try {
        const client = createWorkflowClient();
        const data = await client.listWorkflows();
        setWorkflows(data);
      } catch (error) {
        logger.error("Failed to load workflows", {
          error: error instanceof Error ? error.message : String(error),
        });
      } finally {
        setLoading(false);
      }
    }
    void loadWorkflows();
  }, []);

  return (
    <EnterpriseShell
      appId="mission-control"
      pageTitle="Dashboard"
      breadcrumbs={[{ label: "Dashboard" }]}
    >
      <div className="space-y-6">
        <div className="rounded-lg border p-6">
          <h2 className="text-lg font-semibold">Welcome, {user?.name}</h2>
          <p className="text-sm text-gray-500">
            Monitor workflows, missions, and execution history.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Link
            href="/workflows"
            className="rounded-lg border p-4 hover:border-purple-300 hover:bg-purple-50"
          >
            <h3 className="font-medium text-gray-900">Workflows</h3>
            <p className="text-sm text-gray-500">View and execute workflows.</p>
          </Link>
          <Link
            href="/missions"
            className="rounded-lg border p-4 hover:border-purple-300 hover:bg-purple-50"
          >
            <h3 className="font-medium text-gray-900">Missions</h3>
            <p className="text-sm text-gray-500">Mission control center.</p>
          </Link>
          <Link
            href="/history"
            className="rounded-lg border p-4 hover:border-purple-300 hover:bg-purple-50"
          >
            <h3 className="font-medium text-gray-900">History</h3>
            <p className="text-sm text-gray-500">Execution history.</p>
          </Link>
        </div>

        <div className="rounded-lg border p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-medium">Active Workflows</h3>
            <Link href="/workflows" className="text-sm text-blue-600 hover:underline">
              View all
            </Link>
          </div>
          {loading ? (
            <LoadingState message="Loading workflows..." />
          ) : (
            <DataGrid
              data={workflows.slice(0, 5)}
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
                    <Link
                      href={`/workflows/${workflow.id}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View
                    </Link>
                  ),
                },
              ]}
            />
          )}
        </div>
      </div>
    </EnterpriseShell>
  );
}

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardContent />
    </RequireAuth>
  );
}
