"use client";

import { useState, useEffect, useCallback } from "react";
import { RequireAuth } from "@eaip/auth";
import { EnterpriseShell, LoadingState, ErrorState } from "@eaip/ui-enterprise";
import { Button, Badge, Input, EmptyState } from "@eaip/ui-primitives";
import { EnterpriseIcon } from "@eaip/icons";
import { usePlatformStore } from "@eaip/state";
import {
  fetchModels,
  routeModel,
  fetchRoutingDecisions,
  fetchExperiments,
  type ModelRecord,
  type RoutingDecision,
  type ExperimentSummary,
} from "../../services/model-service";

function ModelsContent() {
  const addToast = usePlatformStore((s) => s.addToast);
  const [models, setModels] = useState<ModelRecord[]>([]);
  const [routingDecisions, setRoutingDecisions] = useState<RoutingDecision[]>([]);
  const [experiments, setExperiments] = useState<ExperimentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterProvider, setFilterProvider] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showRouting, setShowRouting] = useState(false);
  const [showExperiments, setShowExperiments] = useState(false);
  const [routeForm, setRouteForm] = useState({
    task_type: "",
    required_capabilities: "",
    data_classification: "internal",
    max_cost_per_1k: "",
  });
  const [routeResult, setRouteResult] = useState<RoutingDecision | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [mdl, rd, exp] = await Promise.all([
        fetchModels({ provider: filterProvider || undefined, status: filterStatus || undefined }),
        fetchRoutingDecisions(),
        fetchExperiments(),
      ]);
      setModels(mdl.data);
      setRoutingDecisions(rd.data);
      setExperiments(exp.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [filterProvider, filterStatus]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = models.filter(
    (m) =>
      !search ||
      m.model_name.toLowerCase().includes(search.toLowerCase()) ||
      m.provider.toLowerCase().includes(search.toLowerCase()) ||
      m.id.toLowerCase().includes(search.toLowerCase()),
  );

  const providers = [...new Set(models.map((m) => m.provider))];

  const handleRoute = async () => {
    const caps = routeForm.required_capabilities
      ? routeForm.required_capabilities
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean)
      : [];
    const result = await routeModel({
      task_type: routeForm.task_type,
      required_capabilities: caps,
      data_classification: routeForm.data_classification,
      max_cost_per_1k: routeForm.max_cost_per_1k
        ? parseFloat(routeForm.max_cost_per_1k)
        : undefined,
    });
    if (result.source === "fallback") {
      addToast({ type: "error", title: "Backend unavailable" });
    } else {
      setRouteResult(result.data);
    }
  };

  if (loading)
    return (
      <EnterpriseShell
        appId="enterprise-console"
        pageTitle="Model Management"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Models" }]}
      >
        <LoadingState message="Loading models..." />
      </EnterpriseShell>
    );
  if (error)
    return (
      <EnterpriseShell
        appId="enterprise-console"
        pageTitle="Model Management"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Models" }]}
      >
        <ErrorState message={error} onRetry={() => void load()} />
      </EnterpriseShell>
    );

  return (
    <EnterpriseShell
      appId="enterprise-console"
      pageTitle="Model Management"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Models" }]}
    >
      <div className="space-y-8">
        <section className="surface-hero relative overflow-hidden p-8 lg:p-10">
          <div
            className="from-primary-subtle/50 absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br to-transparent blur-3xl"
            aria-hidden="true"
          />
          <div className="relative">
            <div className="text-primary mb-4 flex items-center gap-2 text-xs font-semibold tracking-widest uppercase">
              <EnterpriseIcon name="cpu" size={14} /> Multi-Model Fabric
            </div>
            <h1 className="text-text text-3xl font-bold tracking-tight">Model Management</h1>
            <p className="text-text-secondary mt-3 max-w-2xl text-base leading-relaxed">
              Model registry, capability comparison, routing decisions, health monitoring, and
              cost/quality analysis.
            </p>
            <div className="mt-4 flex gap-2">
              <Badge variant="default">{models.length} models</Badge>
              <Badge variant="default">{providers.length} providers</Badge>
              <Badge variant="default">{routingDecisions.length} routing decisions</Badge>
            </div>
          </div>
        </section>

        <section className="rounded-card border-border bg-surface border p-5">
          <h3 className="text-text mb-3 font-semibold">Model Router</h3>
          <p className="text-text-secondary mb-4 text-sm">
            Route a task to the best model based on requirements.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Input
              placeholder="Task type (e.g. summarization)"
              value={routeForm.task_type}
              onChange={(e) => {
                setRouteForm((f) => ({ ...f, task_type: e.target.value }));
              }}
            />
            <Input
              placeholder="Required capabilities (comma-separated)"
              value={routeForm.required_capabilities}
              onChange={(e) => {
                setRouteForm((f) => ({ ...f, required_capabilities: e.target.value }));
              }}
            />
            <select
              value={routeForm.data_classification}
              onChange={(e) => {
                setRouteForm((f) => ({ ...f, data_classification: e.target.value }));
              }}
              className="border-border bg-surface rounded-lg border px-3 py-2 text-sm"
            >
              <option value="public">Public</option>
              <option value="internal">Internal</option>
              <option value="confidential">Confidential</option>
              <option value="restricted">Restricted</option>
            </select>
            <Input
              placeholder="Max cost/1k tokens"
              type="number"
              value={routeForm.max_cost_per_1k}
              onChange={(e) => {
                setRouteForm((f) => ({ ...f, max_cost_per_1k: e.target.value }));
              }}
            />
          </div>
          <div className="mt-3">
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                void handleRoute();
              }}
            >
              Route Task
            </Button>
          </div>
          {routeResult ? (
            <div className="border-primary/30 bg-primary/5 mt-4 rounded-lg border p-4">
              <h4 className="text-text text-sm font-semibold">Routing Result</h4>
              <p className="text-text-secondary mt-1 text-sm">
                Selected:{" "}
                <span className="text-text font-medium">{routeResult.selected_model_id}</span>
              </p>
              <p className="text-text-secondary text-sm">Score: {routeResult.score}</p>
              <p className="text-text-secondary text-sm">Reason: {routeResult.reason}</p>
              {routeResult.alternatives.length > 0 ? (
                <div className="mt-2">
                  <p className="text-text-secondary text-xs font-medium">Alternatives:</p>
                  {routeResult.alternatives.map((alt) => (
                    <Badge key={alt.model_id} variant="default" className="mt-1 mr-1">
                      {alt.model_id} ({alt.score})
                    </Badge>
                  ))}
                </div>
              ) : null}
              {Object.keys(routeResult.factors).length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {Object.entries(routeResult.factors).map(([k, v]) => (
                    <Badge key={k} variant="default">
                      {k}: {v}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </section>

        <section>
          <div className="border-border flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 sm:max-w-sm">
              <Input
                placeholder="Search models..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterProvider}
                onChange={(e) => {
                  setFilterProvider(e.target.value);
                }}
                className="border-border bg-surface rounded-lg border px-3 py-2 text-sm"
              >
                <option value="">All providers</option>
                {providers.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                }}
                className="border-border bg-surface rounded-lg border px-3 py-2 text-sm"
              >
                <option value="">All statuses</option>
                <option value="active">Active</option>
                <option value="degraded">Degraded</option>
                <option value="unavailable">Unavailable</option>
              </select>
              <span className="text-text-secondary self-center text-xs">
                {filtered.length} of {models.length}
              </span>
            </div>
          </div>
          {filtered.length === 0 ? (
            <div className="pt-6">
              <EmptyState
                icon="cpu"
                title="No models"
                description={search ? "No matches." : "No models registered yet."}
              />
            </div>
          ) : (
            <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((m) => (
                <div
                  key={m.id}
                  className="rounded-card border-border bg-surface hover:border-primary/40 transition-smooth border p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-text line-clamp-1 text-sm font-semibold">{m.model_name}</h3>
                    <Badge
                      variant={
                        m.status === "active"
                          ? "success"
                          : m.status === "degraded"
                            ? "warning"
                            : "danger"
                      }
                    >
                      {m.status}
                    </Badge>
                  </div>
                  <p className="text-text-secondary mt-1 text-xs">
                    {m.provider} · v{m.version}
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-text-secondary">Quality:</span>{" "}
                      <span className="text-text font-medium">{m.quality_score}</span>
                    </div>
                    <div>
                      <span className="text-text-secondary">Cost/1k:</span>{" "}
                      <span className="text-text font-medium">${m.cost_per_1k_tokens}</span>
                    </div>
                    <div>
                      <span className="text-text-secondary">Latency:</span>{" "}
                      <span className="text-text font-medium">{m.latency_avg_ms}ms</span>
                    </div>
                    <div>
                      <span className="text-text-secondary">Context:</span>{" "}
                      <span className="text-text font-medium">
                        {(m.context_limit / 1000).toFixed(0)}k
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <Badge variant="default">{m.privacy_level}</Badge>
                    <Badge variant="default">{m.locality}</Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {m.capabilities.slice(0, 4).map((c) => (
                      <Badge key={c} variant="default">
                        {c}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-card border-border bg-surface border p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-text font-semibold">Routing Decisions Log</h3>
            <Button
              variant={showRouting ? "primary" : "secondary"}
              size="sm"
              onClick={() => {
                setShowRouting((v) => !v);
              }}
            >
              {showRouting ? "Hide" : "Show"} Log
            </Button>
          </div>
          {showRouting ? (
            routingDecisions.length === 0 ? (
              <p className="text-text-secondary text-sm">No routing decisions recorded.</p>
            ) : (
              <div className="space-y-2">
                {routingDecisions.slice(0, 20).map((rd, i) => (
                  <div
                    key={i}
                    className="border-border flex items-center justify-between rounded-lg border px-3 py-2"
                  >
                    <div>
                      <span className="text-text text-sm font-medium">{rd.selected_model_id}</span>
                      <span className="text-text-secondary ml-2 text-xs">
                        {rd.reason.slice(0, 80)}
                      </span>
                    </div>
                    <Badge variant="default">score: {rd.score}</Badge>
                  </div>
                ))}
              </div>
            )
          ) : null}
        </section>

        <section className="rounded-card border-border bg-surface border p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-text font-semibold">Model Experiments</h3>
            <Button
              variant={showExperiments ? "primary" : "secondary"}
              size="sm"
              onClick={() => {
                setShowExperiments((v) => !v);
              }}
            >
              {showExperiments ? "Hide" : "Show"} Experiments
            </Button>
          </div>
          {showExperiments ? (
            experiments.length === 0 ? (
              <p className="text-text-secondary text-sm">No experiments configured.</p>
            ) : (
              <div className="space-y-3">
                {experiments.map((exp) => (
                  <div key={exp.experiment_id} className="border-border rounded-lg border p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-text text-sm font-semibold">{exp.experiment_id}</h4>
                      <Badge
                        variant={
                          exp.status === "completed"
                            ? "success"
                            : exp.status === "running"
                              ? "warning"
                              : "default"
                        }
                      >
                        {exp.status}
                      </Badge>
                    </div>
                    {exp.winner ? (
                      <p className="text-text-secondary mt-1 text-xs">
                        Winner: <span className="text-text font-medium">{exp.winner}</span>
                      </p>
                    ) : null}
                    <p className="text-text-secondary text-xs">{exp.recommendation}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {Object.entries(exp.models).map(([mid, stats]) => (
                        <Badge key={mid} variant={mid === exp.winner ? "success" : "default"}>
                          {mid}: q={stats.avg_quality} l={stats.avg_latency_ms}ms
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : null}
        </section>

        <section className="rounded-card border-border bg-surface border p-5">
          <h3 className="text-text mb-3 font-semibold">Cost / Quality Analysis</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-border border-b">
                  <th className="text-text-secondary px-3 py-2 text-left font-medium">Model</th>
                  <th className="text-text-secondary px-3 py-2 text-left font-medium">Provider</th>
                  <th className="text-text-secondary px-3 py-2 text-right font-medium">Quality</th>
                  <th className="text-text-secondary px-3 py-2 text-right font-medium">Cost/1k</th>
                  <th className="text-text-secondary px-3 py-2 text-right font-medium">Latency</th>
                  <th className="text-text-secondary px-3 py-2 text-right font-medium">
                    Availability
                  </th>
                  <th className="text-text-secondary px-3 py-2 text-left font-medium">Privacy</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr key={m.id} className="border-border hover:bg-surface-secondary border-b">
                    <td className="text-text px-3 py-2 font-medium">{m.model_name}</td>
                    <td className="text-text-secondary px-3 py-2">{m.provider}</td>
                    <td className="text-text px-3 py-2 text-right">{m.quality_score}</td>
                    <td className="text-text px-3 py-2 text-right">${m.cost_per_1k_tokens}</td>
                    <td className="text-text px-3 py-2 text-right">{m.latency_avg_ms}ms</td>
                    <td className="text-text px-3 py-2 text-right">
                      {(m.availability * 100).toFixed(1)}%
                    </td>
                    <td className="px-3 py-2">
                      <Badge variant="default">{m.privacy_level}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </EnterpriseShell>
  );
}

export default function ModelsPage() {
  return (
    <RequireAuth>
      <ModelsContent />
    </RequireAuth>
  );
}
