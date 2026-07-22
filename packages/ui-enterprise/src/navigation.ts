import type { AppNavigation, EnterpriseApp } from "./types";

export const enterpriseApps: EnterpriseApp[] = [
  {
    id: "enterprise-console",
    label: "Enterprise Console",
    shortLabel: "Console",
    href: "http://localhost:3000",
    color: "bg-blue-600",
  },
  {
    id: "workspace",
    label: "Workspace",
    shortLabel: "Workspace",
    href: "http://localhost:3001",
    color: "bg-green-600",
  },
  {
    id: "mission-control",
    label: "Mission Control",
    shortLabel: "Missions",
    href: "http://localhost:3003",
    color: "bg-purple-600",
  },
  {
    id: "administration",
    label: "Administration",
    shortLabel: "Admin",
    href: "http://localhost:3002",
    color: "bg-orange-600",
  },
  {
    id: "mobile",
    label: "Mobile",
    shortLabel: "Mobile",
    href: "http://localhost:3004",
    color: "bg-pink-600",
  },
];

const enterpriseConsoleNavigation: AppNavigation = {
  id: "enterprise-console",
  label: "Enterprise Console",
  basePath: "/",
  items: [
    { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: "home" },
    { id: "agents", label: "Agents", href: "/agents", icon: "robot" },
    {
      id: "analytics",
      label: "Analytics",
      href: "/analytics",
      icon: "chart",
      requiredPermission: "view:agents",
    },
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
