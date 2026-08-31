"use client";

import { useState, useEffect, useCallback } from "react";
import { RequireAuth } from "@eaip/auth";
import { EnterpriseShell, ErrorState } from "@eaip/ui-enterprise";
import { Button, Badge, Input, EmptyState } from "@eaip/ui-primitives";
import { EnterpriseIcon } from "@eaip/icons";
import { usePlatformStore } from "@eaip/state";
import {
  fetchSchedules,
  fetchStats,
  fetchUpcoming,
  createSchedule,
  pauseSchedule,
  resumeSchedule,
  cancelSchedule,
  executeSchedule,
  type Schedule,
  type ScheduleStats,
  type ScheduleTrigger,
} from "../../services/scheduling-service";
import { useFallback } from "../../services/fallback-context";

const STATUS_VARIANT: Record<string, "default" | "success" | "warning" | "danger"> = {
  active: "success",
  paused: "warning",
  failed: "danger",
  cancelled: "default",
  completed: "default",
  overdue: "danger",
};

function SchedulingContent() {
  const addToast = usePlatformStore((s) => s.addToast);
  const { setFallback } = useFallback();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [stats, setStats] = useState<ScheduleStats>({
    total: 0,
    active: 0,
    paused: 0,
    failed: 0,
    overdue: 0,
  });
  const [upcoming, setUpcoming] = useState<Schedule[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: "",
    target_type: "workflow",
    target_id: "",
    kind: "interval",
    interval_seconds: 3600,
    priority: 1,
  });
  const [actioning, setActioning] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [schedRes, statsRes, upcomingRes] = await Promise.all([
        fetchSchedules(statusFilter !== "all" ? { status: statusFilter } : undefined),
        fetchStats(),
        fetchUpcoming("24h"),
      ]);
      setFallback("scheduling", schedRes.source === "fallback");
      setSchedules(schedRes.data.schedules);
      setStats(statsRes.data);
      setUpcoming(upcomingRes.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [statusFilter, setFallback]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = schedules.filter(
    (s) =>
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.target_id.toLowerCase().includes(search.toLowerCase()),
  );

  async function handleCreate() {
    if (!form.name.trim() || !form.target_id.trim()) {
      addToast({ type: "error", title: "Name and target ID required" });
      return;
    }
    try {
      const trigger: ScheduleTrigger = { kind: form.kind === "interval" ? "interval" : form.kind };
      if (form.kind === "interval") trigger.interval_seconds = form.interval_seconds;
      if (form.kind === "cron") trigger.cron_expr = "0 * * * *";
      const res = await createSchedule({
        name: form.name,
        target_type: form.target_type,
        target_id: form.target_id,
        trigger,
        priority: String(form.priority),
      });
      if (res.source === "fallback") {
        addToast({ type: "error", title: "Backend unavailable" });
        return;
      }
      addToast({ type: "success", title: "Schedule created" });
      setShowCreate(false);
      setForm({
        name: "",
        target_type: "workflow",
        target_id: "",
        kind: "interval",
        interval_seconds: 3600,
        priority: 1,
      });
      void load();
    } catch (err) {
      addToast({
        type: "error",
        title: "Failed to create schedule",
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  async function doAction(id: string, fn: (id: string) => Promise<unknown>, label: string) {
    setActioning(id);
    try {
      const res = (await fn(id)) as { source?: string };
      if (res.source === "fallback") {
        addToast({ type: "error", title: "Backend unavailable" });
        return;
      }
      addToast({ type: "success", title: label });
      void load();
    } catch (err) {
      addToast({
        type: "error",
        title: label + " failed",
        message: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setActioning(null);
    }
  }

  const chips = ["all", "active", "paused", "failed", "overdue", "completed"];

  return (
    <EnterpriseShell
      appId="enterprise-console"
      pageTitle="Scheduling"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Scheduling" }]}
    >
      <div className="space-y-8">
        <section className="surface-hero relative overflow-hidden p-8 lg:p-10">
          <div
            className="from-primary-subtle/50 absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br to-transparent blur-3xl"
            aria-hidden="true"
          />
          <div className="relative">
            <div className="text-primary mb-4 flex items-center gap-2 text-xs font-semibold tracking-widest uppercase">
              <EnterpriseIcon name="activity" size={14} /> Enterprise Scheduling
            </div>
            <h1 className="text-text text-3xl font-bold tracking-tight">Advanced Scheduling</h1>
            <p className="text-text-secondary mt-3 max-w-2xl text-base leading-relaxed">
              Enterprise operations scheduler — recurring, interval, cron, and dependency-aware
              execution for missions, workflows, and agent actions.
            </p>
          </div>
        </section>

        <div className="border-border bg-surface flex flex-wrap items-center gap-4 rounded-lg border px-5 py-3">
          <span className="text-text-secondary flex items-center gap-2 text-sm">
            <EnterpriseIcon name="activity" size={16} />
            <strong className="text-text">{stats.total}</strong> total
          </span>
          <span className="bg-border h-4 w-px" />
          <span className="text-text-secondary text-sm">
            <strong className="text-text">{stats.active}</strong> active
          </span>
          <span className="bg-border h-4 w-px" />
          <span className="text-text-secondary text-sm">
            <strong className="text-text">{stats.paused}</strong> paused
          </span>
          <span className="bg-border h-4 w-px" />
          <span className="text-text-secondary text-sm">
            <strong className="text-text">{stats.failed}</strong> failed
          </span>
          <span className="bg-border h-4 w-px" />
          <span className="text-text-secondary text-sm">
            <strong className="text-text">{stats.overdue}</strong> overdue
          </span>
          <div className="ml-auto">
            <Button
              variant="primary"
              size="sm"
              iconLeft="plus"
              onClick={() => {
                setShowCreate((v) => !v);
              }}
            >
              {showCreate ? "Close" : "Create schedule"}
            </Button>
          </div>
        </div>

        {showCreate ? (
          <div className="rounded-card border-border bg-surface space-y-4 border p-5">
            <h3 className="text-text font-semibold">Create schedule</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                placeholder="Schedule name"
                value={form.name}
                onChange={(e) => {
                  setForm((f) => ({ ...f, name: e.target.value }));
                }}
              />
              <div className="flex gap-2">
                <select
                  value={form.target_type}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, target_type: e.target.value }));
                  }}
                  className="border-border bg-surface rounded-lg border px-3 py-2 text-sm"
                >
                  <option value="workflow">Workflow</option>
                  <option value="mission">Mission</option>
                  <option value="agent_action">Agent</option>
                </select>
                <Input
                  placeholder="Target ID"
                  value={form.target_id}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, target_id: e.target.value }));
                  }}
                  className="flex-1"
                />
              </div>
              <select
                value={form.kind}
                onChange={(e) => {
                  setForm((f) => ({ ...f, kind: e.target.value }));
                }}
                className="border-border bg-surface rounded-lg border px-3 py-2 text-sm"
              >
                <option value="interval">Interval</option>
                <option value="cron">Cron</option>
                <option value="once">One-time</option>
              </select>
              <Input
                type="number"
                placeholder="Interval seconds"
                value={String(form.interval_seconds)}
                onChange={(e) => {
                  setForm((f) => ({
                    ...f,
                    interval_seconds: parseInt(e.target.value, 10) || 3600,
                  }));
                }}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setShowCreate(false);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  void handleCreate();
                }}
              >
                Create
              </Button>
            </div>
          </div>
        ) : null}

        {upcoming.length > 0 ? (
          <section className="rounded-card border-border bg-surface border p-5">
            <h3 className="text-text mb-3 flex items-center gap-2 font-semibold">
              <EnterpriseIcon name="activity" size={14} /> Upcoming queue (24h)
            </h3>
            <div className="flex flex-wrap gap-2">
              {upcoming.slice(0, 8).map((s) => (
                <Badge key={s.id} variant="default">
                  {s.name} — {s.next_run_at ? new Date(s.next_run_at).toLocaleString() : "—"}
                </Badge>
              ))}
            </div>
          </section>
        ) : null}

        <section>
          <div className="border-border flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 sm:max-w-sm">
              <Input
                placeholder="Search schedules..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
              />
            </div>
            <div className="border-border flex flex-wrap gap-1 rounded-lg border p-0.5">
              {chips.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setStatusFilter(c);
                  }}
                  className={`rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors ${statusFilter === c ? "bg-primary text-text-inverse" : "text-text-secondary hover:bg-surface-tertiary"}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="mt-4 space-y-3">
              <div className="skeleton h-8 w-72 rounded" />
              <div className="grid gap-4 lg:grid-cols-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="skeleton rounded-card h-32" />
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="mt-4">
              <ErrorState message={error} onRetry={() => void load()} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="pt-6">
              <EmptyState
                icon="activity"
                title="No schedules found"
                description={
                  search || statusFilter !== "all"
                    ? "Try adjusting filters."
                    : "Create a schedule to get started."
                }
              />
            </div>
          ) : (
            <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((s) => (
                <div
                  key={s.id}
                  className="rounded-card border-border bg-surface hover:border-primary/40 transition-smooth border p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-text line-clamp-1 text-sm font-semibold">{s.name}</h3>
                    <Badge variant={STATUS_VARIANT[s.status] ?? "default"}>{s.status}</Badge>
                  </div>
                  <p className="text-text-secondary mt-1 line-clamp-1 text-xs">
                    {s.target_type} · {s.target_id || "—"} · priority {s.priority}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Badge variant="default">{s.trigger.kind}</Badge>
                    {s.next_run_at ? (
                      <Badge variant="default">
                        next {new Date(s.next_run_at).toLocaleString()}
                      </Badge>
                    ) : null}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {s.status === "active" ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        loading={actioning === s.id}
                        onClick={() => void doAction(s.id, pauseSchedule, "Paused")}
                      >
                        Pause
                      </Button>
                    ) : null}
                    {s.status === "paused" ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        loading={actioning === s.id}
                        onClick={() => void doAction(s.id, resumeSchedule, "Resumed")}
                      >
                        Resume
                      </Button>
                    ) : null}
                    <Button
                      variant="secondary"
                      size="sm"
                      loading={actioning === s.id}
                      onClick={() => void doAction(s.id, cancelSchedule, "Cancelled")}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      loading={actioning === s.id}
                      onClick={() => void doAction(s.id, executeSchedule, "Executed")}
                    >
                      Run
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </EnterpriseShell>
  );
}

export default function SchedulingPage() {
  return (
    <RequireAuth>
      <SchedulingContent />
    </RequireAuth>
  );
}
