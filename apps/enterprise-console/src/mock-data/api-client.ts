/* eslint-disable @typescript-eslint/no-unnecessary-condition */

import type { AuthUser } from "@eaip/auth";
import type { Agent, AgentExecution, AgentEvent } from "@eaip/agent";
import type { PlatformNotification } from "@eaip/state";
import {
  createMockAgents,
  createMockExecutions,
  createMockEvents,
  createMockStats,
  createMockMonitoringEvents,
  createMockSearchResults,
  createMockSystemHealth,
  createMockActivityFeed,
  createMockWorkflows,
  createMockUsers,
  createMockKnowledgeArticles,
  createMockNotifications,
} from "./data";

const API_PREFIX = "/api";
let agents = createMockAgents();
const executions = new Map<string, AgentExecution[]>();
const eventsMap = new Map<string, AgentEvent[]>();
for (const agent of agents) {
  executions.set(agent.id, createMockExecutions(agent.id));
  eventsMap.set(agent.id, createMockEvents(agent.id));
}
const workflows = createMockWorkflows();
const users = createMockUsers();
const knowledgeArticles = createMockKnowledgeArticles();
let notifications = createMockNotifications();
let notificationIdCounter = notifications.length;

function delay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 30 + Math.random() * 40));
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

interface RouteHandler {
  pattern: RegExp;
  handler: (match: RegExpMatchArray, body?: unknown) => Response;
}

function def(pattern: string, handler: (match: RegExpMatchArray, body?: unknown) => Response): RouteHandler {
  const regexStr = "^" + pattern.replace(/:([^/]+)/g, "([^/]+)") + "$";
  return { pattern: new RegExp(regexStr), handler };
}

function id(m: RegExpMatchArray): string { return m[1] ?? ""; }

const routes: RouteHandler[] = [
  def("/agents/stats", () => jsonResponse(createMockStats())),
  def("/agents", () => jsonResponse([...agents])),
  def("/agents/:id", (m) => {
    const agent = agents.find((a) => a.id === id(m));
    return agent ? jsonResponse(agent) : jsonResponse(null, 404);
  }),
  def("/agents/:id/execute", (m, body) => {
    const aid = id(m);
    const exec: AgentExecution = {
      id: `exec-${aid}-${String(Date.now())}`,
      agentId: aid,
      status: "running",
      input: (body as Record<string, string> | undefined)?.input ?? "",
      startedAt: new Date().toISOString(),
      duration: 0,
    };
    const list = executions.get(aid) ?? [];
    list.unshift(exec);
    executions.set(aid, list);
    return jsonResponse(exec);
  }),
  def("/agents/:id/executions", (m) => jsonResponse(executions.get(id(m)) ?? [])),
  def("/agents/:id/events", (m) => jsonResponse(eventsMap.get(id(m)) ?? [])),
  def("/agents/:id/executions/:execId/pause", () => jsonResponse({})),
  def("/agents/:id/executions/:execId/stop", () => jsonResponse({})),
  def("/agents/:id/executions/:execId/retry", (m) => {
    const aid = id(m);
    const exec: AgentExecution = {
      id: `exec-${aid}-${String(Date.now())}`,
      agentId: aid,
      status: "running",
      startedAt: new Date().toISOString(),
      duration: 0,
    };
    return jsonResponse(exec);
  }),
  def("/monitoring/events", () => jsonResponse(createMockMonitoringEvents())),
  def("/search", () => jsonResponse(createMockSearchResults())),
  def("/search/:query", (m) => jsonResponse(createMockSearchResults(id(m)))),
  def("/search/history", () => jsonResponse(createMockSearchResults())),
  def("/system/health", () => jsonResponse(createMockSystemHealth())),
  def("/system/metrics", () => jsonResponse(createMockSystemHealth().metrics)),
  def("/activity", () => jsonResponse(createMockActivityFeed())),
  def("/workflows", () => jsonResponse([...workflows])),
  def("/workflows/:id", (m) => {
    const wf = workflows.find((w) => w.id === id(m));
    return wf ? jsonResponse(wf) : jsonResponse(null, 404);
  }),
  def("/users", (m) => {
    const params = new URLSearchParams((m as unknown as { query?: string })?.query ?? "");
    const page = parseInt(params.get("page") ?? "1", 10);
    const limit = parseInt(params.get("limit") ?? "20", 10);
    const start = (page - 1) * limit;
    return jsonResponse({ items: users.slice(start, start + limit), total: users.length, page, limit });
  }),
  def("/users/:id", (m) => {
    const user = users.find((u) => u.id === id(m));
    return user ? jsonResponse(user) : jsonResponse(null, 404);
  }),
  def("/knowledge", () => jsonResponse([...knowledgeArticles])),
  def("/knowledge/:id", (m) => {
    const ka = knowledgeArticles.find((k) => k.id === id(m));
    return ka ? jsonResponse(ka) : jsonResponse(null, 404);
  }),
  def("/notifications", () => jsonResponse([...notifications])),
  def("/notifications/read", (_, body) => {
    const ids = (body as { ids?: string[] })?.ids;
    if (ids) {
      notifications = notifications.map((n) => (ids.includes(n.id) ? { ...n, read: true } : n));
    }
    return jsonResponse({});
  }),
  def("/notifications/read-all", () => {
    notifications = notifications.map((n) => ({ ...n, read: true }));
    return jsonResponse({});
  }),
  def("/auth/login", () => {
    const user: AuthUser = { id: "u1", name: "Alex Rivera", email: "alex@eaip.io", roles: ["admin"] };
    return jsonResponse({ token: "mock-token-" + String(Date.now()), refresh_token: "mock-refresh-" + String(Date.now()), user });
  }),
  def("/auth/logout", () => jsonResponse({})),
  def("/auth/refresh", () => jsonResponse({ token: "mock-refreshed-token", refresh_token: "mock-refresh" })),
  def("/users/me", () => {
    const user: AuthUser = { id: "u1", name: "Alex Rivera", email: "alex@eaip.io", roles: ["admin"] };
    return jsonResponse(user);
  }),
];

