"use client";

import { useEffect, useState, useCallback } from "react";
import { RequireAuth, RequireRole } from "@eaip/auth";
import { EnterpriseShell, LoadingState, ErrorState, DataGrid } from "@eaip/ui-enterprise";
import { fetchAuditLog, type AuditEntry } from "../../services/admin-service";
import { Button } from "@eaip/ui-primitives";

function AuditContent() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAuditLog();
      if (result.error) {
        setError(result.error);
      } else {
        setLogs(result.data.entries);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <EnterpriseShell
      appId="administration"
      pageTitle="Audit Trail"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Audit Trail" }]}
    >
      <div className="space-y-8">
        <section className="surface-hero relative overflow-hidden p-8 lg:p-10">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br from-primary-subtle/50 to-transparent blur-3xl" aria-hidden="true" />
          <div className="relative">
            <h1 className="text-3xl font-bold text-text tracking-tight">Audit Trail</h1>
            <p className="mt-3 text-base text-text-secondary max-w-2xl leading-relaxed">Immutable system event log tracking administrative access and actions.</p>
          </div>
        </section>

        <div className="flex justify-end">
          <Button variant="secondary" onClick={() => { void load(); }}>Refresh</Button>
        </div>

        {loading ? (
          <LoadingState message="Loading audit trail..." />
        ) : error ? (
          <ErrorState message={error} onRetry={() => { void load(); }} />
        ) : (
          <div className="surface-card rounded-card overflow-hidden">
            <DataGrid
              data={logs}
              keyExtractor={(log) => log.id}
              columns={[
                {
                  key: "timestamp",
                  header: "Timestamp",
                  render: (log) => new Date(log.timestamp).toLocaleString(),
                },
                {
                  key: "actor",
                  header: "Actor",
                  render: (log) => log.actor,
                },
                {
                  key: "action",
                  header: "Action",
                  render: (log) => <span className="font-semibold">{log.action}</span>,
                },
                {
                  key: "resource",
                  header: "Resource Type",
                  render: (log) => log.resource,
                },
                {
                  key: "outcome",
                  header: "Outcome",
                  render: (log) => (
                    <span className={`text-sm font-medium ${log.outcome === "success" ? "text-success" : "text-danger"}`}>
                      {log.outcome}
                    </span>
                  ),
                },
                {
                  key: "details",
                  header: "Details",
                  render: (log) => log.details ?? "—",
                },
              ]}
            />
          </div>
        )}
      </div>
    </EnterpriseShell>
  );
}

export default function AuditPage() {
  return (
    <RequireAuth>
      <RequireRole requiredRole="admin">
        <AuditContent />
      </RequireRole>
    </RequireAuth>
  );
}
