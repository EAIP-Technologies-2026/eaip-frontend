export interface NavCategory {
  id: string;
  label: string;
  icon: string;
  href: string;
  description: string;
  items: { label: string; href: string; icon?: string; permissions?: string[] }[];
}

export const fullNavigation: NavCategory[] = [
  {
    id: "core",
    label: "Core",
    icon: "home",
    href: "/dashboard",
    description: "Platform overview and system status",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: "home" },
      { label: "Agents", href: "/agents", icon: "robot" },
      { label: "Analytics", href: "/analytics", icon: "chart" },
      { label: "Activity", href: "/activity", icon: "activity" },
      { label: "Notifications", href: "/notifications", icon: "bell" },
    ],
  },
  {
    id: "data",
    label: "Data & Knowledge",
    icon: "database",
    href: "/knowledge",
    description: "Knowledge base, memory, and documents",
    items: [
      { label: "Knowledge", href: "/knowledge", icon: "book" },
      { label: "Memory", href: "/memory", icon: "brain" },
      { label: "Documents", href: "/documents", icon: "folder" },
    ],
  },
  {
    id: "automation",
    label: "Automation",
    icon: "workflow",
    href: "/workflows",
    description: "Workflows, missions, and automation",
    items: [
      { label: "Workflows", href: "/workflows", icon: "workflow" },
      { label: "Missions", href: "/missions", icon: "rocket" },
    ],
  },
  {
    id: "operations",
    label: "Operations",
    icon: "activity",
    href: "/monitoring",
    description: "System monitoring and health",
    items: [
      { label: "Monitoring", href: "/monitoring", icon: "activity" },
      { label: "Health", href: "/health", icon: "cpu" },
    ],
  },
  {
    id: "admin",
    label: "Administration",
    icon: "shield",
    href: "/administration",
    description: "User management and settings",
    items: [
      { label: "Administration", href: "/administration", icon: "building" },
      { label: "Users", href: "/users", icon: "users" },
      { label: "Roles", href: "/roles", icon: "shield" },
      { label: "Permissions", href: "/permissions", icon: "key" },
      { label: "Settings", href: "/settings", icon: "settings" },
    ],
  },
  {
    id: "marketplace",
    label: "Marketplace",
    icon: "package",
    href: "/marketplace",
    description: "Discover and install integrations",
    items: [
      { label: "Browse", href: "/marketplace", icon: "package" },
    ],
  },
];

export const commandPaletteCommands = [
  {
    id: "nav-dashboard",
    label: "Go to Dashboard",
    shortcut: "G D",
    href: "/dashboard",
    category: "navigation" as const,
    icon: "home" as const,
  },
  {
    id: "nav-agents",
    label: "Go to Agents",
    shortcut: "G A",
    href: "/agents",
    category: "navigation" as const,
    icon: "robot" as const,
  },
  {
    id: "nav-analytics",
    label: "Go to Analytics",
    shortcut: "G N",
    href: "/analytics",
    category: "navigation" as const,
    icon: "chart" as const,
  },
  {
    id: "nav-monitoring",
    label: "Go to Monitoring",
    shortcut: "G M",
    href: "/monitoring",
    category: "navigation" as const,
    icon: "activity" as const,
  },
  {
    id: "nav-workflows",
    label: "Go to Workflows",
    shortcut: "G W",
    href: "/workflows",
    category: "navigation" as const,
    icon: "workflow" as const,
  },
  {
    id: "nav-notifications",
    label: "Go to Notifications",
    shortcut: "G N",
    href: "/notifications",
    category: "navigation" as const,
    icon: "bell" as const,
  },
  {
    id: "nav-settings",
    label: "Go to Settings",
    shortcut: "G S",
    href: "/settings",
    category: "navigation" as const,
    icon: "settings" as const,
  },
  {
    id: "nav-users",
    label: "Go to Users",
    shortcut: "G U",
    href: "/users",
    category: "navigation" as const,
    icon: "users" as const,
  },
  {
    id: "nav-knowledge",
    label: "Go to Knowledge",
    shortcut: "G K",
    href: "/knowledge",
    category: "navigation" as const,
    icon: "book" as const,
  },
  {
    id: "nav-profile",
    label: "Go to Profile",
    shortcut: "G P",
    href: "/profile",
    category: "navigation" as const,
    icon: "user" as const,
  },
  {
    id: "action-create-agent",
    label: "Create New Agent",
    shortcut: "C A",
    href: "/agents",
    category: "action" as const,
    icon: "plus" as const,
  },
  {
    id: "action-search",
    label: "Search Everything",
    shortcut: "Cmd+Shift+F",
    href: "/search",
    category: "action" as const,
    icon: "search" as const,
  },
  {
    id: "action-notifications",
    label: "View Notifications",
    shortcut: "C N",
    href: "/notifications",
    category: "action" as const,
    icon: "bell" as const,
  },
  {
    id: "nav-activity",
    label: "View Activity Feed",
    shortcut: "G V",
    href: "/activity",
    category: "navigation" as const,
    icon: "activity" as const,
  },
  {
    id: "nav-health",
    label: "System Health",
    shortcut: "G H",
    href: "/health",
    category: "navigation" as const,
    icon: "cpu" as const,
  },
  {
    id: "nav-marketplace",
    label: "Marketplace",
    shortcut: "G X",
    href: "/marketplace",
    category: "navigation" as const,
    icon: "package" as const,
  },
];

