"use client";
import { useEffect, useState } from "react";
import { getDefaultClient } from "@eaip/api";
import { VerifiedOutcomeBadge } from "./verified-outcome-badge";

interface Pred {
  prediction_id: string;
  target_entity: string;
  metric: string;
  predicted_value: unknown;
  actual_outcome: unknown;
  prediction_error: unknown;
  accuracy: number | null;
  verification_status: string;
  synthetic: boolean;
  business_impact?: string;
  confidence: number;
}

export function ImpactMarkers({ entityId }: { entityId?: string }) {
  const [preds, setPreds] = useState<Pred[]>([]);
  useEffect(() => {
    void (async () => {
      const c = getDefaultClient();
      const r = await c.get<Pred[]>("/m2/predictions", undefined, { retries: 0 });
      if (!r.error && Array.isArray(r.data)) {
        const arr = r.data.filter((p) => !entityId || p.target_entity === entityId);
        setPreds(arr.slice(0, 6));
      }
    })();
  }, [entityId]);
  if (!preds.length) return null;
  return (
    <div className="flex flex-wrap gap-2 py-2">
      {preds.map((p) => (
        <span
          key={p.prediction_id}
          className="border-border bg-surface/60 inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px]"
        >
          <span className="font-medium">{p.metric}</span>
          <VerifiedOutcomeBadge
            status={p.verification_status}
            accuracyPct={p.accuracy != null ? Math.round(p.accuracy * 1000) / 10 : null}
            predicted={p.predicted_value}
            actual={p.actual_outcome}
          />
        </span>
      ))}
    </div>
  );
}
