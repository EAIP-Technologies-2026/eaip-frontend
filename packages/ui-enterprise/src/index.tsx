export { DataGrid } from "./data-grid";
export type { DataGridProps, DataGridColumn } from "./data-grid";

export { Card, CardHeader, CardTitle, CardContent, CardFooter } from "./card";
export type { CardProps, CardHeaderProps, CardTitleProps, CardContentProps, CardFooterProps } from "./card";

export { EnterpriseShell } from "./enterprise-shell";
export { Header } from "./header";
export { Sidebar } from "./sidebar";
export { Breadcrumbs } from "./breadcrumbs";
export { UserProfileMenu } from "./user-profile-menu";
export { ThemeSwitcher } from "./theme-switcher";
export { WorkspaceSwitcher } from "./workspace-switcher";
export { GlobalSearchTrigger, GlobalSearchDialog } from "./global-search";
export { NotificationBell } from "./notification-bell";
export { CommandPalette } from "./command-palette";
export { AppSwitcher } from "./app-switcher";
export { EnterpriseIcon } from "./icon";
export { LoadingState, ErrorState } from "./states";
export { ToastContainer } from "./toast";
export { ConfirmDialog } from "./confirm-dialog";
export { FormField } from "./form-field";

// EP-UI-0018 – Enterprise Data Display
export { PropertyList, DetailSection, TreeView, CodeBlock } from "./data-display";
export type { PropertyListProps, KeyValuePair, DetailSectionProps, TreeViewProps, TreeNodeItem, CodeBlockProps } from "./data-display";

// EP-UI-0019 – Executive Dashboard
export { StatCard, StatGroup, KPIBlock } from "./stat-card";
export type { StatCardProps, StatGroupProps, KPIBlockProps } from "./stat-card";

export { DashboardLayout, DashboardSection, DashboardGrid, MetricComparison, SectionHeader } from "./dashboard-layout";
export type { DashboardLayoutProps, DashboardSectionProps, DashboardGridProps, MetricComparisonProps, SectionHeaderProps } from "./dashboard-layout";

export { ChartContainer } from "./chart-container";
export type { ChartContainerProps } from "./chart-container";

// EP-UI-0021 – Enterprise AI
export { AIChatPanel, SuggestionChips, ModelSelector } from "./ai-assistant";
export type { AIChatPanelProps, ChatMessage, SuggestionChipProps, ModelSelectorProps } from "./ai-assistant";

export { AIContextBar } from "./ai-context-bar";
export type { AIContextBarProps, ContextItem } from "./ai-context-bar";

// EP-UI-0022 – Workspace
export { TabPanel, SplitPane, Toolbar, ToolbarGroup, WorkspaceLayout, QuickActions } from "./workspace";
export type { TabPanelProps, SplitPaneProps, ToolbarProps, ToolbarGroupProps, WorkspaceLayoutProps, QuickActionProps } from "./workspace";

// EP-UI-0023 – Notifications & Monitoring
export { NotificationPanel, ActivityFeed, SystemStatus, AuditLogViewer } from "./notifications";
export type { NotificationPanelProps, NotificationItemData, ActivityFeedProps, SystemStatusProps, AuditLogEntryProps } from "./notifications";

export { HealthWidget } from "./health-monitor";
export type { HealthWidgetProps, HealthMetric } from "./health-monitor";
export { useConfirm } from "./use-confirm";
export { useUnsavedChangesGuard } from "./use-unsaved-changes";

export {
  navigationRegistry,
  getNavigationForApp,
  getEnterpriseApp,
  getAllEnterpriseApps,
  enterpriseApps,
} from "./navigation";

export type { NavigationItem, AppNavigation, EnterpriseApp, Breadcrumb, ShellProps } from "./types";
