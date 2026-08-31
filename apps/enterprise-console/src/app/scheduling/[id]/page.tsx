"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { RequireAuth } from "@eaip/auth";
import { EnterpriseShell, LoadingState, ErrorState } from "@eaip/ui-enterprise";
import { Button, Badge, EmptyState } from "@eaip/ui-primitives";
import { EnterpriseIcon } from "@eaip/icons";
import { usePlatformStore } from "@eaip/state";
import {
  fetchSchedule,
  fetchExecutions,
  fetchHealth,
  pauseSchedule,
  resumeSchedule,
  cancelSchedule,
  executeSchedule,
  type Schedule,
  type ScheduleExecution,
  type ScheduleHealth,
} from "../../../services/scheduling-service";

function ScheduleDetailContent() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const addToast = usePlatformStore((s) => s.addToast);
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [executions, setExecutions] = useState<ScheduleExecution[]>([]);
  const [health, setHealth] = useState<ScheduleHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [s, e, h] = await Promise.all([
        fetchSchedule(id),
        fetchExecutions(id),
        fetchHealth(id),
      ]);
      setSchedule(s.data);
      setExecutions(e.data);
      setHealth(h.data);
      if (!s.data) setError("Schedule not found");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading)
    return (
      <EnterpriseShell
        appId="enterprise-console"
        pageTitle="Schedule"
        breadcrumbs={[{ label: "Scheduling", href: "/scheduling" }, { label: id }]}
      >
        <LoadingState message="Loading schedule..." />
      </EnterpriseShell>
    );
  if (error || !schedule)
    return (
      <EnterpriseShell
        appId="enterprise-console"
        pageTitle="Schedule"
        breadcrumbs={[{ label: "Scheduling", href: "/scheduling" }, { label: id }]}
      >
        <ErrorState message={error ?? "Not found"} onRetry={() => void load()} />
      </EnterpriseShell>
    );

  return (
    <EnterpriseShell
      appId="enterprise-console"
      pageTitle={schedule.name}
      breadcrumbs={[{ label: "Scheduling", href: "/scheduling" }, { label: schedule.name }]}
    >
      <div className="space-y-6">
        <section className="surface-hero relative overflow-hidden p-6 lg:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-text text-2xl font-bold tracking-tight">{schedule.name}</h1>
              <p className="text-text-secondary mt-2 text-sm">
                {schedule.description ?? `${schedule.target_type} · ${schedule.target_id}`}
              </p>
            </div>
            <Badge
              variant={
                schedule.status === "active"
                  ? "success"
                  : schedule.status === "paused"
                    ? "warning"
                    : schedule.status === "failed"
                      ? "danger"
                      : "default"
              }
            >
              {schedule.status}
            </Badge>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="default">{schedule.trigger.kind}</Badge>
            <Badge variant="default">priority {schedule.priority}</Badge>
            {schedule.next_run_at ? (
              <Badge variant="default">
                next {new Date(schedule.next_run_at).toLocaleString()}
              </Badge>
            ) : null}
            {schedule.last_run_at ? (
              <Badge variant="default">
                last {new Date(schedule.last_run_at).toLocaleString()}
              </Badge>
            ) : null}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                void pauseSchedule(schedule.id).then(() => {
                  addToast({ type: "success", title: "Paused" });
                  void load();
                })
              }
            >
              Pause
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                void resumeSchedule(schedule.id).then(() => {
                  addToast({ type: "success", title: "Resumed" });
                  void load();
                })
              }
            >
              Resume
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                void cancelSchedule(schedule.id).then(() => {
                  addToast({ type: "success", title: "Cancelled" });
                  void load();
                })
              }
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() =>
                void executeSchedule(schedule.id).then(() => {
                  addToast({ type: "success", title: "Executed" });
                  void load();
                })
              }
            >
              Run now
            </Button>
            <Link href="/scheduling" className="text-primary ml-auto text-sm hover:underline">
              Back to scheduling
            </Link>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-card border-border bg-surface border p-5">
            <h3 className="text-text mb-3 flex items-center gap-2 font-semibold">
              <EnterpriseIcon name="activity" size={14} /> Health
            </h3>
            {health ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Status</span>
                  <Badge variant={health.healthy ? "success" : "danger"}>{health.status}</Badge>
                </div>
                {health.consecutive_failures !== undefined ? (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Consecutive failures</span>
                    <span className="text-text">{health.consecutive_failures ?? 0}</span>
                  </div>
                ) : null}
                {health.next_run_at ? (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Next run</span>
                    <span className="text-text">
                      {new Date(health.next_run_at).toLocaleString()}
                    </span>
                  </div>
                ) : null}
                {health.message ? (
                  <p className="text-text-secondary text-xs">{health.message}</p>
                ) : null}
              </div>
            ) : (
              <p className="text-text-secondary text-sm">No health data</p>
            )}
          </div>
          <div className="rounded-card border-border bg-surface border p-5">
            <h3 className="text-text mb-3 font-semibold">Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Target</span>
                <span className="text-text">
                  {schedule.target_type} / {schedule.target_id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Trigger</span>
                <span className="text-text">
                  {schedule.trigger.kind}
                  {schedule.trigger.cron_expr ? ` (${schedule.trigger.cron_expr})` : ""}
                  {schedule.trigger.interval_seconds
                    ? ` every ${String(schedule.trigger.interval_seconds)}s`
                    : ""}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Created</span>
                <span className="text-text">
                  {schedule.created_at ? new Date(schedule.created_at).toLocaleString() : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-card border-border bg-surface border p-5">
          <h3 className="text-text mb-3 font-semibold">Execution history</h3>
          {executions.length === 0 ? (
            <EmptyState
              icon="activity"
              title="No executions yet"
              description="Executions will appear here after the schedule runs."
            />
          ) : (
            <div className="space-y-2">
              {executions.map((e) => (
                <div
                  key={e.id}
                  className="border-border flex items-center justify-between rounded-lg border px-3 py-2"
                >
                  <div>
                    <span className="text-text text-sm font-medium">{e.status}</span>
                    <span className="text-text-secondary ml-2 text-xs">
                      {e.started_at ? new Date(e.started_at).toLocaleString() : ""}
                    </span>
                  </div>
                  <span className="text-text-secondary text-xs">
                    {e.duration_ms ? `${String(e.duration_ms)}ms` : ""}{" "}
                    {e.error ? `· ${e.error}` : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </EnterpriseShell>
  );
}

export default function ScheduleDetailPage() {
  return (
    <RequireAuth>
      <ScheduleDetailContent />
    </RequireAuth>
  );
}