function matchRoute(_method: string, pathname: string): ((body?: unknown) => Response) | null {
  const stripped = pathname.startsWith(API_PREFIX) ? pathname.slice(API_PREFIX.length) : pathname;
  const normalized = stripped || "/";
  for (const route of routes) {
    const match = normalized.match(route.pattern);
    if (match) {
      const handler = route.handler;
      return (body?: unknown) => handler(match, body);
    }
  }
  return null;
}

export function installMockApi(): () => void {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const urlStr = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    if (!urlStr.includes("localhost:8080")) {
      return originalFetch(input, init);
    }
    const url = new URL(urlStr);
    const method = (init?.method ?? "GET").toUpperCase();

    if (method === "POST" && url.pathname === API_PREFIX + "/agents") {
      await delay();
      const body = init?.body ? (JSON.parse(init.body as string) as Record<string, unknown>) : undefined;
      const agentName = typeof body?.name === "string" ? body.name : "New Agent";
      const agentDesc = typeof body?.description === "string" ? body.description : "";
      const agent: Agent = {
        id: `agent-${String(Date.now())}`,
        name: agentName,
        description: agentDesc,
        status: "active",
        model: "gpt-4",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metrics: { totalExecutions: 0, successRate: 0, avgLatencyMs: 0 },
      };
      agents = [agent, ...agents];
      return jsonResponse(agent);
    }

    if (method === "POST" && url.pathname === API_PREFIX + "/notifications") {
      await delay();
      notificationIdCounter++;
      const n: PlatformNotification = {
        id: `n${String(notificationIdCounter)}`,
        title: "Test notification from POST",
        message: "Notification created via API",
        read: false,
        timestamp: new Date().toISOString(),
      };
      notifications = [n, ...notifications];
      return jsonResponse(n);
    }

    if (method === "POST" && url.pathname === API_PREFIX + "/workflows") {
      await delay();
      const body = init?.body ? (JSON.parse(init.body as string) as Record<string, unknown>) : undefined;
      const wf = {
        id: `wf-${String(Date.now())}`,
        name: typeof body?.name === "string" ? body.name : "New Workflow",
        description: typeof body?.description === "string" ? body.description : "",
        status: "draft" as const,
        steps: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return jsonResponse(wf);
    }

    if (method === "PUT") {
      const agentRe = new RegExp("^" + API_PREFIX + "/agents/([^/]+)$");
      const agentMatch = agentRe.exec(url.pathname);
      if (agentMatch) {
        await delay();
        const body = init?.body ? (JSON.parse(init.body as string) as Record<string, unknown>) : undefined;
        const idx = agents.findIndex((a) => a.id === agentMatch[1]);
        if (idx < 0) return jsonResponse(null, 404);
        agents[idx] = { ...agents[idx], ...(body as Partial<Agent>), updatedAt: new Date().toISOString() } as Agent;
        return jsonResponse(agents[idx]);
      }
    }

    if (method === "DELETE") {
      const agentRe = new RegExp("^" + API_PREFIX + "/agents/([^/]+)$");
      const agentMatch = agentRe.exec(url.pathname);
      if (agentMatch) {
        await delay();
        agents = agents.filter((a) => a.id !== agentMatch[1]);
        return jsonResponse({});
      }
    }

    const handler = matchRoute(method, url.pathname);
    if (handler) {
      await delay();
      const body = init?.body ? (JSON.parse(init.body as string) as Record<string, unknown>) : undefined;
      return handler(body);
    }

    return originalFetch(input, init);
  };

  return () => {
    globalThis.fetch = originalFetch;
  };
}
