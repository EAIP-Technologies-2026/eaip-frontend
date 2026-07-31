"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { RequireAuth } from "@eaip/auth";
import { EnterpriseIcon } from "@eaip/icons";
import { EnterpriseShell, DataGrid, LoadingState, ErrorState } from "@eaip/ui-enterprise";
import { fetchHistory } from "../../services/history-service";
import type { HistoryItem } from "../../services/history-service";

function HistoryPageContent() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchHistory();
      if (result.error) {
        setError(result.error);
      } else {
        setHistory(result.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return (
    <EnterpriseShell
      appId="mission-control"
      pageTitle="History"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "History" }]}
    >
      <div className="space-y-8">
        <section className="surface-hero relative overflow-hidden p-8 lg:p-10">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br from-primary-subtle/50 to-transparent blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-gradient-to-tr from-accent-glow/30 to-transparent blur-2xl" aria-hidden="true" />
          <div className="relative">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-primary uppercase mb-4">
              <EnterpriseIcon name="activity" size={14} />
              Execution History
            </div>
            <h1 className="text-3xl font-bold text-text tracking-tight">History</h1>
            <p className="mt-3 text-base text-text-secondary max-w-2xl leading-relaxed">Global execution history across workflows and agents.</p>
          </div>
        </section>

        {loading ? (
          <LoadingState message="Loading history..." />
        ) : error ? (
          <ErrorState message={error} onRetry={() => { void load(); }} />
        ) : (
          <div className="space-y-6">
            {/* Executive Summary Strip (Layer 2) */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border border-border bg-surface px-5 py-3">
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <EnterpriseIcon name="activity" size={16} />
                <span><strong className="text-text">{String(history.length)}</strong> executions</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <EnterpriseIcon name="check" size={16} />
                <span><strong className="text-text">{String(history.filter((h) => h.status === "completed").length)}</strong> completed</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <EnterpriseIcon name="play" size={16} />
                <span><strong className="text-text">{String(history.filter((h) => h.status === "running").length)}</strong> running</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <EnterpriseIcon name="alert" size={16} />
                <span><strong className="text-text">{String(history.filter((h) => h.status === "failed").length)}</strong> failed</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <EnterpriseIcon name="workflow" size={16} />
                <span><strong className="text-text">{String(history.filter((h) => h.type === "workflow").length)}</strong> workflow / <strong className="text-text">{String(history.filter((h) => h.type === "agent").length)}</strong> agent</span>
              </div>
            </div>

            <DataGrid
            data={history}
            keyExtractor={(item) => item.id}
            loading={loading}
            pageSize={10}
            columns={[
              { key: "id", header: "Run ID", sortable: true, filterable: true },
              {
                key: "type",
                header: "Type",
                sortable: true,
                render: (item) => (
                  <span className="rounded-full bg-surface-secondary px-2 py-0.5 text-xs capitalize">
                    {item.type}
                  </span>
                ),
              },
              { key: "name", header: "Name", sortable: true, filterable: true },
              {
                key: "status",
                header: "Status",
                sortable: true,
                filterable: true,
                render: (item) => (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                      item.status === "running"
                        ? "bg-primary-subtle text-primary"
                        : item.status === "completed"
                          ? "bg-success-subtle text-success"
                          : item.status === "failed"
                            ? "bg-danger-subtle text-danger"
                            : "bg-surface-secondary text-text-secondary"
                    }`}
                  >
                    {item.status}
                  </span>
                ),
              },
              {
                key: "target",
                header: "Target",
                render: (item) => (
                  <Link
                    href={item.type === "workflow" ? `/workflows/${item.targetId}` : `/agents/${item.targetId}`}
                    className="text-sm text-primary hover:underline"
                  >
                    View {item.type}
                  </Link>
                ),
              },
            ]}
          />
          </div>
        )}
      </div>
    </EnterpriseShell>
  );
}

export default function HistoryPage() {
  return (
    <RequireAuth>
      <HistoryPageContent />
    </RequireAuth>
  );
}
