"use client";

import { RequireAuth } from "@eaip/auth";
import { EnterpriseShell } from "@eaip/ui-enterprise";
import { EmptyState, Button } from "@eaip/ui-primitives";
import { useRouter } from "next/navigation";

function DocumentsContent() {
  const router = useRouter();
  return (
    <EnterpriseShell
      appId="enterprise-console"
      pageTitle="Documents"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Documents" }]}
    >
      <EmptyState
        icon="folder"
        title="Document Management"
        description="Upload, organize, and search documents for use by agents and workflows across your enterprise."
        action={
          <Button variant="secondary" iconLeft="dashboard" onClick={() => { router.push("/dashboard"); }}>Back to Dashboard</Button>
        }
      />
    </EnterpriseShell>
  );
}

export default function DocumentsPage() {
  return (
    <RequireAuth>
      <DocumentsContent />
    </RequireAuth>
  );
}
