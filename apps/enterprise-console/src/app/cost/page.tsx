"use client";

import { useEffect, useState, useCallback } from "react";
import { RequireAuth } from "@eaip/auth";
import {
  EnterpriseShell,
  ErrorState,
  StatCard,
  Card,
  CardHeader,
  CardContent,
} from "@eaip/ui-enterprise";
import { Badge, EmptyState } from "@eaip/ui-primitives";
import { EnterpriseIcon } from "@eaip/icons";
import {
  fetchCostOverview,
  fetchCostModels,
  fetchCostProviders,
  fetchCostAgents,
  fetchCostWorkflows,
  fetchCostTrends,
  fetchCostBudgets,
  fetchCostAnomalies,
} from "../../services/cost-service";
import type {
  CostIntelligenceData,
  ModelCostData,
  ProviderCostData,
  AgentCostData,
  WorkflowCostData,
  CostTrend,
  BudgetStatus,
  CostAnomaly,
} from "../../services/cost-service";
import { useFallback } from "../../services/fallback-context";

type CostTab = "overview" | "models" | "providers" | "agents" | "workflows" | "trends" | "budgets" | "anomalies";

function formatCurrency(amount: number, _currency: string = "USD"): string {
  if (amount === 0) return "$0.00";
  if (amount < 0.01) return `<$0.01`;
  return `$${amount.toFixed(2)}`;
}

function formatTokens(tokens: number): string {
  if (tokens === 0) return "0";
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`;
  if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(1)}K`;
  return String(tokens);
}

function BudgetStatusBadge({ status }: { status: string }) {
  const variants: Record<string, "success" | "warning" | "danger" | "default"> = {
    under: "success",
    warning: "warning",
    critical: "danger",
    exceeded: "danger",
  };
  return <Badge variant={variants[status] ?? "default"}>{status}</Badge>;
}

function AnomalySeverityBadge({ severity }: { severity: string }) {
  const variants: Record<string, "success" | "warning" | "danger" | "default"> = {
    low: "default",
    medium: "warning",
    high: "danger",
    critical: "danger",
  };
  return <Badge variant={variants[severity] ?? "default"}>{severity}</Badge>;
}

