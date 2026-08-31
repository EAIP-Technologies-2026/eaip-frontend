"use client";
import { useEffect, useState } from "react";
import { getDefaultClient } from "@eaip/api";
import { Badge } from "@eaip/ui-primitives";

interface StoryItem {
  id: string;
  ts: string | null;
  source: string;
  kind: string;
  signal: string;
  insight: string;
  foresight: string;
  action: string;
  governance: unknown;
  outcome: string | null;
  verification: unknown;
  refs: Record<string, unknown>;
}

export function StorylineFeed({ onShowOnMap }: { onShowOnMap?: (id: string) => void }) {
  const [items, setItems] = useState<StoryItem[]>([]);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    void (async () => {
      try {
        const c = getDefaultClient();
        const r = await c.get<{ items: StoryItem[] }>("/storyline", undefined, { retries: 0 });
        if (r.error) throw r.error;
        setItems((r.data as { items: StoryItem[] }).items);
      } catch (e: unknown) {
        setErr(String(e));
      }
    })();
  }, []);
  if (err)
    return (
      <div className="border-border text-text-muted rounded-lg border p-4 text-sm">
        Storyline unavailable — {err}
      </div>
    );
  if (!items.length)
    return (
      <div className="border-border text-text-muted rounded-lg border p-4 text-sm">
        No storyline items yet — seed data and refresh.
      </div>
    );
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-tight">What changed today</h3>
        <span className="text-text-muted text-xs">{items.length} items</span>
      </div>
      <ol className="space-y-3">
        {items.map((it) => (
          <li key={it.id} className="border-border bg-surface/50 rounded-xl border p-4">
            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              <Badge variant="glass" className="text-[10px]">
                {it.kind}
              </Badge>
              <span className="text-text-muted">{it.source}</span>
              {it.ts ? (
                <span className="text-text-muted">{new Date(it.ts).toLocaleString()}</span>
              ) : null}
            </div>
            <p className="mt-2 text-sm leading-snug font-medium">{it.signal}</p>
            {it.insight ? (
              <p className="text-text-secondary mt-1 text-xs">
                <span className="font-medium">Insight:</span> {it.insight}
              </p>
            ) : null}
            {it.foresight ? (
              <p className="text-text-secondary mt-1 text-xs">
                <span className="font-medium">Foresight:</span> {it.foresight}
              </p>
            ) : null}
            <p className="mt-1 text-xs">
              <span className="font-medium">Action:</span> {it.action}
            </p>
            {it.outcome ? (
              <p className="text-success mt-1 text-xs">
                <span className="font-medium">Outcome:</span> {it.outcome}
              </p>
            ) : null}
            {it.verification && typeof it.verification === "object" ? (
              <p className="text-text-muted mt-1 text-[11px]">
                Verification: {(it.verification as Record<string, unknown>).status as string}{" "}
                {(it.verification as Record<string, unknown>).accuracy_pct
                  ? `· ${String((it.verification as Record<string, unknown>).accuracy_pct)}% accuracy`
                  : ""}
              </p>
            ) : null}
            <div className="mt-2 flex gap-2">
              {(it.refs.target_entity as string) || (it.refs.prediction_id as string) ? (
                <button
                  onClick={() =>
                    onShowOnMap?.(String(it.refs.target_entity ?? it.refs.prediction_id))
                  }
                  className="text-primary text-xs hover:underline"
                >
                  Show on map
                </button>
              ) : null}
              {(it.refs.prediction_id as string) ? (
                <span className="text-text-muted text-[11px]">
                  · {String(it.refs.prediction_id)}
                </span>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
