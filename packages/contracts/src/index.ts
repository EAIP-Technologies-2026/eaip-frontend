/**
 * @eaip/contracts — EAIP API Contract Types
 *
 * These types are the single source of truth for frontend-backend API contracts.
 * They mirror the Pydantic models in `src/eaip/http/schemas.py`.
 *
 * DO NOT manually edit these types. They are generated from the backend schemas.
 * To regenerate, run: `pnpm generate:contracts`
 */

// ---------------------------------------------------------------------------
// Error responses
// ---------------------------------------------------------------------------

/** RFC 7807-inspired error detail */
export interface ErrorDetail {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  code: string;
}

/** Standard error envelope */
export interface ErrorResponse {
  error: ErrorDetail;
}

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

/** Standard pagination query parameters */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

/** Standard pagination envelope for list endpoints */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ---------------------------------------------------------------------------
// Status / action acknowledgements
// ---------------------------------------------------------------------------

/** Generic status acknowledgement */
export interface StatusResponse {
  status: string;
  message: string;
}

/** Response containing a resource identifier */
export interface IdResponse {
  id: string;
  status: string;
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refresh_token: string;
  user: UserSummary;
}

export interface RefreshRequest {
  refresh_token: string;
}

export interface RefreshResponse {
  token: string;
  refresh_token: string;
}

// ---------------------------------------------------------------------------
// User
// ---------------------------------------------------------------------------

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

// ---------------------------------------------------------------------------
// Agent
// ---------------------------------------------------------------------------

export interface AgentSummary {
  id: string;
  name: string;
  description: string;
  status: string;
  model: string;
  labels: string[];
  tags: string[];
  owner: string;
  createdAt: string;
  updatedAt: string;
  metrics: Record<string, unknown>;
}

export interface AgentDetail {
  id: string;
  name: string;
  description: string;
  status: string;
  model: string;
  systemPrompt: string;
  tools: AgentTool[];
  knowledge: unknown[];
  memory: unknown[];
  config: Record<string, unknown>;
  labels: string[];
  tags: string[];
  owner: string;
  createdAt: string;
  updatedAt: string;
  metrics: Record<string, unknown>;
}

export interface AgentTool {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  type: string;
}

export interface AgentExecution {
  id: string;
  agentId: string;
  status: string;
  input: string;
  output: string;
  startedAt: string;
  completedAt: string | null;
  duration: number;
}

export interface AgentHealth {
  status: string;
  uptime: string;
  activeAgents: number;
  totalAgents: number;
  avgLatencyMs: number;
  throughputPerMin: number;
  tokensUsedTotal: number;
  memoryUsagePercent: number;
}

export interface AgentStats {
  totalAgents: number;
  runningAgents: number;
  idleAgents: number;
  errorAgents: number;
  pausedAgents: number;
  totalExecutions: number;
  successRate: number;
  avgLatencyMs: number;
  avgTokensPerRun: number;
  executionsToday: number;
  activeUsers: number;
}

// ---------------------------------------------------------------------------
// Workflow
// ---------------------------------------------------------------------------

