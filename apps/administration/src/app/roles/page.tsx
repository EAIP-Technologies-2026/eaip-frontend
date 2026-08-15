"use client";

import { useEffect, useState } from "react";
import { RequireAuth, RequireRole } from "@eaip/auth";
import { EnterpriseShell, DataGrid, LoadingState, ErrorState, SectionHeader } from "@eaip/ui-enterprise";
import { EnterpriseIcon } from "@eaip/icons";
import { getDefaultClient } from "@eaip/api";
import { logger } from "@eaip/logging";

interface Role {
  id: string;
  name: string;
  description?: string;
  permissions?: string[];
  permissionCount?: number;
  memberCount?: number;
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
        setRoles(Array.isArray(response.data) ? response.data : []);
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

  const permissionCount = (role: Role): number =>
    Array.isArray(role.permissions) ? role.permissions.length : (role.permissionCount ?? 0);

  const totalRoles = roles.length;
  const withPermissions = roles.filter((r) => permissionCount(r) > 0).length;
  const withoutPermissions = roles.filter((r) => permissionCount(r) === 0).length;

  return (
    <EnterpriseShell
      appId="administration"
      pageTitle="Roles"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Roles" }]}
    >
      <div className="space-y-8">
        {/* Layer 1 — Hero */}
        <section className="surface-hero relative overflow-hidden p-8 lg:p-10">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br from-primary-subtle/50 to-transparent blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-gradient-to-tr from-accent-glow/30 to-transparent blur-2xl" aria-hidden="true" />
          <div className="relative">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-primary uppercase mb-4">
              <EnterpriseIcon name="activity" size={14} />
              Role Governance
            </div>
            <h1 className="text-3xl font-bold text-text tracking-tight">Roles</h1>
            <p className="mt-3 text-base text-text-secondary max-w-2xl leading-relaxed">Define and manage organizational roles, permission sets, and access hierarchies.</p>
          </div>
        </section>

        {/* Layer 2 — Governance Summary Strip */}
        <section className="space-y-4">
          <SectionHeader icon="barChart" title="Governance Summary" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="surface-card rounded-card p-4">
              <p className="text-sm font-medium text-text-secondary">Total Roles</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-text">{totalRoles}</p>
            </div>
            <div className="surface-card rounded-card p-4">
              <p className="text-sm font-medium text-text-secondary">With Permissions</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-text">{withPermissions}</p>
            </div>
            <div className="surface-card rounded-card p-4">
              <p className="text-sm font-medium text-text-secondary">Without Permissions</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-text">{withoutPermissions}</p>
            </div>
          </div>
        </section>

        {/* Layer 3 — Operational Workspace */}
        <section className="space-y-4">
          <SectionHeader icon="shield" title="Role Directory" />
          <div className="surface-card rounded-card overflow-hidden">
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
                  {
                    key: "name",
                    header: "Name",
                    render: (role) => (
                      <div>
                        <p className="font-medium text-text">{role.name}</p>
                        {role.description ? (
                          <p className="text-xs text-text-secondary">{role.description}</p>
                        ) : null}
                      </div>
                    ),
                  },
                  {
                    key: "permissions",
                    header: "Permissions",
                    render: (role) => permissionCount(role),
                  },
                  {
                    key: "memberCount",
                    header: "Members",
                    render: (role) => role.memberCount ?? 0,
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

export default function RolesPage() {
  return (
    <RequireAuth>
      <RequireRole requiredRole="admin">
        <RolesPageContent />
      </RequireRole>
    </RequireAuth>
  );
}
