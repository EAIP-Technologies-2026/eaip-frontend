"use client";

import { RequireAuth } from "@eaip/auth";
import { EnterpriseShell } from "@eaip/ui-enterprise";
import { EmptyState, Button } from "@eaip/ui-primitives";
import { useRouter } from "next/navigation";

function WorkflowsContent() {
  const router = useRouter();
  return (
    <EnterpriseShell
      appId="enterprise-console"
      pageTitle="Workflows"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Workflows" }]}
    >
      <EmptyState
        icon="workflow"
        title="Workflow Engine"
        description="Design, deploy, and monitor automated agent workflows to orchestrate multi-step processes across your enterprise."
        action={
          <Button variant="secondary" iconLeft="robot" onClick={() => { router.push("/agents"); }}>Browse Agents</Button>
        }
      />
    </EnterpriseShell>
  );
}

export default function WorkflowsPage() {
  return (
    <RequireAuth>
      <WorkflowsContent />
    </RequireAuth>
  );
}
