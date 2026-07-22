"use client";

import { RequireAuth, RequireRole } from "@eaip/auth";
import { usePlatformStore } from "@eaip/state";
import { EnterpriseShell } from "@eaip/ui-enterprise";

function PermissionsPageContent() {
  const { permissions } = usePlatformStore();

  return (
    <EnterpriseShell
      appId="administration"
      pageTitle="Permissions"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Permissions" }]}
    >
      <div className="space-y-4">
        <div className="rounded-lg border p-6">
          <h2 className="text-lg font-semibold">Your Permissions</h2>
          <p className="text-sm text-gray-500">Permissions are derived from your assigned roles.</p>
        </div>
        <ul className="divide-y rounded-lg border">
          {permissions.map((permission) => (
            <li key={permission} className="px-4 py-3 text-sm font-medium text-gray-700">
              {permission}
            </li>
          ))}
        </ul>
      </div>
    </EnterpriseShell>
  );
}

export default function PermissionsPage() {
  return (
    <RequireAuth>
      <RequireRole requiredRole="admin">
        <PermissionsPageContent />
      </RequireRole>
    </RequireAuth>
  );
}
