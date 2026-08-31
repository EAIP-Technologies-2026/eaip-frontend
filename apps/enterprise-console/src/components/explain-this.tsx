"use client";
import { useState } from "react";
import { getDefaultClient } from "@eaip/api";
import { Button } from "@eaip/ui-primitives";

interface ExplainResponse {
  what?: string;
  why_it_matters?: string;
  recommendation?: string;
  data_sources?: string[];
  entity?: unknown;
}

export function ExplainThis({
  entityId,
  entityType,
  label = "Explain this",
}: {
  entityId?: string;
  entityType?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<ExplainResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);
  async function load() {
    setErr(null);
    try {
      const c = getDefaultClient();
      const qs = new URLSearchParams({
        entity_id: entityId ?? "",
        entity_type: entityType ?? "",
      }).toString();
      const r = await c.get<ExplainResponse>(`/explain?${qs}`, undefined, { retries: 0 });
      if (r.error) throw r.error;
      setData(r.data);
      setOpen(true);
    } catch (e: unknown) {
      setErr(String(e));
      setOpen(true);
    }
  }
  return (
    <div className="inline-flex flex-col gap-2">
      <Button
        size="sm"
        variant="ghost"
        onClick={() => {
          void load();
        }}
        className="text-xs"
      >
        ⓘ {label}
      </Button>
      {open ? (
        <div className="border-border bg-surface rounded-xl border p-4 text-xs shadow-lg">
          {err ? (
            <p className="text-danger">{err.slice(0, 300)}</p>
          ) : !data ? (
            <p className="text-text-muted">Loading…</p>
          ) : (
            <div className="space-y-2">
              <div>
                <span className="font-medium">What this is:</span>{" "}
                {(data.what ?? "") ||
                  (data.entity != null ? JSON.stringify(data.entity) : entityId)}
              </div>
              <div>
                <span className="font-medium">Why it matters:</span> {data.why_it_matters ?? ""}
              </div>
              {data.recommendation ? (
                <div>
                  <span className="font-medium">Recommendation:</span> {data.recommendation}
                </div>
              ) : null}
              <div className="text-text-muted">Sources: {data.data_sources?.join(", ") ?? ""}</div>
              <div className="flex gap-2">
                <a href="/copilot" className="text-primary hover:underline">
                  Ask Conductor
                </a>
                <button
                  onClick={() => {
                    setOpen(false);
                  }}
                  className="text-text-muted hover:text-text"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
