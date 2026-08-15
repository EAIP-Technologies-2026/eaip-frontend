"use client";

import { useEffect, useState, useCallback } from "react";
import { RequireAuth } from "@eaip/auth";
import {
  EnterpriseShell,
  ErrorState,
  StatCard,
  Card,
  CardHeader,
  CardContent,
} from "@eaip/ui-enterprise";
import { Badge, Button, EmptyState, Input } from "@eaip/ui-primitives";
import { EnterpriseIcon } from "@eaip/icons";
import {
  fetchKnowledgeArticles,
  fetchKnowledgeStats,
  fetchKnowledgeHealth,
  fetchKnowledgeSources,
  fetchKnowledgeCollections,
  fetchKnowledgeDocuments,
  searchKnowledge,
} from "../../services/knowledge-service";
import type {
  KnowledgeStats,
  KnowledgeHealth,
  KnowledgeSource,
  KnowledgeCollection,
  KnowledgeDocument,
  KnowledgeSearchResult,
} from "../../services/knowledge-service";
import { useFallback } from "../../services/fallback-context";

type KnowledgeTab = "overview" | "search" | "sources" | "collections" | "documents";

function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  const diff = Date.now() - date.getTime();
  const days = Math.floor(diff / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${String(days)} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${String(months)} mo ago`;
  return `${String(Math.floor(months / 12))} yr ago`;
}

const statusColors: Record<string, string> = {
  healthy: "bg-success",
  degraded: "bg-warning",
  empty: "bg-surface-tertiary",
  indexed: "bg-success",
  pending: "bg-warning",
  failed: "bg-danger",
};

const statusLabels: Record<string, string> = {
  healthy: "Healthy",
  degraded: "Degraded",
  empty: "Empty",
  indexed: "Indexed",
  pending: "Pending",
  failed: "Failed",
};

function HealthIndicator({ status }: { status: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs">
      <span className={`h-2 w-2 rounded-full ${statusColors[status] ?? "bg-surface-tertiary"}`} />
      <span className="text-text-secondary">{statusLabels[status] ?? status}</span>
    </span>
  );
}

function KnowledgeOverview({
  stats,
  health,
  sources,
  loading,
}: {
  stats: KnowledgeStats | null;
  health: KnowledgeHealth | null;
  sources: KnowledgeSource[];
  loading: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Documents"
          value={stats?.totalDocuments ?? 0}
          icon={<EnterpriseIcon name="document" size={18} />}
          loading={loading}
        />
        <StatCard
          label="Collections"
          value={stats?.totalCollections ?? 0}
          icon={<EnterpriseIcon name="layers" size={18} />}
          loading={loading}
        />
        <StatCard
          label="Indexed"
          value={stats?.indexedCount ?? 0}
          icon={<EnterpriseIcon name="checkCircle" size={18} />}
          loading={loading}
        />
        <StatCard
          label="Pending"
          value={stats?.pendingCount ?? 0}
          icon={<EnterpriseIcon name="clock" size={18} />}
          loading={loading}
        />
      </div>

      {health && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text">Knowledge Health</h3>
              <HealthIndicator status={health.status} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-text">{String(health.totalDocuments)}</p>
                <p className="text-xs text-text-muted">Documents</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-text">{String(health.totalCollections)}</p>
                <p className="text-xs text-text-muted">Collections</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-text">{String(health.totalChunks)}</p>
                <p className="text-xs text-text-muted">Chunks</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-text">{String(health.failedCount)}</p>
                <p className="text-xs text-text-muted">Failed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {sources.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-text">Sources</h3>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {sources.slice(0, 5).map((source) => (
                <div key={source.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <EnterpriseIcon name="database" size={16} className="text-text-muted" />
                    <div>
                      <p className="text-sm font-medium text-text">{source.name}</p>
                      <p className="text-xs text-text-muted">{String(source.documentCount)} documents</p>
                    </div>
                  </div>
                  <HealthIndicator status={source.status} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function KnowledgeSearch({
  collections,
}: {
  collections: KnowledgeCollection[];
}) {
  const [query, setQuery] = useState("");
  const [selectedCollection, setSelectedCollection] = useState<string>("");
  const [results, setResults] = useState<KnowledgeSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [total, setTotal] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setSearching(true);
    setHasSearched(true);
    try {
      const result = await searchKnowledge(query, {
        collection: selectedCollection || undefined,
        pageSize: 20,
      });
      if (result.source === "live") {
        setResults(result.data.results);
        setTotal(result.data.total);
      } else {
        setResults([]);
        setTotal(0);
      }
    } catch {
      setResults([]);
      setTotal(0);
    } finally {
      setSearching(false);
    }
  }, [query, selectedCollection]);

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            iconLeft="search"
            placeholder="Search knowledge base..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); }}
            onKeyDown={(e) => {
              if (e.key === "Enter") void handleSearch();
            }}
            aria-label="Search knowledge base"
          />
        </div>
        <select
          value={selectedCollection}
          onChange={(e) => { setSelectedCollection(e.target.value); }}
          className="rounded-input border border-border bg-surface px-3 py-2 text-sm text-text"
          aria-label="Filter by collection"
        >
          <option value="">All Collections</option>
          {collections.map((c) => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>
        <Button onClick={() => { void handleSearch(); }} disabled={searching || !query.trim()}>
          {searching ? "Searching..." : "Search"}
        </Button>
      </div>

      {hasSearched && (
        <div className="space-y-2">
          <p className="text-xs text-text-muted">
            {total > 0 ? `${String(total)} results found` : "No results found"}
          </p>
          {results.map((result) => (
            <div
              key={result.id}
              className="rounded-card border border-border bg-surface p-4 transition-smooth hover:border-primary"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text">{result.title}</p>
                  <p className="mt-1 text-xs text-text-secondary line-clamp-2">{result.excerpt}</p>
                  <div className="mt-2 flex items-center gap-2">
                    {result.collectionId && (
                      <Badge variant="glass" className="text-[10px]">{result.collectionId}</Badge>
                    )}
                    {result.score > 0 && (
                      <span className="text-[10px] text-text-muted">
                        Score: {result.score.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function KnowledgeSources({ sources, loading }: { sources: KnowledgeSource[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-20 rounded-card" />
        ))}
      </div>
    );
  }

  if (sources.length === 0) {
    return (
      <EmptyState
        icon="database"
        title="No sources"
        description="Knowledge sources will appear here when collections are created."
      />
    );
  }

  return (
    <div className="space-y-3">
      {sources.map((source) => (
        <div
          key={source.id}
          className="rounded-card border border-border bg-surface p-4 transition-smooth hover:border-primary"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-subtle text-primary">
                <EnterpriseIcon name="database" size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-text">{source.name}</p>
                <p className="text-xs text-text-muted">{source.description || "No description"}</p>
              </div>
            </div>
            <HealthIndicator status={source.status} />
          </div>
          <div className="mt-3 grid grid-cols-4 gap-4 border-t border-border pt-3">
            <div>
              <p className="text-lg font-bold text-text">{String(source.documentCount)}</p>
              <p className="text-[10px] text-text-muted">Documents</p>
            </div>
            <div>
              <p className="text-lg font-bold text-text">{String(source.chunkCount)}</p>
              <p className="text-[10px] text-text-muted">Chunks</p>
            </div>
            <div>
              <p className="text-lg font-bold text-success">{String(source.indexedCount)}</p>
              <p className="text-[10px] text-text-muted">Indexed</p>
            </div>
            <div>
              <p className="text-lg font-bold text-warning">{String(source.pendingCount)}</p>
              <p className="text-[10px] text-text-muted">Pending</p>
            </div>
          </div>
          <div className="mt-2 text-[10px] text-text-muted">
            Updated {formatRelativeDate(source.updatedAt)}
          </div>
        </div>
      ))}
    </div>
  );
}

function KnowledgeCollections({ collections, loading }: { collections: KnowledgeCollection[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton h-32 rounded-card" />
        ))}
      </div>
    );
  }

  if (collections.length === 0) {
    return (
      <EmptyState
        icon="layers"
        title="No collections"
        description="Knowledge collections will appear here when created."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {collections.map((col) => (
        <div
          key={col.id}
          className="rounded-card border border-border bg-surface p-5 transition-smooth hover:border-primary"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-subtle text-primary">
              <EnterpriseIcon name="layers" size={16} />
            </div>
            <div>
              <p className="text-sm font-semibold text-text">{col.name}</p>
              <p className="text-xs text-text-muted">{col.description || "No description"}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-text-muted">
            <span>{String(col.documentCount)} documents</span>
            <span>Created {formatRelativeDate(col.createdAt)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function KnowledgeDocuments({ documents, loading }: { documents: KnowledgeDocument[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="skeleton h-16 rounded-card" />
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <EmptyState
        icon="document"
        title="No documents"
        description="Knowledge documents will appear here when ingested."
      />
    );
  }

  return (
    <div className="divide-y divide-border rounded-card border border-border bg-surface">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="flex items-center justify-between px-4 py-3 transition-smooth hover:bg-surface-secondary"
        >
          <div className="flex items-center gap-3 min-w-0">
            <EnterpriseIcon name="document" size={16} className="text-text-muted shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-text truncate">{doc.title}</p>
              <p className="text-xs text-text-muted">{doc.type} &middot; {formatRelativeDate(doc.createdAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant={doc.status === "indexed" ? "success" : doc.status === "pending" ? "warning" : "default"}>
              {doc.status}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}

function KnowledgeContent() {
  const { setFallback } = useFallback();
  const [activeTab, setActiveTab] = useState<KnowledgeTab>("overview");
  const [stats, setStats] = useState<KnowledgeStats | null>(null);
  const [health, setHealth] = useState<KnowledgeHealth | null>(null);
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [collections, setCollections] = useState<KnowledgeCollection[]>([]);
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [articlesResult, statsResult, healthResult, sourcesResult, collectionsResult, documentsResult] =
          await Promise.all([
            fetchKnowledgeArticles(),
            fetchKnowledgeStats(),
            fetchKnowledgeHealth(),
            fetchKnowledgeSources(),
            fetchKnowledgeCollections(),
            fetchKnowledgeDocuments(),
          ]);
        if (cancelled) return;
        setFallback("knowledge", articlesResult.source === "fallback");
        setStats(statsResult.data);
        setHealth(healthResult.data);
        setSources(sourcesResult.data);
        setCollections(collectionsResult.data);
        setDocuments(documentsResult.data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [setFallback]);

  const tabs: { id: KnowledgeTab; label: string; icon: string }[] = [
    { id: "overview", label: "Overview", icon: "home" },
    { id: "search", label: "Search", icon: "search" },
    { id: "sources", label: "Sources", icon: "database" },
    { id: "collections", label: "Collections", icon: "layers" },
    { id: "documents", label: "Documents", icon: "document" },
  ];

  return (
    <EnterpriseShell
      appId="enterprise-console"
      pageTitle="Knowledge Center"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Knowledge Center" }]}
    >
      <div className="space-y-6">
        <section data-tour="knowledge" className="surface-hero relative overflow-hidden p-8 lg:p-10">
          <div className="relative">
            <div className="mb-4 flex items-center gap-2 text-xs font-semibold tracking-widest text-primary uppercase">
              <EnterpriseIcon name="book" size={14} />
              Knowledge Center
            </div>
            <h1 className="text-3xl font-bold text-text tracking-tight">Knowledge</h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-text-secondary">
              Search, explore, and govern your organization&apos;s knowledge infrastructure — the
              foundation that powers agent reasoning and enterprise intelligence.
            </p>
            {health && (
              <div className="mt-4">
                <HealthIndicator status={health.status} />
              </div>
            )}
          </div>
        </section>

        <div className="flex items-center gap-1 rounded-lg border border-border bg-surface p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => { setActiveTab(tab.id); }}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-primary text-text-inverse"
                  : "text-text-secondary hover:bg-surface-tertiary"
              }`}
            >
              <EnterpriseIcon name={tab.icon as never} size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <ErrorState
            title="Could not load knowledge data"
            message={error}
            onRetry={() => { window.location.reload(); }}
          />
        )}

        {activeTab === "overview" && (
          <KnowledgeOverview stats={stats} health={health} sources={sources} loading={loading} />
        )}
        {activeTab === "search" && <KnowledgeSearch collections={collections} />}
        {activeTab === "sources" && <KnowledgeSources sources={sources} loading={loading} />}
        {activeTab === "collections" && <KnowledgeCollections collections={collections} loading={loading} />}
        {activeTab === "documents" && <KnowledgeDocuments documents={documents} loading={loading} />}
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
