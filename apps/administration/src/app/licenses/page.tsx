"use client";

import { useEffect, useState, useCallback } from "react";
import { RequireAuth, RequireRole } from "@eaip/auth";
import { usePlatformStore } from "@eaip/state";
import { EnterpriseShell, LoadingState, ErrorState, DataGrid } from "@eaip/ui-enterprise";
import { Button, Badge } from "@eaip/ui-primitives";
import { fetchLicenses, createLicense, type License } from "../../services/admin-service";

function LicensesContent() {
  const addToast = usePlatformStore((state) => state.addToast);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchLicenses();
      if (result.error) {
        setError(result.error);
      } else {
        setLicenses(result.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load licenses");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleAddLicense = async () => {
    try {
      const name = `Enterprise License ${String(licenses.length + 1)}`;
      const result = await createLicense(name, "enterprise", 50);
      if (result.error) throw new Error(result.error);
      addToast({ type: "success", title: "License Created", message: name });
      void load();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      addToast({ type: "error", title: "Failed to create license", message });
    }
  };

  return (
    <EnterpriseShell
      appId="administration"
      pageTitle="License Management"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Licenses" }]}
    >
      <div className="space-y-8">
        <section className="surface-hero relative overflow-hidden p-8 lg:p-10">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br from-primary-subtle/50 to-transparent blur-3xl" aria-hidden="true" />
          <div className="relative">
            <h1 className="text-3xl font-bold text-text tracking-tight">License Management</h1>
            <p className="mt-3 text-base text-text-secondary max-w-2xl leading-relaxed">Manage system subscription levels and concurrent seats.</p>
          </div>
        </section>

        <div className="flex justify-between items-center">
          <Button variant="secondary" onClick={() => { void load(); }}>Refresh</Button>
          <Button onClick={() => { void handleAddLicense(); }}>Issue License</Button>
        </div>

        {loading ? (
          <LoadingState message="Loading licenses..." />
        ) : error ? (
          <ErrorState message={error} onRetry={() => { void load(); }} />
        ) : (
          <div className="surface-card rounded-card overflow-hidden">
            <DataGrid
              data={licenses}
              keyExtractor={(lic) => lic.id}
              columns={[
                {
                  key: "name",
                  header: "License Name",
                  render: (lic) => <span className="font-medium text-text">{lic.name}</span>,
                },
                {
                  key: "type",
                  header: "Type",
                  render: (lic) => <span className="capitalize">{lic.type}</span>,
                },
                {
                  key: "seats",
                  header: "Seats Allocation",
                  render: (lic) => `${String(lic.used)} / ${String(lic.seats)}`,
                },
                {
                  key: "status",
                  header: "Status",
                  render: (lic) => (
                    <Badge variant={lic.status === "active" ? "success" : "danger"}>
                      {lic.status}
                    </Badge>
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

export default function LicensesPage() {
  return (
    <RequireAuth>
      <RequireRole requiredRole="admin">
        <LicensesContent />
      </RequireRole>
    </RequireAuth>
  );
}
