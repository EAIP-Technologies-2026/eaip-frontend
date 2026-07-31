"use client";

import { RequireAuth, RequireRole } from "@eaip/auth";
import { usePlatformStore } from "@eaip/state";
import { EnterpriseShell, SectionHeader } from "@eaip/ui-enterprise";
import { Badge, EmptyState } from "@eaip/ui-primitives";
import { EnterpriseIcon } from "@eaip/icons";

function getPermissionBadge(permission: string): { variant: "default" | "primary" | "success" | "danger"; label: string } {
  const prefix = permission.split(":")[0] ?? "";
  if (prefix === "admin") return { variant: "danger", label: "Admin" };
  if (prefix === "write") return { variant: "primary", label: "Write" };
  if (prefix === "manage") return { variant: "primary", label: "Manage" };
  if (prefix === "read") return { variant: "default", label: "Read" };
  return { variant: "default", label: "Access" };
}

function PermissionsPageContent() {
  const { permissions } = usePlatformStore();

  const grouped = permissions.reduce<Record<string, string[]>>((acc, p) => {
    const category = p.split(":")[0] ?? "other";
    acc[category] ??= [];
    acc[category].push(p);
    return acc;
  }, {});

  const highestAccess = permissions.some((p) => p.startsWith("admin"))
    ? "Admin"
    : permissions.some((p) => p.startsWith("write") || p.startsWith("manage"))
      ? "Write"
      : "Read";

  return (
    <EnterpriseShell
      appId="administration"
      pageTitle="Permissions"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Permissions" }]}
    >
      <div className="space-y-8">
        {/* Layer 1 — Hero */}
        <section className="surface-hero relative overflow-hidden p-8 lg:p-10">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br from-primary-subtle/50 to-transparent blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-gradient-to-tr from-accent-glow/30 to-transparent blur-2xl" aria-hidden="true" />
          <div className="relative">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-primary uppercase mb-4">
              <EnterpriseIcon name="activity" size={14} />
              Access Control
            </div>
            <h1 className="text-3xl font-bold text-text tracking-tight">Permissions</h1>
            <p className="mt-3 text-base text-text-secondary max-w-2xl leading-relaxed">Configure fine-grained permissions, access policies, and security entitlements.</p>
          </div>
        </section>

        {/* Layer 2 — Access Overview */}
        <section className="space-y-4">
          <SectionHeader icon="shield" title="Access Overview" />
          <div className="surface-card rounded-card p-6">
            <p className="text-sm text-text-secondary">
              You have <span className="font-semibold text-text">{permissions.length}</span> permissions.
              Highest access level: <span className="font-semibold text-text">{highestAccess}</span>.
            </p>
          </div>
        </section>

        {/* Layer 3 — Permission Directory */}
        <section className="space-y-4">
          <SectionHeader icon="lock" title="Permission Directory" />
          <div className="surface-card rounded-card overflow-hidden">
            {Object.keys(grouped).length === 0 ? (
              <EmptyState
                icon="shield"
                title="No permissions configured"
                description="Permissions are derived from your assigned roles. No role-based permissions are currently active."
              />
            ) : (
              <div className="divide-y divide-border">
                {Object.entries(grouped).map(([category, items]) => (
                  <div key={category}>
                    <div className="px-4 py-2 bg-surface-secondary">
                      <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">{category}</span>
                    </div>
                    <ul className="divide-y divide-border">
                      {items.map((permission) => {
                        const badge = getPermissionBadge(permission);
                        return (
                          <li
                            key={permission}
                            className="flex items-center justify-between px-4 py-3 text-sm font-medium text-text"
                          >
                            <span>{permission}</span>
                            <Badge variant={badge.variant}>{badge.label}</Badge>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </EnterpriseShell>
  );
}

export default function PermissionsPage() {
  return (
    <RequireAuth>
      <RequireRole requiredRole="admin">
        <PermissionsPageContent />
      </RequireRole>
    </RequireAuth>
  );
}
