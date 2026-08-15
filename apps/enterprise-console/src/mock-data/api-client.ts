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
  createMockCopilotTurn,
  createMockPendingApprovals,
} from "./data";
import type { MockCopilotApproval } from "./data";

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
let mockBrains: MockBrain[] = [];
let mockMissions: MockMission[] = [];
let mockBrainCounter = 0;
let mockCopilotApprovals: MockCopilotApproval[] = createMockPendingApprovals();

interface MockMission {
  id: string;
  name: string;
  description: string;
  status: string;
  progress: number;
  startedAt: string | null;
  completedAt: string | null;
  agentIds: string[];
  workflowIds: string[];
}

interface MockBrainRecommendation {
  id: string;
  title: string;
  rationale: string;
  evidence: { source_type: string; source_id: string; content_preview: string; relevance_score: number }[];
  confidence: number;
  status: string;
  approvalRequired: boolean;
  executionStatus: string;
  executionResult?: string;
  missionId?: string;
}

interface MockBrainActivity {
  id: string;
  action: string;
  message: string;
  timestamp: string;
}

interface MockBrain {
  id: string;
  name: string;
  description: string;
  businessFunction: string;
  ownerId: string;
  objectives: string[];
  instructions: string;
  knowledgeSources: string[];
  rules: string[];
  tools: string[];
  approvalRequired: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  recommendations: MockBrainRecommendation[];
  missionIds: string[];
  memoryIds: string[];
  activity: MockBrainActivity[];
}

const mockBrainTemplates = {
  marketing: {
    name: "Marketing Brain",
    description: "Governed intelligence for qualified customer acquisition.",
    businessFunction: "Marketing",
    objectives: ["Improve qualified customer acquisition."],
    instructions: "Prioritize evidence-backed growth opportunities and brand-safe actions.",
    rules: ["Use available evidence before recommending action.", "Require approval before execution."],
    tools: ["knowledge.search", "missions.create", "memory.write"],
  },
  sales: {
    name: "Sales Brain",
    description: "Governed intelligence for pipeline quality and conversion.",
    businessFunction: "Sales",
    objectives: ["Improve pipeline conversion."],
    instructions: "Surface high-confidence opportunities and risks in the pipeline.",
    rules: ["Do not contact customers without approval."],
    tools: ["knowledge.search", "missions.create", "memory.write"],
  },
  operations: {
    name: "Operations Brain",
    description: "Governed intelligence for reliable business operations.",
    businessFunction: "Operations",
    objectives: ["Reduce operational friction."],
    instructions: "Prioritize measurable process improvements and operational risk.",
    rules: ["Cite the operating context for recommendations."],
    tools: ["knowledge.search", "missions.create", "memory.write"],
  },
  custom: {
    name: "Business Brain",
    description: "A configurable governed intelligence layer.",
    businessFunction: "Custom",
    objectives: [],
    instructions: "",
    rules: ["Require approval before execution."],
    tools: ["knowledge.search", "missions.create", "memory.write"],
  },
} as const;

type MockBrainTemplateId = keyof typeof mockBrainTemplates;

function stringList(value: unknown, fallback: readonly string[]): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [...fallback];
}

function recordBody(body: unknown): Record<string, unknown> {
  return body && typeof body === "object" ? (body as Record<string, unknown>) : {};
}

function persistMockBrains(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem("eaip_mock_brains", JSON.stringify(mockBrains));
  } catch {
    void 0;
  }
}

function persistMockMissions(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem("eaip_mock_missions", JSON.stringify(mockMissions));
  } catch {
    void 0;
  }
}

function loadMockMissions(): void {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem("eaip_mock_missions");
    if (!raw) return;
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      mockMissions = parsed.filter((item): item is MockMission => Boolean(item) && typeof item === "object" && "id" in item);
    }
  } catch {
    mockMissions = [];
  }
}

