/* eslint-disable @typescript-eslint/no-non-null-assertion, @typescript-eslint/restrict-template-expressions */

import type { Agent, AgentExecution, AgentEvent } from "@eaip/agent";
import type { PlatformNotification } from "@eaip/state";

export interface MockWorkflow {
  id: string;
  name: string;
  description?: string;
  status: "active" | "inactive" | "error" | "draft";
  steps: number;
  lastRun?: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

export interface MockUser {
  id: string;
  name: string;
  email: string;
  roles: string[];
  avatar?: string;
  department?: string;
  lastActive?: string;
  status: "active" | "inactive" | "suspended";
}

export interface MockKnowledgeArticle {
  id: string;
  title: string;
  category: string;
  summary: string;
  tags: string[];
  author: string;
  updatedAt: string;
}

export interface MockMonitoringEvent {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  severity: "info" | "warning" | "error" | "critical";
  source: string;
  acknowledged: boolean;
}

const firstNames = ["Alex", "Jordan", "Sam", "Morgan", "Casey", "Riley", "Taylor", "Quinn", "Avery", "Blake", "Cameron", "Dakota", "Emerson", "Finley", "Harper", "Jamie", "Kendall", "Logan", "Parker", "Reese", "Skyler", "Sydney", "Charlie", "Drew", "Elliott", "Frankie", "Gray", "Hayden", "Jules", "Kerry"];
const lastNames = ["Rivera", "Chen", "Patel", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis"];
const domains = ["eaip.io", "acmecorp.com", "globex.io", "initech.net", "umbrella.org"];
const depts = ["Engineering", "Operations", "Data Science", "Security", "Product", "Support", "Finance", "HR"];
const agentTasks = [
  "Data Analysis", "Code Review", "Customer Support", "Document Processing", "Security Scanning",
  "Report Generation", "Email Classification", "Translation", "Log Analysis", "Monitoring",
  "Compliance Checking", "Search Indexing", "Alert Correlation", "Budget Forecasting", "Pipeline Management",
  "Quality Assurance", "Threat Detection", "Performance Optimization", "Knowledge Extraction", "Anomaly Detection",
  "Predictive Modeling", "Data Validation", "Workflow Automation", "Sentiment Analysis", "Image Recognition",
  "Natural Language Understanding", "Database Optimization", "Network Analysis", "Fraud Detection", "Resource Planning",
];

export function createMockAgents(count = 100): Agent[] {
  const statuses: Agent["status"][] = ["active", "active", "active", "active", "inactive", "inactive", "error"];
  const models = ["gpt-4", "gpt-4-turbo", "gpt-3.5-turbo", "claude-3-opus", "claude-3-sonnet"];
  return Array.from({ length: count }, (_, i) => ({
    id: `agent-${i + 1}`,
    name: `${agentTasks[i % agentTasks.length]!} Agent ${i < 30 ? "" : `#${Math.floor(i / 30) + 1}`}`.trim(),
    description: `Automated ${agentTasks[i % agentTasks.length]!.toLowerCase()} agent handling ${((i + 1) * 23) % 1000 + 100} tasks per day`,
    status: statuses[i % statuses.length] ?? "inactive",
    model: models[i % models.length] ?? "gpt-4",
    systemPrompt: `You are an expert ${agentTasks[i % agentTasks.length]!.toLowerCase()} agent. Process requests efficiently and accurately.`,
    tools: i % 3 === 0 ? [{ id: `tool-${i}`, name: `${agentTasks[i % agentTasks.length]!.toLowerCase().replace(/\s+/g, "-")}-api`, enabled: true }] : [],
    createdAt: new Date(Date.now() - (count - i) * 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - (count - i) * 3600000).toISOString(),
    metrics: {
      totalExecutions: Math.floor(Math.random() * 5000 + 100),
      successRate: 0.75 + Math.random() * 0.24,
      avgLatencyMs: Math.floor(Math.random() * 2000 + 100),
    },
  }));
}

export function createMockExecutions(agentId: string): AgentExecution[] {
  const statuses: AgentExecution["status"][] = ["completed", "completed", "completed", "completed", "completed", "completed", "completed", "failed", "completed", "running"];
  return Array.from({ length: 30 }, (_, i) => ({
    id: `exec-${agentId}-${String(i + 1)}`,
    agentId,
    status: statuses[i % statuses.length] ?? "completed",
    input: `Process job batch ${String(i + 1)}: execute ${agentTasks[i % agentTasks.length]!.toLowerCase()} routine against dataset ${String((i + 1) * 7)}`,
    output: `Batch ${String(i + 1)} completed. Processed ${String(Math.floor(Math.random() * 5000 + 100))} records in ${String(Math.floor(Math.random() * 5000 + 100))}ms. Success rate: ${String(Math.round((0.85 + Math.random() * 0.14) * 100))}%`,
    startedAt: new Date(Date.now() - (30 - i) * 3600000).toISOString(),
    completedAt: new Date(Date.now() - (30 - i) * 3600000 + Math.random() * 300000).toISOString(),
    duration: Math.floor(Math.random() * 5000 + 100),
  }));
}

export function createMockEvents(agentId: string): AgentEvent[] {
  const eventTypes = ["agent.started", "agent.progress", "agent.completed", "agent.metrics", "agent.error", "agent.warning"] as const;
  return Array.from({ length: 20 }, (_, i) => ({
    id: `evt-${agentId}-${String(i + 1)}`,
    type: eventTypes[i % eventTypes.length]!,
    data: { stage: i, progress: Math.min(100, (i + 1) * 10), duration: Math.floor(Math.random() * 5000) },
    timestamp: new Date(Date.now() - (20 - i) * 600000).toISOString(),
  }));
}

export function createMockStats() {
  return {
    totalAgents: 100,
    activeAgents: 68,
    totalExecutions: 284320,
    successRate: 0.93,
    avgLatencyMs: 420,
    executionsByDay: Array.from({ length: 30 }, (_, i) => ({
      label: new Date(Date.now() - (29 - i) * 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      value: Math.floor(Math.random() * 500 + 200),
    })),
    agentsByStatus: [
      { name: "active", value: 68 },
      { name: "inactive", value: 22 },
      { name: "error", value: 10 },
    ],
    agentsByModel: [
      { name: "gpt-4", value: 35 },
      { name: "gpt-4-turbo", value: 25 },
      { name: "gpt-3.5-turbo", value: 20 },
      { name: "claude-3-opus", value: 12 },
      { name: "claude-3-sonnet", value: 8 },
    ],
    topAgents: [
      { name: "Customer Support Agent", value: 28432 },
      { name: "Search Indexing Agent", value: 22456 },
      { name: "Email Classification Agent", value: 18901 },
      { name: "Security Scanning Agent", value: 15678 },
      { name: "Data Analysis Agent", value: 12345 },
    ],
  };
}

export function createMockMonitoringEvents(count = 500): MockMonitoringEvent[] {
  const sources = ["API Gateway", "Agent Runtime", "Database Cluster", "Message Queue", "Search Index", "Memory Cache", "Knowledge Store", "Notification Service"];
  const severities: MockMonitoringEvent["severity"][] = ["info", "info", "info", "info", "warning", "warning", "error", "critical"];
  const titles = [
    "Agent execution completed successfully", "Health check passed", "Cache invalidation triggered",
    "Database connection pool exhausted", "Memory usage threshold crossed", "Service latency spike detected",
    "Certificate expiring soon", "Disk space low on node", "Unhandled exception in agent runtime",
    "Message backlog exceeding limit", "Search index rebuilt", "Knowledge sync completed",
    "API rate limit approaching", "Authentication failure rate elevated", "Deployment started",
  ];
  return Array.from({ length: count }, (_, i) => ({
    id: `mon-${String(i + 1)}`,
    title: titles[i % titles.length]!,
    description: `Details: ${sources[i % sources.length]!} reported ${severities[i % severities.length]!} event at ${new Date(Date.now() - i * 3600000).toISOString()}`,
    timestamp: new Date(Date.now() - i * 3600000).toISOString(),
    severity: severities[i % severities.length]!,
    source: sources[i % sources.length]!,
    acknowledged: Math.random() > 0.4,
  }));
}

export function createMockActivityFeed(count = 500) {
  const types = ["create", "update", "delete", "info"] as const;
  const actions = [
    "Agent executed successfully", "Agent deployed to production", "Workflow triggered",
    "Configuration updated", "User invited to workspace", "Knowledge base synchronized",
    "Security scan completed", "Report generated", "Alert acknowledged", "System backup completed",
    "Agent paused", "Agent resumed", "Permission updated", "Role assigned", "Token revoked",
  ];
  return Array.from({ length: count }, (_, i) => ({
    id: `act-${String(i + 1)}`,
    title: actions[i % actions.length] ?? "System activity",
    description: i % 4 === 0 ? `Details: ${actions[i % actions.length]!} for ${agentTasks[i % agentTasks.length]!.toLowerCase()} operation` : undefined,
    timestamp: new Date(Date.now() - i * 3600000).toISOString(),
    type: types[i % types.length],
    actor: `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`,
  }));
}

export function createMockSearchResults(query?: string) {
  const all = [
    ...createMockAgents(30).map((a) => ({ id: a.id, title: a.name, category: "agent" as const, href: `/agents/${a.id}` })),
    ...Array.from({ length: 20 }, (_, i) => ({ id: `wf-${i + 1}`, title: `Workflow ${String(i + 1)}: ${["Deployment", "Data Processing", "Report Generation", "Alert Response", "Backup"][i % 5]} Pipeline`, category: "workflow" as const, href: `/workflows/wf-${i + 1}` })),
    ...Array.from({ length: 15 }, (_, i) => ({ id: `doc-${i + 1}`, title: `${["Architecture", "API Reference", "Deployment Guide", "Security Policy", "Operations Manual"][i % 5]} ${i < 10 ? "v1." + String(i) : "v2." + String(i - 10)}`, category: "knowledge" as const, href: `/knowledge/doc-${i + 1}` })),
    ...Array.from({ length: 10 }, (_, i) => ({ id: `mem-${i + 1}`, title: `Session Context - ${["Q1", "Q2", "Current", "Training", "Evaluation"][i % 5]} ${String(i + 1)}`, category: "memory" as const, href: `/memory/mem-${i + 1}` })),
    ...Array.from({ length: 10 }, (_, i) => ({ id: `usr-${i + 1}`, title: `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`, category: "user" as const, href: `/users/usr-${i + 1}` })),
    ...Array.from({ length: 8 }, (_, i) => ({ id: `mon-${i + 1}`, title: `Monitoring - ${["System Health", "Agent Metrics", "Database", "Network", "Security", "Performance", "Cost", "Compliance"][i]}`, category: "monitoring" as const, href: `/monitoring/${["health", "agents", "database", "network", "security", "performance", "cost", "compliance"][i]}` })),
    ...Array.from({ length: 5 }, (_, i) => ({ id: `set-${i + 1}`, title: `Settings - ${["General", "Security", "Notifications", "API Keys", "Team"][i]}`, category: "settings" as const, href: `/settings/${["general", "security", "notifications", "api-keys", "team"][i]}` })),
  ];
  if (query) {
    const q = query.toLowerCase();
    return all.filter((r) => r.title.toLowerCase().includes(q)).slice(0, 50);
  }
  return all.slice(0, 20);
}

export function createMockNotifications(count = 100): PlatformNotification[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `n${String(i + 1)}`,
    title: [
      "Agent execution completed", "System health alert", "Deployment successful",
      "Security scan complete", "Knowledge sync completed", "Workflow failed",
      "New agent registered", "Memory threshold warning", "Certificate expiring",
      "User permission updated",
    ][i % 10]!,
    message: `${agentTasks[i % agentTasks.length]!} operation ${i % 3 === 0 ? "completed successfully" : i % 3 === 1 ? "encountered an issue" : "requires attention"}. ${sources()[i % sources().length]!} ${i % 2 === 0 ? "is operational" : "reported an anomaly"}.`,
    read: i > 30 ? Math.random() > 0.3 : false,
    timestamp: new Date(Date.now() - i * 3600000).toISOString(),
  }));

