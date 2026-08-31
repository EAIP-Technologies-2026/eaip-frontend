"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */

import { useEffect, useState, useCallback } from "react";
import { Dialog } from "@eaip/ui-foundation";
import { Input } from "@eaip/ui-primitives";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RequireAuth, useAuth, RequireRole } from "@eaip/auth";
import { usePlatformStore } from "@eaip/state";
import {
  EnterpriseShell,
  DataGrid,
  LoadingState,
  ErrorState,
  SectionHeader,
  StatCard,
} from "@eaip/ui-enterprise";
import { Button, Badge } from "@eaip/ui-primitives";
import dynamic from "next/dynamic";

const StatusWidget = dynamic(
  () => import("@eaip/ui-visualizations").then((mod) => mod.StatusWidget),
  { ssr: false, loading: () => <div className="skeleton h-24 rounded-lg" /> },
);
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

import { fetchAdminUsers, fetchAdminStats, createAdminUser } from "../../services/admin-service";
import { fetchMonitoringMetrics } from "../../services/monitoring-service";

function parseMonitoringMetrics(data: unknown): MonitoringMetrics {
  if (Array.isArray(data)) {
    // If it's a metric list from /monitoring/metrics
    const activeAlertsMetric = data.find((m: any) => m.label?.toLowerCase().includes("alert"));
    const uptimeMetric = data.find((m: any) => m.label?.toLowerCase().includes("uptime"));
    return {
      systemHealth: uptimeMetric ? "Active" : "unknown",
      activeAlerts: activeAlertsMetric ? Number(activeAlertsMetric.value) || 0 : 0,
    };
  }
  if (!data || typeof data !== "object") return defaultMonitoringMetrics;
  const obj = data as Record<string, unknown>;
  const num = (value: unknown): number => (typeof value === "number" ? value : Number(value) || 0);
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
  const [metrics, setMetrics] = useState<MonitoringMetrics>(defaultMonitoringMetrics);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersResponse, statsResponse, metricsResponse] = await Promise.all([
        fetchAdminUsers(),
        fetchAdminStats(),
        fetchMonitoringMetrics(),
      ]);
      setUsers(parseUsers(usersResponse.data));
      setStats(statsResponse.data);
      setMetrics(parseMonitoringMetrics(metricsResponse.data));
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("Failed to load dashboard", { error: message });
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const [addUserOpen, setAddUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");

  async function handleAddUser() {
    if (!newUserName.trim() || !newUserEmail.trim()) return;
    try {
      const response = await createAdminUser(newUserName.trim(), newUserEmail.trim(), ["user"]);
      const newUser = response.data;
      if (newUser) {
        setUsers((prev) => [newUser as unknown as AdminUser, ...prev]);
        addToast({ type: "success", title: "User added" });
        setAddUserOpen(false);
        setNewUserName("");
        setNewUserEmail("");
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
          <div
            className="from-primary-subtle/50 absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br to-transparent blur-3xl"
            aria-hidden="true"
          />
          <div
            className="from-accent-glow/30 absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-gradient-to-tr to-transparent blur-2xl"
            aria-hidden="true"
          />
          <div className="relative">
            <div className="text-primary mb-4 flex items-center gap-2 text-xs font-semibold tracking-widest uppercase">
              <EnterpriseIcon name="activity" size={14} />
              Administration
            </div>
            <h1 className="text-text text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-text-secondary mt-3 max-w-2xl text-base leading-relaxed">
              Platform governance overview with user directory, roles, permissions, and operational
              health.
            </p>
          </div>
        </section>

        {/* Layer 2 — Governance Summary */}
        <section className="space-y-4">
          <SectionHeader icon="barChart" title="Governance Summary" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total Users"
              value={stats.totalUsers}
              icon={<EnterpriseIcon name="users" size={20} />}
            />
            <StatCard
              label="Active Roles"
              value={stats.totalRoles}
              icon={<EnterpriseIcon name="shield" size={20} />}
            />
            <StatCard
              label="Permission Sets"
              value={stats.totalPermissions}
              icon={<EnterpriseIcon name="lock" size={20} />}
            />
            <StatCard
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
                  void loadDashboard();
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
                      <Link href={`/users/${user.id}`} className="text-primary hover:underline">
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
                      <span className="text-text-secondary text-sm">{user.status ?? "—"}</span>
                    ),
                  },
                  {
                    key: "lastActive",
                    header: "Last Active",
                    render: (user) => (
                      <span className="text-text-secondary text-sm">{user.lastActive ?? "—"}</span>
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
                setAddUserOpen(true);
              }}
            >
              Add User
            </Button>

            <Dialog
              open={addUserOpen}
              onClose={() => {
                setAddUserOpen(false);
              }}
              title="Add User"
            >
              <div className="space-y-4">
                <Input
                  label="Name"
                  value={newUserName}
                  onChange={(e) => {
                    setNewUserName(e.target.value);
                  }}
                  placeholder="Full name"
                />
                <Input
                  label="Email"
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => {
                    setNewUserEmail(e.target.value);
                  }}
                  placeholder="name@company.com"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setAddUserOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      void handleAddUser();
                    }}
                  >
                    Add User
                  </Button>
                </div>
              </div>
            </Dialog>
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
              title="Total Users"
              status="success"
              value={String(stats.totalUsers)}
              subtitle="Registered in platform"
            />
            <StatusWidget
              title="Active Roles"
              status="success"
              value={String(stats.totalRoles)}
              subtitle="Defined in system"
            />
            <StatusWidget
              title="Permission Sets"
              status="success"
              value={String(stats.totalPermissions)}
              subtitle="Configured"
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