function createMockMission(body: unknown): MockMission {
  const input = recordBody(body);
  const mission: MockMission = {
    id: `mission-${String(Date.now())}`,
    name: typeof input.name === "string" ? input.name : "New Mission",
    description: typeof input.description === "string" ? input.description : "",
    status: "pending",
    progress: 0,
    startedAt: null,
    completedAt: null,
    agentIds: stringList(input.agent_ids, []),
    workflowIds: stringList(input.workflow_ids, []),
  };
  mockMissions = [mission, ...mockMissions];
  persistMockMissions();
  return mission;
}

function loadMockBrains(): void {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem("eaip_mock_brains");
    if (!raw) return;
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      mockBrains = parsed.filter((item): item is MockBrain => Boolean(item) && typeof item === "object" && "id" in item);
    }
  } catch {
    mockBrains = [];
  }
}

function addBrainActivity(brain: MockBrain, action: string, message: string): void {
  brain.activity.unshift({
    id: `activity-${String(Date.now())}-${String(++mockBrainCounter)}`,
    action,
    message,
    timestamp: new Date().toISOString(),
  });
  brain.updatedAt = new Date().toISOString();
  persistMockBrains();
}

function createMockBrain(body: unknown): MockBrain {
  const input = recordBody(body);
  const requestedTemplate = typeof input.template === "string" ? input.template : "custom";
  const templateId: MockBrainTemplateId = requestedTemplate in mockBrainTemplates ? requestedTemplate as MockBrainTemplateId : "custom";
  const template = mockBrainTemplates[templateId];
  const now = new Date().toISOString();
  const brain: MockBrain = {
    id: `brain-${String(Date.now())}-${String(++mockBrainCounter)}`,
    name: typeof input.name === "string" && input.name ? input.name : template.name,
    description: typeof input.description === "string" && input.description ? input.description : template.description,
    businessFunction: typeof input.businessFunction === "string" ? input.businessFunction : template.businessFunction,
    ownerId: "u1",
    objectives: stringList(input.objectives, template.objectives),
    instructions: typeof input.instructions === "string" ? input.instructions : template.instructions,
    knowledgeSources: stringList(input.knowledgeSources, []),
    rules: stringList(input.rules, template.rules),
    tools: stringList(input.tools, template.tools),
    approvalRequired: typeof input.approvalRequired === "boolean" ? input.approvalRequired : true,
    status: "active",
    createdAt: now,
    updatedAt: now,
    recommendations: [],
    missionIds: [],
    memoryIds: [],
    activity: [],
  };
  mockBrains = [brain, ...mockBrains];
  addBrainActivity(brain, "created", "Brain created");
  return brain;
}

function findMockBrain(brainId: string): MockBrain | undefined {
  return mockBrains.find((brain) => brain.id === brainId);
}

function findRecommendation(brain: MockBrain, recommendationId: string): MockBrainRecommendation | undefined {
  return brain.recommendations.find((recommendation) => recommendation.id === recommendationId);
}

function brainTemplatesResponse(): Response {
  return jsonResponse(Object.entries(mockBrainTemplates).map(([id, template]) => ({ id, ...template })));
}

