"use client";

import { useEffect, useState } from "react";
import { RequireAuth } from "@eaip/auth";
import { EnterpriseShell, DataGrid, LoadingState, ErrorState } from "@eaip/ui-enterprise";
import { createKnowledgeClient, type KnowledgeDocument } from "@eaip/knowledge";
import { logger } from "@eaip/logging";

function DocumentsPageContent() {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDocuments() {
      try {
        const client = createKnowledgeClient();
        const results = await client.search("*");
        setDocuments(results.map((r) => r.document));
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        logger.error("Failed to load documents", { error: message });
        setError(message);
      } finally {
        setLoading(false);
      }
    }
    void loadDocuments();
  }, []);

  return (
    <EnterpriseShell
      appId="workspace"
      pageTitle="Documents"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Documents" }]}
    >
      <div className="space-y-4">
        {loading ? (
          <LoadingState message="Loading documents..." />
        ) : error ? (
          <ErrorState
            message={error}
            onRetry={() => {
              window.location.reload();
            }}
          />
        ) : (
          <DataGrid
            data={documents}
            keyExtractor={(document) => document.id}
            columns={[
              { key: "title", header: "Title" },
              { key: "tags", header: "Tags", render: (document) => document.tags.join(", ") },
              { key: "createdAt", header: "Created" },
            ]}
          />
        )}
      </div>
    </EnterpriseShell>
  );
}

export default function DocumentsPage() {
  return (
    <RequireAuth>
      <DocumentsPageContent />
    </RequireAuth>
  );
}
