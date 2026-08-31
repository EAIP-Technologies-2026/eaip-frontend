"use client";

import { useEffect, useState } from "react";
import { RequireAuth } from "@eaip/auth";
import { getDefaultClient } from "@eaip/api";
import {
  EnterpriseShell,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ErrorState,
  StatCard,
} from "@eaip/ui-enterprise";
import { Badge, Skeleton } from "@eaip/ui-primitives";
import { EnterpriseIcon } from "@eaip/icons";

interface CostOverview {
  totalCost: number;
  totalRequests: number;
  totalTokens: number;
  currency: string;
}

interface CostResponse {
  overview: CostOverview;
  byModel: Record<string, { cost: number; tokens: number }>;
}

function CostIntelligenceContent() {
  const [data, setData] = useState<CostResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      const response = await getDefaultClient().get<CostResponse>("/cost/overview");
      if (cancelled) return;
      if (response.error) {
        setError(response.error.message);
        return;
      }
      setData(response.data);
    }
    void loadData().catch((reason: unknown) => {
      if (!cancelled)
        setError(reason instanceof Error ? reason.message : "Unable to load cost data");
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const [forecast, setForecast] = useState<{
    estimated_cost: number;
    forecast_next_days: number;
  } | null>(null);
  useEffect(() => {
    let cancelled = false;
    void getDefaultClient()
      .get<{ estimated_cost: number; forecast_next_days: number }>("/cost-v2/forecast", {
        days: "30",
      })
      .then((r) => {
        if (!cancelled && !r.error && r.data) setForecast(r.data);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  const overview = data?.overview;

  return (
    <EnterpriseShell
      appId="enterprise-console"
      pageTitle="Cost Intelligence"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Cost Intelligence" }]}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-text text-2xl font-bold tracking-tight">Cost Intelligence</h1>
          <p className="text-text-secondary text-sm">
            Live platform token expenditure, LLM provider spending, budgets, and forecast.
          </p>
        </div>

        {error ? <ErrorState message={error} /> : null}

        <div className="grid gap-4 md:grid-cols-4">
          <StatCard
            label="Total Spend"
            value={overview ? `${overview.currency} ${overview.totalCost.toFixed(2)}` : null}
            icon={<EnterpriseIcon name="creditCard" size={18} />}
          />
          <StatCard
            label="API Requests"
            value={overview ? overview.totalRequests.toLocaleString() : null}
            icon={<EnterpriseIcon name="activity" size={18} />}
          />
          <StatCard
            label="Token Volume"
            value={overview ? overview.totalTokens.toLocaleString() : null}
            icon={<EnterpriseIcon name="layers" size={18} />}
          />
          <StatCard
            label="30d Forecast"
            value={forecast ? `$${forecast.estimated_cost.toFixed(2)}` : null}
            icon={<EnterpriseIcon name="activity" size={18} />}
          />
        </div>

        <Card liquid padding="md">
          <CardHeader>
            <CardTitle>Top Model Cost Drivers</CardTitle>
          </CardHeader>
          <CardContent className="mt-4">
            {data ? (
              <div className="divide-border divide-y">
                {Object.entries(data.byModel).map(([model, item]) => (
                  <div key={model} className="flex items-center justify-between py-3">
                    <span className="text-text font-medium">{model}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-text-muted text-xs">
                        {item.tokens.toLocaleString()} tokens
                      </span>
                      <Badge variant="primary">${item.cost.toFixed(2)}</Badge>
                    </div>
                  </div>
                ))}
                {Object.keys(data.byModel).length === 0 ? (
                  <p className="text-text-muted text-sm">No model cost records available.</p>
                ) : null}
              </div>
            ) : (
              <Skeleton className="h-24 w-full" />
            )}
          </CardContent>
        </Card>
        {forecast ? (
          <p className="text-text-muted text-xs">
            Forecast ({forecast.forecast_next_days}d) distinct from actual — based on historical
            average.
          </p>
        ) : null}
      </div>
    </EnterpriseShell>
  );
}

export default function CostIntelligencePage() {
  return (
    <RequireAuth>
      <CostIntelligenceContent />
    </RequireAuth>
  );
}