export interface RouteAuditEntry {
  path: string;
  label: string;
  icon?: string;
  status: "implemented" | "partial" | "placeholder" | "planned";
  phase: number;
  description: string;
}

export const routeAudit: RouteAuditEntry[] = [
  { path: "/", label: "Root Redirect", icon: "home", status: "implemented", phase: 1, description: "Redirects to /dashboard" },
  { path: "/dashboard", label: "Dashboard", icon: "home", status: "implemented", phase: 1, description: "Main dashboard with stats, pinned agents, activity" },
  { path: "/agents", label: "Agents", icon: "robot", status: "implemented", phase: 1, description: "Agent listing with CRUD" },
  { path: "/agents/[id]", label: "Agent Detail", icon: "robot", status: "implemented", phase: 2, description: "Agent detail with executions, events" },
  { path: "/analytics", label: "Analytics", icon: "chart", status: "implemented", phase: 1, description: "Analytics dashboard" },
  { path: "/health", label: "System Health", icon: "cpu", status: "implemented", phase: 1, description: "Health monitoring page" },
  { path: "/activity", label: "Activity", icon: "activity", status: "implemented", phase: 2, description: "Activity feed page" },
  { path: "/notifications", label: "Notifications", icon: "bell", status: "partial", phase: 3, description: "Notification center with grouping" },
  { path: "/workflows", label: "Workflows", icon: "workflow", status: "implemented", phase: 2, description: "Workflow listing" },
  { path: "/missions", label: "Missions", icon: "rocket", status: "implemented", phase: 2, description: "Mission listing" },
  { path: "/knowledge", label: "Knowledge", icon: "book", status: "implemented", phase: 2, description: "Knowledge base" },
  { path: "/memory", label: "Memory", icon: "brain", status: "implemented", phase: 2, description: "Memory management" },
  { path: "/documents", label: "Documents", icon: "folder", status: "implemented", phase: 2, description: "Document management" },
  { path: "/users", label: "Users", icon: "users", status: "implemented", phase: 2, description: "User directory" },
  { path: "/roles", label: "Roles", icon: "shield", status: "implemented", phase: 2, description: "Role management" },
  { path: "/permissions", label: "Permissions", icon: "key", status: "implemented", phase: 2, description: "Permission management" },
  { path: "/settings", label: "Settings", icon: "settings", status: "partial", phase: 3, description: "App settings with config info" },
  { path: "/search", label: "Search", icon: "search", status: "implemented", phase: 3, description: "Universal search results page" },
  { path: "/monitoring", label: "Monitoring", icon: "activity", status: "implemented", phase: 3, description: "System monitoring dashboard" },
  { path: "/administration", label: "Administration", icon: "building", status: "implemented", phase: 3, description: "Admin overview" },
  { path: "/marketplace", label: "Marketplace", icon: "package", status: "implemented", phase: 3, description: "Integration marketplace" },
  { path: "/profile", label: "Profile", icon: "user", status: "implemented", phase: 3, description: "User profile and preferences" },
  { path: "/login", label: "Login", icon: "lock", status: "implemented", phase: 1, description: "Authentication page" },
  { path: "/unauthorized", label: "Unauthorized", icon: "alert", status: "implemented", phase: 1, description: "Access denied page" },
  { path: "/navigation", label: "Navigation Map", icon: "grid", status: "implemented", phase: 3, description: "Full navigation overview" },
];
