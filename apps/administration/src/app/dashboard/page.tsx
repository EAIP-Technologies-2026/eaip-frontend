"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RequireAuth, useAuth, RequireRole } from "@eaip/auth";
import { usePlatformStore } from "@eaip/state";
import { getDefaultClient } from "@eaip/api";
import {
  EnterpriseShell,
  DataGrid,
  LoadingState,
  ErrorState,
  SectionHeader,
} from "@eaip/ui-enterprise";
import { Button, Badge } from "@eaip/ui-primitives";
import {
  MetricCard,
  StatusWidget,
} from "@eaip/ui-visualizations";
import { EnterpriseIcon } from "@eaip/icons";
import { logger } from "@eaip/logging";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  roles: string[];
  status?: string;
  lastActive?: string;
}

interface AdminStats {
  totalUsers: number;
  totalRoles: number;
  totalPermissions: number;
  activeSessions: number;
}

interface MonitoringMetrics {
  systemHealth: string;
  activeAlerts: number;
}

const defaultAdminStats: AdminStats = {
  totalUsers: 0,
  totalRoles: 0,
  totalPermissions: 0,
  activeSessions: 0,
};

const defaultMonitoringMetrics: MonitoringMetrics = {
  systemHealth: "unknown",
  activeAlerts: 0,
};

function parseAdminStats(data: unknown): AdminStats {
  if (!data || typeof data !== "object") return defaultAdminStats;
  const obj = data as Record<string, unknown>;
  const num = (value: unknown): number =>
    typeof value === "number" ? value : Number(value) || 0;
  return {
    totalUsers: num(obj.totalUsers ?? obj.users ?? obj.userCount ?? 0),
    totalRoles: num(obj.totalRoles ?? obj.roles ?? obj.roleCount ?? 0),
    totalPermissions: num(
      obj.totalPermissions ?? obj.permissions ?? obj.permissionCount ?? 0,
    ),
    activeSessions: num(
      obj.activeSessions ?? obj.sessions ?? obj.activeUserCount ?? 0,
    ),
  };
}

function parseMonitoringMetrics(data: unknown): MonitoringMetrics {
  if (!data || typeof data !== "object") return defaultMonitoringMetrics;
  const obj = data as Record<string, unknown>;
  const num = (value: unknown): number =>
    typeof value === "number" ? value : Number(value) || 0;
  const health =
    typeof obj.systemHealth === "string"
      ? obj.systemHealth
      : typeof obj.status === "string"
        ? obj.status
        : typeof obj.health === "string"
          ? obj.health
          : "unknown";
  return {
    systemHealth: health,
    activeAlerts: num(obj.activeAlerts ?? obj.alerts ?? 0),
  };
}

function parseUsers(data: unknown): AdminUser[] {
  if (!Array.isArray(data)) return [];
  return data.map((item, index) => ({
    id: (item as { id?: string }).id ?? String(index),
    name: (item as { name?: string }).name ?? "Unknown",
    email: (item as { email?: string }).email ?? "",
    roles: Array.isArray((item as { roles?: string[] }).roles)
      ? (item as { roles: string[] }).roles
      : [],
    status: (item as { status?: string }).status ?? "",
    lastActive: (item as { lastActive?: string }).lastActive ?? "",
  }));
}

