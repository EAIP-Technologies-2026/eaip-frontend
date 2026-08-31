"use client";

import { useCallback, useEffect, useState } from "react";
import { RequireAuth } from "@eaip/auth";
import { EnterpriseShell, Card, ErrorState } from "@eaip/ui-enterprise";
import { Button, Badge } from "@eaip/ui-primitives";
import { EnterpriseIcon } from "@eaip/icons";
import { usePlatformStore } from "@eaip/state";
import type { Agent, AgentExecution } from "@eaip/agent";
import {
  listAgents,
  listExecutions,
  pauseExecution,
  resumeExecution,
  stopExecution,
} from "../../services/agents-service";

function statusVariant(status: string): "success" | "warning" | "danger" | "default" {
  if (status === "completed") return "success";
  if (status === "running") return "warning";
  if (status === "failed" || status === "cancelled") return "danger";
  return "default";
}

function ExecutionCard({
  agent,
  execution,
  busy,
  onPause,
  onResume,
  onStop,
}: {
  agent: Agent;
  execution: AgentExecution;
  busy: boolean;
  onPause: (executionId: string) => void;
  onResume: (executionId: string) => void;
  onStop: (executionId: string) => void;
}) {
  const isRunning = execution.status === "running";
  return (
    <Card liquid padding="md" className="border-l-primary/40 border-l-2">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <EnterpriseIcon
              name={
                isRunning ? "activity" : execution.status === "completed" ? "checkCircle" : "stop"
              }
              size={16}
              className={
                isRunning
                  ? "text-warning"
                  : execution.status === "completed"
                    ? "text-success"
                    : "text-danger"
              }
            />
            <div>
              <p className="text-text font-semibold">{agent.name}</p>
              <p className="text-text-muted text-xs">{execution.id}</p>
            </div>
          </div>
          <Badge variant={statusVariant(execution.status)}>{execution.status}</Badge>
        </div>

        <div className="text-text-secondary flex flex-wrap gap-x-6 gap-y-1 text-xs">
          {execution.startedAt ? (
            <span>Started: {new Date(execution.startedAt).toLocaleTimeString()}</span>
          ) : null}
          {execution.duration !== undefined ? (
            <span>Duration: {execution.duration.toFixed(1)}s</span>
          ) : null}
          {execution.agentId ? <span>Agent: {execution.agentId}</span> : null}
        </div>

        {execution.input ? (
          <div className="bg-surface-secondary/50 text-text-secondary rounded-lg p-3 text-xs">
            <span className="text-text-muted font-medium">Input: </span>
            <span className="line-clamp-2">{execution.input}</span>
          </div>
        ) : null}
        {execution.output ? (
          <div className="bg-surface-secondary/50 text-text-secondary rounded-lg p-3 text-xs">
            <span className="text-text-muted font-medium">Output: </span>
            <span className="line-clamp-3">{execution.output}</span>
          </div>
        ) : null}

        <div className="flex items-center gap-2">
          {isRunning ? (
            <>
              <Button
                size="sm"
                variant="secondary"
                iconLeft="pause"
                disabled={busy}
                onClick={() => {
                  onPause(execution.id);
                }}
              >
                Pause
              </Button>
              <Button
                size="sm"
                variant="ghost"
                iconLeft="stop"
                disabled={busy}
                onClick={() => {
                  onStop(execution.id);
                }}
              >
                Stop
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="secondary"
              iconLeft="play"
              disabled={busy}
              onClick={() => {
                onResume(execution.id);
              }}
            >
              Resume
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

function ExecutionContent() {
  const addToast = usePlatformStore((s) => s.addToast);
  const [rows, setRows] = useState<{ agent: Agent; execution: AgentExecution }[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    try {
      const agents = await listAgents();
      const agentList = agents.data;
      const executions: { agent: Agent; execution: AgentExecution }[] = [];
      // Only load executions for recently active agents to avoid N+1 over the whole fleet.
      const activeAgents = agentList.slice(0, 12);
      for (const agent of activeAgents) {
        const ex = await listExecutions(agent.id);
        const list = ex.data.slice(0, 3);
        for (const execution of list) {
          executions.push({ agent, execution });
        }
      }
      setRows(
        executions.sort((a, b) =>
          (a.execution.startedAt ?? "") < (b.execution.startedAt ?? "") ? 1 : -1,
        ),
      );
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load executions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
    const timer = window.setInterval(() => void loadAll(), 5000);
    return () => {
      window.clearInterval(timer);
    };
  }, [loadAll]);

  const act = async (agentId: string, executionId: string, action: "pause" | "resume" | "stop") => {
    setBusyKey(executionId);
    try {
      if (action === "pause") await pauseExecution(agentId, executionId);
      else if (action === "resume") await resumeExecution(agentId, executionId);
      else await stopExecution(agentId, executionId);
      addToast({ title: "Execution updated", message: `Execution ${action}d.`, type: "success" });
      const target = rows?.find((r) => r.execution.id === executionId);
      if (target && action === "stop") {
        await loadAll();
      }
    } catch (err) {
      addToast({
        title: "Action failed",
        message: err instanceof Error ? err.message : "Could not update execution.",
        type: "error",
      });
    } finally {
      setBusyKey(null);
    }
  };

  const runningCount = rows?.filter((r) => r.execution.status === "running").length ?? 0;

  return (
    <EnterpriseShell
      appId="enterprise-console"
      pageTitle="Execution"
      breadcrumbs={[{ label: "Operate", href: "/operations" }, { label: "Execution Theater" }]}
    >
      <div className="space-y-6">
        <div className="liquid-glass rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-xl">
              <EnterpriseIcon name="activity" size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-primary text-xs font-bold tracking-wider uppercase">Operate</p>
                <Badge variant="warning">{runningCount} running</Badge>
              </div>
              <h1 className="text-text mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                Live Execution Theater
              </h1>
              <p className="text-text-secondary mt-1 max-w-2xl text-sm">
                Watch governed agent executions progress in real time — every step audited, every
                pause/resume/stop performed on the actual runtime.
              </p>
            </div>
          </div>
        </div>

        {error ? (
          <ErrorState
            title="Could not load executions"
            message={error}
            onRetry={() => void loadAll()}
          />
        ) : loading ? (
          <p className="text-text-muted py-8 text-center text-sm">Loading live executions...</p>
        ) : rows === null || rows.length === 0 ? (
          <Card liquid padding="md" className="text-center">
            <EnterpriseIcon name="play" size={20} className="text-primary mx-auto" />
            <p className="text-text-secondary mt-2 text-sm">
              No agent executions in view. Trigger an agent run to see it stream here.
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {rows.map((row) => (
              <ExecutionCard
                key={`${row.agent.id}-${row.execution.id}`}
                agent={row.agent}
                execution={row.execution}
                busy={busyKey === row.execution.id}
                onPause={(id) => {
                  void act(row.agent.id, id, "pause");
                }}
                onResume={(id) => {
                  void act(row.agent.id, id, "resume");
                }}
                onStop={(id) => {
                  void act(row.agent.id, id, "stop");
                }}
              />
            ))}
          </div>
        )}
      </div>
    </EnterpriseShell>
  );
}

export default function ExecutionPage() {
  return (
    <RequireAuth>
      <ExecutionContent />
    </RequireAuth>
  );
}
