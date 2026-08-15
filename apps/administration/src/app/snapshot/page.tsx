"use client";

import { useEffect, useState, useCallback } from "react";
import { RequireAuth, RequireRole } from "@eaip/auth";
import { EnterpriseShell, LoadingState, ErrorState, DataGrid } from "@eaip/ui-enterprise";
import { Badge, Button } from "@eaip/ui-primitives";
import { fetchAdminSnapshot, type AdminSnapshot } from "../../services/admin-service";

function SnapshotContent() {
  const [snapshot, setSnapshot] = useState<AdminSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAdminSnapshot();
      if (result.error) {
        setError(result.error);
      } else {
        setSnapshot(result.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load snapshot");
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
      pageTitle="System Snapshots"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Snapshots" }]}
    >
      <div className="space-y-8">
        <section className="surface-hero relative overflow-hidden p-8 lg:p-10">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br from-primary-subtle/50 to-transparent blur-3xl" aria-hidden="true" />
          <div className="relative">
            <h1 className="text-3xl font-bold text-text tracking-tight">System Snapshots</h1>
            <p className="mt-3 text-base text-text-secondary max-w-2xl leading-relaxed">Operational state snapshots of active runtime modules and services.</p>
          </div>
        </section>

        <div className="flex justify-end">
          <Button variant="secondary" onClick={() => { void load(); }}>Refresh</Button>
        </div>

        {loading ? (
          <LoadingState message="Loading snapshots..." />
        ) : error ? (
          <ErrorState message={error} onRetry={() => { void load(); }} />
        ) : snapshot ? (
          <div className="space-y-6">
            <div className="rounded-lg border border-border p-4 bg-surface flex justify-between text-sm text-text-secondary">
              <span>Overall Health: <strong>{snapshot.health}</strong></span>
              <span>Uptime: <strong>{snapshot.uptimeSeconds ? `${String(Math.floor(snapshot.uptimeSeconds / 3600))} hours` : "N/A"}</strong></span>
              <span>Collected At: <strong>{new Date(snapshot.timestamp).toLocaleString()}</strong></span>
            </div>

            <div className="surface-card rounded-card overflow-hidden">
              <DataGrid
                data={snapshot.services}
                keyExtractor={(svc) => svc.name}
                columns={[
                  {
                    key: "name",
                    header: "Module Name",
                    render: (svc) => <span className="font-semibold">{svc.name}</span>,
                  },
                  {
                    key: "status",
                    header: "Status",
                    render: (svc) => (
                      <Badge variant={svc.status === "healthy" ? "success" : svc.status === "unhealthy" ? "danger" : "default"}>
                        {svc.status}
                      </Badge>
                    ),
                  },
                ]}
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-text-secondary">
            <p>No snapshot data available.</p>
          </div>
        )}
      </div>
    </EnterpriseShell>
  );
}

export default function SnapshotPage() {
  return (
    <RequireAuth>
      <RequireRole requiredRole="admin">
        <SnapshotContent />
      </RequireRole>
    </RequireAuth>
  );
}
