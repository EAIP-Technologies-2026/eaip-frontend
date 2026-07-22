"use client";

import { useEffect, useState } from "react";
import { RequireAuth, RequireRole } from "@eaip/auth";
import { EnterpriseShell, DataGrid, LoadingState, ErrorState } from "@eaip/ui-enterprise";
import { getDefaultClient } from "@eaip/api";
import { logger } from "@eaip/logging";

interface Role {
  id: string;
  name: string;
  permissions: string[];
}

function RolesPageContent() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRoles() {
      try {
        const client = getDefaultClient();
        const response = await client.get<Role[]>("/admin/roles");
        if (response.error) throw response.error;
        setRoles(response.data ?? []);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        logger.error("Failed to load roles", { error: message });
        setError(message);
      } finally {
        setLoading(false);
      }
    }
    void loadRoles();
  }, []);

  return (
    <EnterpriseShell
      appId="administration"
      pageTitle="Roles"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Roles" }]}
    >
      <div className="space-y-4">
        {loading ? (
          <LoadingState message="Loading roles..." />
        ) : error ? (
          <ErrorState
            message={error}
            onRetry={() => {
              window.location.reload();
            }}
          />
        ) : (
          <DataGrid
            data={roles}
            keyExtractor={(role) => role.id}
            columns={[
              { key: "name", header: "Name" },
              {
                key: "permissions",
                header: "Permissions",
                render: (role) => role.permissions.join(", ") || "—",
              },
            ]}
          />
        )}
      </div>
    </EnterpriseShell>
  );
}

export default function RolesPage() {
  return (
    <RequireAuth>
      <RequireRole requiredRole="admin">
        <RolesPageContent />
      </RequireRole>
    </RequireAuth>
  );
}