const MOCK_TOUR_STEPS = [
  {
    id: "dashboard",
    order: 0,
    route: "/dashboard",
    application: "enterprise_console",
    title: "Dashboard",
    narration: "Let's start with the Dashboard. This is your operational overview of EAIP. It gives you a quick view of system health, agents, activity, and current operational context.",
    why_it_matters: "The Dashboard is where you begin every session. It surfaces what needs your attention right now.",
    demo_description: "Showing real-time health and agent status cards.",
    demo_fixture_type: "health_card",
    demo_safe: true,
  },
  {
    id: "agents",
    order: 1,
    route: "/agents",
    application: "enterprise_console",
    title: "Agents",
    narration: "You're now looking at Agents. Agents are the execution workers inside EAIP. Each agent has tools, permissions, and a governed lifecycle.",
    why_it_matters: "Agents do the actual work — they run workflows, search knowledge, and interact with enterprise systems on your behalf.",
    demo_description: "Listing registered agents with their current status.",
    demo_fixture_type: "agent_card",
    demo_safe: true,
  },
  {
    id: "brains",
    order: 2,
    route: "/brains",
    application: "enterprise_console",
    title: "Second Brain / Brains",
    narration: "This is Brains — your Second Brain. It organizes knowledge, context, and reasoning into structured brain instances.",
    why_it_matters: "Brains let you build specialized knowledge repositories that agents and workflows can draw from.",
    demo_description: "Showing available brain instances.",
    demo_fixture_type: "brain_card",
    demo_safe: true,
  },
  {
    id: "knowledge",
    order: 3,
    route: "/knowledge",
    application: "enterprise_console",
    title: "Knowledge",
    narration: "Knowledge is your enterprise knowledge base. Documents, policies, and operational knowledge are stored here and made searchable.",
    why_it_matters: "When agents need grounded answers, they search the Knowledge base. Keeping it current improves every agent response.",
    demo_description: "Searching the knowledge base for a sample query.",
    demo_fixture_type: "knowledge_article",
    demo_safe: true,
  },
  {
    id: "missions",
    order: 4,
    route: "/missions",
    application: "enterprise_console",
    title: "Missions",
    narration: "Missions are orchestrated multi-step operations. A mission coordinates agents, workflows, and approvals to achieve a goal.",
    why_it_matters: "Complex enterprise tasks often need multiple steps. Missions give you visibility and control over those operations.",
    demo_description: "Showing mission history and active missions.",
    demo_fixture_type: "mission_entry",
    demo_safe: true,
  },
  {
    id: "monitoring",
    order: 5,
    route: "/monitoring",
    application: "enterprise_console",
    title: "Monitoring",
    narration: "Monitoring gives you real-time operational telemetry. Health checks, performance metrics, and system alerts appear here.",
    why_it_matters: "When something goes wrong, Monitoring is where you find it first. It connects to the System Twin for a unified operational view.",
    demo_description: "Displaying current system health metrics.",
    demo_fixture_type: "telemetry_chart",
    demo_safe: true,
  },
  {
    id: "activity",
    order: 6,
    route: "/activity",
    application: "enterprise_console",
    title: "Activity",
    narration: "Activity is your operational audit trail. Every action, every tool invocation, and every governance decision is recorded here.",
    why_it_matters: "Audit trails are essential for enterprise governance. You can always trace what happened, when, and who authorized it.",
    demo_description: "Showing recent platform activity entries.",
    demo_fixture_type: "activity_log",
    demo_safe: true,
  },
  {
    id: "administration",
    order: 7,
    route: "/administration",
    application: "enterprise_console",
    title: "Administration",
    narration: "Administration is where platform operators manage users, roles, permissions, and enterprise settings.",
    why_it_matters: "This is the control center for who can do what on the platform. All changes here go through normal governance and audit.",
    demo_description: "Showing the administration overview.",
    demo_fixture_type: "admin_table",
    demo_safe: true,
  },
  {
    id: "marketplace",
    order: 8,
    route: "/marketplace",
    application: "enterprise_console",
    title: "Marketplace",
    narration: "The Marketplace is where you discover and install skills for your agents and the Conductor. Skills extend what the platform can do.",
    why_it_matters: "New capabilities can be added without changing core platform code. Each skill goes through trust verification before installation.",
    demo_description: "Browsing available marketplace skills.",
    demo_fixture_type: "marketplace_item",
    demo_safe: true,
  },
  {
    id: "memory",
    order: 9,
    route: "/memory",
    application: "enterprise_console",
    title: "Memory",
    narration: "Memory is your governed personal enterprise memory. The Conductor remembers preferences, investigations, and context on your behalf.",
    why_it_matters: "Memory makes your assistant personally useful over time. All memory is governed — it has retention, sensitivity, and audit.",
    demo_description: "Showing your current governed memory items.",
    demo_fixture_type: "memory_item",
    demo_safe: true,
  },
  {
    id: "system-twin",
    order: 10,
    route: "/dashboard",
    application: "enterprise_console",
    title: "System Twin",
    narration: "The System Twin is a normalized operational model of your entire EAIP instance. It rolls up agents, workflows, missions, and health into a single coherent state.",
    why_it_matters: "Instead of checking five different screens, the System Twin gives you one authoritative view of platform operational state.",
    demo_description: "Retrieving the current System Twin state.",
    demo_fixture_type: "twin_model",
    demo_safe: true,
  },
  {
    id: "conductor",
    order: 11,
    route: "/dashboard",
    application: "enterprise_console",
    title: "Personal Assistant / Conductor",
    narration: "And this — the Conductor — is your personal assistant. It's the governed AI that can inspect the platform, run tools, and help you operate EAIP using natural language or voice.",
    why_it_matters: "The Conductor is how you interact with EAIP conversationally. Every action it takes goes through governance, approval, and audit.",
    demo_description: "Demonstrating a safe Conductor query.",
    demo_fixture_type: "conductor_demo",
    demo_safe: true,
  },
];

