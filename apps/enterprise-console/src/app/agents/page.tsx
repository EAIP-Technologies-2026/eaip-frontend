"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RequireAuth } from "@eaip/auth";
import { usePlatformStore } from "@eaip/state";
import { EnterpriseShell, DataGrid, LoadingState, ErrorState } from "@eaip/ui-enterprise";
import { createAgentClient, type Agent } from "@eaip/agent";
import { logger } from "@eaip/logging";

function AgentsPageContent() {
  const hasPermission = usePlatformStore((state) => state.hasPermission);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAgents() {
      try {
        const client = createAgentClient();
        const data = await client.listAgents();
        setAgents(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        logger.error("Failed to load agents", { error: message });
        setError(message);
      } finally {
        setLoading(false);
      }
    }
    void loadAgents();
  }, []);

  return (
    <EnterpriseShell
      appId="enterprise-console"
      pageTitle="Agents"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Agents" }]}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Manage and execute autonomous agents.</p>
          {hasPermission("manage:agents") ? (
            <button
              type="button"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
            >
              Create agent
            </button>
          ) : null}
        </div>

        {loading ? (
          <LoadingState message="Loading agents..." />
        ) : error ? (
          <ErrorState
            message={error}
            onRetry={() => {
              window.location.reload();
            }}
          />
        ) : (
          <DataGrid
            data={agents}
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
    </EnterpriseShell>
  );
}

export default function AgentsPage() {
  return (
    <RequireAuth>
      <AgentsPageContent />
    </RequireAuth>
  );
}
