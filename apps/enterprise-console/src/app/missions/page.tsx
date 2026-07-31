"use client";

import { RequireAuth } from "@eaip/auth";
import { EnterpriseShell } from "@eaip/ui-enterprise";
import { EmptyState, Button } from "@eaip/ui-primitives";
import { useRouter } from "next/navigation";

function MissionsContent() {
  const router = useRouter();
  return (
    <EnterpriseShell
      appId="enterprise-console"
      pageTitle="Missions"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Missions" }]}
    >
      <EmptyState
        icon="rocket"
        title="Mission Control"
        description="Plan and execute complex multi-agent missions with coordinated task distribution and real-time monitoring."
        action={
          <Button variant="secondary" iconLeft="robot" onClick={() => { router.push("/agents"); }}>Browse Agents</Button>
        }
      />
    </EnterpriseShell>
  );
}

export default function MissionsPage() {
  return (
    <RequireAuth>
      <MissionsContent />
    </RequireAuth>
  );
}
