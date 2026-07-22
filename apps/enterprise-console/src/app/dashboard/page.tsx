"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RequireAuth, useAuth } from "@eaip/auth";
import { usePlatformStore } from "@eaip/state";
import { EnterpriseShell, DataGrid, LoadingState } from "@eaip/ui-enterprise";
import { createAgentClient, type Agent } from "@eaip/agent";
import { logger } from "@eaip/logging";

function DashboardContent() {
  const { user } = useAuth();
  const hasPermission = usePlatformStore((state) => state.hasPermission);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAgents() {
      try {
        const client = createAgentClient();
        const data = await client.listAgents();
        setAgents(data);
      } catch (error) {
        logger.error("Failed to load agents", {
          error: error instanceof Error ? error.message : String(error),
        });
      } finally {
        setLoading(false);
      }
    }
    void loadAgents();
  }, []);

  return (
    <EnterpriseShell
      appId="enterprise-console"
      pageTitle="Dashboard"
      breadcrumbs={[{ label: "Dashboard" }]}
    >
      <div className="space-y-6">
        <div className="rounded-lg border p-6">
          <h2 className="text-lg font-semibold">Welcome, {user?.name}</h2>
          <p className="text-sm text-gray-500">
            Manage agents, monitor activity, and control the EAIP platform.
          </p>
        </div>

        <div className="rounded-lg border p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-medium">Recent Agents</h3>
            <Link href="/agents" className="text-sm text-blue-600 hover:underline">
              View all
            </Link>
          </div>
          {loading ? (
            <LoadingState message="Loading agents..." />
          ) : (
            <DataGrid
              data={agents.slice(0, 5)}
              keyExtractor={(agent) => agent.id}
              columns={[
                { key: "name", header: "Name" },
                { key: "status", header: "Status" },
                {
                  key: "actions",
                  header: "Actions",
                  render: (agent) => (
                    <Link
                      href={`/agents/${agent.id}`}
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

        {hasPermission("manage:agents") ? (
          <div className="rounded-lg border p-6">
            <h3 className="mb-2 text-base font-medium">Quick Actions</h3>
            <div className="flex gap-2">
              <Link
                href="/agents"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
              >
                Browse agents
              </Link>
            </div>
          </div>
        ) : null}
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
