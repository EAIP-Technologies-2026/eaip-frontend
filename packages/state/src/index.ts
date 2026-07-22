import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { AuthUser } from "@eaip/auth";

export interface AppState {
  sidebarOpen: boolean;
  sidebarWidth: number;
  toggleSidebar: () => void;
  setSidebarWidth: (width: number) => void;
}

export const useAppStore = create<AppState>()(
  subscribeWithSelector((set) => ({
    sidebarOpen: true,
    sidebarWidth: 280,
    toggleSidebar: () => {
      set((state) => ({ sidebarOpen: !state.sidebarOpen }));
    },
    setSidebarWidth: (width: number) => {
      set({ sidebarWidth: width });
    },
  })),
);

export interface Breadcrumb {
  label: string;
  href?: string;
}

export interface Workspace {
  id: string;
  name: string;
}

export interface PlatformNotification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
}

export interface PlatformState {
  // UI shell
  sidebarOpen: boolean;
  commandPaletteOpen: boolean;
  globalSearchOpen: boolean;
  notificationPanelOpen: boolean;

  // Navigation
  activeRoute: string;
  breadcrumbs: Breadcrumb[];

  // User and permissions
  user: AuthUser | null;
  permissions: string[];

  // Workspace
  activeWorkspace: Workspace | null;
  workspaces: Workspace[];

  // Notifications
  notifications: PlatformNotification[];

  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setActiveRoute: (route: string, breadcrumbs?: Breadcrumb[]) => void;
  setBreadcrumbs: (breadcrumbs: Breadcrumb[]) => void;
  setUser: (user: AuthUser | null) => void;
  setPermissions: (permissions: string[]) => void;
  setActiveWorkspace: (workspace: Workspace | null) => void;
  setWorkspaces: (workspaces: Workspace[]) => void;
  addNotification: (notification: PlatformNotification) => void;
  markNotificationRead: (id: string) => void;
  removeNotification: (id: string) => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  openGlobalSearch: () => void;
  closeGlobalSearch: () => void;
  openNotificationPanel: () => void;
  closeNotificationPanel: () => void;

  // Helpers
  hasPermission: (permission: string) => boolean;
  unreadNotificationCount: () => number;
}

function derivePermissions(user: AuthUser | null): string[] {
  if (!user) return [];
  const permissions = new Set<string>(["view:dashboard"]);
  for (const role of user.roles) {
    if (role === "admin") {
      permissions.add("admin:users");
      permissions.add("admin:roles");
      permissions.add("admin:permissions");
      permissions.add("manage:agents");
      permissions.add("manage:workflows");
      permissions.add("manage:knowledge");
      permissions.add("manage:memory");
    }
    if (role === "user") {
      permissions.add("view:agents");
      permissions.add("view:workflows");
      permissions.add("view:knowledge");
      permissions.add("view:memory");
    }
  }
  return Array.from(permissions);
}

export const usePlatformStore = create<PlatformState>()(
  subscribeWithSelector((set, get) => ({
    sidebarOpen: true,
    commandPaletteOpen: false,
    globalSearchOpen: false,
    notificationPanelOpen: false,

    activeRoute: "/dashboard",
    breadcrumbs: [],

    user: null,
    permissions: [],

    activeWorkspace: null,
    workspaces: [
      { id: "default", name: "Default Workspace" },
      { id: "engineering", name: "Engineering" },
      { id: "operations", name: "Operations" },
    ],

    notifications: [],

    toggleSidebar: () => {
      set((state) => ({ sidebarOpen: !state.sidebarOpen }));
    },
    setSidebarOpen: (open: boolean) => {
      set({ sidebarOpen: open });
    },
    setActiveRoute: (route: string, breadcrumbs?: Breadcrumb[]) => {
      set({ activeRoute: route, breadcrumbs: breadcrumbs ?? [] });
    },
    setBreadcrumbs: (breadcrumbs: Breadcrumb[]) => {
      set({ breadcrumbs });
    },
    setUser: (user: AuthUser | null) => {
      set({ user, permissions: derivePermissions(user) });
    },
    setPermissions: (permissions: string[]) => {
      set({ permissions });
    },
    setActiveWorkspace: (workspace: Workspace | null) => {
      set({ activeWorkspace: workspace });
    },
    setWorkspaces: (workspaces: Workspace[]) => {
      set({ workspaces });
    },
    addNotification: (notification: PlatformNotification) => {
      set((state) => ({ notifications: [notification, ...state.notifications] }));
    },
    markNotificationRead: (id: string) => {
      set((state) => ({
        notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
      }));
    },
    removeNotification: (id: string) => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }));
    },
    openCommandPalette: () => {
      set({ commandPaletteOpen: true });
    },
    closeCommandPalette: () => {
      set({ commandPaletteOpen: false });
    },
    openGlobalSearch: () => {
      set({ globalSearchOpen: true });
    },
    closeGlobalSearch: () => {
      set({ globalSearchOpen: false });
    },
    openNotificationPanel: () => {
      set({ notificationPanelOpen: true });
    },
    closeNotificationPanel: () => {
      set({ notificationPanelOpen: false });
    },
    hasPermission: (permission: string) => {
      return get().permissions.includes(permission);
    },
    unreadNotificationCount: () => {
      return get().notifications.filter((n) => !n.read).length;
    },
  })),
);
