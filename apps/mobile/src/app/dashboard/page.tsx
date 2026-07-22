"use client";

import { RequireAuth, useAuth } from "@eaip/auth";
import { EnterpriseShell } from "@eaip/ui-enterprise";

function DashboardContent() {
  const { user } = useAuth();

  return (
    <EnterpriseShell appId="mobile" pageTitle="Mobile" breadcrumbs={[{ label: "Dashboard" }]}>
      <div className="space-y-6">
        <div className="rounded-lg border p-6">
          <h2 className="text-lg font-semibold">Welcome, {user?.name}</h2>
          <p className="text-sm text-gray-500">Access memory and quick actions on the go.</p>
        </div>

        <div className="grid gap-4">
          <a
            href="/memory"
            className="rounded-lg border p-4 hover:border-pink-300 hover:bg-pink-50"
          >
            <h3 className="font-medium text-gray-900">Memory</h3>
            <p className="text-sm text-gray-500">View memory entries.</p>
          </a>
          <a
            href="/actions"
            className="rounded-lg border p-4 hover:border-pink-300 hover:bg-pink-50"
          >
            <h3 className="font-medium text-gray-900">Quick Actions</h3>
            <p className="text-sm text-gray-500">Run common tasks.</p>
          </a>
        </div>
      </div>
    </EnterpriseShell>
  );
}

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardContent />
    </RequireAuth>
  );
}
