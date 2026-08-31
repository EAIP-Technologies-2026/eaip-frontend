export { DataGrid } from "./data-grid";
export type { DataGridProps, DataGridColumn } from "./data-grid";

export { Card, CardHeader, CardTitle, CardContent, CardFooter } from "./card";
export type {
  CardProps,
  CardHeaderProps,
  CardTitleProps,
  CardContentProps,
  CardFooterProps,
} from "./card";

export { EnterpriseShell } from "./enterprise-shell";
export { EAIPAtmosphere } from "./eaip-atmosphere";
export type { EAIPAtmosphereProps } from "./eaip-atmosphere";
export { LiquidGlassNav } from "./liquid-glass-nav";
export { AppHeader, Header } from "./app-header";

export { AppSidebar, Sidebar } from "./app-sidebar";
export { Breadcrumbs } from "./breadcrumbs";
export type { BreadcrumbItem } from "./breadcrumbs";
export { UserMenu, UserProfileMenu } from "./user-menu";
export type { UserMenuUser, UserMenuItem } from "./user-menu";
export { ThemeSwitcher } from "./theme-switcher";
export { WorkspaceSwitcher } from "./workspace-switcher";
export { GlobalSearchTrigger, GlobalSearchDialog } from "./global-search";
export { NotificationBell } from "./notification-bell";
export { CommandPalette } from "./command-palette";
export { AppSwitcher } from "./app-switcher";
export { EnterpriseIcon } from "./icon";
export { LoadingState, ErrorState } from "./states";
export { EmptyState } from "@eaip/ui-primitives";
export { PageHero } from "./page-hero";
export {
  AnimatedBeam,
  AnimatedList,
  BentoGrid,
  BentoGridItem,
  BorderBeam,
  Dock,
  IntelligenceBackground,
  IntelligenceOrbital,
  MagicCard,
  MathematicalLoader,
  NumberTicker,
  OrbitingCircles,
  ProgressiveBlur,
  ShimmerButton,
} from "./magic-ui";
export { ToastContainer } from "./toast";
export { ConfirmDialog } from "./confirm-dialog";
export { FormField } from "./form-field";

// EP-UI-0018 – Enterprise Data Display
export { PropertyList, DetailSection, TreeView, CodeBlock } from "./data-display";
export type {
  PropertyListProps,
  KeyValuePair,
  DetailSectionProps,
  TreeViewProps,
  TreeNodeItem,
  CodeBlockProps,
} from "./data-display";

// EP-UI-0019 – Executive Dashboard
export { StatCard, StatGroup, KPIBlock } from "./stat-card";
export type { StatCardProps, StatGroupProps, KPIBlockProps } from "./stat-card";

export {
  DashboardLayout,
  DashboardSection,
  DashboardGrid,
  MetricComparison,
  SectionHeader,
} from "./dashboard-layout";
export type {
  DashboardLayoutProps,
  DashboardSectionProps,
  DashboardGridProps,
  MetricComparisonProps,
  SectionHeaderProps,
} from "./dashboard-layout";

export { ChartContainer } from "./chart-container";
export type { ChartContainerProps } from "./chart-container";

// EP-UI-0021 – Enterprise AI
export {
  AIChatPanel,
  SuggestionChips,
  ModelSelector,
  ConductorWidget,
  SystemTwinGraph,
} from "./ai-assistant";
export type {
  AIChatPanelProps,
  ChatMessage,
  SuggestionChipProps,
  ModelSelectorProps,
  ConductorWidgetProps,
  ConductorMessage,
  ConductorToolActivity,
  ConductorApproval,
} from "./ai-assistant";

export { AIContextBar } from "./ai-context-bar";
export type { AIContextBarProps, ContextItem } from "./ai-context-bar";
export { SpeechInputService, SpeechOutputService } from "./speech-services";
export type { VoiceState, PermissionState } from "./speech-services";
export { PersonalAssistantMark } from "./personal-assistant-mark";
export type {
  PersonalAssistantMarkProps,
  PersonalAssistantMarkState,
} from "./personal-assistant-mark";