  function sources() { return ["API Gateway", "Agent Runtime", "Database Cluster", "Message Queue", "Search Index", "Memory Cache"]; }
}

export function createMockSystemHealth() {
  return {
    overall: "degraded" as const,
    uptime: "45d 12h 18m",
    services: [
      { name: "API Gateway", status: "healthy" as const, uptime: "45d 12h 18m", latency: "14ms" },
      { name: "Agent Runtime", status: "healthy" as const, uptime: "45d 12h 15m", latency: "52ms" },
      { name: "Message Queue", status: "healthy" as const, uptime: "45d 12h 18m", latency: "4ms" },
      { name: "Database Cluster", status: "degraded" as const, uptime: "45d 11h 30m", latency: "145ms", message: "Primary node latency elevated" },
      { name: "Knowledge Store", status: "healthy" as const, uptime: "45d 12h 18m", latency: "31ms" },
      { name: "Memory Cache", status: "healthy" as const, uptime: "45d 12h 18m", latency: "2ms" },
      { name: "Search Index", status: "healthy" as const, uptime: "45d 10h 45m", latency: "22ms" },
      { name: "Notification Service", status: "healthy" as const, uptime: "45d 12h 18m", latency: "8ms" },
      { name: "Auth Service", status: "healthy" as const, uptime: "45d 12h 18m", latency: "18ms" },
      { name: "File Storage", status: "healthy" as const, uptime: "45d 12h 18m", latency: "35ms" },
    ],
    metrics: [
      { label: "CPU Usage", value: 62, unit: "%", threshold: 80, status: "healthy" as const },
      { label: "Memory Usage", value: 78, unit: "%", threshold: 85, status: "warning" as const },
      { label: "Disk I/O", value: 45, unit: "%", threshold: 90, status: "healthy" as const },
      { label: "Network Throughput", value: 2.4, unit: "Gbps", threshold: 10, status: "healthy" as const },
      { label: "Error Rate", value: 0.8, unit: "%", threshold: 5, status: "healthy" as const },
      { label: "Request Latency P99", value: 280, unit: "ms", threshold: 500, status: "healthy" as const },
      { label: "Active Connections", value: 1240, unit: "", threshold: 5000, status: "healthy" as const },
      { label: "Queue Depth", value: 340, unit: "", threshold: 1000, status: "healthy" as const },
    ],
  };
}

