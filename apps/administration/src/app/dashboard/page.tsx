"use client";

import { RequireAuth, useAuth, RequireRole } from "@eaip/auth";
import { EnterpriseShell } from "@eaip/ui-enterprise";

function DashboardContent() {
  const { user } = useAuth();

  return (
    <EnterpriseShell
      appId="administration"
      pageTitle="Dashboard"
      breadcrumbs={[{ label: "Dashboard" }]}
    >
      <div className="space-y-6">
        <div className="rounded-lg border p-6">
          <h2 className="text-lg font-semibold">Welcome, {user?.name}</h2>
          <p className="text-sm text-gray-500">Manage users, roles, and platform permissions.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <a
            href="/users"
            className="rounded-lg border p-4 hover:border-orange-300 hover:bg-orange-50"
          >
            <h3 className="font-medium text-gray-900">Users</h3>
            <p className="text-sm text-gray-500">Manage platform users.</p>
          </a>
          <a
            href="/roles"
            className="rounded-lg border p-4 hover:border-orange-300 hover:bg-orange-50"
          >
            <h3 className="font-medium text-gray-900">Roles</h3>
            <p className="text-sm text-gray-500">Configure roles.</p>
          </a>
          <a
            href="/permissions"
            className="rounded-lg border p-4 hover:border-orange-300 hover:bg-orange-50"
          >
            <h3 className="font-medium text-gray-900">Permissions</h3>
            <p className="text-sm text-gray-500">Review permissions.</p>
          </a>
        </div>
      </div>
    </EnterpriseShell>
  );
}

export default function DashboardPage() {
  return (
    <RequireAuth>
      <RequireRole requiredRole="admin">
        <DashboardContent />
      </RequireRole>
    </RequireAuth>
  );
}
