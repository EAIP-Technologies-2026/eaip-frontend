"use client";

import { useEffect, useState } from "react";
import { RequireAuth } from "@eaip/auth";
import { EnterpriseShell, DataGrid, LoadingState, ErrorState } from "@eaip/ui-enterprise";
import { createKnowledgeClient, type KnowledgeDocument } from "@eaip/knowledge";
import { useDebounce } from "@eaip/hooks";
import { logger } from "@eaip/logging";

function KnowledgePageContent() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function searchDocuments() {
      if (!debouncedQuery) {
        setDocuments([]);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const client = createKnowledgeClient();
        const results = await client.search(debouncedQuery);
        setDocuments(results.map((r) => r.document));
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        logger.error("Failed to search knowledge", { error: message });
        setError(message);
      } finally {
        setLoading(false);
      }
    }
    void searchDocuments();
  }, [debouncedQuery]);

  return (
    <EnterpriseShell
      appId="workspace"
      pageTitle="Knowledge"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Knowledge" }]}
    >
      <div className="space-y-4">
        <input
          type="text"
          value={query}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setQuery(event.target.value);
          }}
          placeholder="Search knowledge..."
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />

        {loading ? (
          <LoadingState message="Searching..." />
        ) : error ? (
          <ErrorState message={error} />
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

export default function KnowledgePage() {
  return (
    <RequireAuth>
      <KnowledgePageContent />
    </RequireAuth>
  );
}
