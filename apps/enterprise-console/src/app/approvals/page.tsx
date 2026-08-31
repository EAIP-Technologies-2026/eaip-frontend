"use client";

import { useCallback, useEffect, useState } from "react";
import { RequireAuth } from "@eaip/auth";
import { getDefaultClient } from "@eaip/api";
import { EnterpriseShell, Card, ErrorState } from "@eaip/ui-enterprise";
import { Button, Badge } from "@eaip/ui-primitives";
import { EnterpriseIcon } from "@eaip/icons";
import { usePlatformStore } from "@eaip/state";

interface ApprovalItem {
  id: string;
  tool_name: string;
  arguments: Record<string, unknown>;
  risk: string;
  status: string;
  source: string;
  requester: string;
  tenant_id: string;
  title?: string;
  created_at?: string | null;
  reversible?: boolean;
}

interface AttentionItem {
  id: string;
  category: string;
  priority: number;
  title: string;
  why: string;
  impact?: string;
  actions?: { kind: string; approval_id?: string; ref?: string }[];
  refs?: Record<string, unknown>;
}

const TABS = [
  { key: "needs_approval", label: "Needs Approval" },
  { key: "at_risk", label: "At Risk" },
  { key: "waiting", label: "Waiting / Verify" },
  { key: "recommended", label: "Recommended" },
] as const;

function riskLabel(risk: string): {
  label: string;
  variant: "danger" | "warning" | "success" | "default";
} {
  switch (risk) {
    case "destructive":
    case "DESTRUCTIVE":
      return { label: "Destructive", variant: "danger" };
    case "action":
    case "ACTION":
      return { label: "Action", variant: "warning" };
    case "informational":
    case "INFORMATIONAL":
      return { label: "Informational", variant: "default" };
    default:
      return { label: risk || "unknown", variant: "default" };
  }
}

