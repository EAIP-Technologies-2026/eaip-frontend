"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { RequireAuth } from "@eaip/auth";
import { EnterpriseShell, LoadingState, ErrorState, DataGrid } from "@eaip/ui-enterprise";
import { Card, CardHeader, CardContent } from "@eaip/ui-foundation";
import { Badge, SectionTitle, Input, EmptyState } from "@eaip/ui-primitives";
import { StatusRing, MetricCard } from "@eaip/ui-visualizations";
import { EnterpriseIcon } from "@eaip/icons";
import { fetchAgentFleet } from "../../services/agents-service";
import type { AgentFleetItem } from "../../services/agents-service";
import { OperationsToolbar } from "../../components/operations-toolbar";

function healthColor(health: AgentFleetItem["health"]): "success" | "warning" | "error" {
  if (health === "healthy") return "success";
  if (health === "degraded") return "warning";
  return "error";
}

function AgentFleetContent() {
  const [agents, setAgents] = useState<AgentFleetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [groupBy, setGroupBy] = useState<"none" | "status" | "owner">("none");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAgentFleet();
      setAgents(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load agents");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(() => {
    let list = agents;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((a) => a.name.toLowerCase().includes(q) || a.owner.toLowerCase().includes(q) || a.capabilities.some((c) => c.includes(q)));
    }
    if (statusFilter !== "all") list = list.filter((a) => a.status === statusFilter);
    return list;
  }, [agents, search, statusFilter]);

  const grouped = useMemo(() => {
    if (groupBy === "none") return null;
    const groups: Record<string, AgentFleetItem[]> = {};
    for (const agent of filtered) {
      const key = groupBy === "status" ? agent.status : agent.owner;
      groups[key] ??= [];
      groups[key].push(agent);
    }
    return groups;
  }, [filtered, groupBy]);

  const stats = useMemo(() => ({
    total: agents.length,
    active: agents.filter((a) => a.status === "active").length,
    healthy: agents.filter((a) => a.health === "healthy").length,
    degraded: agents.filter((a) => a.health === "degraded" || a.health === "down").length,
  }), [agents]);

  return (
    <EnterpriseShell
      appId="mission-control"
      pageTitle="Agent Fleet"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Agent Fleet" }]}
    >
      <div className="space-y-8">
        <section className="surface-hero relative overflow-hidden p-8 lg:p-10">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br from-primary-subtle/50 to-transparent blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-gradient-to-tr from-accent-glow/30 to-transparent blur-2xl" aria-hidden="true" />
          <div className="relative">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-primary uppercase mb-4">
              <EnterpriseIcon name="activity" size={14} />
              Agent Fleet
            </div>
            <h1 className="text-3xl font-bold text-text tracking-tight">Agent Fleet</h1>
            <p className="mt-3 text-base text-text-secondary max-w-2xl leading-relaxed">Monitor, search, and manage the autonomous agent fleet.</p>
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Total Agents" value={stats.total} icon="robot" />
          <MetricCard label="Active" value={stats.active} icon="check" />
          <MetricCard label="Healthy" value={stats.healthy} icon="heart" />
          <MetricCard label="Degraded" value={stats.degraded} icon="alert" />
        </div>

        <OperationsToolbar onRefresh={() => { void load(); }} />

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <EnterpriseIcon name="search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <Input
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setSearch(e.target.value); }}
              placeholder="Search agents..."
              className="w-full pl-9"
            />
          </div>
          <div className="flex gap-1 rounded-lg border border-border p-0.5">
            {["all", "active", "inactive", "error"].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => { setStatusFilter(s); }}
                className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                  statusFilter === s ? "bg-primary text-text-inverse" : "text-text-secondary hover:bg-surface-tertiary"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <select
            value={groupBy}
            onChange={(e) => { setGroupBy(e.target.value as "none" | "status" | "owner"); }}
            className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-text"
          >
            <option value="none">No Grouping</option>
            <option value="status">Group by Status</option>
            <option value="owner">Group by Owner</option>
          </select>
        </div>

        {loading ? (
          <LoadingState message="Loading agent fleet..." />
        ) : error ? (
          <ErrorState message={error} onRetry={() => { void load(); }} />
        ) : filtered.length === 0 ? (
          <Card variant="elevated" padding="none"><CardContent className="px-5 py-4"><EmptyState icon="robot" title="No agents found" description={search ? "Try a different search term." : "No agents are registered."} /></CardContent></Card>
        ) : grouped ? (
          Object.entries(grouped).map(([key, items]) => (
            <Card key={key} variant="elevated" padding="none">
              <CardHeader className="px-5 py-4">
                <SectionTitle className="capitalize">{key} ({items.length})</SectionTitle>
              </CardHeader>
              <CardContent className="px-5 py-4">
                <AgentGrid agents={items} selectedIds={selectedIds} onSelectionChange={setSelectedIds} />
              </CardContent>
            </Card>
          ))
        ) : (
          <DataGrid
            data={filtered}
            keyExtractor={(a) => a.id}
            selectable
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            pageSize={20}
            columns={[
              { key: "name", header: "Name", sortable: true, filterable: true, render: (a) => <Link href={`/agents/${a.id}`} className="text-primary hover:underline">{a.name}</Link> },
              { key: "status", header: "Status", sortable: true, filterable: true, render: (a) => <Badge variant={a.status === "active" ? "success" : a.status === "inactive" ? "warning" : "danger"}>{a.status}</Badge> },
              { key: "health", header: "Health", render: (a) => <StatusRing status={healthColor(a.health)} size="sm" /> },
              { key: "cpu", header: "CPU", sortable: true, render: (a) => `${String(a.cpu)}%` },
              { key: "memory", header: "Memory", sortable: true, render: (a) => `${String(a.memory)}%` },
              { key: "owner", header: "Owner", sortable: true, filterable: true },
              { key: "capabilities", header: "Capabilities", render: (a) => a.capabilities.slice(0, 2).join(", ") },
              { key: "version", header: "Version" },
              { key: "currentTask", header: "Current Task", render: (a) => a.currentTask ?? "—" },
            ]}
          />
        )}
      </div>
    </EnterpriseShell>
  );
}

