"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RequireAuth } from "@eaip/auth";
import { usePlatformStore } from "@eaip/state";
import { getDefaultClient } from "@eaip/api";
import {
  EnterpriseShell,
  LoadingState,
  ErrorState,
  SectionHeader,
} from "@eaip/ui-enterprise";
import { Button, EmptyState } from "@eaip/ui-primitives";
import {
  MetricCard,
  Timeline,
  type TimelineItem,
} from "@eaip/ui-visualizations";
import { EnterpriseIcon } from "@eaip/icons";
import { createKnowledgeClient, type KnowledgeDocument } from "@eaip/knowledge";
import { createMemoryClient, type MemoryEntry } from "@eaip/memory";
import { logger } from "@eaip/logging";

interface KnowledgeStats {
  totalDocuments: number;
  totalCollections: number;
}

const defaultKnowledgeStats: KnowledgeStats = {
  totalDocuments: 0,
  totalCollections: 0,
};

function parseKnowledgeStats(data: unknown): KnowledgeStats {
  if (!data || typeof data !== "object") return defaultKnowledgeStats;
  const obj = data as Record<string, unknown>;
  const num = (value: unknown): number =>
    typeof value === "number" ? value : Number(value) || 0;
  return {
    totalDocuments: num(
      obj.totalDocuments ?? obj.documents ?? obj.documentCount ?? obj.total,
    ),
    totalCollections: num(
      obj.totalCollections ?? obj.collections ?? obj.collectionCount ?? 0,
    ),
  };
}

function parseActivityEvents(data: unknown): TimelineItem[] {
  if (!Array.isArray(data)) return [];
  return data.map((item, index) => ({
    id: (item as { id?: string }).id ?? String(index),
    title:
      (item as { title?: string }).title ??
      (item as { type?: string }).type ??
      "Activity",
    description:
      (item as { description?: string }).description ??
      (item as { message?: string }).message ??
      "",
    timestamp:
      (item as { timestamp?: string }).timestamp ??
      (item as { createdAt?: string }).createdAt ??
      new Date().toISOString(),
    status: ((item as { status?: string }).status ?? "idle") as TimelineItem["status"],
  }));
}

