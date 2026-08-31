import type { AppNavigation, EnterpriseApp } from "./types";

export const enterpriseApps: EnterpriseApp[] = [
  {
    id: "enterprise-console",
    label: "Enterprise Console",
    shortLabel: "Console",
    href: "http://localhost:3000",
    color: "bg-primary",
  },
  {
    id: "workspace",
    label: "Workspace",
    shortLabel: "Workspace",
    href: "http://localhost:3004",
    color: "bg-success",
  },
  {
    id: "mission-control",
    label: "Mission Control",
    shortLabel: "Missions",
    href: "http://localhost:3003",
    color: "bg-warning",
  },
  {
    id: "administration",
    label: "Administration",
    shortLabel: "Admin",
    href: "http://localhost:3002",
    color: "bg-danger",
  },
  {
    id: "mobile",
    label: "Mobile",
    shortLabel: "Mobile",
    href: "http://localhost:3001",
    color: "bg-primary",
  },
];

const enterpriseConsoleNavigation: AppNavigation = {
  id: "enterprise-console",
  label: "Enterprise Console",
  basePath: "/",
  items: [
    // OPERATE
    { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: "home", category: "OPERATE" },
    {
      id: "agents",
      label: "Agents & Workforce",
      href: "/agents",
      icon: "robot",
      category: "OPERATE",
      children: [
        { id: "agents-registry", label: "Agent Registry", href: "/agents" },
        { id: "agents-workforce", label: "Workforce Overview", href: "/agents" },
      ],
    },
    {
      id: "missions",
      label: "Missions",
      href: "/missions",
      icon: "rocket",
      category: "OPERATE",
      children: [
        { id: "missions-active", label: "Active Missions", href: "/missions" },
        { id: "missions-history", label: "Mission History", href: "/missions" },
      ],
    },
    {
      id: "workflows",
      label: "Workflows",
      href: "/workflows",
      icon: "workflow",
      category: "OPERATE",
      children: [
        { id: "workflows-builder", label: "Workflow Builder", href: "/workflows" },
        { id: "workflows-executions", label: "Executions", href: "/workflows" },
      ],
    },
    {
      id: "operations",
      label: "Operations",
      href: "/operations",
      icon: "bolt",
      category: "OPERATE",
    },
    { id: "execution", label: "Execution", href: "/execution", icon: "play", category: "OPERATE" },
    {
      id: "simulation",
      label: "Simulation",
      href: "/simulation",
      icon: "pieChart",
      category: "OPERATE",
    },
    {
      id: "long-missions",
      label: "Long Missions",
      href: "/long-missions",
      icon: "clock",
      category: "OPERATE",
    },

    // INTELLIGENCE
    {
      id: "copilot",
      label: "Copilot Studio",
      href: "/copilot",
      icon: "cpu",
      category: "INTELLIGENCE",
    },
    {
      id: "knowledge",
      label: "Knowledge",
      href: "/knowledge",
      icon: "book",
      category: "INTELLIGENCE",
      children: [
        { id: "knowledge-overview", label: "Overview", href: "/knowledge" },
        { id: "knowledge-graph", label: "Knowledge Graph", href: "/knowledge/graph" },
        { id: "knowledge-semantic", label: "Semantic Search", href: "/knowledge/semantic" },
      ],
    },
    { id: "memory", label: "Memory", href: "/memory", icon: "brain", category: "INTELLIGENCE" },
    {
      id: "brains",
      label: "Second Brain",
      href: "/brains",
      icon: "layers",
      category: "INTELLIGENCE",
    },
    {
      id: "methodologies",
      label: "Methodologies",
      href: "/methodologies",
      icon: "book",
      category: "INTELLIGENCE",
    },

    // GOVERN
    {
      id: "decisions",
      label: "Decisions Audit",
      href: "/decisions",
      icon: "gitPullRequest",
      category: "GOVERN",
    },
    {
      id: "approvals",
      label: "Approvals",
      href: "/approvals",
      icon: "checkCircle",
      category: "GOVERN",
    },
    {
      id: "governance",
      label: "Governance & Policies",
      href: "/governance",
      icon: "shield",
      category: "GOVERN",
    },
    {
      id: "administration",
      label: "Administration",
      href: "/administration",
      icon: "settings",
      category: "GOVERN",
      children: [
        { id: "admin-users", label: "Users", href: "/users" },
        { id: "admin-roles", label: "Roles", href: "/roles" },
        { id: "admin-permissions", label: "Permissions", href: "/permissions" },
        { id: "admin-settings", label: "Settings", href: "/settings" },
      ],
    },

    // OBSERVE
    {
      id: "activity",
      label: "Pulse Activity",
      href: "/activity",
      icon: "history",
      category: "OBSERVE",
    },
    {
      id: "monitoring",
      label: "Monitoring",
      href: "/monitoring",
      icon: "activity",
      category: "OBSERVE",
    },
    { id: "analytics", label: "Analytics", href: "/analytics", icon: "chart", category: "OBSERVE" },
    {
      id: "cost",
      label: "Cost Intelligence",
      href: "/cost",
      icon: "creditCard",
      category: "OBSERVE",
    },
    {
      id: "health",
      label: "Health Diagnostics",
      href: "/health",
      icon: "heart",
      category: "OBSERVE",
    },
    {
      id: "enterprise-loop",
      label: "Enterprise Loop",
      href: "/enterprise-loop",
      icon: "refresh",
      category: "OBSERVE",
    },
    {
      id: "executive",
      label: "Executive OS",
      href: "/executive",
      icon: "barChart",
      category: "OBSERVE",
    },

    // EXTEND
    {
      id: "marketplace",
      label: "Marketplace",
      href: "/marketplace",
      icon: "package",
      category: "EXTEND",
    },
    {
      id: "integrations",
      label: "Integrations",
      href: "/integrations",
      icon: "box",
      category: "EXTEND",
    },
    {
      id: "runtimes",
      label: "Enterprise Scale",
      href: "/runtimes",
      icon: "server",
      category: "EXTEND",
    },
    { id: "search", label: "Global Search", href: "/search", icon: "search", category: "EXTEND" },
  ],
};