export interface WorkflowSummary {
  id: string;
  name: string;
  description: string;
  status: string;
  triggers: string;
  labels: string[];
  tags: string[];
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowDetail {
  id: string;
  name: string;
  description: string;
  status: string;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowNode {
  id: string;
  type: string;
  label: string;
  x: number;
  y: number;
  config: Record<string, unknown>;
}

export interface WorkflowConnection {
  id: string;
  source: string;
  target: string;
  label: string;
  condition: string;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflowName: string;
  status: string;
  startedAt: string;
  completedAt: string | null;
  duration: number;
  triggeredBy: string;
  triggeredByType: string;
  steps: WorkflowStepResult[];
}

export interface WorkflowStepResult {
  name: string;
  status: string;
  duration: number;
  nodeId: string;
}

export interface WorkflowHealth {
  status: string;
  activeWorkflows: number;
  totalWorkflows: number;
  executionsToday: number;
  successRate: number;
  avgDurationMs: number;
  failedToday: number;
}

export interface WorkflowStats {
  totalWorkflows: number;
  activeCount: number;
  pausedCount: number;
  draftCount: number;
  archivedCount: number;
  totalExecutions: number;
  successRate: number;
  avgDurationMs: number;
  executionsToday: number;
  failedToday: number;
}

// ---------------------------------------------------------------------------
// Brain
// ---------------------------------------------------------------------------

export interface BrainSummary {
  id: string;
  name: string;
  description: string;
  template: string;
  status: string;
  owner: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface BrainTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  config: Record<string, unknown>;
}

export interface BrainQueryResult {
  findings: unknown[];
  recommendations: unknown[];
  confidence: number;
  sources: unknown[];
}

export interface BrainRecommendation {
  id: string;
  title: string;
  description: string;
  status: string;
  confidence: number;
}

// ---------------------------------------------------------------------------
// Knowledge
// ---------------------------------------------------------------------------

export interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  source: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeStats {
  totalDocuments: number;
  totalSources: number;
  totalCollections: number;
  lastIndexedAt: string | null;
}

export interface KnowledgeSearchResult {
  id: string;
  title: string;
  content: string;
  score: number;
  source: string;
}

// ---------------------------------------------------------------------------
// Mission
// ---------------------------------------------------------------------------

export interface Mission {
  id: string;
  name: string;
  description: string;
  status: string;
  agentId: string;
  workflowId: string;
  createdAt: string;
  updatedAt: string;
}

export interface MissionStats {
  total: number;
  running: number;
  completed: number;
  failed: number;
}

// ---------------------------------------------------------------------------
// Marketplace
// ---------------------------------------------------------------------------

export interface MarketplacePackage {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  category: string;
  installed: boolean;
  rating: number;
  downloads: number;
}

export interface MarketplaceCategory {
  id: string;
  name: string;
  count: number;
}

// ---------------------------------------------------------------------------
// Notification
// ---------------------------------------------------------------------------

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Memory
// ---------------------------------------------------------------------------

export interface MemoryEntry {
  id: string;
  content: string;
  source: string;
  tags: string[];
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Cost
// ---------------------------------------------------------------------------

export interface CostOverview {
  totalCost: number;
  periodStart: string;
  periodEnd: string;
  breakdown: CostBreakdown[];
}

export interface CostBreakdown {
  category: string;
  amount: number;
  percentage: number;
}

export interface CostModel {
  id: string;
  name: string;
  provider: string;
  costPerToken: number;
  totalTokens: number;
  totalCost: number;
}

export interface CostBudget {
  id: string;
  name: string;
  limit: number;
  current: number;
  period: string;
}

// ---------------------------------------------------------------------------
// Monitoring
// ---------------------------------------------------------------------------

export interface MonitoringHealth {
  status: string;
  components: MonitoringComponent[];
}

export interface MonitoringComponent {
  name: string;
  status: string;
  latency: number;
  uptime: number;
}

export interface MonitoringEvent {
  id: string;
  type: string;
  severity: string;
  message: string;
  source: string;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

export interface SearchResult {
  id: string;
  type: string;
  title: string;
  snippet: string;
  score: number;
  source: string;
}

export interface SearchSuggestion {
  text: string;
  type: string;
}

// ---------------------------------------------------------------------------
// Workforce
// ---------------------------------------------------------------------------

export interface Worker {
  id: string;
  name: string;
  type: string;
  status: string;
  capabilities: string[];
}

// ---------------------------------------------------------------------------
// Workspace
// ---------------------------------------------------------------------------

export interface Workspace {
  id: string;
  name: string;
  description: string;
  members: string[];
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------

export interface HealthCheckResult {
  component: string;
  status: string;
  message: string;
  criticality: string | null;
  configured: boolean;
}

export interface HealthResponse {
  status: string;
  message: string;
  checks: HealthCheckResult[];
  background_tasks: Record<string, unknown>[];
}

// ---------------------------------------------------------------------------
// Version
// ---------------------------------------------------------------------------

export interface VersionResponse {
  version: string;
  name: string;
}

// ---------------------------------------------------------------------------
// API Client interface (mirrors @eaip/api)
// ---------------------------------------------------------------------------

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
  status: number;
  headers: Headers;
}

export class ApiError extends Error {
  status: number;
  code: string;
  data?: unknown;

  constructor(opts: { status: number; code: string; message: string; data?: unknown }) {
    super(opts.message);
    this.name = "ApiError";
    this.status = opts.status;
    this.code = opts.code;
    this.data = opts.data;
  }
}
