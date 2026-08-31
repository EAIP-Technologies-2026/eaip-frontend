"use client";
import { useEffect, useState } from "react";
import { getDefaultClient } from "@eaip/api";
import { Badge } from "@eaip/ui-primitives";

interface NBA {
  id: string;
  title: string;
  rationale: string;
  recommendation: string;
  expected_impact: string;
  confidence: number;
  risk_level: string;
  track_record: string;
  requires_approval: boolean;
  approval_id?: string | null;
  grounding: string[];
}

const DISMISSED_KEY = "eaip_dismissed_nbas";

export function NextBestActions() {
  const [items, setItems] = useState<NBA[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    try {
      setDismissed(JSON.parse(localStorage.getItem(DISMISSED_KEY) ?? "[]") as string[]);
    } catch {
      /* intentionally empty */
    }
    void (async () => {
      const c = getDefaultClient();
      const r = await c.get<{ items: NBA[] }>("/next-best-actions", undefined, { retries: 0 });
      if (!r.error && Array.isArray((r.data as { items?: NBA[] }).items)) {
        setItems((r.data as { items: NBA[] }).items.slice(0, 3));
      }
    })();
  }, []);

  function dismiss(id: string) {
    const next = [...dismissed, id];
    setDismissed(next);
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(next));
  }

  const visible = items.filter((i) => !dismissed.includes(i.id));
  if (!visible.length) return null;

  return (
    <section
      className="rounded-card border-primary/20 bg-primary/[0.04] space-y-3 border p-5"
      aria-label="Next best actions"
    >
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
          <span aria-hidden>➤</span> What EAIP recommends now
        </h3>
        <span className="text-text-muted text-[11px]">grounded in live signals</span>
      </div>
      <div className="grid gap-3">
        {visible.map((nba) => (
          <div key={nba.id} className="border-border bg-surface/60 rounded-xl border p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium">{nba.title}</span>
              <Badge
                variant={
                  nba.risk_level === "high"
                    ? "danger"
                    : nba.risk_level === "medium"
                      ? "warning"
                      : "success"
                }
              >
                Risk: {nba.risk_level}
              </Badge>
              <Badge variant="glass">Confidence {Math.round(nba.confidence * 100)}%</Badge>
              {nba.requires_approval ? <Badge variant="primary">Requires approval</Badge> : null}
            </div>
            <p className="text-text-secondary mt-1.5 text-xs">
              <span className="font-medium">Why:</span> {nba.rationale}
            </p>
            {expanded === nba.id ? (
              <div className="bg-surface-secondary/50 mt-2 space-y-1 rounded-lg p-3 text-xs">
                <p>
                  <span className="font-medium">Recommendation:</span> {nba.recommendation}
                </p>
                <p>
                  <span className="font-medium">Expected impact:</span> {nba.expected_impact}
                </p>
                {nba.track_record ? (
                  <p className="text-success">
                    <span className="font-medium">Track record:</span> {nba.track_record}
                  </p>
                ) : null}
                <p className="text-text-muted">Grounded in: {nba.grounding.join(", ")}</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <a
                    href="/simulation"
                    className="border-border hover:border-primary/40 hover:text-primary rounded-lg border px-3 py-1.5 font-medium"
                  >
                    Simulate safely
                  </a>
                  {nba.approval_id ? (
                    <a
                      href="/approvals"
                      className="border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg border px-3 py-1.5 font-medium"
                    >
                      Approve
                    </a>
                  ) : null}
                  <a
                    href="/copilot"
                    className="border-border hover:border-primary/40 hover:text-primary rounded-lg border px-3 py-1.5 font-medium"
                  >
                    Ask Conductor why
                  </a>
                  <button
                    onClick={() => {
                      dismiss(nba.id);
                    }}
                    className="text-text-muted hover:text-text rounded-lg px-3 py-1.5 font-medium"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => {
                    setExpanded(nba.id);
                  }}
                  className="text-primary text-xs font-medium hover:underline"
                >
                  Why? · Simulate · Act
                </button>
                <button
                  onClick={() => {
                    dismiss(nba.id);
                  }}
                  className="text-text-muted text-xs hover:underline"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
