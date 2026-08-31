"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { RequireRole } from "@eaip/auth";
import { getDefaultClient } from "@eaip/api";
import {
  EnterpriseShell,
  ErrorState,
  StatCard,
  Card,
  CardHeader,
  CardContent,
} from "@eaip/ui-enterprise";
import { Badge, Button, SectionTitle, EmptyState } from "@eaip/ui-primitives";
import { EnterpriseIcon } from "@eaip/icons";
import {
  fetchAdminOverview,
  fetchAdminUsers,
  fetchAdminRoles,
  fetchAdminPermissions,
  fetchAdminAudit,
  fetchAdminFeatureFlags,
  toggleAdminFeatureFlag,
} from "../../services/administration-service";
import type {
  AdminUser,
  AdminRole,
  AdminPermission,
  AdminAuditEntry,
  AdminFeatureFlag,
  AdminOverview,
} from "../../services/administration-service";
import { useFallback } from "../../services/fallback-context";

type AdminTab = "overview" | "users" | "roles" | "permissions" | "audit" | "feature-flags";

function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const diff = Date.now() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${String(seconds)}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${String(minutes)}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${String(hours)}h ago`;
  const days = Math.floor(hours / 24);
  return `${String(days)}d ago`;
}

function OverviewSection({ overview, users }: { overview: AdminOverview; users: AdminUser[] }) {
  const activeUsers = users.filter((u) => u.status === "active").length;
  const adminUsers = users.filter((u) => u.roles.includes("admin")).length;
  const departments = new Set(users.map((u) => u.department).filter(Boolean)).size;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Users"
          value={overview.users.total || users.length}
          icon={<EnterpriseIcon name="users" size={18} />}
        />
        <StatCard
          label="Active"
          value={activeUsers}
          icon={<EnterpriseIcon name="check" size={18} />}
        />
        <StatCard
          label="Administrators"
          value={adminUsers}
          icon={<EnterpriseIcon name="shield" size={18} />}
        />
        <StatCard
          label="Organizations"
          value={overview.organizations.total}
          icon={<EnterpriseIcon name="building" size={18} />}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <SectionTitle>Quick Management</SectionTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              <Link
                href="/users"
                className="rounded-card border-border bg-surface transition-smooth hover:border-primary flex items-center gap-3 border p-4"
              >
                <div className="bg-primary-subtle text-primary flex h-10 w-10 items-center justify-center rounded-lg">
                  <EnterpriseIcon name="users" size={20} />
                </div>
                <div>
                  <p className="text-text text-sm font-medium">Users</p>
                  <p className="text-text-secondary text-xs">Manage user accounts</p>
                </div>
              </Link>
              <Link
                href="/roles"
                className="rounded-card border-border bg-surface transition-smooth hover:border-primary flex items-center gap-3 border p-4"
              >
                <div className="bg-success-subtle text-success flex h-10 w-10 items-center justify-center rounded-lg">
                  <EnterpriseIcon name="shield" size={20} />
                </div>
                <div>
                  <p className="text-text text-sm font-medium">Roles</p>
                  <p className="text-text-secondary text-xs">Configure access roles</p>
                </div>
              </Link>
              <Link
                href="/permissions"
                className="rounded-card border-border bg-surface transition-smooth hover:border-primary flex items-center gap-3 border p-4"
              >
                <div className="bg-warning-subtle text-warning flex h-10 w-10 items-center justify-center rounded-lg">
                  <EnterpriseIcon name="key" size={20} />
                </div>
                <div>
                  <p className="text-text text-sm font-medium">Permissions</p>
                  <p className="text-text-secondary text-xs">Set access policies</p>
                </div>
              </Link>
              <Link
                href="/settings"
                className="rounded-card border-border bg-surface transition-smooth hover:border-primary flex items-center gap-3 border p-4"
              >
                <div className="bg-surface-tertiary text-text-secondary flex h-10 w-10 items-center justify-center rounded-lg">
                  <EnterpriseIcon name="settings" size={20} />
                </div>
                <div>
                  <p className="text-text text-sm font-medium">Settings</p>
                  <p className="text-text-secondary text-xs">Platform configuration</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <SectionTitle>Platform Summary</SectionTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-text text-2xl font-bold">{String(overview.teams.total)}</p>
                <p className="text-text-muted text-xs">Teams</p>
              </div>
              <div className="text-center">
                <p className="text-text text-2xl font-bold">{String(overview.agents.total)}</p>
                <p className="text-text-muted text-xs">Agents</p>
              </div>
              <div className="text-center">
                <p className="text-text text-2xl font-bold">{String(overview.workflows.total)}</p>
                <p className="text-text-muted text-xs">Workflows</p>
              </div>
              <div className="text-center">
                <p className="text-text text-2xl font-bold">{String(departments)}</p>
                <p className="text-text-muted text-xs">Departments</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function UsersSection({ users, loading }: { users: AdminUser[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton rounded-card h-16" />
        ))}
      </div>
    );
  }
  if (users.length === 0) {
    return <EmptyState icon="users" title="No users" description="No users found." />;
  }
  return (
    <div className="divide-border rounded-card border-border bg-surface divide-y border">
      {users.map((user) => (
        <div
          key={user.id}
          className="hover:bg-surface-secondary transition-smooth flex items-center justify-between px-4 py-3"
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-text truncate text-sm font-medium">{user.name}</p>
              <p className="text-text-muted truncate text-xs">{user.email}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {user.department && (
              <span className="text-text-muted hidden text-xs sm:block">{user.department}</span>
            )}
            <div className="flex gap-1">
              {user.roles.map((role) => (
                <Badge key={role} variant={role === "admin" ? "primary" : "default"}>
                  {role}
                </Badge>
              ))}
            </div>
            <Badge
              variant={
                user.status === "active"
                  ? "success"
                  : user.status === "inactive"
                    ? "warning"
                    : "danger"
              }
            >
              {user.status}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}

function RolesSection({ roles, loading }: { roles: AdminRole[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton rounded-card h-24" />
        ))}
      </div>
    );
  }
  if (roles.length === 0) {
    return <EmptyState icon="shield" title="No roles" description="No roles configured." />;
  }
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {roles.map((role) => (
        <Card key={role.id}>
          <CardContent>
            <div className="mb-2 flex items-center gap-3">
              <div className="bg-success-subtle text-success flex h-8 w-8 items-center justify-center rounded-lg">
                <EnterpriseIcon name="shield" size={16} />
              </div>
              <div>
                <p className="text-text text-sm font-semibold">{role.name}</p>
                <p className="text-text-muted text-xs">{role.description}</p>
              </div>
            </div>
            <div className="text-text-muted flex items-center gap-4 text-xs">
              <span>{String(role.permissionCount)} permissions</span>
              <span>{String(role.memberCount)} members</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function PermissionsSection({
  permissions,
  loading,
}: {
  permissions: AdminPermission[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton rounded-card h-12" />
        ))}
      </div>
    );
  }
  if (permissions.length === 0) {
    return <EmptyState icon="key" title="No permissions" description="No permissions defined." />;
  }
  return (
    <div className="divide-border rounded-card border-border bg-surface divide-y border">
      {permissions.map((perm) => (
        <div key={perm.id} className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <EnterpriseIcon name="key" size={14} className="text-text-muted" />
            <div>
              <p className="text-text text-sm font-medium">{perm.name}</p>
              <p className="text-text-muted text-xs">{perm.description}</p>
            </div>
          </div>
          <Badge variant="glass">{perm.resource}</Badge>
        </div>
      ))}
    </div>
  );
}

function AuditSection({ entries, loading }: { entries: AdminAuditEntry[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton rounded-card h-12" />
        ))}
      </div>
    );
  }
  if (entries.length === 0) {
    return (
      <EmptyState icon="history" title="No audit entries" description="No audit events recorded." />
    );
  }

  async function replayEvents() {
    try {
      const response = await getDefaultClient().post<{ count: number }>(
        "/administration/audit/replay",
        {},
      );
      if (response.error) throw response.error;
      alert(`Successfully replayed ${String(response.data?.count ?? 0)} events.`);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-text text-sm font-medium">Recent Events</h3>
        <Button
          variant="secondary"
          size="sm"
          iconLeft="history"
          onClick={() => {
            void replayEvents();
          }}
        >
          Replay Event Source
        </Button>
      </div>
      <div className="divide-border rounded-card border-border bg-surface divide-y border">
        {entries.map((entry) => (
          <div key={entry.id} className="flex items-start gap-3 px-4 py-3">
            <div
              className={`mt-1 h-2 w-2 shrink-0 rounded-full ${entry.outcome === "success" ? "bg-success" : "bg-danger"}`}
            />
            <div className="min-w-0 flex-1">
              <p className="text-text text-sm font-medium">{entry.action}</p>
              <p className="text-text-muted text-xs">
                {entry.actor} &middot; {entry.resource}
                {entry.resourceId ? ` (${entry.resourceId})` : ""}
              </p>
              <p className="text-text-muted mt-0.5 text-[10px]">
                {formatRelativeTime(entry.timestamp)}
              </p>
            </div>
            <Badge variant={entry.outcome === "success" ? "success" : "danger"}>
              {entry.outcome}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeatureFlagsSection({
  flags,
  loading,
  onToggle,
}: {
  flags: AdminFeatureFlag[];
  loading: boolean;
  onToggle: (name: string) => void;
}) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton rounded-card h-12" />
        ))}
      </div>
    );
  }
  if (flags.length === 0) {
    return (
      <EmptyState icon="bolt" title="No feature flags" description="No feature flags configured." />
    );
  }
  return (
    <div className="divide-border rounded-card border-border bg-surface divide-y border">
      {flags.map((flag) => (
        <div key={flag.name} className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <EnterpriseIcon name="bolt" size={14} className="text-text-muted" />
            <span className="text-text text-sm font-medium">{flag.name}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              onToggle(flag.name);
            }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              flag.enabled ? "bg-primary" : "bg-surface-tertiary"
            }`}
            aria-label={`Toggle ${flag.name}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                flag.enabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      ))}
    </div>
  );
}

function AdministrationContent() {
  const { setFallback } = useFallback();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [permissions, setPermissions] = useState<AdminPermission[]>([]);
  const [auditEntries, setAuditEntries] = useState<AdminAuditEntry[]>([]);
  const [featureFlags, setFeatureFlags] = useState<AdminFeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewResult, usersResult, rolesResult, permsResult, auditResult, flagsResult] =
        await Promise.all([
          fetchAdminOverview(),
          fetchAdminUsers(),
          fetchAdminRoles(),
          fetchAdminPermissions(),
          fetchAdminAudit(),
          fetchAdminFeatureFlags(),
        ]);
      setFallback("admin", overviewResult.source === "fallback");
      setOverview(overviewResult.data);
      setUsers(usersResult.data);
      setRoles(rolesResult.data);
      setPermissions(permsResult.data);
      setAuditEntries(auditResult.data.entries);
      setFeatureFlags(flagsResult.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [setFallback]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleToggleFlag = useCallback(async (flagName: string) => {
    const result = await toggleAdminFeatureFlag(flagName);
    if (result.source === "live") {
      setFeatureFlags((prev) =>
        prev.map((f) => (f.name === flagName ? { ...f, enabled: result.data.enabled } : f)),
      );
    }
  }, []);

  const tabs: { id: AdminTab; label: string; icon: string }[] = [
    { id: "overview", label: "Overview", icon: "home" },
    { id: "users", label: "Users", icon: "users" },
    { id: "roles", label: "Roles", icon: "shield" },
    { id: "permissions", label: "Permissions", icon: "key" },
    { id: "audit", label: "Audit", icon: "history" },
    { id: "feature-flags", label: "Feature Flags", icon: "bolt" },
  ];

  return (
    <EnterpriseShell
      appId="enterprise-console"
      pageTitle="Administration"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Administration" }]}
    >
      <div className="space-y-6">
        <section
          data-tour="administration"
          className="surface-hero relative overflow-hidden p-8 lg:p-10"
        >
          <div className="relative">
            <div className="text-primary mb-4 flex items-center gap-2 text-xs font-semibold tracking-widest uppercase">
              <EnterpriseIcon name="shield" size={14} />
              Platform Administration
            </div>
            <h1 className="text-text text-3xl font-bold tracking-tight">Administration</h1>
            <p className="text-text-secondary mt-3 max-w-2xl text-base leading-relaxed">
              Manage users, roles, permissions, organizations, and platform configuration.
            </p>
          </div>
        </section>

        <div className="border-border bg-surface flex items-center gap-1 overflow-x-auto rounded-lg border p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
              }}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "bg-primary text-text-inverse"
                  : "text-text-secondary hover:bg-surface-tertiary"
              }`}
            >
              <EnterpriseIcon name={tab.icon as never} size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <ErrorState
            title="Could not load administration data"
            message={error}
            onRetry={() => {
              void loadData();
            }}
          />
        )}

        {loading && !overview ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton rounded-card h-24" />
            ))}
          </div>
        ) : overview ? (
          <>
            {activeTab === "overview" && <OverviewSection overview={overview} users={users} />}
            {activeTab === "users" && <UsersSection users={users} loading={loading} />}
            {activeTab === "roles" && <RolesSection roles={roles} loading={loading} />}
            {activeTab === "permissions" && (
              <PermissionsSection permissions={permissions} loading={loading} />
            )}
            {activeTab === "audit" && <AuditSection entries={auditEntries} loading={loading} />}
            {activeTab === "feature-flags" && (
              <FeatureFlagsSection
                flags={featureFlags}
                loading={loading}
                onToggle={(name) => {
                  void handleToggleFlag(name);
                }}
              />
            )}
          </>
        ) : null}
      </div>
    </EnterpriseShell>
  );
}

export default function AdministrationPage() {
  return (
    <RequireRole requiredRole="admin">
      <AdministrationContent />
    </RequireRole>
  );
}
