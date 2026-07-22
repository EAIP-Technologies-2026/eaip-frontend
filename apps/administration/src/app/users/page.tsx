"use client";

import { useEffect, useState } from "react";
import { RequireAuth, RequireRole } from "@eaip/auth";
import { EnterpriseShell, DataGrid, LoadingState, ErrorState } from "@eaip/ui-enterprise";
import { getDefaultClient } from "@eaip/api";
import { logger } from "@eaip/logging";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

function UsersPageContent() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUsers() {
      try {
        const client = getDefaultClient();
        const response = await client.get<AdminUser[]>("/admin/users");
        if (response.error) throw response.error;
        setUsers(response.data ?? []);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        logger.error("Failed to load users", { error: message });
        setError(message);
      } finally {
        setLoading(false);
      }
    }
    void loadUsers();
  }, []);

  return (
    <EnterpriseShell
      appId="administration"
      pageTitle="Users"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Users" }]}
    >
      <div className="space-y-4">
        {loading ? (
          <LoadingState message="Loading users..." />
        ) : error ? (
          <ErrorState
            message={error}
            onRetry={() => {
              window.location.reload();
            }}
          />
        ) : (
          <DataGrid
            data={users}
            keyExtractor={(user) => user.id}
            columns={[
              { key: "name", header: "Name" },
              { key: "email", header: "Email" },
              {
                key: "roles",
                header: "Roles",
                render: (user) => user.roles.join(", "),
              },
            ]}
          />
        )}
      </div>
    </EnterpriseShell>
  );
}

export default function UsersPage() {
  return (
    <RequireAuth>
      <RequireRole requiredRole="admin">
        <UsersPageContent />
      </RequireRole>
    </RequireAuth>
  );
}
