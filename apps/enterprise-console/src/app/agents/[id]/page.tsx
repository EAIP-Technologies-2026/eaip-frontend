"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { RequireAuth } from "@eaip/auth";
import { usePlatformStore } from "@eaip/state";
import { EnterpriseShell, LoadingState, ErrorState } from "@eaip/ui-enterprise";
import { Button, Input } from "@eaip/ui-primitives";
import { createAgentClient, type Agent, type AgentExecution } from "@eaip/agent";
import { logger } from "@eaip/logging";

function AgentDetailPageContent() {
  const params = useParams();
  const agentId = String(params.id);
  const hasPermission = usePlatformStore((state) => state.hasPermission);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [executions, setExecutions] = useState<AgentExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [executing, setExecuting] = useState(false);

  useEffect(() => {
    async function loadAgent() {
      try {
        const client = createAgentClient();
        const [agentData, executionData] = await Promise.all([
          client.getAgent(agentId),
          client.listExecutions(agentId),
        ]);
        setAgent(agentData);
        setExecutions(executionData);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        logger.error("Failed to load agent", { error: message });
        setError(message);
      } finally {
        setLoading(false);
      }
    }
    void loadAgent();
  }, [agentId]);

  async function handleExecute() {
    if (!hasPermission("manage:agents")) return;
    setExecuting(true);
    try {
      const client = createAgentClient();
      const execution = await client.executeAgent(agentId, input);
      setExecutions((prev) => [execution, ...prev]);
      setInput("");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("Failed to execute agent", { error: message });
      setError(message);
    } finally {
      setExecuting(false);
    }
  }

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
        <ErrorState
          message={error}
          onRetry={() => {
            window.location.reload();
          }}
        />
      ) : (
        <div className="space-y-6">
          <div className="rounded-lg border p-6">
            <h2 className="text-lg font-semibold">{agent?.name}</h2>
            <p className="text-sm text-gray-500">Status: {agent?.status ?? "unknown"}</p>
            {agent?.description ? (
              <p className="mt-2 text-sm text-gray-700">{agent.description}</p>
            ) : null}
          </div>

          {hasPermission("manage:agents") ? (
            <div className="rounded-lg border p-6">
              <h3 className="mb-3 text-base font-medium">Execute Agent</h3>
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
                  onClick={() => {
                    void handleExecute();
                  }}
                  loading={executing}
                >
                  Execute
                </Button>
              </div>
            </div>
          ) : null}

          <div className="rounded-lg border p-6">
            <h3 className="mb-3 text-base font-medium">Execution History</h3>
            {executions.length === 0 ? (
              <p className="text-sm text-gray-500">No executions yet.</p>
            ) : (
              <ul className="divide-y">
                {executions.map((execution) => (
                  <li key={execution.id} className="py-3">
                    <p className="font-medium">{execution.id}</p>
                    <p className="text-sm text-gray-500">{execution.status}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
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
