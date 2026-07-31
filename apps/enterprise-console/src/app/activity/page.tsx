"use client";

import { useEffect, useState } from "react";
import { RequireAuth } from "@eaip/auth";
import { EnterpriseShell, LoadingState, ErrorState } from "@eaip/ui-enterprise";
import { ActivityFeed } from "@eaip/ui-enterprise";
import { Button, EmptyState } from "@eaip/ui-primitives";
import { EnterpriseIcon } from "@eaip/icons";
import { useRouter } from "next/navigation";
import { fetchActivityFeed } from "../../services/activity-service";
import type { ActivityItem } from "../../services/activity-service";
import { useFallback } from "../../services/fallback-context";

function ActivityContent() {
  const router = useRouter();
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setFallback } = useFallback();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchActivityFeed();
        if (cancelled) return;
        setFallback("activity", result.source === "fallback");
        setItems(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load activity");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [setFallback]);

  return (
    <EnterpriseShell
      appId="enterprise-console"
      pageTitle="Activity Feed"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Activity" }]}
    >
      <div className="space-y-8">
        <section className="surface-hero relative overflow-hidden p-8 lg:p-10">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br from-primary-subtle/50 to-transparent blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-gradient-to-tr from-accent-glow/30 to-transparent blur-2xl" aria-hidden="true" />
          <div className="relative">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-primary uppercase mb-4">
              <EnterpriseIcon name="activity" size={14} />
              Activity Stream
            </div>
            <h1 className="text-3xl font-bold text-text tracking-tight">Activity Feed</h1>
            <p className="mt-3 text-base text-text-secondary max-w-2xl leading-relaxed">Review platform activity, agent executions, and operational events.</p>
          </div>
        </section>

        {loading ? (
        <LoadingState message="Loading activity feed..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => { window.location.reload(); }} />
      ) : items.length === 0 ? (
        <EmptyState
          icon="activity"
          title="No activity recorded"
          description="Activity events will appear here once agents begin executing tasks."
          action={
            <Button variant="secondary" iconLeft="robot" onClick={() => { router.push("/agents"); }}>Browse Agents</Button>
          }
        />
      ) : (
        <div className="max-w-3xl">
          <ActivityFeed items={items as unknown as { id: string; title: string; description?: string; timestamp: string; type?: "create" | "update" | "delete" | "info"; actor?: string }[]} loading={loading} />
        </div>
      )}
      </div>
    </EnterpriseShell>
  );
}

export default function ActivityPage() {
  return (
    <RequireAuth>
      <ActivityContent />
    </RequireAuth>
  );
}
