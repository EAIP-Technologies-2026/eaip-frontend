"use client";
import { useEffect, useState } from "react";
import { getDefaultClient } from "@eaip/api";

interface Related {
  id: string;
  type: string;
  name: string;
}

export function ShowRelated({ entityId }: { entityId: string }) {
  const [items, setItems] = useState<Related[]>([]);
  useEffect(() => {
    if (!entityId) return;
    void (async () => {
      try {
        const c = getDefaultClient();
        const r = await c.post<{ related: Related[] } | Related[]>(
          `/knowledge-graph/traversal/${encodeURIComponent(entityId)}`,
          { max_hops: 1, limit: 12 },
          { retries: 0 },
        );
        if (!r.error) {
          const arr = Array.isArray(r.data) ? r.data : (r.data as { related: Related[] }).related;
          setItems(Array.isArray(arr) ? arr : []);
        } else {
          const g = await c.get<{ entities: Related[] } | Related[]>(
            `/knowledge-graph/entities/${encodeURIComponent(entityId)}/related`,
            undefined,
            { retries: 0 },
          );
          if (!g.error) setItems([]);
        }
      } catch {
        /* intentionally empty */
      }
    })();
  }, [entityId]);
  if (!entityId) return null;
  return (
    <div className="border-border bg-surface/40 rounded-xl border p-3">
      <div className="text-xs font-semibold">Related</div>
      {!items.length ? (
        <p className="text-text-muted mt-1 text-xs">No related entities found for this node.</p>
      ) : (
        <ul className="mt-1 space-y-1">
          {items.map((x) => (
            <li key={x.id} className="text-xs">
              <a
                href={`/knowledge/graph?focus=${encodeURIComponent(x.id)}`}
                className="text-primary hover:underline"
              >
                {x.name}
              </a>{" "}
              <span className="text-text-muted">· {x.type}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
