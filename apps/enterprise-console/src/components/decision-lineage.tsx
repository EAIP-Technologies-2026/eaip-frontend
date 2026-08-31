"use client";
import { useEffect, useState } from "react";
import { getDefaultClient } from "@eaip/api";

interface Lineage {
  decision_id: string;
  decision_type: string;
  signal: { summary: string; source_signal: string };
  evidence: unknown[];
  assumptions: unknown[];
  alternatives: unknown[];
  simulation: unknown;
  prediction: unknown;
  risk: unknown;
  approval: unknown;
  selected_option: string;
  execution: Record<string, unknown>;
  actual_outcome: unknown;
  accuracy: number | null;
  audit_proof: unknown[];
  verification_status: string;
}

export function DecisionLineage({ decisionId }: { decisionId: string }) {
  const [data, setData] = useState<Lineage | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    void (async () => {
      try {
        const c = getDefaultClient();
        const r = await c.get<Lineage>(
          `/lineage/decision/${encodeURIComponent(decisionId)}`,
          undefined,
          { retries: 0 },
        );
        if (r.error) throw r.error;
        setData(r.data);
      } catch (e: unknown) {
        setErr(String(e));
      }
    })();
  }, [decisionId]);
  if (err)
    return <div className="text-danger text-xs">Lineage unavailable — {err.slice(0, 180)}</div>;
  if (!data) return <div className="text-text-muted text-xs">Loading lineage…</div>;
  const Row = ({ k, v }: { k: string; v: unknown }) => (
    <div className="border-border/50 flex gap-3 border-b py-2 text-xs">
      <span className="text-text-muted w-28 shrink-0 font-medium">{k}</span>
      <span className="text-text-secondary break-words">
        {typeof v === "string" ? v : JSON.stringify(v ?? "").slice(0, 500)}
      </span>
    </div>
  );
  return (
    <div className="border-border bg-surface/40 rounded-xl border p-4">
      <div className="mb-2 text-xs font-semibold">Decision lineage — {data.decision_type}</div>
      <Row k="SIGNAL" v={data.signal.summary} />
      <Row k="EVIDENCE" v={data.evidence.join("; ")} />
      <Row k="ASSUMPTIONS" v={data.assumptions.join("; ")} />
      <Row k="ALTERNATIVES" v={JSON.stringify(data.alternatives).slice(0, 400)} />
      <Row k="SIMULATION" v={JSON.stringify(data.simulation ?? {})} />
      <Row k="PREDICTION" v={JSON.stringify(data.prediction ?? {})} />
      <Row k="RISK" v={JSON.stringify(data.risk ?? {})} />
      <Row k="APPROVAL" v={JSON.stringify(data.approval ?? {})} />
      <Row k="SELECTED" v={data.selected_option} />
      <Row k="EXECUTION" v={JSON.stringify(data.execution)} />
      <Row k="ACTUAL OUTCOME" v={JSON.stringify(data.actual_outcome ?? {})} />
      <Row k="ACCURACY" v={String(data.accuracy ?? "")} />
      <Row k="AUDIT PROOF" v={`${String(data.audit_proof.length)} chain records`} />
      <div className="mt-3 flex gap-2">
        <a
          href={`/decisions?decision_id=${encodeURIComponent(decisionId)}`}
          className="text-primary text-xs hover:underline"
        >
          Open decision
        </a>
        {data.actual_outcome ? (
          <span className="text-success text-xs">Verification: {data.verification_status}</span>
        ) : null}
      </div>
    </div>
  );
}
