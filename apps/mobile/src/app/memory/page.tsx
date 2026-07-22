"use client";

import { useEffect, useState } from "react";
import { RequireAuth } from "@eaip/auth";
import { EnterpriseShell, DataGrid, LoadingState, ErrorState } from "@eaip/ui-enterprise";
import { createMemoryClient, type MemoryEntry } from "@eaip/memory";
import { logger } from "@eaip/logging";

function MemoryPageContent() {
  const [memories, setMemories] = useState<MemoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMemories() {
      try {
        const client = createMemoryClient();
        const data = await client.list();
        setMemories(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        logger.error("Failed to load memories", { error: message });
        setError(message);
      } finally {
        setLoading(false);
      }
    }
    void loadMemories();
  }, []);

  return (
    <EnterpriseShell
      appId="mobile"
      pageTitle="Memory"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Memory" }]}
    >
      <div className="space-y-4">
        {loading ? (
          <LoadingState message="Loading memories..." />
        ) : error ? (
          <ErrorState
            message={error}
            onRetry={() => {
              window.location.reload();
            }}
          />
        ) : (
          <DataGrid
            data={memories}
            keyExtractor={(memory) => memory.id}
            columns={[
              { key: "key", header: "Key" },
              {
                key: "value",
                header: "Value",
                render: (memory) => JSON.stringify(memory.value).slice(0, 40),
              },
            ]}
          />
        )}
      </div>
    </EnterpriseShell>
  );
}

export default function MemoryPage() {
  return (
    <RequireAuth>
      <MemoryPageContent />
    </RequireAuth>
  );
}
