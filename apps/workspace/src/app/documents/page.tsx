"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { RequireAuth } from "@eaip/auth";
import { usePlatformStore } from "@eaip/state";
import {
  EnterpriseShell,
  DataGrid,
  LoadingState,
  ErrorState,
  ConfirmDialog,
  useConfirm,
  SectionHeader,
} from "@eaip/ui-enterprise";
import { EnterpriseIcon } from "@eaip/icons";
import { EmptyState } from "@eaip/ui-primitives";
import { createKnowledgeClient, type KnowledgeDocument } from "@eaip/knowledge";
import { logger } from "@eaip/logging";

function DocumentsPageContent() {
  const addToast = usePlatformStore((state) => state.addToast);
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { confirm, state: confirmState, cancel } = useConfirm();

  const client = useMemo(() => createKnowledgeClient(), []);

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await client.listDocuments();
      setDocuments(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("Failed to load documents", { error: message });
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    void loadDocuments();
  }, [loadDocuments]);

  async function handleDelete(document: KnowledgeDocument) {
    const confirmed = await confirm({
      title: "Delete document",
      message: `Are you sure you want to delete "${document.title}"?`,
      variant: "danger",
      confirmLabel: "Delete",
    });
    if (!confirmed) return;
    try {
      await client.deleteDocument(document.id);
      addToast({ type: "success", title: "Document deleted" });
      void loadDocuments();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("Failed to delete document", { error: message });
      addToast({ type: "error", title: "Failed to delete document", message });
    }
  }

  const totalDocuments = documents.length;
  const indexedCount = documents.filter((d) => (d.status ?? "indexed") === "indexed").length;
  const pendingCount = documents.filter((d) => d.status === "pending").length;

  return (
    <EnterpriseShell
      appId="workspace"
      pageTitle="Documents"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Documents" }]}
    >
      <div className="space-y-8">
        {/* Layer 1 — Hero */}
        <section className="surface-hero relative overflow-hidden p-8 lg:p-10">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br from-primary-subtle/50 to-transparent blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-gradient-to-tr from-accent-glow/30 to-transparent blur-2xl" aria-hidden="true" />
          <div className="relative">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-primary uppercase mb-4">
              <EnterpriseIcon name="activity" size={14} />
              Document Library
            </div>
            <h1 className="text-3xl font-bold text-text tracking-tight">Documents</h1>
            <p className="mt-3 text-base text-text-secondary max-w-2xl leading-relaxed">Manage, upload, and organize documents for agent training and knowledge retrieval.</p>
          </div>
        </section>

        {/* Layer 2 — Workspace Summary Strip */}
        <section className="space-y-4">
          <SectionHeader icon="barChart" title="Library Overview" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="surface-card rounded-card p-4">
              <p className="text-sm font-medium text-text-secondary">Total Documents</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-text">{totalDocuments}</p>
            </div>
            <div className="surface-card rounded-card p-4">
              <p className="text-sm font-medium text-text-secondary">Indexed</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-text">{indexedCount}</p>
            </div>
            <div className="surface-card rounded-card p-4">
              <p className="text-sm font-medium text-text-secondary">Pending</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-text">{pendingCount}</p>
            </div>
          </div>
        </section>

        {/* Layer 3 — Operational Workspace */}
        <section className="space-y-4">
          <SectionHeader icon="activity" title="Documents" />
          <div className="surface-card rounded-card overflow-hidden">
            {loading ? (
              <LoadingState message="Loading documents..." />
            ) : error ? (
              <ErrorState message={error} onRetry={() => { void loadDocuments(); }} />
            ) : documents.length === 0 ? (
              <EmptyState
                icon="fileText"
                title="No documents yet"
                description="Upload or create documents to organize your knowledge library."
              />
            ) : (
              <DataGrid
                data={documents}
                keyExtractor={(document) => document.id}
                loading={loading}
                pageSize={10}
                columns={[
                  {
                    key: "title",
                    header: "Title",
                    sortable: true,
                    filterable: true,
                    render: (document) => <span className="font-medium">{document.title}</span>,
                  },
                  {
                    key: "tags",
                    header: "Tags",
                    filterable: true,
                    render: (document) => document.tags.join(", ") || "—",
                  },
                  {
                    key: "status",
                    header: "Status",
                    sortable: true,
                    filterable: true,
                    render: (document) => document.status ?? "indexed",
                  },
                  {
                    key: "createdAt",
                    header: "Created",
                    sortable: true,
                    render: (document) => new Date(document.createdAt).toLocaleString(),
                  },
                  {
                    key: "actions",
                    header: "Actions",
                    render: (document) => (
                      <button
                        type="button"
                        onClick={() => {
                          void handleDelete(document);
                        }}
                        className="text-sm text-danger hover:underline"
                      >
                        Delete
                      </button>
                    ),
                  },
                ]}
              />
            )}
          </div>
        </section>
      </div>

      <ConfirmDialog
        open={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        variant={confirmState.variant}
        confirmLabel={confirmState.confirmLabel}
        cancelLabel={confirmState.cancelLabel}
        onConfirm={() => {
          confirmState.onConfirm?.();
        }}
        onCancel={cancel}
      />
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
