"use client";

import { useEffect, useState, useCallback } from "react";
import { RequireAuth, RequireRole } from "@eaip/auth";
import { usePlatformStore } from "@eaip/state";
import { EnterpriseShell, LoadingState, ErrorState } from "@eaip/ui-enterprise";
import { Button, Badge } from "@eaip/ui-primitives";
import { Card, CardContent } from "@eaip/ui-foundation";
import { fetchFeatureFlags, toggleFeatureFlag } from "../../services/admin-service";

interface FeatureFlag {
  name: string;
  enabled: boolean;
}

function FeatureFlagsContent() {
  const addToast = usePlatformStore((state) => state.addToast);
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFeatureFlags();
      if (result.error) {
        setError(result.error);
      } else {
        setFlags(result.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load feature flags");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleToggle = async (flagName: string) => {
    try {
      const result = await toggleFeatureFlag(flagName);
      if (result.error) throw new Error(result.error);
      addToast({
        type: "success",
        title: "Flag Toggled",
        message: `Feature flag "${flagName}" is now ${result.data.enabled ? "enabled" : "disabled"}.`,
      });
      void load();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      addToast({ type: "error", title: "Failed to toggle flag", message });
    }
  };

  return (
    <EnterpriseShell
      appId="administration"
      pageTitle="Feature Flags"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Feature Flags" }]}
    >
      <div className="space-y-8">
        <section className="surface-hero relative overflow-hidden p-8 lg:p-10">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br from-primary-subtle/50 to-transparent blur-3xl" aria-hidden="true" />
          <div className="relative">
            <h1 className="text-3xl font-bold text-text tracking-tight">Feature Flags</h1>
            <p className="mt-3 text-base text-text-secondary max-w-2xl leading-relaxed">Toggle and manage runtime system feature overrides.</p>
          </div>
        </section>

        <div className="flex justify-end">
          <Button variant="secondary" onClick={() => { void load(); }}>Refresh</Button>
        </div>

        {loading ? (
          <LoadingState message="Loading feature flags..." />
        ) : error ? (
          <ErrorState message={error} onRetry={() => { void load(); }} />
        ) : flags.length === 0 ? (
          <Card>
            <CardContent>
              <div className="text-center py-6 text-text-secondary">No feature flags registered.</div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent>
              <div className="divide-y divide-border">
                {flags.map((flag) => (
                  <div key={flag.name} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                    <div>
                      <span className="font-semibold text-text">{flag.name}</span>
                      <div className="mt-1">
                        <Badge variant={flag.enabled ? "success" : "default"}>
                          {flag.enabled ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                    </div>
                    <Button variant={flag.enabled ? "secondary" : "primary"} onClick={() => { void handleToggle(flag.name); }}>
                      Toggle
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </EnterpriseShell>
  );
}

export default function FeatureFlagsPage() {
  return (
    <RequireAuth>
      <RequireRole requiredRole="admin">
        <FeatureFlagsContent />
      </RequireRole>
    </RequireAuth>
  );
}
