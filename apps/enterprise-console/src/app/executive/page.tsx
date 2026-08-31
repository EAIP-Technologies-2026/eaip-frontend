"use client";
import { useState, useEffect, useCallback } from "react";
import { RequireAuth } from "@eaip/auth";
import { EnterpriseShell, Card, CardHeader, CardTitle, CardContent } from "@eaip/ui-enterprise";
import { Button, Skeleton } from "@eaip/ui-primitives";
import { EnterpriseIcon, type IconName } from "@eaip/icons";
import {
  fetchCockpit,
  fetchBriefing,
  createBriefing,
  fetchDepartments,
  fetchDepartment,
  fetchSynthetic,
} from "../../services/m9-service";

function humanize(key: string): string {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function isScalar(v: unknown): boolean {
  return v === null || ["string", "number", "boolean"].includes(typeof v);
}

function ScalarGrid({ data }: { data: Record<string, unknown> }) {
  const entries = Object.entries(data).filter(([, v]) => isScalar(v));
  if (!entries.length) return null;
  return (
    <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {entries.map(([k, v]) => (
        <div key={k} className="border-border bg-surface-secondary/40 rounded-lg border px-3 py-2">
          <div className="text-text-muted text-xs tracking-wide uppercase">{humanize(k)}</div>
          <div className="text-text text-sm font-semibold">{String(v)}</div>
        </div>
      ))}
    </div>
  );
}

function ListSection({ title, items }: { title: string; items: unknown[] }) {
  if (!items.length) return null;
  return (
    <div className="mt-3">
      <div className="text-text-muted text-xs font-semibold tracking-wide uppercase">
        {humanize(title)}
      </div>
      <ul className="mt-1 space-y-1">
        {items.slice(0, 6).map((it, i) => (
          <li key={i} className="text-text-secondary text-sm">
            • {typeof it === "string" ? it : JSON.stringify(it)}
          </li>
        ))}
      </ul>
    </div>
  );
}

function StructuredBlock({
  title,
  icon,
  data,
}: {
  title: string;
  icon: IconName;
  data: Record<string, unknown>;
}) {
  return (
    <Card liquid padding="md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <EnterpriseIcon name={icon} size={16} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScalarGrid data={data} />
        {Object.entries(data)
          .filter(([, v]) => Array.isArray(v))
          .map(([k, v]) => (
            <ListSection key={k} title={k} items={v as unknown[]} />
          ))}
      </CardContent>
    </Card>
  );
}

function ExecutiveContent() {
  const [cockpit, setCockpit] = useState<Record<string, unknown> | null>(null);
  const [briefing, setBriefing] = useState<Record<string, unknown> | null>(null);
  const [depts, setDepts] = useState<unknown[]>([]);
  const [deptView, setDeptView] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    try {
      const [c, b, d] = await Promise.all([
        fetchCockpit().catch(() => null),
        fetchBriefing().catch(() => null),
        fetchDepartments().catch(() => []),
      ]);
      setCockpit(c as Record<string, unknown>);
      setBriefing(b as Record<string, unknown>);
      setDepts(Array.isArray(d) ? d : []);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);

  const briefingSections = briefing
    ? Object.entries(briefing).filter(
        ([, v]) => v !== null && typeof v === "object" && !Array.isArray(v),
      )
    : [];

  return (
    <EnterpriseShell
      appId="enterprise-console"
      pageTitle="Executive OS"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Executive OS" }]}
    >
      <div className="space-y-8">
        <section className="surface-hero relative overflow-hidden p-8">
          <div className="text-primary mb-4 flex items-center gap-2 text-xs font-semibold tracking-widest uppercase">
            <EnterpriseIcon name="activity" size={14} />
            M9 Executive Intelligence OS
          </div>
          <h1 className="text-text text-3xl font-bold tracking-tight">Executive Cockpit</h1>
          <p className="text-text-secondary mt-3 max-w-2xl">
            Evidence-backed view: what EAIP detected, recommended, executed — and verified business
            results.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={() => {
                void (async () => {
                  const b = await createBriefing({});
                  setBriefing(b as Record<string, unknown>);
                })();
              }}
            >
              Generate Briefing
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                void fetchSynthetic("apex").then((r) => {
                  setBriefing(r as Record<string, unknown>);
                });
              }}
            >
              Apex Synthetic
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                void fetchSynthetic("meridian").then((r) => {
                  setBriefing(r as Record<string, unknown>);
                });
              }}
            >
              Meridian Synthetic
            </Button>
          </div>
        </section>

        {loading ? <Skeleton className="h-40 w-full" /> : null}

        {cockpit ? (
          <StructuredBlock title="Strategic Cockpit" icon="shield" data={cockpit} />
        ) : null}

        {briefing ? (
          briefingSections.length ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {briefingSections.map(([k, v]) => (
                <StructuredBlock
                  key={k}
                  title={humanize(k)}
                  icon={
                    (k.includes("risk")
                      ? "alert"
                      : k.includes("opportunit")
                        ? "zap"
                        : "activity") as IconName
                  }
                  data={v as Record<string, unknown>}
                />
              ))}
            </div>
          ) : (
            <StructuredBlock title="Executive Briefing" icon="activity" data={briefing} />
          )
        ) : !loading ? (
          <p className="text-text-muted text-sm">No briefing available yet — generate one above.</p>
        ) : null}

        <Card liquid padding="md">
          <CardHeader>
            <CardTitle>Departments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-3 flex flex-wrap gap-2">
              {depts.map((d: unknown) => {
                const x = d as Record<string, unknown>;
                return (
                  <Button
                    key={String(x.id)}
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      void (async () => {
                        const v = await fetchDepartment(String(x.id));
                        setDeptView(v as Record<string, unknown>);
                      })();
                    }}
                  >
                    {String(x.title)}
                  </Button>
                );
              })}
            </div>
            {deptView ? <ScalarGrid data={deptView} /> : null}
          </CardContent>
        </Card>
      </div>
    </EnterpriseShell>
  );
}
export default function ExecutivePage() {
  return (
    <RequireAuth>
      <ExecutiveContent />
    </RequireAuth>
  );
}
