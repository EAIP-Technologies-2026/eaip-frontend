"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { RequireAuth } from "@eaip/auth";
import { EnterpriseShell } from "@eaip/ui-enterprise";
import { Card, CardHeader, CardContent } from "@eaip/ui-foundation";
import { Badge, SectionTitle, EmptyState, Button } from "@eaip/ui-primitives";
import { MetricCard } from "@eaip/ui-visualizations";
import { EnterpriseIcon } from "@eaip/icons";
import { useRouter } from "next/navigation";
import { fetchAdminUsers } from "../../services/administration-service";
import type { AdminUser } from "../../services/administration-service";

function AdministrationContent() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchAdminUsers();
        if (cancelled) return;
        if (result.error) throw new Error(result.error);
        setUsers(result.data);
        setTotalUsers(result.data.length);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load administration data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  const activeUsers = users.filter((u) => u.status === "active").length;
  const adminUsers = users.filter((u) => u.roles.includes("admin")).length;

  const rolesSummary = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const u of users) {
      for (const r of u.roles) {
        counts[r] = (counts[r] ?? 0) + 1;
      }
    }
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [users]);

  return (
    <EnterpriseShell
      appId="enterprise-console"
      pageTitle="Administration"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Administration" }]}
    >
      <div className="space-y-8">
        <section className="surface-hero relative overflow-hidden p-8 lg:p-10">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br from-primary-subtle/50 to-transparent blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-gradient-to-tr from-accent-glow/30 to-transparent blur-2xl" aria-hidden="true" />
          <div className="relative">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-primary uppercase mb-4">
              <EnterpriseIcon name="activity" size={14} />
              Platform Administration
            </div>
            <h1 className="text-3xl font-bold text-text tracking-tight">Administration</h1>
            <p className="mt-3 text-base text-text-secondary max-w-2xl leading-relaxed">Oversee users, roles, permissions, and platform governance.</p>
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Total Users" value={totalUsers} icon="users" />
          <MetricCard label="Active" value={activeUsers} icon="check" />
          <MetricCard label="Administrators" value={adminUsers} icon="shield" />
          <MetricCard label="Departments" value={Array.from(new Set(users.map((u) => u.department).filter(Boolean))).length} icon="building" />
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <SectionTitle>Quick Management</SectionTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Link href="/users" className="card-hover-lift flex items-center gap-3 rounded-card border border-border bg-surface-secondary p-4 transition-smooth hover:border-border-strong">
                <div className="flex h-10 w-10 items-center justify-center rounded-button bg-primary-subtle text-primary">
                  <EnterpriseIcon name="users" size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium text-text">Users</p>
                  <p className="text-xs text-text-secondary">Manage user accounts</p>
                </div>
              </Link>
              <Link href="/roles" className="card-hover-lift flex items-center gap-3 rounded-card border border-border bg-surface-secondary p-4 transition-smooth hover:border-border-strong">
                <div className="flex h-10 w-10 items-center justify-center rounded-button bg-success-subtle text-success">
                  <EnterpriseIcon name="shield" size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium text-text">Roles</p>
                  <p className="text-xs text-text-secondary">Configure access roles</p>
                </div>
              </Link>
              <Link href="/permissions" className="card-hover-lift flex items-center gap-3 rounded-card border border-border bg-surface-secondary p-4 transition-smooth hover:border-border-strong">
                <div className="flex h-10 w-10 items-center justify-center rounded-button bg-warning-subtle text-warning">
                  <EnterpriseIcon name="key" size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium text-text">Permissions</p>
                  <p className="text-xs text-text-secondary">Set access policies</p>
                </div>
              </Link>
              <Link href="/settings" className="card-hover-lift flex items-center gap-3 rounded-card border border-border bg-surface-secondary p-4 transition-smooth hover:border-border-strong">
                <div className="flex h-10 w-10 items-center justify-center rounded-button bg-surface-tertiary text-text-secondary">
                  <EnterpriseIcon name="settings" size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium text-text">Settings</p>
                  <p className="text-xs text-text-secondary">Application configuration</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <SectionTitle>Recent Users</SectionTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="skeleton h-12" />
            ))}
          </div>
            ) : error ? (
              <EmptyState icon="alert" title="Failed to load users" description={error} />
            ) : users.length === 0 ? (
              <EmptyState
                icon="users"
                title="No users yet"
                description="Users will appear here once they join the platform."
                action={
                  <Button variant="secondary" iconLeft="settings" size="sm" onClick={() => { router.push("/settings"); }}>Go to Settings</Button>
                }
              />
            ) : (
              <div className="divide-y divide-border">
                {users.slice(0, 10).map((user) => (
                  <div key={user.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text">{user.name}</p>
                        <p className="text-xs text-text-secondary">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {user.department ? (
                        <span className="text-xs text-text-secondary">{user.department}</span>
                      ) : null}
                      <div className="flex gap-1">
                        {user.roles.map((role) => (
                          <Badge key={role} variant={role === "admin" ? "primary" : "default"}>{role}</Badge>
                        ))}
                      </div>
                      <Badge variant={user.status === "active" ? "success" : user.status === "inactive" ? "warning" : "danger"}>
                        {user.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <SectionTitle>Role Distribution</SectionTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              {rolesSummary.map((role) => (
                <div key={role.name} className="rounded-lg border border-border bg-surface-secondary p-4">
                  <p className="text-2xl font-bold text-text">{role.value}</p>
                  <p className="text-xs capitalize text-text-secondary">{role.name}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </EnterpriseShell>
  );
}

export default function AdministrationPage() {
  return (
    <RequireAuth>
      <AdministrationContent />
    </RequireAuth>
  );
}
