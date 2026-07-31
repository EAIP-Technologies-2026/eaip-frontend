import { createAgentClient, type Agent, type AgentExecution, type AgentEvent } from "@eaip/agent";
import type { ServiceResult } from "./service-result";
import { liveResult, fallbackResult, isNetworkError } from "./service-result";
import { createMockAgents, createMockExecutions, createMockEvents } from "../mock-data/data";

const demoAgents = createMockAgents();
const demoExecutions = new Map<string, AgentExecution[]>();
const demoEvents = new Map<string, AgentEvent[]>();
for (const agent of demoAgents) {
  demoExecutions.set(agent.id, createMockExecutions(agent.id));
  demoEvents.set(agent.id, createMockEvents(agent.id));
}

function getFallbackAgents(): Agent[] {
  return [...demoAgents];
}

function getFallbackAgent(id: string): Agent | null {
  return demoAgents.find((a) => a.id === id) ?? null;
}

function getFallbackExecutions(id: string): AgentExecution[] {
  return demoExecutions.get(id) ?? [];
}

function getFallbackEvents(id: string): AgentEvent[] {
  return demoEvents.get(id) ?? [];
}

export async function listAgents(): Promise<ServiceResult<Agent[]>> {
  try {
    const client = createAgentClient();
    const data = await client.listAgents();
    return liveResult(data);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(getFallbackAgents(), "Backend unavailable, showing cached agents");
    }
    throw err;
  }
}

export async function getAgent(id: string): Promise<ServiceResult<Agent | null>> {
  try {
    const client = createAgentClient();
    const data = await client.getAgent(id);
    return liveResult(data);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(getFallbackAgent(id), "Backend unavailable, showing cached data");
    }
    throw err;
  }
}

export async function createAgent(
  name: string,
  description?: string,
): Promise<ServiceResult<Agent>> {
  try {
    const client = createAgentClient();
    const data = await client.createAgent(name, description);
    return liveResult(data);
  } catch (err) {
    if (isNetworkError(err)) {
      const local: Agent = {
        id: `local-${String(Date.now())}`,
        name,
        description: description ?? "",
        status: "active",
        model: "gpt-4",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metrics: { totalExecutions: 0, successRate: 0, avgLatencyMs: 0 },
      };
      return fallbackResult(local, "Backend unavailable, created locally");
    }
    throw err;
  }
}

export async function updateAgent(
  id: string,
  updates: Partial<Agent>,
): Promise<ServiceResult<Agent>> {
  try {
    const client = createAgentClient();
    const data = await client.updateAgent(id, updates);
    return liveResult(data);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult({ ...getFallbackAgent(id), ...updates } as Agent, "Backend unavailable, updated locally");
    }
    throw err;
  }
}

export async function deleteAgent(id: string): Promise<ServiceResult<void>> {
  try {
    const client = createAgentClient();
    await client.deleteAgent(id);
    return liveResult(undefined);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(undefined, "Backend unavailable, removed locally");
    }
    throw err;
  }
}

export async function executeAgent(
  id: string,
  input: string,
): Promise<ServiceResult<AgentExecution>> {
  try {
    const client = createAgentClient();
    const data = await client.executeAgent(id, input);
    return liveResult(data);
  } catch (err) {
    if (isNetworkError(err)) {
      const execId = `exec-local-${String(Date.now())}`;
      const local: AgentExecution = {
        id: execId,
        agentId: id,
        status: "running",
        input,
        startedAt: new Date().toISOString(),
        duration: 0,
      };
      return fallbackResult(local, "Backend unavailable, execution recorded locally");
    }
    throw err;
  }
}

export async function listExecutions(id: string): Promise<ServiceResult<AgentExecution[]>> {
  try {
    const client = createAgentClient();
    const data = await client.listExecutions(id);
    return liveResult(data);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(getFallbackExecutions(id), "Backend unavailable, showing cached data");
    }
    throw err;
  }
}

export async function getAgentEvents(
  id: string,
  limit?: number,
): Promise<ServiceResult<AgentEvent[]>> {
  try {
    const client = createAgentClient();
    const data = await client.getAgentEvents(id, limit);
    return liveResult(data);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(getFallbackEvents(id), "Backend unavailable, showing cached data");
    }
    throw err;
  }
}

export async function pauseExecution(
  id: string,
  executionId: string,
): Promise<ServiceResult<void>> {
  try {
    const client = createAgentClient();
    await client.pauseExecution(id, executionId);
    return liveResult(undefined);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(undefined, "Backend unavailable");
    }
    throw err;
  }
}

export async function resumeExecution(
  id: string,
  executionId: string,
): Promise<ServiceResult<void>> {
  try {
    const client = createAgentClient();
    await client.resumeExecution(id, executionId);
    return liveResult(undefined);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(undefined, "Backend unavailable");
    }
    throw err;
  }
}

export async function stopExecution(
  id: string,
  executionId: string,
): Promise<ServiceResult<void>> {
  try {
    const client = createAgentClient();
    await client.stopExecution(id, executionId);
    return liveResult(undefined);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(undefined, "Backend unavailable");
    }
    throw err;
  }
}

export async function retryExecution(
  id: string,
  executionId: string,
): Promise<ServiceResult<AgentExecution>> {
  try {
    const client = createAgentClient();
    const data = await client.retryExecution(id, executionId);
    return liveResult(data);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult({
        id: `exec-local-${String(Date.now())}`,
        agentId: id,
        status: "running",
        startedAt: new Date().toISOString(),
        duration: 0,
      }, "Backend unavailable, retry recorded locally");
    }
    throw err;
  }
}
