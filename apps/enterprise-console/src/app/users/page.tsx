"use client";

import { RequireAuth } from "@eaip/auth";
import { EnterpriseShell } from "@eaip/ui-enterprise";
import { EmptyState, Button } from "@eaip/ui-primitives";
import { useRouter } from "next/navigation";

function UsersContent() {
  const router = useRouter();
  return (
    <EnterpriseShell
      appId="enterprise-console"
      pageTitle="Users"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Users" }]}
    >
      <EmptyState
        icon="users"
        title="User Management"
        description="Manage users, roles, and permissions across the platform with fine-grained access control."
        action={
          <Button variant="secondary" iconLeft="users" onClick={() => { router.push("/administration"); }}>View Administration</Button>
        }
      />
    </EnterpriseShell>
  );
}

export default function UsersPage() {
  return (
    <RequireAuth>
      <UsersContent />
    </RequireAuth>
  );
}