function ApprovalCard({
  item,
  busy,
  onApprove,
  onReject,
  onDefer,
}: {
  item: ApprovalItem;
  busy: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDefer: (id: string) => void;
}) {
  const risk = riskLabel(item.risk);
  const argEntries = Object.entries(item.arguments);
  return (
    <Card liquid padding="md" className="border-l-primary/40 border-l-2">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <EnterpriseIcon name="shield" size={16} className="text-primary" />
            <span className="text-text font-semibold">{item.title ?? item.tool_name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="primary">{item.source}</Badge>
            <Badge variant={risk.variant}>{risk.label}</Badge>
          </div>
        </div>

        <div className="text-text-secondary flex flex-wrap gap-x-6 gap-y-1 text-xs">
          <span>
            Requester: <span className="text-text font-medium">{item.requester}</span>
          </span>
          <span>
            Tenant: <span className="text-text font-medium">{item.tenant_id}</span>
          </span>
          {item.created_at ? <span>Requested: {item.created_at}</span> : null}
          {item.reversible === false ? (
            <span className="text-danger">Not reversible</span>
          ) : (
            <span>Reversible</span>
          )}
        </div>

        {argEntries.length > 0 ? (
          <div className="bg-surface-secondary/50 rounded-lg p-3 text-xs">
            <p className="text-text-muted mb-1 font-medium">Request details</p>
            <ul className="space-y-0.5">
              {argEntries.map(([k, v]) => (
                <li key={k} className="text-text-secondary">
                  <span className="text-text-muted font-medium">{k}:</span>{" "}
                  {typeof v === "string" ? v : JSON.stringify(v)}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="primary"
            disabled={busy}
            iconLeft="check"
            onClick={() => {
              onApprove(item.id);
            }}
          >
            Approve
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={busy}
            iconLeft="x"
            onClick={() => {
              onReject(item.id);
            }}
          >
            Reject
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={busy}
            onClick={() => {
              onDefer(item.id);
            }}
          >
            Defer
          </Button>
        </div>
      </div>
    </Card>
  );
}

function AttentionCard({ item }: { item: AttentionItem }) {
  const catTone: Record<string, string> = {
    at_risk: "border-l-danger/50",
    waiting: "border-l-warning/50",
    recommended: "border-l-success/50",
  };
  return (
    <Card
      liquid
      padding="md"
      className={`border-l-2 ${catTone[item.category] ?? "border-l-primary/40"}`}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <EnterpriseIcon
              name={
                item.category === "at_risk"
                  ? "alert"
                  : item.category === "recommended"
                    ? "zap"
                    : "clock"
              }
              size={16}
              className={
                item.category === "at_risk"
                  ? "text-danger"
                  : item.category === "recommended"
                    ? "text-success"
                    : "text-warning"
              }
            />
            <span className="text-text font-semibold">{item.title}</span>
          </div>
          {typeof item.priority === "number" ? (
            <Badge variant="default">P{Math.round(item.priority * 100)}</Badge>
          ) : null}
        </div>
        <p className="text-text-secondary text-xs">
          <span className="font-medium">Why:</span> {item.why}
        </p>
        {item.impact ? (
          <p className="text-xs">
            <span className="text-text-muted font-medium">Impact:</span> {item.impact}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2 pt-1">
          {(item.actions ?? []).map((a, i) =>
            a.kind === "approve" ? null : a.kind === "simulate" ? (
              <a
                key={`${a.kind}-${String(i)}`}
                href="/simulation"
                className="border-border text-text-secondary hover:border-primary/40 hover:text-primary rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors"
              >
                Simulate safely
              </a>
            ) : a.kind === "explain" && a.ref ? (
              <a
                key={`${a.kind}-${String(i)}`}
                href={`/knowledge/graph?focus=${encodeURIComponent(a.ref)}`}
                className="border-border text-text-secondary hover:border-primary/40 hover:text-primary rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors"
              >
                Why?
              </a>
            ) : (
              <button
                key={`${a.kind}-${String(i)}`}
                type="button"
                className="border-border text-text-secondary hover:border-primary/40 hover:text-primary rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors"
              >
                {a.kind}
              </button>
            ),
          )}
          {item.refs?.prediction_id ? (
            <a
              href="/dashboard"
              className="border-border text-text-secondary hover:border-primary/40 hover:text-primary rounded-lg border px-3 py-1.5 text-xs font-medium"
            >
              View storyline
            </a>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

function ApprovalsContent() {
  const addToast = usePlatformStore((s) => s.addToast);
  const [items, setItems] = useState<ApprovalItem[] | null>(null);
  const [attention, setAttention] = useState<AttentionItem[] | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("needs_approval");
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    try {
      const client = getDefaultClient();
      const res = await client.get<{ items: ApprovalItem[]; total: number }>(
        "/copilot/approval-inbox",
      );
      setItems(res.data?.items ?? []);
      const att = await client.get<{ items: AttentionItem[]; counts: Record<string, number> }>(
        "/attention",
      );
      if (!att.error && att.data) {
        setAttention((att.data as { items: AttentionItem[] }).items);
        setCounts((att.data as { counts: Record<string, number> }).counts);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load approvals");
      setItems([]);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const decide = async (id: string, action: "approve" | "reject" | "defer") => {
    setBusyId(id);
    try {
      const client = getDefaultClient();
      const path =
        action === "approve"
          ? `/copilot/approvals/${id}/approve`
          : action === "reject"
            ? `/copilot/approvals/${id}/reject`
            : `/approval-center/${id}/defer`;
      const res = await client.post(path, {});
      if (res.error) throw res.error;
      addToast({
        title: action === "approve" ? "Approved" : action === "reject" ? "Rejected" : "Deferred",
        message: `Action ${action === "approve" ? "approved and executed" : action === "reject" ? "rejected — no changes made" : "deferred"}.`,
        type: action === "reject" ? "warning" : "success",
      });
      setItems((prev) => (prev ? prev.filter((i) => i.id !== id) : prev));
      void loadAll();
    } catch (err) {
      addToast({
        title: "Action failed",
        message: err instanceof Error ? err.message : "Could not complete that action.",
        type: "error",
      });
    } finally {
      setBusyId(null);
    }
  };

  const pendingCount = items?.filter((i) => i.status === "pending").length ?? 0;
  const attentionForTab = (attention ?? []).filter((a) =>
    tab === "needs_approval" ? false : a.category === tab,
  );

  return (
    <EnterpriseShell
      appId="enterprise-console"
      pageTitle="Approvals"
      breadcrumbs={[{ label: "Governance", href: "/governance" }, { label: "Approvals" }]}
    >
      <div className="space-y-6">
        <div className="liquid-glass rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-xl">
              <EnterpriseIcon name="shield" size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-primary text-xs font-bold tracking-wider uppercase">
                  Governance
                </p>
                <Badge variant="primary">{pendingCount} pending</Badge>
              </div>
              <h1 className="text-text mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                Attention Center
              </h1>
              <p className="text-text-secondary mt-1 max-w-2xl text-sm">
                Where does a human need to intervene? Approvals, rising risks, outcomes to verify,
                and grounded recommendations — composed live from Conductor, the approval center, M2
                intelligence, and governance workflows.
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div role="tablist" aria-label="Attention categories" className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => {
                setTab(t.key);
              }}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                tab === t.key
                  ? "border-primary/60 bg-primary/10 text-primary"
                  : "border-border bg-surface/40 text-text-secondary hover:border-primary/30 hover:text-text"
              }`}
            >
              {t.label}
              {t.key === "needs_approval" && pendingCount > 0 ? (
                <span className="ml-1.5 text-xs opacity-70">({pendingCount})</span>
              ) : t.key !== "needs_approval" && counts[t.key] ? (
                <span className="ml-1.5 text-xs opacity-70">({counts[t.key]})</span>
              ) : null}
            </button>
          ))}
        </div>

        {error ? (
          <ErrorState
            title="Could not load approvals"
            message={error}
            onRetry={() => void loadAll()}
          />
        ) : items === null ? (
          <p className="text-text-muted py-8 text-center text-sm">
            Loading your attention center...
          </p>
        ) : tab === "needs_approval" ? (
          items.length === 0 ? (
            <Card liquid padding="md" className="text-center">
              <EnterpriseIcon name="checkCircle" size={20} className="text-success mx-auto" />
              <p className="text-text-secondary mt-2 text-sm">
                No pending approvals. When Conductor needs human-in-the-loop approval, it will
                appear here and on the notification bell.
              </p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {items.map((item) => (
                <ApprovalCard
                  key={`${item.source}-${item.id}`}
                  item={item}
                  busy={busyId === item.id}
                  onApprove={(id) => void decide(id, "approve")}
                  onReject={(id) => void decide(id, "reject")}
                  onDefer={(id) => void decide(id, "defer")}
                />
              ))}
            </div>
          )
        ) : attentionForTab.length === 0 ? (
          <Card liquid padding="md" className="text-center">
            <EnterpriseIcon name="checkCircle" size={20} className="text-success mx-auto" />
            <p className="text-text-secondary mt-2 text-sm">
              Nothing needs your attention in this category right now.
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {attentionForTab.map((item) => (
              <AttentionCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </EnterpriseShell>
  );
}

export default function ApprovalsPage() {
  return (
    <RequireAuth>
      <ApprovalsContent />
    </RequireAuth>
  );
}
