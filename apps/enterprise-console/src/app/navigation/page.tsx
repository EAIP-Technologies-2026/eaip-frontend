"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { RequireAuth } from "@eaip/auth";
import { EnterpriseShell } from "@eaip/ui-enterprise";
import { Card, CardHeader, CardContent } from "@eaip/ui-foundation";
import { Badge, SectionTitle } from "@eaip/ui-primitives";
import { EnterpriseIcon } from "@eaip/icons";
import { routeAudit, fullNavigation, type RouteAuditEntry } from "@/lib/navigation-map";

const statusColors: Record<RouteAuditEntry["status"], string> = {
  implemented: "bg-success",
  partial: "bg-warning",
  placeholder: "bg-accent",
  planned: "bg-text-secondary",
};

const statusLabels: Record<RouteAuditEntry["status"], string> = {
  implemented: "Implemented",
  partial: "Partial",
  placeholder: "Pending",
  planned: "Planned",
};

function NavigationContent() {
  const [filter, setFilter] = useState<RouteAuditEntry["status"] | "all">("all");

  const visible = filter === "all" ? routeAudit : routeAudit.filter((r) => r.status === filter);
  const counts = useMemo(() => {
    const c = { implemented: 0, partial: 0, placeholder: 0, planned: 0 };
    for (const r of routeAudit) c[r.status]++;
    return c;
  }, []);

  return (
    <EnterpriseShell
      appId="enterprise-console"
      pageTitle="Navigation Map"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Navigation" }]}
    >
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(["implemented", "partial", "placeholder", "planned"] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => { setFilter(status === filter ? "all" : status); }}
              className={`rounded-lg border p-4 text-left transition-colors ${
                filter === status ? "border-primary bg-primary/5" : "border-border bg-surface-secondary"
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`h-2.5 w-2.5 rounded-full ${statusColors[status]}`} />
                <p className="text-sm font-medium text-text capitalize">{statusLabels[status]}</p>
              </div>
              <p className="mt-1 text-2xl font-bold text-text">{counts[status]}</p>
            </button>
          ))}
        </div>

        <Card>
          <CardHeader>
            <SectionTitle>All Routes</SectionTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {visible.map((entry) => (
                <div key={entry.path} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${statusColors[entry.status]}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        {entry.path !== "/" && !entry.path.includes("[") ? (
                          <Link href={entry.path} className="text-sm font-medium text-text hover:text-primary">
                            {entry.label}
                          </Link>
                        ) : (
                          <span className="text-sm font-medium text-text">{entry.label}</span>
                        )}
                        <code className="rounded bg-surface-tertiary px-1.5 py-0.5 text-[10px] text-text-secondary">
                          {entry.path}
                        </code>
                        {entry.icon ? <EnterpriseIcon name={entry.icon as never} size={12} /> : null}
                      </div>
                      <p className="text-xs text-text-secondary">{entry.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      entry.status === "implemented" ? "success" :
                      entry.status === "partial" ? "warning" :
                      entry.status === "placeholder" ? "danger" : "default"
                    }>
                      {statusLabels[entry.status]}
                    </Badge>
                    <span className="text-[10px] text-text-muted">Phase {entry.phase}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <SectionTitle>Module Categories</SectionTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {fullNavigation.map((cat) => (
                <Link
                  key={cat.id}
                  href={cat.href}
                  className="rounded-lg border border-border bg-surface-secondary p-4 transition-colors hover:bg-surface-tertiary"
                >
                  <div className="flex items-center gap-2">
                    <EnterpriseIcon name={cat.icon as never} size={16} />
                    <p className="text-sm font-medium text-text">{cat.label}</p>
                  </div>
                  <p className="mt-1 text-xs text-text-secondary">{cat.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {cat.items.map((item) => (
                      <Badge key={item.href} variant="default">{item.label}</Badge>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </EnterpriseShell>
  );
}

export default function NavigationPage() {
  return (
    <RequireAuth>
      <NavigationContent />
    </RequireAuth>
  );
}