export function createMockWorkflows(count = 200): MockWorkflow[] {
  const statuses: MockWorkflow["status"][] = ["active", "active", "active", "inactive", "inactive", "error", "draft", "draft"];
  return Array.from({ length: count }, (_, i) => ({
    id: `wf-${i + 1}`,
    name: `${["Data Pipeline", "Deployment", "Report Generation", "Alert Response", "Backup", "Sync", "Validation", "Approval"][i % 8]!} ${Math.floor(i / 8) > 0 ? `#${Math.floor(i / 8) + 1}` : ""}`.trim(),
    description: `${["Processes", "Deploys", "Generates", "Responds to", "Backs up", "Synchronizes", "Validates", "Manages approvals for"][i % 8]!} data across ${String((i + 1) * 3)} sources`,
    status: statuses[i % statuses.length]!,
    steps: Math.floor(Math.random() * 15 + 3),
    lastRun: Math.random() > 0.2 ? new Date(Date.now() - Math.floor(Math.random() * 86400000 * 7)).toISOString() : undefined,
    createdAt: new Date(Date.now() - (count - i) * 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - Math.floor(Math.random() * 86400000 * 14)).toISOString(),
    tags: [["data", "pipeline"], ["deploy", "ci"], ["report", "analytics"], ["alert", "monitor"], ["backup", "data"], ["sync", "data"], ["validate", "qa"], ["approval", "workflow"]][i % 8],
  }));
}