const mockTourSession = {
  id: "tour-mock-session-001",
  stepIndex: 0,
  state: "idle",
  completed: false,
};

function createTourResponse(state: string, stepIndex: number, sessionId = mockTourSession.id) {
  const step = MOCK_TOUR_STEPS[stepIndex] ?? null;
  return {
    tour_session_id: sessionId,
    state,
    current_step: step,
    current_step_index: stepIndex,
    total_steps: MOCK_TOUR_STEPS.length,
    narration: step ? step.narration : "",
    route: step ? step.route : "/dashboard",
    application: step ? step.application : "enterprise_console",
    fixtures: [],
    voice_narration: step ? step.narration : "",
    error: null,
  };
}

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
  def("/brains/templates", () => brainTemplatesResponse()),
  def("/brains/:id/activity", (m) => {
    const brain = findMockBrain(id(m));
    return brain ? jsonResponse(brain.activity) : jsonResponse(null, 404);
  }),
  def("/brains/:id/memory", (m) => {
    const brain = findMockBrain(id(m));
    return brain ? jsonResponse(brain.memoryIds.map((memoryId) => ({ id: memoryId, why: "Recorded from a governed Brain outcome." }))) : jsonResponse(null, 404);
  }),
  def("/brains/:id", (m) => {
    const brain = findMockBrain(id(m));
    return brain ? jsonResponse(brain) : jsonResponse(null, 404);
  }),
  def("/brains", () => jsonResponse([...mockBrains])),
  def("/users", (m) => {
    const params = new URLSearchParams((m as unknown as { query?: string })?.query ?? "");
    const page = parseInt(params.get("page") ?? "1", 10);
    const limit = parseInt(params.get("limit") ?? "20", 10);
    const start = (page - 1) * limit;
    return jsonResponse({ items: users.slice(start, start + limit), total: users.length, page, limit });
  }),
  def("/users/me", () => {
    const user: AuthUser = { id: "u1", name: "Alex Rivera", email: "alex@eaip.io", roles: ["admin"] };
    return jsonResponse(user);
  }),
  def("/users/:id", (m) => {
    const user = users.find((u) => u.id === id(m));
    return user ? jsonResponse(user) : jsonResponse(null, 404);
  }),
  def("/knowledge", () => jsonResponse([...knowledgeArticles])),
  def("/knowledge/collections", () => jsonResponse([])),
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
  loadMockBrains();
  loadMockMissions();
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const urlStr = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    const url = new URL(urlStr, typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
    const isApiRequest = url.pathname.startsWith(`${API_PREFIX}/`);
    const isMockTarget = urlStr.includes("localhost:8080") || isApiRequest;
    if (!isMockTarget) {
      return originalFetch(input, init);
    }
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
        summary: "Notification created via API",
        severity: "info",
        category: "system",
        read: false,
        acknowledged: false,
        dismissed: false,
        timestamp: new Date().toISOString(),
        source: "API Gateway",
        deepLink: null,
        relatedEntityId: null,
        relatedEntityType: null,
        groupKey: null,
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

    if (url.pathname === API_PREFIX + "/missions" && method === "GET") {
      await delay();
      return jsonResponse([...mockMissions]);
    }

    if (url.pathname === API_PREFIX + "/missions/stats" && method === "GET") {
      await delay();
      return jsonResponse({
        totalMissions: mockMissions.length,
        running: mockMissions.filter((mission) => mission.status === "running").length,
        completed: mockMissions.filter((mission) => mission.status === "completed").length,
        failed: mockMissions.filter((mission) => mission.status === "failed").length,
        queued: mockMissions.filter((mission) => mission.status === "pending").length,
      });
    }

    if (url.pathname === API_PREFIX + "/missions" && method === "POST") {
      await delay();
      const body = init?.body ? JSON.parse(init.body as string) as unknown : undefined;
      return jsonResponse(createMockMission(body));
    }

    const missionExecute = new RegExp(`^${API_PREFIX}/missions/([^/]+)/execute$`).exec(url.pathname);
    if (missionExecute && method === "POST") {
      await delay();
      const mission = mockMissions.find((item) => item.id === missionExecute[1]);
      if (!mission) return jsonResponse(null, 404);
      mission.status = "completed";
      mission.progress = 1;
      mission.completedAt = new Date().toISOString();
      persistMockMissions();
      return jsonResponse({ executionId: `execution-${String(Date.now())}` });
    }

    const missionRoute = new RegExp(`^${API_PREFIX}/missions/([^/]+)$`).exec(url.pathname);
    if (missionRoute && method === "GET") {
      await delay();
      const mission = mockMissions.find((item) => item.id === missionRoute[1]);
      return mission ? jsonResponse(mission) : jsonResponse(null, 404);
    }

    if (missionRoute && method === "DELETE") {
      await delay();
      mockMissions = mockMissions.filter((item) => item.id !== missionRoute[1]);
      persistMockMissions();
      return jsonResponse({ status: "deleted" });
    }

    if (url.pathname === API_PREFIX + "/brains" && method === "POST") {
      await delay();
      const body = init?.body ? JSON.parse(init.body as string) as unknown : undefined;
      return jsonResponse(createMockBrain(body));
    }

    const brainAction = new RegExp(`^${API_PREFIX}/brains/([^/]+)/recommendations/([^/]+)/(approve|reject|execute)$`).exec(url.pathname);
    if (brainAction && method === "POST") {
      await delay();
      const brain = findMockBrain(brainAction[1] ?? "");
      const recommendation = brain ? findRecommendation(brain, brainAction[2] ?? "") : undefined;
      if (!brain || !recommendation) return jsonResponse(null, 404);
      const action = brainAction[3];
      if (action === "approve") {
        if (recommendation.status !== "pending_approval") return jsonResponse({ detail: "Recommendation is not pending approval" }, 403);
        recommendation.status = "approved";
        addBrainActivity(brain, "approval_granted", recommendation.id);
        return jsonResponse(recommendation);
      }
      if (action === "reject") {
        if (recommendation.status !== "pending_approval") return jsonResponse({ detail: "Recommendation is not pending approval" }, 403);
        recommendation.status = "rejected";
        recommendation.executionStatus = "rejected";
        addBrainActivity(brain, "approval_rejected", recommendation.id);
        return jsonResponse(recommendation);
      }
      if (recommendation.status !== "approved") return jsonResponse({ detail: "Recommendation requires approval before execution" }, 403);
      const missionId = recommendation.missionId ?? `mission-${String(Date.now())}`;
      recommendation.missionId = missionId;
      recommendation.status = "executed";
      recommendation.executionStatus = "ready_for_integration";
      recommendation.executionResult = "Mission created; execution integration pending.";
      if (!brain.missionIds.includes(missionId)) brain.missionIds.unshift(missionId);
      addBrainActivity(brain, "action_executed", recommendation.title);
      const memoryId = `brain-memory-${String(Date.now())}`;
      brain.memoryIds.unshift(memoryId);
      addBrainActivity(brain, "memory_recorded", recommendation.executionResult);
      return jsonResponse({ missionId, mission: { id: missionId, name: recommendation.title, status: "draft" }, executionStatus: recommendation.executionStatus, executionResult: recommendation.executionResult });
    }

    const brainQuery = new RegExp(`^${API_PREFIX}/brains/([^/]+)/query$`).exec(url.pathname);
    if (brainQuery && method === "POST") {
      await delay();
      const brain = findMockBrain(brainQuery[1] ?? "");
      if (!brain) return jsonResponse(null, 404);
      const recommendation: MockBrainRecommendation = {
        id: `rec-${String(Date.now())}`,
        title: "Focus on evidence-backed acquisition opportunities",
        rationale: "No connected knowledge source returned evidence.",
        evidence: [],
        confidence: 0,
        status: brain.approvalRequired ? "pending_approval" : "approved",
        approvalRequired: brain.approvalRequired,
        executionStatus: "ready_for_execution_integration",
      };
      brain.recommendations.unshift(recommendation);
      addBrainActivity(brain, "recommendation_generated", recommendation.title);
      return jsonResponse({ answer: recommendation.rationale, sources: [], recommendation });
    }

    const brainMemory = new RegExp(`^${API_PREFIX}/brains/([^/]+)/memory$`).exec(url.pathname);
    if (brainMemory && method === "POST") {
      await delay();
      const brain = findMockBrain(brainMemory[1] ?? "");
      if (!brain) return jsonResponse(null, 404);
      const body = init?.body ? recordBody(JSON.parse(init.body as string)) : {};
      const content = typeof body.content === "string" ? body.content.trim() : "";
      if (!content) return jsonResponse({ detail: "Memory content is required" }, 400);
      const memoryId = `brain-memory-${String(Date.now())}`;
      brain.memoryIds.unshift(memoryId);
      addBrainActivity(brain, "memory_recorded", content);
      return jsonResponse({ id: memoryId, content, why: "Recorded from a governed Brain outcome." });
    }

    const brainConfig = new RegExp(`^${API_PREFIX}/brains/([^/]+)/config$`).exec(url.pathname);
    if (brainConfig && method === "PUT") {
      await delay();
      const brain = findMockBrain(brainConfig[1] ?? "");
      if (!brain) return jsonResponse(null, 404);
      const body = init?.body ? recordBody(JSON.parse(init.body as string)) : {};
      for (const key of ["name", "description", "businessFunction", "instructions"] as const) {
        if (typeof body[key] === "string") brain[key === "businessFunction" ? "businessFunction" : key] = body[key];
      }
      if ("objectives" in body) brain.objectives = stringList(body.objectives, []);
      if ("knowledgeSources" in body) brain.knowledgeSources = stringList(body.knowledgeSources, []);
      if ("rules" in body) brain.rules = stringList(body.rules, []);
      if ("tools" in body) brain.tools = stringList(body.tools, []);
      if (typeof body.approvalRequired === "boolean") brain.approvalRequired = body.approvalRequired;
      addBrainActivity(brain, "configured", "Brain configuration updated");
      return jsonResponse(brain);
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

    if (url.pathname === API_PREFIX + "/copilot/chat" && method === "POST") {
      await delay();
      const body = init?.body ? (JSON.parse(init.body as string) as { message?: string }) : {};
      const message = typeof body.message === "string" ? body.message : "";
      const turn = createMockCopilotTurn(message);
      if (turn.pending_approval) {
        mockCopilotApprovals = [turn.pending_approval, ...mockCopilotApprovals];
      }
      return jsonResponse(turn);
    }

    if (url.pathname === API_PREFIX + "/copilot/approvals" && method === "GET") {
      await delay();
      return jsonResponse([...mockCopilotApprovals]);
    }

    const copilotApprovalAction = new RegExp(`^${API_PREFIX}/copilot/approvals/([^/]+)/(approve|reject)$`).exec(url.pathname);
    if (copilotApprovalAction && method === "POST") {
      await delay();
      const approvalId = copilotApprovalAction[1] ?? "";
      const action = copilotApprovalAction[2];
      const approval = mockCopilotApprovals.find((item) => item.id === approvalId);
      if (!approval) return jsonResponse({ detail: "Approval not found or not pending" }, 404);
      approval.status = action === "approve" ? "approved" : "rejected";
      approval.decided_at = new Date().toISOString();
      approval.decided_by = "local-user";
      const result = action === "approve" ? `Executed ${approval.tool_name} with arguments ${JSON.stringify(approval.arguments)}` : null;
      mockCopilotApprovals = mockCopilotApprovals.filter((item) => item.id !== approvalId);
      return jsonResponse({ approval, result });
    }

    if (url.pathname === API_PREFIX + "/tour/preferences" && method === "GET") {
      await delay();
      return jsonResponse({ tour_completed: mockTourSession.completed });
    }

    if (url.pathname === API_PREFIX + "/tour/start" && method === "POST") {
      await delay();
      mockTourSession.state = "explaining";
      mockTourSession.stepIndex = 0;
      return jsonResponse(createTourResponse("explaining", 0));
    }

    const tourCmd = new RegExp(`^${API_PREFIX}/tour/([^/]+)/command$`).exec(url.pathname);
    if (tourCmd && method === "POST") {
      await delay();
      const body = init?.body ? (JSON.parse(init.body as string) as { command?: string; step_id?: string; route?: string }) : {};
      const cmd = body.command ?? "next";
      if (cmd === "pause") {
        mockTourSession.state = "paused";
      } else if (cmd === "resume") {
        mockTourSession.state = "explaining";
      } else if (cmd === "next") {
        if (mockTourSession.stepIndex < MOCK_TOUR_STEPS.length - 1) {
          mockTourSession.stepIndex += 1;
          mockTourSession.state = "explaining";
        } else {
          mockTourSession.state = "completed";
          mockTourSession.completed = true;
        }
      } else if (cmd === "previous") {
        if (mockTourSession.stepIndex > 0) {
          mockTourSession.stepIndex -= 1;
          mockTourSession.state = "explaining";
        }
      } else if (cmd === "skip") {
        if (mockTourSession.stepIndex < MOCK_TOUR_STEPS.length - 1) {
          mockTourSession.stepIndex += 1;
          mockTourSession.state = "explaining";
        } else {
          mockTourSession.state = "completed";
          mockTourSession.completed = true;
        }
      } else if (cmd === "stop") {
        mockTourSession.state = "cancelled";
      } else if (cmd === "go_to" && body.step_id) {
        const found = MOCK_TOUR_STEPS.findIndex((s) => s.id === body.step_id);
        if (found >= 0) {
          mockTourSession.stepIndex = found;
          mockTourSession.state = "explaining";
        }
      } else if (cmd === "try_myself") {
        mockTourSession.state = "waiting";
      } else {
        mockTourSession.state = "explaining";
      }
      return jsonResponse(createTourResponse(mockTourSession.state, mockTourSession.stepIndex, tourCmd[1]));
    }

    const tourEnd = new RegExp(`^${API_PREFIX}/tour/([^/]+)/end$`).exec(url.pathname);
    if (tourEnd && method === "POST") {
      await delay();
      const body = init?.body ? (JSON.parse(init.body as string) as { cancelled?: boolean }) : {};
      const isCancelled = Boolean(body.cancelled);
      mockTourSession.state = isCancelled ? "cancelled" : "completed";
      if (!isCancelled) mockTourSession.completed = true;
      return jsonResponse(createTourResponse(mockTourSession.state, mockTourSession.stepIndex, tourEnd[1]));
    }

    const tourStatus = new RegExp(`^${API_PREFIX}/tour/([^/]+)/status$`).exec(url.pathname);
    if (tourStatus && method === "GET") {
      await delay();
      const step = MOCK_TOUR_STEPS[mockTourSession.stepIndex];
      return jsonResponse({
        tour_session_id: tourStatus[1],
        state: mockTourSession.state,
        current_step_index: mockTourSession.stepIndex,
        total_steps: MOCK_TOUR_STEPS.length,
        current_route: step ? step.route : "/dashboard",
        current_application: "enterprise_console",
        voice_enabled: false,
      });
    }

    try {
      const response = await originalFetch(input, init);
      if (response.status === 401) {
        return jsonResponse({}, 404);
      }
      return response;
    } catch {
      return jsonResponse({}, 404);
    }
  };

  return () => {
    globalThis.fetch = originalFetch;
  };
}
