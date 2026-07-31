"use client";

import { RequireAuth } from "@eaip/auth";
import { EnterpriseShell } from "@eaip/ui-enterprise";
import { EnterpriseIcon } from "@eaip/icons";
import { EmptyState, Button } from "@eaip/ui-primitives";
import { useRouter } from "next/navigation";

function KnowledgeContent() {
  const router = useRouter();
  return (
    <EnterpriseShell
      appId="enterprise-console"
      pageTitle="Knowledge"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Knowledge" }]}
    >
      <div className="space-y-8">
        <section className="surface-hero relative overflow-hidden p-8 lg:p-10">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br from-primary-subtle/50 to-transparent blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-gradient-to-tr from-accent-glow/30 to-transparent blur-2xl" aria-hidden="true" />
          <div className="relative">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-primary uppercase mb-4">
              <EnterpriseIcon name="activity" size={14} />
              Knowledge Base
            </div>
            <h1 className="text-3xl font-bold text-text tracking-tight">Knowledge</h1>
            <p className="mt-3 text-base text-text-secondary max-w-2xl leading-relaxed">Manage, curate, and search your organization&apos;s knowledge base to power agent reasoning and enterprise search.</p>
          </div>
        </section>

        <EmptyState
          icon="book"
          title="Knowledge Base"
          description="Manage, curate, and search your organization&apos;s knowledge base to power agent reasoning and enterprise search."
          action={
            <Button variant="secondary" iconLeft="dashboard" onClick={() => { router.push("/dashboard"); }}>Back to Dashboard</Button>
          }
        />
      </div>
    </EnterpriseShell>
  );
}

export default function KnowledgePage() {
  return (
    <RequireAuth>
      <KnowledgeContent />
    </RequireAuth>
  );
}