function AgentGrid({ agents, selectedIds, onSelectionChange }: { agents: AgentFleetItem[]; selectedIds: string[]; onSelectionChange: (ids: string[]) => void }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {agents.map((agent) => (
        <div key={agent.id} className={`rounded-lg border p-4 transition-colors hover:bg-surface-tertiary ${selectedIds.includes(agent.id) ? "ring-2 ring-primary" : ""}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <StatusRing status={healthColor(agent.health)} size="sm" />
              <div>
                <Link href={`/agents/${agent.id}`} className="text-sm font-medium text-text hover:text-primary">{agent.name}</Link>
                <p className="text-xs text-text-secondary">{agent.owner}</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={selectedIds.includes(agent.id)}
              onChange={() => {
                onSelectionChange(
                  selectedIds.includes(agent.id)
                    ? selectedIds.filter((id) => id !== agent.id)
                    : [...selectedIds, agent.id],
                );
              }}
              className="h-4 w-4 rounded border-border"
            />
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-text-secondary">
            <Badge variant={agent.status === "active" ? "success" : "danger"}>{agent.status}</Badge>
            <span>v{agent.version}</span>
          </div>
          {agent.currentTask ? (
            <p className="mt-2 truncate text-xs text-text-secondary">{agent.currentTask}</p>
          ) : null}
          <div className="mt-2 flex gap-2">
            <div className="flex-1 rounded bg-surface-secondary px-2 py-1 text-xs">
              <span className="text-text-secondary">CPU </span>
              <span className={agent.cpu > 75 ? "text-danger" : "text-text"}>{agent.cpu}%</span>
            </div>
            <div className="flex-1 rounded bg-surface-secondary px-2 py-1 text-xs">
              <span className="text-text-secondary">MEM </span>
              <span className={agent.memory > 75 ? "text-danger" : "text-text"}>{agent.memory}%</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AgentFleetPage() {
  return <RequireAuth><AgentFleetContent /></RequireAuth>;
}