function CostOverviewSection({ data }: { data: CostIntelligenceData }) {
  const { overview, byModel, byTenant } = data;
  const topModels = Object.entries(byModel).slice(0, 5);
  const topTenants = Object.entries(byTenant).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Cost"
          value={formatCurrency(overview.totalCost)}
          icon={<EnterpriseIcon name="creditCard" size={18} />}
        />
        <StatCard
          label="Total Requests"
          value={overview.totalRequests}
          icon={<EnterpriseIcon name="activity" size={18} />}
        />
        <StatCard
          label="Total Tokens"
          value={formatTokens(overview.totalTokens)}
          icon={<EnterpriseIcon name="database" size={18} />}
        />
        <StatCard
          label="Avg Cost/Request"
          value={formatCurrency(overview.avgCostPerRequest)}
          icon={<EnterpriseIcon name="chart" size={18} />}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-text">Token Breakdown</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{formatTokens(overview.inputTokens)}</p>
                <p className="text-xs text-text-muted">Input Tokens</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-success">{formatTokens(overview.outputTokens)}</p>
                <p className="text-xs text-text-muted">Output Tokens</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-text">Models</h3>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-3xl font-bold text-text">{String(overview.modelCount)}</p>
              <p className="text-sm text-text-muted">Active Models</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {topModels.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-text">Top Models by Cost</h3>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {topModels.map(([modelId, data]) => (
                <div key={modelId} className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-2">
                    <EnterpriseIcon name="cpu" size={14} className="text-text-muted" />
                    <span className="text-sm text-text">{modelId}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-text-muted">{formatTokens(data.tokens)} tokens</span>
                    <span className="text-sm font-medium text-text">{formatCurrency(data.cost)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {topTenants.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-text">Cost by Tenant</h3>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {topTenants.map(([tenantId, cost]) => (
                <div key={tenantId} className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
                  <span className="text-sm text-text">{tenantId}</span>
                  <span className="text-sm font-medium text-text">{formatCurrency(cost)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ModelsSection({ models, loading }: { models: ModelCostData[]; loading: boolean }) {
  if (loading) {
    return <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-16 rounded-card" />)}</div>;
  }
  if (models.length === 0) {
    return <EmptyState icon="cpu" title="No model data" description="No model cost data available yet." />;
  }
  return (
    <div className="divide-y divide-border rounded-card border border-border bg-surface">
      {models.map((model) => (
        <div key={model.modelId} className="flex items-center justify-between px-4 py-3 hover:bg-surface-secondary transition-smooth">
          <div className="flex items-center gap-3 min-w-0">
            <EnterpriseIcon name="cpu" size={16} className="text-text-muted shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-text truncate">{model.modelId}</p>
              <p className="text-xs text-text-muted">{String(model.requests)} requests &middot; {formatTokens(model.totalTokens)} tokens</p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-semibold text-text">{formatCurrency(model.totalCost)}</p>
            <p className="text-xs text-text-muted">{formatCurrency(model.avgCostPerRequest)}/req</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProvidersSection({ providers, loading }: { providers: ProviderCostData[]; loading: boolean }) {
  if (loading) {
    return <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-16 rounded-card" />)}</div>;
  }
  if (providers.length === 0) {
    return <EmptyState icon="globe" title="No provider data" description="No provider cost data available yet." />;
  }
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {providers.map((provider) => (
        <Card key={provider.provider}>
          <CardContent>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-subtle text-primary">
                <EnterpriseIcon name="globe" size={16} />
              </div>
              <div>
                <p className="text-sm font-semibold text-text">{provider.provider}</p>
                <p className="text-xs text-text-muted">{String(provider.modelCount)} models</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-lg font-bold text-text">{formatCurrency(provider.totalCost)}</p>
                <p className="text-[10px] text-text-muted">Total Cost</p>
              </div>
              <div>
                <p className="text-lg font-bold text-text">{String(provider.requests)}</p>
                <p className="text-[10px] text-text-muted">Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function AgentsSection({ agents, loading }: { agents: AgentCostData[]; loading: boolean }) {
  if (loading) {
    return <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-16 rounded-card" />)}</div>;
  }
  if (agents.length === 0) {
    return <EmptyState icon="robot" title="No agent data" description="No agent cost attribution available yet." />;
  }
  return (
    <div className="divide-y divide-border rounded-card border border-border bg-surface">
      {agents.map((agent) => (
        <div key={agent.agentId} className="flex items-center justify-between px-4 py-3 hover:bg-surface-secondary transition-smooth">
          <div className="flex items-center gap-3">
            <EnterpriseIcon name="robot" size={16} className="text-text-muted" />
            <div>
              <p className="text-sm font-medium text-text">{agent.agentId}</p>
              <p className="text-xs text-text-muted">{String(agent.requests)} requests &middot; {formatTokens(agent.inputTokens + agent.outputTokens)} tokens</p>
            </div>
          </div>
          <span className="text-sm font-semibold text-text">{formatCurrency(agent.totalCost)}</span>
        </div>
      ))}
    </div>
  );
}

function WorkflowsSection({ workflows, loading }: { workflows: WorkflowCostData[]; loading: boolean }) {
  if (loading) {
    return <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-16 rounded-card" />)}</div>;
  }
  if (workflows.length === 0) {
    return <EmptyState icon="workflow" title="No workflow data" description="No workflow cost attribution available yet." />;
  }
  return (
    <div className="divide-y divide-border rounded-card border border-border bg-surface">
      {workflows.map((wf) => (
        <div key={wf.workflowId} className="flex items-center justify-between px-4 py-3 hover:bg-surface-secondary transition-smooth">
          <div className="flex items-center gap-3">
            <EnterpriseIcon name="workflow" size={16} className="text-text-muted" />
            <div>
              <p className="text-sm font-medium text-text">{wf.workflowId}</p>
              <p className="text-xs text-text-muted">{String(wf.requests)} requests &middot; {formatTokens(wf.inputTokens + wf.outputTokens)} tokens</p>
            </div>
          </div>
          <span className="text-sm font-semibold text-text">{formatCurrency(wf.totalCost)}</span>
        </div>
      ))}
    </div>
  );
}

function TrendsSection({ trends, loading }: { trends: CostTrend[]; loading: boolean }) {
  if (loading) {
    return <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-20 rounded-card" />)}</div>;
  }
  if (trends.length === 0) {
    return <EmptyState icon="chart" title="No trend data" description="Historical cost data will appear here once usage is recorded." />;
  }
  const maxCost = Math.max(...trends.map((t) => t.cost), 0.01);
  return (
    <Card>
      <CardHeader>
        <h3 className="text-sm font-semibold text-text">Daily Cost Trend</h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {trends.map((trend) => (
            <div key={trend.date} className="flex items-center gap-3">
              <span className="text-xs text-text-muted w-20 shrink-0">{trend.date}</span>
              <div className="flex-1 h-4 bg-surface-tertiary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${String(Math.min((trend.cost / maxCost) * 100, 100))}%` }}
                />
              </div>
              <span className="text-xs text-text w-16 text-right shrink-0">{formatCurrency(trend.cost)}</span>
              <span className="text-xs text-text-muted w-16 text-right shrink-0">{String(trend.requests)} req</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function BudgetsSection({ budgets, loading }: { budgets: BudgetStatus[]; loading: boolean }) {
  if (loading) {
    return <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-20 rounded-card" />)}</div>;
  }
  if (budgets.length === 0) {
    return <EmptyState icon="shield" title="No budgets" description="No budgets configured yet." />;
  }
  return (
    <div className="space-y-4">
      {budgets.map((budget) => (
        <Card key={budget.id}>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-semibold text-text">{budget.name}</p>
                <p className="text-xs text-text-muted">{budget.period}</p>
              </div>
              <BudgetStatusBadge status={budget.status} />
            </div>
            <div className="h-2 bg-surface-tertiary rounded-full overflow-hidden mb-2">
              <div
                className={`h-full rounded-full transition-all ${
                  budget.status === "exceeded" ? "bg-danger" :
                  budget.status === "critical" ? "bg-danger" :
                  budget.status === "warning" ? "bg-warning" : "bg-success"
                }`}
                style={{ width: `${String(Math.min(budget.percentage, 100))}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span>{formatCurrency(budget.currentSpend)} of {formatCurrency(budget.amount)}</span>
              <span>{budget.percentage.toFixed(1)}%</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function AnomaliesSection({ anomalies, loading }: { anomalies: CostAnomaly[]; loading: boolean }) {
  if (loading) {
    return <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-16 rounded-card" />)}</div>;
  }
  if (anomalies.length === 0) {
    return <EmptyState icon="checkCircle" title="No anomalies" description="No cost anomalies detected." />;
  }
  return (
    <div className="divide-y divide-border rounded-card border border-border bg-surface">
      {anomalies.map((anomaly, i) => (
        <div key={`${anomaly.modelId}-${String(i)}`} className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <AnomalySeverityBadge severity={anomaly.severity} />
            <div>
              <p className="text-sm font-medium text-text">{anomaly.modelId}</p>
              <p className="text-xs text-text-muted">
                Expected {formatCurrency(anomaly.expectedCost)}, actual {formatCurrency(anomaly.actualCost)}
              </p>
            </div>
          </div>
          <span className="text-sm font-semibold text-danger">
            {anomaly.deviationPercent > 0 ? "+" : ""}{anomaly.deviationPercent.toFixed(1)}%
          </span>
        </div>
      ))}
    </div>
  );
}

function CostContent() {
  const { setFallback } = useFallback();
  const [activeTab, setActiveTab] = useState<CostTab>("overview");
  const [costData, setCostData] = useState<CostIntelligenceData | null>(null);
  const [models, setModels] = useState<ModelCostData[]>([]);
  const [providers, setProviders] = useState<ProviderCostData[]>([]);
  const [agents, setAgents] = useState<AgentCostData[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowCostData[]>([]);
  const [trends, setTrends] = useState<CostTrend[]>([]);
  const [budgets, setBudgets] = useState<BudgetStatus[]>([]);
  const [anomalies, setAnomalies] = useState<CostAnomaly[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewResult, modelsResult, providersResult, agentsResult, wfResult, trendsResult, budgetsResult, anomaliesResult] =
        await Promise.all([
          fetchCostOverview(),
          fetchCostModels(),
          fetchCostProviders(),
          fetchCostAgents(),
          fetchCostWorkflows(),
          fetchCostTrends(),
          fetchCostBudgets(),
          fetchCostAnomalies(),
        ]);
      setFallback("cost", overviewResult.source === "fallback");
      setCostData(overviewResult.data);
      setModels(modelsResult.data);
      setProviders(providersResult.data);
      setAgents(agentsResult.data);
      setWorkflows(wfResult.data);
      setTrends(trendsResult.data);
      setBudgets(budgetsResult.data);
      setAnomalies(anomaliesResult.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [setFallback]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const tabs: { id: CostTab; label: string; icon: string }[] = [
    { id: "overview", label: "Overview", icon: "home" },
    { id: "models", label: "Models", icon: "cpu" },
    { id: "providers", label: "Providers", icon: "globe" },
    { id: "agents", label: "Agents", icon: "robot" },
    { id: "workflows", label: "Workflows", icon: "workflow" },
    { id: "trends", label: "Trends", icon: "chart" },
    { id: "budgets", label: "Budgets", icon: "shield" },
    { id: "anomalies", label: "Anomalies", icon: "alert" },
  ];

  return (
    <EnterpriseShell
      appId="enterprise-console"
      pageTitle="Cost Intelligence"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Cost Intelligence" }]}
    >
      <div className="space-y-6">
        <section className="surface-hero relative overflow-hidden p-8 lg:p-10">
          <div className="relative">
            <div className="mb-4 flex items-center gap-2 text-xs font-semibold tracking-widest text-primary uppercase">
              <EnterpriseIcon name="creditCard" size={14} />
              Cost Intelligence
            </div>
            <h1 className="text-3xl font-bold text-text tracking-tight">Cost Intelligence</h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-text-secondary">
              Monitor AI model costs, token usage, provider spending, and budget utilization
              across your EAIP platform.
            </p>
          </div>
        </section>

        <div className="flex items-center gap-1 rounded-lg border border-border bg-surface p-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => { setActiveTab(tab.id); }}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-primary text-text-inverse"
                  : "text-text-secondary hover:bg-surface-tertiary"
              }`}
            >
              <EnterpriseIcon name={tab.icon as never} size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <ErrorState title="Could not load cost data" message={error} onRetry={() => { void loadData(); }} />
        )}

        {loading && !costData ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-24 rounded-card" />)}
          </div>
        ) : costData ? (
          <>
            {activeTab === "overview" && <CostOverviewSection data={costData} />}
            {activeTab === "models" && <ModelsSection models={models} loading={loading} />}
            {activeTab === "providers" && <ProvidersSection providers={providers} loading={loading} />}
            {activeTab === "agents" && <AgentsSection agents={agents} loading={loading} />}
            {activeTab === "workflows" && <WorkflowsSection workflows={workflows} loading={loading} />}
            {activeTab === "trends" && <TrendsSection trends={trends} loading={loading} />}
            {activeTab === "budgets" && <BudgetsSection budgets={budgets} loading={loading} />}
            {activeTab === "anomalies" && <AnomaliesSection anomalies={anomalies} loading={loading} />}
          </>
        ) : null}
      </div>
    </EnterpriseShell>
  );
}

export default function CostPage() {
  return (
    <RequireAuth>
      <CostContent />
    </RequireAuth>
  );
}
