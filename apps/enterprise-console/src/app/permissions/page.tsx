"use client";

import { RequireAuth } from "@eaip/auth";
import { EnterpriseShell } from "@eaip/ui-enterprise";
import { EmptyState, Button } from "@eaip/ui-primitives";
import { useRouter } from "next/navigation";

function PermissionsContent() {
  const router = useRouter();
  return (
    <EnterpriseShell
      appId="enterprise-console"
      pageTitle="Permissions"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Permissions" }]}
    >
      <EmptyState
        icon="key"
        title="Permission Management"
        description="Configure fine-grained access control policies and resource-level permissions for agents and users."
        action={
          <Button variant="secondary" iconLeft="users" onClick={() => { router.push("/administration"); }}>View Administration</Button>
        }
      />
    </EnterpriseShell>
  );
}

export default function PermissionsPage() {
  return (
    <RequireAuth>
      <PermissionsContent />
    </RequireAuth>
  );
}