export function createMockUsers(count = 100): MockUser[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `usr-${i + 1}`,
    name: `${firstNames[i % firstNames.length]!} ${lastNames[i % lastNames.length]!}`,
    email: `${firstNames[i % firstNames.length]!.toLowerCase()}.${lastNames[i % lastNames.length]!.toLowerCase()}@${domains[i % domains.length]!}`,
    roles: i === 0 ? ["admin"] : i < 5 ? ["admin", "user"] : i < 20 ? ["user", "manager"] : ["user"],
    department: depts[i % depts.length]!,
    lastActive: Math.random() > 0.1 ? new Date(Date.now() - Math.floor(Math.random() * 86400000 * 30)).toISOString() : undefined,
    status: Math.random() > 0.05 ? "active" : Math.random() > 0.5 ? "inactive" : "suspended",
  }));
}

export function createMockKnowledgeArticles(count = 50): MockKnowledgeArticle[] {
  const categories = ["Architecture", "API Reference", "Deployment", "Security", "Operations", "Integration", "Troubleshooting", "Best Practices"];
  return Array.from({ length: count }, (_, i) => ({
    id: `ka-${i + 1}`,
    title: `${categories[i % categories.length]!}: ${["Overview", "Guide", "Reference", "FAQ", "Tutorial", "Checklist", "Policy", "Template"][i % 8]!} v${Math.floor(i / 8) + 1}`,
    category: categories[i % categories.length]!,
    summary: `Comprehensive ${categories[i % categories.length]!.toLowerCase()} documentation covering ${agentTasks[i % agentTasks.length]!.toLowerCase()} patterns and best practices for enterprise deployment.`,
    tags: [categories[i % categories.length]!.toLowerCase(), "documentation", ...(i % 2 === 0 ? ["guide"] : ["reference"])],
    author: `${firstNames[i % firstNames.length]!} ${lastNames[i % lastNames.length]!}`,
    updatedAt: new Date(Date.now() - Math.floor(Math.random() * 86400000 * 90)).toISOString(),
  }));
}

export function createMockSearchHistory(): string[] {
  return [
    "Data Analyst", "Security scan", "Workflow deployment", "API Gateway",
    "Memory usage", "User permissions", "Knowledge base", "Agent logs",
  ];
}

export function createMockRecentItems() {
  return [
    { id: "agent-1", type: "agent" as const, label: "Data Analysis Agent", href: "/agents/agent-1" },
    { id: "wf-5", type: "workflow" as const, label: "Deployment Pipeline #1", href: "/workflows/wf-5" },
    { id: "ka-3", type: "knowledge" as const, label: "Architecture: Overview v1", href: "/knowledge/ka-3" },
    { id: "usr-2", type: "user" as const, label: "Jordan Chen", href: "/users/usr-2" },
  ];
}

export const mockUsers: MockUser[] = createMockUsers();
