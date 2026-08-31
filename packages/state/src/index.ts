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

function breadcrumbsEqual(a: Breadcrumb[], b: Breadcrumb[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const crumb = a[i];
    const other = b[i];
    if (!crumb || !other) return false;
    if (crumb.label !== other.label || crumb.href !== other.href) return false;
  }
  return true;
}

export interface Workspace {
  id: string;
  name: string;
}

export type NotificationSeverity = "info" | "success" | "warning" | "error" | "critical";

export type NotificationCategory =
  | "system"
  | "security"
  | "operations"
  | "approvals"
  | "automation"
  | "workflow"
  | "deployment"
  | "knowledge"
  | "conductor";

export interface PlatformNotification {
  id: string;
  title: string;
  message: string;
  summary: string;
  severity: NotificationSeverity;
  category: NotificationCategory;
  read: boolean;
  acknowledged: boolean;
  dismissed: boolean;
  timestamp: string;
  source: string;
  deepLink: string | null;
  relatedEntityId: string | null;
  relatedEntityType: string | null;
  groupKey: string | null;
}

export type ToastType = "info" | "success" | "warning" | "error";

export interface PlatformToast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
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

  // Toasts
  toasts: PlatformToast[];

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
  acknowledgeNotification: (id: string) => void;
  dismissNotification: (id: string) => void;
  removeNotification: (id: string) => void;
  addToast: (toast: Omit<PlatformToast, "id">) => void;
  removeToast: (id: string) => void;
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
  for (const role of user.roles ?? []) {
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
    toasts: [],

    toggleSidebar: () => {
      set((state) => ({ sidebarOpen: !state.sidebarOpen }));
    },
    setSidebarOpen: (open: boolean) => {
      set({ sidebarOpen: open });
    },
    setActiveRoute: (route: string, breadcrumbs?: Breadcrumb[]) => {
      const nextBreadcrumbs = breadcrumbs ?? [];
      const { activeRoute, breadcrumbs: currentBreadcrumbs } = get();
      const sameBreadcrumbs = breadcrumbsEqual(currentBreadcrumbs, nextBreadcrumbs);
      if (activeRoute === route && sameBreadcrumbs) return;
      set({ activeRoute: route, breadcrumbs: nextBreadcrumbs });
    },
    setBreadcrumbs: (breadcrumbs: Breadcrumb[]) => {
      const { breadcrumbs: currentBreadcrumbs } = get();
      if (breadcrumbsEqual(currentBreadcrumbs, breadcrumbs)) return;
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
    acknowledgeNotification: (id: string) => {
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, acknowledged: true, read: true } : n,
        ),
      }));
    },
    dismissNotification: (id: string) => {
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, dismissed: true } : n,
        ),
      }));
    },
    removeNotification: (id: string) => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }));
    },
    addToast: (toast) => {
      const id = crypto.randomUUID();
      set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
      const duration = toast.duration ?? 5000;
      if (duration > 0) {
        window.setTimeout(() => {
          get().removeToast(id);
        }, duration);
      }
    },
    removeToast: (id: string) => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
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

export interface TourStepData {
  id: string;
  order: number;
  route: string;
  application: string;
  title: string;
  narration: string;
  why_it_matters: string;
  demo_description: string;
  demo_fixture_type: string;
  demo_safe: boolean;
}

export type TourRuntimeState =
  | "idle"
  | "intro"
  | "navigating"
  | "explaining"
  | "demonstrating"
  | "waiting"
  | "paused"
  | "error"
  | "completed"
  | "cancelled";

export interface TourStore {
  showInvitation: boolean;
  isTourActive: boolean;
  tourState: TourRuntimeState;
  currentStep: TourStepData | null;
  currentStepIndex: number;
  totalSteps: number;
  narration: string;
  tourCompleted: boolean;
  sessionId: string | null;
  targetFound: boolean;
  isNavigating: boolean;

  setShowInvitation: (show: boolean) => void;
  setTourSession: (sessionId: string | null) => void;
  setTourData: (data: Partial<TourStore>) => void;
  setTargetFound: (found: boolean) => void;
  setIsNavigating: (navigating: boolean) => void;
  resetTour: () => void;
}

