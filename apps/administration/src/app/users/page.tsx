"use client";

import { useEffect, useState } from "react";
import { RequireAuth, RequireRole } from "@eaip/auth";
import { EnterpriseShell, DataGrid, LoadingState, ErrorState, SectionHeader } from "@eaip/ui-enterprise";
import { EnterpriseIcon } from "@eaip/icons";
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

  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.roles.includes("admin")).length;
  const withRolesCount = users.filter((u) => u.roles.length > 0).length;

  return (
    <EnterpriseShell
      appId="administration"
      pageTitle="Users"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Users" }]}
    >
      <div className="space-y-8">
        {/* Layer 1 — Hero */}
        <section className="surface-hero relative overflow-hidden p-8 lg:p-10">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br from-primary-subtle/50 to-transparent blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-gradient-to-tr from-accent-glow/30 to-transparent blur-2xl" aria-hidden="true" />
          <div className="relative">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-primary uppercase mb-4">
              <EnterpriseIcon name="activity" size={14} />
              User Management
            </div>
            <h1 className="text-3xl font-bold text-text tracking-tight">Users</h1>
            <p className="mt-3 text-base text-text-secondary max-w-2xl leading-relaxed">Manage platform users, roles, permissions, and access control policies.</p>
          </div>
        </section>

        {/* Layer 2 — Governance Summary Strip */}
        <section className="space-y-4">
          <SectionHeader icon="barChart" title="Governance Summary" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="surface-card rounded-card p-4">
              <p className="text-sm font-medium text-text-secondary">Total Users</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-text">{totalUsers}</p>
            </div>
            <div className="surface-card rounded-card p-4">
              <p className="text-sm font-medium text-text-secondary">Admins</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-text">{adminCount}</p>
            </div>
            <div className="surface-card rounded-card p-4">
              <p className="text-sm font-medium text-text-secondary">With Roles</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-text">{withRolesCount}</p>
            </div>
          </div>
        </section>

        {/* Layer 3 — Operational Workspace */}
        <section className="space-y-4">
          <SectionHeader icon="users" title="User Directory" />
          <div className="surface-card rounded-card overflow-hidden">
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
        </section>
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
