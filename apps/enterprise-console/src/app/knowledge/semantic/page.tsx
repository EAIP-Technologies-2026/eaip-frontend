"use client";

import { useState, useCallback } from "react";
import { RequireAuth } from "@eaip/auth";
import { EnterpriseShell, ErrorState, Card, CardContent } from "@eaip/ui-enterprise";
import { Badge, Button, EmptyState, Input } from "@eaip/ui-primitives";
import { EnterpriseIcon } from "@eaip/icons";
import {
  searchKnowledge,
  type KnowledgeSearchResponse,
  type KnowledgeSearchResult,
} from "../../../services/knowledge-service";
import { fetchGraphEntities, type GraphEntity } from "../../../services/knowledge-graph-service";
import { searchMemory, type MemoryResult } from "../../../services/memory-service";
import { useFallback } from "../../../services/fallback-context";

type SearchTab = "knowledge" | "graph" | "memory" | "all";

function KnowledgeResults({
  results,
  loading,
}: {
  results: KnowledgeSearchResult[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton rounded-card h-20" />
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <EmptyState
        icon="search"
        title="No results"
        description="No knowledge articles found. Try a different search term."
      />
    );
  }

  return (
    <div className="space-y-3">
      {results.map((result) => (
        <div
          key={result.id}
          className="rounded-card border-border bg-surface transition-smooth hover:border-primary border p-4"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Badge variant="glass" className="text-[10px] uppercase">
                  {result.collectionId || result.type}
                </Badge>
                <p className="text-text text-sm font-medium">{result.title}</p>
              </div>
              <p className="text-text-secondary mt-1 line-clamp-2 text-xs">{result.excerpt}</p>
            </div>
            {result.score > 0 && (
              <span className="text-text-muted text-xs">Score: {result.score.toFixed(2)}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function GraphResults({ results, loading }: { results: GraphEntity[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton rounded-card h-16" />
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <EmptyState
        icon="workflow"
        title="No results"
        description="No graph entities found for this search term."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {results.map((entity) => (
        <div
          key={entity.id}
          className="rounded-card border-border bg-surface transition-smooth hover:border-primary border p-4"
        >
          <div className="mb-2 flex items-center gap-2">
            <Badge variant="glass" className="text-[10px] uppercase">
              {entity.type}
            </Badge>
            <p className="text-text text-sm font-medium">{entity.name}</p>
          </div>
          {entity.description && (
            <p className="text-text-secondary line-clamp-2 text-xs">{entity.description}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function MemoryResults({ results, loading }: { results: MemoryResult[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton rounded-card h-14" />
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <EmptyState
        icon="brain"
        title="No results"
        description="No memory items found for this search term."
      />
    );
  }

  return (
    <div className="space-y-3">
      {results.map((result) => (
        <div
          key={result.id}
          className="rounded-card border-border bg-surface transition-smooth hover:border-primary border p-3"
        >
          <p className="text-text line-clamp-2 text-sm font-medium">{result.value}</p>
          <p className="text-text-muted mt-1 text-xs">
            {new Date(result.timestamp).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}

function SemanticSearchContent() {
  const { setFallback } = useFallback();
  const [activeTab, setActiveTab] = useState<SearchTab>("all");
  const [query, setQuery] = useState("");
  const [knowledgeResults, setKnowledgeResults] = useState<KnowledgeSearchResult[]>([]);
  const [graphResults, setGraphResults] = useState<GraphEntity[]>([]);
  const [memoryResults, setMemoryResults] = useState<MemoryResult[]>([]);
  const [knowledgeTotal, setKnowledgeTotal] = useState(0);
  const [graphTotal, setGraphTotal] = useState(0);
  const [memoryTotal, setMemoryTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);

    const results = await Promise.allSettled([
      searchKnowledge(query, { pageSize: 20 }),
      fetchGraphEntities({ q: query, limit: 50 }),
      searchMemory(query),
    ]);

    setFallback(
      "semantic-search",
      results.some((r) => r.status === "rejected" || r.value.source === "fallback"),
    );

    results.forEach((r, idx) => {
      if (r.status === "rejected") return;

      if (idx === 0) {
        const data = r.value;
        if (data.source === "live") {
          const response = data.data as KnowledgeSearchResponse;
          setKnowledgeResults(response.results);
          setKnowledgeTotal(response.total || 0);
        }
      } else if (idx === 1) {
        const data = r.value;
        if (data.source === "live") {
          setGraphResults(data.data as GraphEntity[]);
          setGraphTotal((data.data as GraphEntity[]).length || 0);
        }
      } else if (idx === 2) {
        const data = r.value;
        if (data.source === "live") {
          setMemoryResults(data.data as MemoryResult[]);
          setMemoryTotal((data.data as MemoryResult[]).length || 0);
        }
      }
    });

    setError(null);
    setLoading(false);
  }, [query, setFallback]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      void handleSearch();
    }
  };

  const tabs: { id: SearchTab; label: string; icon: string; count: number }[] = [
    { id: "all", label: "All", icon: "globe", count: knowledgeTotal + graphTotal + memoryTotal },
    { id: "knowledge", label: "Knowledge", icon: "book", count: knowledgeTotal },
    { id: "graph", label: "Graph", icon: "workflow", count: graphTotal },
    { id: "memory", label: "Memory", icon: "brain", count: memoryTotal },
  ];

  return (
    <EnterpriseShell
      appId="enterprise-console"
      pageTitle="Semantic Search"
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Knowledge", href: "/knowledge" },
        { label: "Semantic Search" },
      ]}
    >
      <div className="space-y-6">
        <section className="surface-hero relative overflow-hidden p-8 lg:p-10">
          <div className="relative">
            <div className="text-primary mb-4 flex items-center gap-2 text-xs font-semibold tracking-widest uppercase">
              <EnterpriseIcon name="search" size={14} />
              Semantic Search
            </div>
            <h1 className="text-text text-3xl font-bold tracking-tight">Semantic Search</h1>
            <p className="text-text-secondary mt-3 max-w-2xl text-base leading-relaxed">
              Search across knowledge, memory, and the knowledge graph using natural language and
              semantic similarity.
            </p>
          </div>
        </section>

        <Card>
          <CardContent className="p-6">
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  iconLeft="search"
                  placeholder="Search knowledge, memory, and graph..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                  }}
                  onKeyDown={handleKeyDown}
                  aria-label="Semantic search"
                />
              </div>
              <Button
                onClick={() => {
                  void handleSearch();
                }}
                disabled={loading || !query.trim()}
              >
                {loading ? "Searching..." : "Search"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {error && (
          <ErrorState
            title="Search failed"
            message={error}
            onRetry={() => {
              void handleSearch();
            }}
          />
        )}

        {!query && !loading && (
          <EmptyState
            icon="search"
            title="Semantic Search"
            description="Enter a search term to find knowledge, memory, and graph entities across the enterprise brain."
          />
        )}

        {query && (
          <div className="space-y-4">
            <div className="border-border bg-surface flex items-center gap-1 rounded-lg border p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                  }}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-primary text-text-inverse"
                      : "text-text-secondary hover:bg-surface-tertiary"
                  }`}
                >
                  <EnterpriseIcon name={tab.icon as never} size={14} />
                  <span>{tab.label}</span>
                  <Badge variant="glass" className="ml-1 text-[10px]">
                    {tab.count}
                  </Badge>
                </button>
              ))}
            </div>

            {activeTab === "all" &&
              (knowledgeTotal + graphTotal + memoryTotal === 0 && !loading ? (
                <EmptyState
                  icon="search"
                  title="No results"
                  description="No results found for your search."
                />
              ) : (
                <div className="space-y-6">
                  {knowledgeResults.length > 0 && (
                    <>
                      <h3 className="text-text text-sm font-semibold">
                        Knowledge ({knowledgeTotal})
                      </h3>
                      <KnowledgeResults results={knowledgeResults} loading={false} />
                    </>
                  )}
                  {graphResults.length > 0 && (
                    <>
                      <h3 className="text-text text-sm font-semibold">
                        Graph Entities ({graphTotal})
                      </h3>
                      <GraphResults results={graphResults} loading={false} />
                    </>
                  )}
                  {memoryResults.length > 0 && (
                    <>
                      <h3 className="text-text text-sm font-semibold">Memory ({memoryTotal})</h3>
                      <MemoryResults results={memoryResults} loading={false} />
                    </>
                  )}
                </div>
              ))}

            {activeTab === "knowledge" && (
              <KnowledgeResults results={knowledgeResults} loading={loading} />
            )}
            {activeTab === "graph" && <GraphResults results={graphResults} loading={loading} />}
            {activeTab === "memory" && <MemoryResults results={memoryResults} loading={loading} />}
          </div>
        )}
      </div>
    </EnterpriseShell>
  );
}

export default function SemanticSearchPage() {
  return (
    <RequireAuth>
      <SemanticSearchContent />
    </RequireAuth>
  );
}