function DashboardContent() {
  const router = useRouter();
  const hasPermission = usePlatformStore((state) => state.hasPermission);
  const addToast = usePlatformStore((state) => state.addToast);
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [memory, setMemory] = useState<MemoryEntry[]>([]);
  const [stats, setStats] = useState<KnowledgeStats>(defaultKnowledgeStats);
  const [events, setEvents] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const knowledgeClient = useMemo(() => createKnowledgeClient(), []);
  const memoryClient = useMemo(() => createMemoryClient(), []);
  const apiClient = useMemo(() => getDefaultClient(), []);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);
      setError(null);
      try {
        const [docsResponse, memoryData, statsResponse, eventsResponse] =
          await Promise.all([
            knowledgeClient.search("*", { pageSize: 10 }),
            memoryClient.list(),
            apiClient.get<unknown>("/knowledge/stats"),
            apiClient.get<unknown>("/events/activity"),
          ]);
        if (cancelled) return;
        setDocuments(docsResponse.results.map((r) => r.document));
        setMemory(memoryData);
        setStats(parseKnowledgeStats(statsResponse.data));
        setEvents(parseActivityEvents(eventsResponse.data));
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        logger.error("Failed to load dashboard", { error: message });
        setError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadDashboard();
    return () => {
      cancelled = true;
    };
  }, [knowledgeClient, memoryClient, apiClient]);

  async function handleUpload(file: File) {
    try {
      const document = await knowledgeClient.uploadDocument(file);
      setDocuments((prev) => [document, ...prev]);
      addToast({ type: "success", title: "Document uploaded" });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("Failed to upload document", { error: message });
      addToast({
        type: "error",
        title: "Failed to upload document",
        message,
      });
    }
  }

  async function handleCreateMemory() {
    try {
      const key = `dashboard-${String(Date.now())}`;
      await memoryClient.set(key, { note: "Created from dashboard" });
      const entries = await memoryClient.list();
      setMemory(entries);
      addToast({ type: "success", title: "Memory entry created" });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("Failed to create memory entry", { error: message });
      addToast({
        type: "error",
        title: "Failed to create memory entry",
        message,
      });
    }
  }

  return (
    <EnterpriseShell
      appId="workspace"
      pageTitle="Dashboard"
      breadcrumbs={[{ label: "Dashboard" }]}
    >
      <div className="space-y-8">
        {/* Layer 1 — Context (Hero) */}
        <section className="surface-hero relative overflow-hidden p-8 lg:p-10">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br from-primary-subtle/50 to-transparent blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-gradient-to-tr from-accent-glow/30 to-transparent blur-2xl" aria-hidden="true" />
          <div className="relative">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-primary uppercase mb-4">
              <EnterpriseIcon name="activity" size={14} />
              Workspace Overview
            </div>
            <h1 className="text-3xl font-bold text-text tracking-tight">Dashboard</h1>
            <p className="mt-3 text-base text-text-secondary max-w-2xl leading-relaxed">Your personal workspace with quick access to knowledge, documents, and agent tools.</p>
          </div>
        </section>

        {/* Layer 2 — Workspace Overview */}
        <section className="space-y-4">
          <SectionHeader icon="barChart" title="Workspace Overview" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              label="Knowledge"
              value={stats.totalDocuments}
              icon={<EnterpriseIcon name="document" size={20} />}
            />
            <MetricCard
              label="Documents"
              value={documents.length}
              icon={<EnterpriseIcon name="folder" size={20} />}
            />
            <MetricCard
              label="Memory"
              value={memory.length}
              icon={<EnterpriseIcon name="brain" size={20} />}
            />
            <MetricCard
              label="Recent Activity"
              value={events.length}
              icon={<EnterpriseIcon name="activity" size={20} />}
            />
          </div>
        </section>

        {/* Layer 3 — Recent Activity */}
        <section className="space-y-4">
          <SectionHeader icon="activity" title="Recent Activity" />
          <div className="surface-card rounded-card p-6 lg:p-8">
            {loading ? (
              <LoadingState message="Loading activity..." />
            ) : error ? (
              <ErrorState
                message={error}
                onRetry={() => {
                  window.location.reload();
                }}
              />
            ) : events.length === 0 ? (
              <EmptyState
                icon="activity"
                title="No recent activity"
                description="Workspace events will appear here once you start using knowledge, documents, and memory."
              />
            ) : (
              <Timeline items={events.slice(0, 8)} />
            )}
          </div>
        </section>

        {/* Layer 3 — Quick Access */}
        <section className="space-y-4">
          <SectionHeader icon="zap" title="Quick Access" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Knowledge Base */}
            <div className="surface-card rounded-card p-6 lg:p-8 flex flex-col">
              <Link href="/knowledge" className="group flex-1">
                <div className="mb-4 inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary-subtle text-primary">
                  <EnterpriseIcon name="document" size={28} />
                </div>
                <h3 className="text-xl font-semibold text-text group-hover:text-primary transition-colors">
                  Knowledge Base
                </h3>
                <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                  Search, upload, and manage your organizational knowledge and documents.
                </p>
              </Link>
              <div className="mt-6 flex flex-wrap gap-2">
                {hasPermission("manage:knowledge") ? (
                  <>
                    <Button
                      iconLeft={<EnterpriseIcon name="upload" size={16} />}
                      onClick={() => {
                        fileInputRef.current?.click();
                      }}
                    >
                      Upload
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) {
                          void handleUpload(file);
                        }
                        event.target.value = "";
                      }}
                    />
                  </>
                ) : null}
                <Button
                  variant="secondary"
                  iconLeft={<EnterpriseIcon name="search" size={16} />}
                  onClick={() => {
                    router.push("/knowledge");
                  }}
                >
                  Search
                </Button>
              </div>
            </div>

            {/* Documents */}
            <div className="surface-card rounded-card p-6 lg:p-8 flex flex-col">
              <Link href="/documents" className="group flex-1">
                <div className="mb-4 inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary-subtle text-primary">
                  <EnterpriseIcon name="folder" size={28} />
                </div>
                <h3 className="text-xl font-semibold text-text group-hover:text-primary transition-colors">
                  Documents
                </h3>
                <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                  Browse and manage all uploaded documents in your workspace.
                </p>
              </Link>
              <div className="mt-6 flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  iconLeft={<EnterpriseIcon name="folder" size={16} />}
                  onClick={() => {
                    router.push("/documents");
                  }}
                >
                  Browse
                </Button>
              </div>
            </div>

            {/* Memory */}
            <div className="surface-card rounded-card p-6 lg:p-8 flex flex-col">
              <Link href="/memory" className="group flex-1">
                <div className="mb-4 inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary-subtle text-primary">
                  <EnterpriseIcon name="brain" size={28} />
                </div>
                <h3 className="text-xl font-semibold text-text group-hover:text-primary transition-colors">
                  Memory
                </h3>
                <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                  Access agent memory, stored context, and conversation history.
                </p>
              </Link>
              <div className="mt-6 flex flex-wrap gap-2">
                <Button
                  iconLeft={<EnterpriseIcon name="plus" size={16} />}
                  onClick={() => {
                    void handleCreateMemory();
                  }}
                >
                  Create Entry
                </Button>
                <Button
                  variant="secondary"
                  iconLeft={<EnterpriseIcon name="brain" size={16} />}
                  onClick={() => {
                    router.push("/memory");
                  }}
                >
                  Browse
                </Button>
              </div>
            </div>
          </div>
        </section>
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
