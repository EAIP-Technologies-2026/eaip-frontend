"use client";

import { RequireAuth } from "@eaip/auth";
import { EnterpriseShell } from "@eaip/ui-enterprise";

function MissionsPageContent() {
  return (
    <EnterpriseShell
      appId="mission-control"
      pageTitle="Missions"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Missions" }]}
    >
      <div className="rounded-lg border p-6">
        <h2 className="text-lg font-semibold">Missions</h2>
        <p className="text-sm text-gray-500">
          Mission management will be integrated once the @eaip/missions package is implemented.
        </p>
      </div>
    </EnterpriseShell>
  );
}

export default function MissionsPage() {
  return (
    <RequireAuth>
      <MissionsPageContent />
    </RequireAuth>
  );
}
