"use client";

import { RequireAuth } from "@eaip/auth";
import { EnterpriseShell } from "@eaip/ui-enterprise";
import { EmptyState, Button } from "@eaip/ui-primitives";
import { useRouter } from "next/navigation";

function RolesContent() {
  const router = useRouter();
  return (
    <EnterpriseShell
      appId="enterprise-console"
      pageTitle="Roles"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Roles" }]}
    >
      <EmptyState
        icon="shield"
        title="Role Management"
        description="Define and assign roles with granular permissions to enforce least-privilege access across your organization."
        action={
          <Button variant="secondary" iconLeft="users" onClick={() => { router.push("/administration"); }}>View Administration</Button>
        }
      />
    </EnterpriseShell>
  );
}

export default function RolesPage() {
  return (
    <RequireAuth>
      <RolesContent />
    </RequireAuth>
  );
}
