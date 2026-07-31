"use client";

import { RequireAuth } from "@eaip/auth";
import { EnterpriseShell } from "@eaip/ui-enterprise";
import { EmptyState, Button } from "@eaip/ui-primitives";
import { useRouter } from "next/navigation";

function MemoryContent() {
  const router = useRouter();
  return (
    <EnterpriseShell
      appId="enterprise-console"
      pageTitle="Memory"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Memory" }]}
    >
      <EmptyState
        icon="brain"
        title="Memory Store"
        description="View and manage agent memory, conversation history, and long-term context storage."
        action={
          <Button variant="secondary" iconLeft="dashboard" onClick={() => { router.push("/dashboard"); }}>Back to Dashboard</Button>
        }
      />
    </EnterpriseShell>
  );
}

export default function MemoryPage() {
  return (
    <RequireAuth>
      <MemoryContent />
    </RequireAuth>
  );
}