export const useTourStore = create<TourStore>()(
  subscribeWithSelector((set) => ({
    showInvitation: false,
    isTourActive: false,
    tourState: "idle",
    currentStep: null,
    currentStepIndex: 0,
    totalSteps: 0,
    narration: "",
    tourCompleted: false,
    sessionId: null,
    targetFound: false,
    isNavigating: false,

    setShowInvitation: (show: boolean) => {
      set({ showInvitation: show });
    },
    setTourSession: (sessionId: string | null) => {
      set({ sessionId });
    },
    setTourData: (data: Partial<TourStore>) => {
      set((state) => ({ ...state, ...data }));
    },
    setTargetFound: (found: boolean) => {
      set({ targetFound: found });
    },
    setIsNavigating: (navigating: boolean) => {
      set({ isNavigating: navigating });
    },
    resetTour: () => {
      set({
        isTourActive: false,
        tourState: "idle",
        currentStep: null,
        currentStepIndex: 0,
        totalSteps: 0,
        narration: "",
        sessionId: null,
        targetFound: false,
        isNavigating: false,
      });
    },
  })),
);

export interface ConductorToolEvent {
  tool_name: string;
  status: "running" | "executed" | "denied" | "failed";
  summary?: string;
}

export interface ConductorApprovalData {
  id: string;
  tool_name: string;
  arguments: Record<string, unknown>;
  risk?: string;
  created_at?: string;
  status?: string;
}

export interface ConductorStoreMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  loading?: boolean;
  toolEvents?: ConductorToolEvent[];
}

export interface ConductorStore {
  messages: ConductorStoreMessage[];
  loading: boolean;
  mode: "collapsed" | "docked" | "expanded";
  approvals: ConductorApprovalData[];
  approvingId: string | null;
  ttsEnabled: boolean;
  voiceState: "idle" | "listening" | "thinking" | "speaking";

  setMessages: (
    messages:
      ConductorStoreMessage[] | ((prev: ConductorStoreMessage[]) => ConductorStoreMessage[]),
  ) => void;
  addMessage: (message: ConductorStoreMessage) => void;
  updateMessage: (id: string, update: Partial<ConductorStoreMessage>) => void;
  setLoading: (loading: boolean) => void;
  setMode: (mode: "collapsed" | "docked" | "expanded") => void;
  setApprovals: (
    approvals:
      ConductorApprovalData[] | ((prev: ConductorApprovalData[]) => ConductorApprovalData[]),
  ) => void;
  setApprovingId: (id: string | null) => void;
  setTtsEnabled: (enabled: boolean) => void;
  setVoiceState: (state: "idle" | "listening" | "thinking" | "speaking") => void;
  clearMessages: () => void;
}

export const useConductorStore = create<ConductorStore>()(
  subscribeWithSelector((set) => ({
    messages: [],
    loading: false,
    mode: "collapsed",
    approvals: [],
    approvingId: null,
    ttsEnabled: false,
    voiceState: "idle",

    setMessages: (messages) => {
      set((state) => ({
        messages: typeof messages === "function" ? messages(state.messages) : messages,
      }));
    },
    addMessage: (message) => {
      set((state) => ({ messages: [...state.messages, message] }));
    },
    updateMessage: (id, update) => {
      set((state) => ({
        messages: state.messages.map((m) => (m.id === id ? { ...m, ...update } : m)),
      }));
    },
    setLoading: (loading) => {
      set({ loading });
    },
    setMode: (mode) => {
      set({ mode });
    },
    setApprovals: (approvals) => {
      set((state) => ({
        approvals: typeof approvals === "function" ? approvals(state.approvals) : approvals,
      }));
    },
    setApprovingId: (approvingId) => {
      set({ approvingId });
    },
    setTtsEnabled: (ttsEnabled) => {
      set({ ttsEnabled });
    },
    setVoiceState: (voiceState) => {
      set({ voiceState });
    },
    clearMessages: () => {
      set({ messages: [], approvals: [] });
    },
  })),
);
