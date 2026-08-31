"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { EnterpriseIcon } from "@eaip/icons";
import { Badge } from "@eaip/ui-primitives";

interface Briefing {
  summary: string;
  agents_summary: string;
  workflows_summary: string;
  automations_summary: string;
}

interface RadarEntry {
  radar_id?: string;
  id?: string;
  type: string;
  category: string;
  title: string;
  score: number;
  factors?: string[];
}

interface InboxItem {
  id: string;
  tool_name: string;
  source: string;
  risk: string;
  title?: string;
}

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token =
    localStorage.getItem("eaip_access_token") ??
    localStorage.getItem("eaip_token") ??
    localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function getJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export function EnterprisePulse() {
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [risks, setRisks] = useState<RadarEntry[]>([]);
  const [approvals, setApprovals] = useState<InboxItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [b, radar, inbox] = await Promise.all([
      getJson<Briefing>("/api/copilot/briefing"),
      getJson<RadarEntry[]>("/api/m2/radar"),
      getJson<{ items: InboxItem[] }>("/api/copilot/approval-inbox"),
    ]);
    setBriefing(b);
    setRisks(Array.isArray(radar) ? radar.sort((a, b) => b.score - a.score).slice(0, 4) : []);
    setApprovals(inbox?.items ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => {
      void load();
    }, 30000);
    return () => {
      window.clearInterval(timer);
    };
  }, [load]);

  const riskCount = risks.length;
  const approvalCount = approvals.length;

  if (loading) {
    return (
      <section className="rounded-card border-border bg-surface text-text-muted border p-4 text-sm">
        Reading the enterprise pulse...
      </section>
    );
  }

  const healthWord = riskCount <= 1 ? "stable" : riskCount <= 3 ? "monitoring" : "under pressure";

  return (
    <section className="liquid-glass rounded-2xl p-5 sm:p-6">
      {/* Enterprise Pulse strip */}
      <div className="border-border/50 flex flex-wrap items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-2">
          <EnterpriseIcon name="activity" size={16} className="text-primary" />
          <p className="text-primary text-xs font-bold tracking-wider uppercase">
            Enterprise Pulse
          </p>
        </div>
        <div className="text-text-secondary text-sm">
          Operations <span className="text-text font-semibold">{healthWord}</span>
          <span className="text-border mx-2">·</span>
          {riskCount > 0 ? (
            <span>
              <span className="text-warning font-semibold">
                {riskCount} risk{riskCount > 1 ? "s" : ""}
              </span>{" "}
              rising
            </span>
          ) : (
            <span>no critical risks</span>
          )}
          <span className="text-border mx-2">·</span>
          <Link href="/approvals" className="text-primary font-semibold hover:underline">
            {approvalCount} decision{approvalCount === 1 ? "" : "s"} need you
          </Link>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {/* What changed / briefing summary */}
        <div className="md:col-span-2">
          <p className="text-text-muted text-xs font-bold tracking-wider uppercase">
            What happened
          </p>
          <p className="text-text mt-2 text-sm leading-relaxed">
            {briefing?.summary ??
              "No briefing is available yet — the platform will compose one as it observes activity."}
          </p>
          {briefing ? (
            <div className="text-text-secondary mt-3 flex flex-wrap gap-2 text-xs">
              <span className="bg-surface-secondary/60 rounded px-2 py-1">
                {briefing.agents_summary}
              </span>
              <span className="bg-surface-secondary/60 rounded px-2 py-1">
                {briefing.workflows_summary}
              </span>
              <span className="bg-surface-secondary/60 rounded px-2 py-1">
                {briefing.automations_summary}
              </span>
            </div>
          ) : null}
        </div>

        {/* Approvals needed */}
        <div className="border-border/60 bg-surface-secondary/30 rounded-lg border p-3">
          <p className="text-text-muted text-xs font-bold tracking-wider uppercase">
            Needs your approval
          </p>
          {approvalCount === 0 ? (
            <p className="text-text-secondary mt-2 text-sm">Nothing pending. All is governed.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {approvals.slice(0, 3).map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-2 text-xs">
                  <Link
                    href="/approvals"
                    className="text-text hover:text-primary flex items-center gap-1.5"
                  >
                    <EnterpriseIcon name="shield" size={12} className="text-primary" />
                    <span className="line-clamp-1">{a.title ?? a.tool_name}</span>
                  </Link>
                  <Badge
                    variant={
                      a.risk === "destructive" || a.risk === "DESTRUCTIVE" ? "danger" : "warning"
                    }
                  >
                    {a.source}
                  </Badge>
                </li>
              ))}
              {approvalCount > 3 ? (
                <li className="text-text-muted text-xs">+ {approvalCount - 3} more</li>
              ) : null}
            </ul>
          )}
        </div>
      </div>

      {/* Top risks */}
      {risks.length > 0 ? (
        <div className="mt-4">
          <p className="text-text-muted text-xs font-bold tracking-wider uppercase">Risks rising</p>
          <div className="mt-2 grid min-w-0 gap-2 sm:grid-cols-2">
            {risks.map((r) => (
              <Link
                key={r.radar_id ?? r.id ?? r.title}
                href="/simulation"
                className="border-border/60 bg-surface-secondary/30 transition-smooth hover:border-warning/40 flex min-w-0 items-center gap-3 overflow-hidden rounded-lg border p-3"
              >
                <div className="bg-warning/15 text-warning flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                  <EnterpriseIcon name="alert" size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-text truncate text-sm font-medium">{r.title}</p>
                  <p className="text-text-muted text-xs capitalize">{r.category}</p>
                </div>
                <span className="text-warning shrink-0 text-sm font-semibold">
                  {Math.round(r.score * 100)}%
                </span>
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      {!briefing && risks.length === 0 && approvalCount === 0 ? (
        <p className="text-text-muted mt-4 text-xs">
          Briefing composing from live system state — connect the platform backend to see real
          signals.
        </p>
      ) : null}
    </section>
  );
}