export { AuroraOrb } from "./aurora-orb";
export type { AuroraOrbProps, AuroraOrbState } from "./aurora-orb";
export { DynamicConductorButton } from "./dynamic-conductor-button";
export type { DynamicConductorButtonProps, ConductorButtonState } from "./dynamic-conductor-button";

// EP-UI-0022 – Workspace
export {
  TabPanel,
  SplitPane,
  Toolbar,
  ToolbarGroup,
  WorkspaceLayout,
  QuickActions,
} from "./workspace";
export type {
  TabPanelProps,
  SplitPaneProps,
  ToolbarProps,
  ToolbarGroupProps,
  WorkspaceLayoutProps,
  QuickActionProps,
} from "./workspace";

// EP-UI-0023 – Notifications & Monitoring
export { NotificationPanel, ActivityFeed, SystemStatus, AuditLogViewer } from "./notifications";
export type {
  NotificationPanelProps,
  NotificationItemData,
  ActivityFeedProps,
  SystemStatusProps,
  AuditLogEntryProps,
} from "./notifications";

// WS-001 – Enterprise Notification Center
export {
  NotificationCenter,
  NotificationDetail,
  NotificationBell as NotificationBellEnhanced,
} from "./notification-center";
export type {
  NotificationCenterProps,
  NotificationDetailProps,
  NotificationBellProps,
  NotificationItem as CenterNotificationItem,
  NotificationCounts as CenterNotificationCounts,
  NotificationFilter,
  NotificationSeverity,
  NotificationCategory,
} from "./notification-center";

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

// EP-UI-0024 – Phase 8 Guided Tour
export { TourInvitation } from "./tour-invitation";
export type { TourInvitationProps } from "./tour-invitation";
export { TourModeBar, TourSpotlight } from "./tour-mode";
export type { TourModeBarProps, TourSpotlightProps } from "./tour-mode";
export { useTour } from "./use-tour";
export type { UseTourOptions, UseTourReturn } from "./use-tour";
export { startTour, sendTourCommand, endTour, getTourPreferences } from "./tour";
export type { TourState, TourCommand, TourStep, TourResponse, TourPreferences } from "./tour";

// EP-UI-0025 — Phase 9 Investigations
export { InvestigationCard } from "./investigation-card";
export type { InvestigationCardProps } from "./investigation-card";
export { InvestigationTimeline } from "./investigation-timeline";
export type { InvestigationTimelineProps } from "./investigation-timeline";
export { EvidenceList } from "./evidence-list";
export type { EvidenceListProps } from "./evidence-list";
export {
  listInvestigations,
  getInvestigation,
  createInvestigation,
  startInvestigation,
  pauseInvestigation,
  resumeInvestigation,
  resolveInvestigation,
  archiveInvestigation,
  getTimeline,
  getEvidence,
  getHypotheses,
  findResumable,
} from "./investigation";
export type {
  InvestigationStatus,
  InvestigationPriority,
  EvidenceType,
  EvidenceSource,
  InvestigationSummary,
  InvestigationEvidence,
  TimelineEvent as InvestigationTimelineEvent,
  InvestigationHypothesis,
} from "./investigation";

// EP-UI-0026 — Phase 10 Orchestration
export { OrchestrationPlanCard } from "./orchestration-plan-card";
export type { OrchestrationPlanCardProps } from "./orchestration-plan-card";
export {
  listPlans,
  getPlan,
  createPlan,
  readyPlan,
  requestApproval,
  approvePlan,
  executePlan,
  executeSteps,
  pausePlan,
  resumePlan,
  cancelPlan,
  rollbackPlan,
  getTimeline as getOrchestrationTimeline,
} from "./orchestration";
export type {
  PlanStatus,
  PlanRisk,
  StepStatus,
  FailureClass,
  PlanStepSummary,
  BudgetSummary,
  OrchestrationPlanSummary,
  TimelineEvent as OrchestrationTimelineEvent,
} from "./orchestration";