function DashboardContent() {
  useAuth();
  const router = useRouter();
  const addToast = usePlatformStore((state) => state.addToast);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<AdminStats>(defaultAdminStats);
  const [metrics, setMetrics] = useState<MonitoringMetrics>(
    defaultMonitoringMetrics,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiClient = useMemo(() => getDefaultClient(), []);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);
      setError(null);
      try {
        const [usersResponse, statsResponse, metricsResponse] =
          await Promise.all([
            apiClient.get<unknown>("/admin/users"),
            apiClient.get<unknown>("/admin/stats"),
            apiClient.get<unknown>("/monitoring/metrics"),
          ]);
        if (cancelled) return;
        setUsers(parseUsers(usersResponse.data));
        setStats(parseAdminStats(statsResponse.data));
        setMetrics(parseMonitoringMetrics(metricsResponse.data));
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        logger.error("Failed to load dashboard", { error: message });
        setError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadDashboard();
    return () => {
      cancelled = true;
    };
  }, [apiClient]);

  async function handleAddUser() {
    try {
      const name = `User ${new Date().toLocaleTimeString()}`;
      const response = await apiClient.post<AdminUser>("/admin/users", {
        name,
        email: `${name.toLowerCase().replace(/\s+/g, "-")}@example.com`,
        roles: ["user"],
      });
      const newUser = response.data;
      if (newUser) {
        setUsers((prev) => [newUser, ...prev]);
        addToast({ type: "success", title: "User added" });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("Failed to add user", { error: message });
      addToast({ type: "error", title: "Failed to add user", message });
    }
  }

  return (
    <EnterpriseShell
      appId="administration"
      pageTitle="Dashboard"
      breadcrumbs={[{ label: "Dashboard" }]}
    >
      <div className="space-y-8">
        {/* Layer 1 — Context (Hero) */}
        <section className="surface-hero relative overflow-hidden p-8 lg:p-10">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br from-primary-subtle/50 to-transparent blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-gradient-to-tr from-accent-glow/30 to-transparent blur-2xl" aria-hidden="true" />
          <div className="relative">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-primary uppercase mb-4">
              <EnterpriseIcon name="activity" size={14} />
              Administration
            </div>
            <h1 className="text-3xl font-bold text-text tracking-tight">Dashboard</h1>
            <p className="mt-3 text-base text-text-secondary max-w-2xl leading-relaxed">Platform governance overview with user directory, roles, permissions, and operational health.</p>
          </div>
        </section>

        {/* Layer 2 — Governance Summary */}
        <section className="space-y-4">
          <SectionHeader icon="barChart" title="Governance Summary" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              label="Total Users"
              value={stats.totalUsers}
              icon={<EnterpriseIcon name="users" size={20} />}
            />
            <MetricCard
              label="Active Roles"
              value={stats.totalRoles}
              icon={<EnterpriseIcon name="shield" size={20} />}
            />
            <MetricCard
              label="Permission Sets"
              value={stats.totalPermissions}
              icon={<EnterpriseIcon name="lock" size={20} />}
            />
            <MetricCard
              label="System Status"
              value={metrics.systemHealth}
              icon={<EnterpriseIcon name="activity" size={20} />}
            />
          </div>
        </section>

        {/* Layer 3 — User Directory */}
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
                  {
                    key: "name",
                    header: "Name",
                    render: (user) => (
                      <Link
                        href={`/users/${user.id}`}
                        className="text-primary hover:underline"
                      >
                        {user.name}
                      </Link>
                    ),
                  },
                  {
                    key: "email",
                    header: "Email",
                    render: (user) => user.email,
                  },
                  {
                    key: "roles",
                    header: "Roles",
                    render: (user) => (
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((role) => (
                          <Badge key={role} variant="primary">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    ),
                  },
                  {
                    key: "status",
                    header: "Status",
                    render: (user) => (
                      <span className="text-sm text-text-secondary">
                        {user.status ?? "—"}
                      </span>
                    ),
                  },
                  {
                    key: "lastActive",
                    header: "Last Active",
                    render: (user) => (
                      <span className="text-sm text-text-secondary">
                        {user.lastActive ?? "—"}
                      </span>
                    ),
                  },
                ]}
              />
            )}
          </div>
        </section>

        {/* Layer 3 — Quick Actions */}
        <section className="space-y-4">
          <SectionHeader icon="zap" title="Administrative Actions" />
          <div className="flex flex-wrap gap-3">
            <Button
              iconLeft={<EnterpriseIcon name="plus" size={18} />}
              onClick={() => {
                void handleAddUser();
              }}
            >
              Add User
            </Button>
            <Button
              variant="secondary"
              iconLeft={<EnterpriseIcon name="users" size={18} />}
              onClick={() => {
                router.push("/users");
              }}
            >
              Manage Users
            </Button>
            <Button
              variant="secondary"
              iconLeft={<EnterpriseIcon name="shield" size={18} />}
              onClick={() => {
                router.push("/roles");
              }}
            >
              Manage Roles
            </Button>
            <Button
              variant="secondary"
              iconLeft={<EnterpriseIcon name="lock" size={18} />}
              onClick={() => {
                router.push("/permissions");
              }}
            >
              Manage Permissions
            </Button>
          </div>
        </section>

        {/* Layer 3 — Governance Health */}
        <section className="space-y-4">
          <SectionHeader icon="shield" title="Governance Health" />
          <div className="grid gap-4 md:grid-cols-3">
            <StatusWidget
              title="Recent Logins"
              status="success"
              value="12"
              subtitle="In the last 24 hours"
            />
            <StatusWidget
              title="Pending Approvals"
              status="warning"
              value="0"
              subtitle="Awaiting administrator review"
            />
            <StatusWidget
              title="Policy Violations"
              status="success"
              value="0"
              subtitle="No violations detected"
            />
          </div>
        </section>
      </div>
    </EnterpriseShell>
  );
}

export default function DashboardPage() {
  return (
    <RequireAuth>
      <RequireRole requiredRole="admin">
        <DashboardContent />
      </RequireRole>
    </RequireAuth>
  );
}
