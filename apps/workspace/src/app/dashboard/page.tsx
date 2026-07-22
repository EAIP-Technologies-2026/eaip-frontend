"use client";

import { useEffect, useState } from "react";
import { RequireAuth, useAuth } from "@eaip/auth";
import { EnterpriseShell } from "@eaip/ui-enterprise";
import { createKnowledgeClient, type KnowledgeDocument } from "@eaip/knowledge";
import { logger } from "@eaip/logging";

function DashboardContent() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDocuments() {
      try {
        const client = createKnowledgeClient();
        const results = await client.search("*");
        setDocuments(results.map((r) => r.document));
      } catch (error) {
        logger.error("Failed to load knowledge", {
          error: error instanceof Error ? error.message : String(error),
        });
      } finally {
        setLoading(false);
      }
    }
    void loadDocuments();
  }, []);

  return (
    <EnterpriseShell appId="workspace" pageTitle="Dashboard" breadcrumbs={[{ label: "Dashboard" }]}>
      <div className="space-y-6">
        <div className="rounded-lg border p-6">
          <h2 className="text-lg font-semibold">Welcome, {user?.name}</h2>
          <p className="text-sm text-gray-500">
            Search knowledge, manage memory, and browse documents.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <a
            href="/knowledge"
            className="rounded-lg border p-4 hover:border-blue-300 hover:bg-blue-50"
          >
            <h3 className="font-medium text-gray-900">Knowledge</h3>
            <p className="text-sm text-gray-500">Search and explore knowledge base.</p>
          </a>
          <a
            href="/memory"
            className="rounded-lg border p-4 hover:border-blue-300 hover:bg-blue-50"
          >
            <h3 className="font-medium text-gray-900">Memory</h3>
            <p className="text-sm text-gray-500">Manage memory entries.</p>
          </a>
          <a
            href="/documents"
            className="rounded-lg border p-4 hover:border-blue-300 hover:bg-blue-50"
          >
            <h3 className="font-medium text-gray-900">Documents</h3>
            <p className="text-sm text-gray-500">Browse uploaded documents.</p>
          </a>
        </div>

        <div className="rounded-lg border p-6">
          <h3 className="mb-3 text-base font-medium">Recent Knowledge</h3>
          {loading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : documents.length === 0 ? (
            <p className="text-sm text-gray-500">No knowledge entries found.</p>
          ) : (
            <ul className="divide-y">
              {documents.slice(0, 5).map((document) => (
                <li key={document.id} className="py-3">
                  <p className="font-medium">{document.title}</p>
                  <p className="text-sm text-gray-500">{document.tags.join(", ")}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </EnterpriseShell>
  );
}

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardContent />
    </RequireAuth>
  );
}