export const navigationRegistry: Record<string, AppNavigation> = {
  "enterprise-console": enterpriseConsoleNavigation,
  workspace: {
    id: "workspace",
    label: "Workspace",
    basePath: "/",
    items: [
      { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: "home" },
      { id: "knowledge", label: "Knowledge", href: "/knowledge", icon: "book" },
      { id: "memory", label: "Memory", href: "/memory", icon: "brain" },
      { id: "documents", label: "Documents", href: "/documents", icon: "folder" },
    ],
  },
  "mission-control": {
    id: "mission-control",
    label: "Mission Control",
    basePath: "/",
    items: [
      { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: "home" },
      { id: "workflows", label: "Workflows", href: "/workflows", icon: "workflow" },
      { id: "missions", label: "Missions", href: "/missions", icon: "rocket" },
      { id: "history", label: "History", href: "/history", icon: "history" },
    ],
  },
  administration: {
    id: "administration",
    label: "Administration",
    basePath: "/",
    items: [
      { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: "home" },
      {
        id: "users",
        label: "Users",
        href: "/users",
        icon: "users",
        requiredPermission: "admin:users",
      },
      {
        id: "roles",
        label: "Roles",
        href: "/roles",
        icon: "shield",
        requiredPermission: "admin:roles",
      },
      {
        id: "permissions",
        label: "Permissions",
        href: "/permissions",
        icon: "key",
        requiredPermission: "admin:permissions",
      },
    ],
  },
  mobile: {
    id: "mobile",
    label: "Mobile",
    basePath: "/",
    items: [
      { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: "home" },
      { id: "memory", label: "Memory", href: "/memory", icon: "brain" },
      { id: "actions", label: "Actions", href: "/actions", icon: "bolt" },
    ],
  },
};

export function getNavigationForApp(appId: string): AppNavigation {
  return navigationRegistry[appId] ?? enterpriseConsoleNavigation;
}

export function getEnterpriseApp(appId: string): EnterpriseApp | undefined {
  return enterpriseApps.find((app) => app.id === appId);
}

export function getAllEnterpriseApps(): EnterpriseApp[] {
  return enterpriseApps;
}
