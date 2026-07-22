"use client";

import { RequireAuth } from "@eaip/auth";
import { EnterpriseShell } from "@eaip/ui-enterprise";

function HistoryPageContent() {
  return (
    <EnterpriseShell
      appId="mission-control"
      pageTitle="History"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "History" }]}
    >
      <div className="rounded-lg border p-6">
        <h2 className="text-lg font-semibold">Execution History</h2>
        <p className="text-sm text-gray-500">
          Global execution history will be aggregated here from workflow and agent executions.
        </p>
      </div>
    </EnterpriseShell>
  );
}

export default function HistoryPage() {
  return (
    <RequireAuth>
      <HistoryPageContent />
    </RequireAuth>
  );
}
