"use client";
import { useEffect, useState } from "react";
import { getDefaultClient } from "@eaip/api";

type OverlayKey = "risks" | "missions" | "approvals" | "events" | "kpis" | "health";
const KEYS: { key: OverlayKey; label: string }[] = [
  { key: "risks", label: "Risks" },
  { key: "missions", label: "Missions" },
  { key: "approvals", label: "Approvals" },
  { key: "events", label: "Events" },
  { key: "kpis", label: "KPIs" },
  { key: "health", label: "Health" },
];

export function LivingMapOverlays({
  onFilterChange,
}: {
  onFilterChange?: (active: Record<OverlayKey, boolean>) => void;
}) {
  const [active, setActive] = useState<Record<OverlayKey, boolean>>({
    risks: true,
    missions: true,
    approvals: true,
    events: true,
    kpis: true,
    health: false,
  });
  const [counts, setCounts] = useState<Record<string, number>>({});
  useEffect(() => {
    void (async () => {
      const c = getDefaultClient();
      const entries: [string, string][] = [
        ["risks", "/m2/radar"],
        ["approvals", "/approval-center"],
        ["events", "/m2/events"],
        ["kpis", "/m2/predictions"],
      ];
      const out: Record<string, number> = {};
      for (const [k, path] of entries) {
        try {
          const r = await c.get<unknown[]>(path, undefined, { retries: 0 });
          if (!r.error && Array.isArray(r.data)) out[k] = r.data.length;
        } catch {
          /* intentionally empty */
        }
      }
      setCounts(out);
    })();
  }, []);
  function toggle(k: OverlayKey) {
    setActive((prev) => {
      const next = { ...prev, [k]: !prev[k] };
      onFilterChange?.(next);
      return next;
    });
  }
  return (
    <div className="border-border bg-surface/50 rounded-xl border p-3">
      <div className="text-xs font-semibold">Overlays</div>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {KEYS.map(({ key, label }) => (
          <label
            key={key}
            className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs ${active[key] ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-surface/40 text-text-muted"}`}
          >
            <input
              type="checkbox"
              checked={active[key]}
              onChange={() => {
                toggle(key);
              }}
              className="h-3 w-3"
            />
            {label}{" "}
            {counts[key] != null ? (
              <span className="text-[10px] opacity-70">({counts[key]})</span>
            ) : null}
          </label>
        ))}
      </div>
      <p className="text-text-muted mt-2 text-[11px]">
        Toggle risk, mission, approval, event, KPI, and health overlays on the knowledge graph.
      </p>
    </div>
  );
}
