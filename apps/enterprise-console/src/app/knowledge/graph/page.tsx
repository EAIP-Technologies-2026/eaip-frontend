"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
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
import { Dialog } from "@eaip/ui-foundation";
import { InteractiveGraphCanvas, type GraphNode, type GraphEdge } from "@eaip/ui-visualizations";
import { EnterpriseIcon } from "@eaip/icons";
import { cn } from "@eaip/utilities";
import {
  fetchGraphEntities,
  fetchGraphRelationships,
  fetchGraphStats,
  createGraphEntity,
  queryGraph,
  type GraphEntity,
  type GraphRelationship,
  type GraphStats,
  type GraphQueryResult,
} from "../../../services/knowledge-graph-service";
import { LivingMapOverlays } from "../../../components/living-map-overlays";
import { ExplainThis } from "../../../components/explain-this";
import { ShowRelated } from "../../../components/show-related-panel";
import { StorylineFeed } from "../../../components/storyline-feed";
import { useFallback } from "../../../services/fallback-context";

type GraphTab = "overview" | "entities" | "relationships" | "visualize" | "query";

function GraphOverview({ stats, loading }: { stats: GraphStats | null; loading: boolean }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Entities"
          value={stats?.totalEntities ?? 0}
          icon={<EnterpriseIcon name="workflow" size={18} />}
          loading={loading}
        />
        <StatCard
          label="Relationships"
          value={stats?.totalRelationships ?? 0}
          icon={<EnterpriseIcon name="share" size={18} />}
          loading={loading}
        />
        <StatCard
          label="Entity Types"
          value={Object.keys(stats?.entityTypeCounts ?? {}).length}
          icon={<EnterpriseIcon name="layers" size={18} />}
          loading={loading}
        />
        <StatCard
          label="Rel. Types"
          value={Object.keys(stats?.relationshipTypeCounts ?? {}).length}
          icon={<EnterpriseIcon name="zap" size={18} />}
          loading={loading}
        />
      </div>

      {stats && (
        <>
          {Object.keys(stats.entityTypeCounts).length > 0 && (
            <Card>
              <CardHeader>
                <h3 className="text-text text-sm font-semibold">Entity Types</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(stats.entityTypeCounts).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between py-1 text-sm">
                      <span className="text-text-secondary">{type}</span>
                      <Badge variant="glass">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {Object.keys(stats.relationshipTypeCounts).length > 0 && (
            <Card>
              <CardHeader>
                <h3 className="text-text text-sm font-semibold">Relationship Types</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(stats.relationshipTypeCounts).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between py-1 text-sm">
                      <span className="text-text-secondary">{type}</span>
                      <Badge variant="glass">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

function EntityList({ entities, loading }: { entities: GraphEntity[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="skeleton rounded-card h-16" />
        ))}
      </div>
    );
  }

  if (entities.length === 0) {
    return (
      <EmptyState
        icon="workflow"
        title="No entities"
        description="No knowledge graph entities found for this tenant."
      />
    );
  }

  return (
    <div className="divide-border rounded-card border-border bg-surface divide-y border">
      {entities.map((entity) => (
        <div
          key={entity.id}
          className="transition-smooth hover:bg-surface-secondary flex items-start justify-between px-4 py-3"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Badge variant="glass" className="text-[10px] uppercase">
                {entity.type}
              </Badge>
              <p className="text-text text-sm font-medium">{entity.name}</p>
            </div>
            {entity.description && (
              <p className="text-text-secondary mt-1 line-clamp-2 text-xs">{entity.description}</p>
            )}
            <div className="mt-1 flex flex-wrap gap-1">
              {entity.tags.map((tag) => (
                <Badge key={tag} variant="glass" className="text-[9px]">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function RelationshipList({
  relationships,
  loading,
}: {
  relationships: GraphRelationship[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton rounded-card h-12" />
        ))}
      </div>
    );
  }

  if (relationships.length === 0) {
    return (
      <EmptyState
        icon="share"
        title="No relationships"
        description="No knowledge graph relationships found for this tenant."
      />
    );
  }

  return (
    <div className="divide-border rounded-card border-border bg-surface divide-y border">
      {relationships.map((rel) => (
        <div key={rel.id} className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Badge variant="glass" className="text-[10px] uppercase">
              {rel.type}
            </Badge>
            <span className="text-text text-sm font-medium">{rel.sourceEntityId}</span>
            <EnterpriseIcon name="arrowRight" size={14} className="text-text-muted" />
            <span className="text-text text-sm font-medium">{rel.targetEntityId}</span>
          </div>
          <Badge variant="glass">{rel.weight.toFixed(2)}</Badge>
        </div>
      ))}
    </div>
  );
}

function GraphVisualization({
  entities,
  relationships,
  onNodeClick,
  selectedEntityId,
}: {
  entities: GraphEntity[];
  relationships: GraphRelationship[];
  onNodeClick: (entity: GraphEntity | null) => void;
  selectedEntityId?: string | null;
}) {
  const [filterTypes, setFilterTypes] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  const entityTypes = useMemo(() => {
    const types = new Set(entities.map((e) => e.type));
    return Array.from(types).sort();
  }, [entities]);

  const filteredEntities = useMemo(() => {
    let filtered = entities;
    if (filterTypes.size > 0) {
      filtered = filtered.filter((e) => filterTypes.has(e.type));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (e) => e.name.toLowerCase().includes(q) || e.type.toLowerCase().includes(q),
      );
    }
    return filtered;
  }, [entities, filterTypes, searchQuery]);

  const filteredRelationships = useMemo(() => {
    const entityIds = new Set(filteredEntities.map((e) => e.id));
    return relationships.filter(
      (r) => entityIds.has(r.sourceEntityId) && entityIds.has(r.targetEntityId),
    );
  }, [relationships, filteredEntities]);

  if (entities.length === 0) {
    return (
      <EmptyState
        icon="workflow"
        title="Empty graph"
        description="No entities to display. Create entities and relationships to build your knowledge graph."
      />
    );
  }

  const nodes: GraphNode[] = filteredEntities.map((e) => ({
    id: e.id,
    label: e.name.length > 18 ? e.name.substring(0, 18) + "…" : e.name,
    type: e.type,
    data: e as unknown as Record<string, unknown>,
  }));

  const edges: GraphEdge[] = filteredRelationships.map((r) => ({
    id: r.id,
    source: r.sourceEntityId,
    target: r.targetEntityId,
    type: r.type,
    label: r.type,
  }));

  const toggleType = (type: string) => {
    setFilterTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  return (
    <div className="space-y-3">
      {/* Graph toolbar — frosted glass */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 backdrop-blur-md">
        <div className="relative max-w-sm min-w-[200px] flex-1">
          <EnterpriseIcon
            name="search"
            size={14}
            className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-500"
          />
          <input
            type="text"
            placeholder="Search entities..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
            className="w-full rounded-lg border border-white/[0.08] bg-[#0d1220]/60 py-2 pr-3 pl-9 text-sm text-slate-200 transition-colors placeholder:text-slate-600 focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/20 focus:outline-none"
            aria-label="Search graph entities"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {entityTypes.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                toggleType(type);
              }}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all duration-200",
                filterTypes.has(type)
                  ? "border-indigo-500/40 bg-indigo-500/10 text-indigo-400"
                  : "border-white/[0.06] bg-white/[0.03] text-slate-500 hover:border-white/[0.12] hover:text-slate-400",
              )}
            >
              {type}
            </button>
          ))}
          {filterTypes.size > 0 && (
            <button
              type="button"
              onClick={() => {
                setFilterTypes(new Set());
              }}
              className="rounded-full border border-white/[0.06] px-2.5 py-1 text-[11px] font-medium text-slate-500 transition-colors hover:text-slate-400"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Graph canvas — premium container */}
      <LivingMapOverlays />
      <div className="relative h-[560px] overflow-hidden rounded-2xl border border-white/[0.08] shadow-2xl shadow-black/30">
        <div className="relative h-full w-full flex-1">
          <InteractiveGraphCanvas
            nodes={nodes}
            edges={edges}
            onNodeSelect={(n) => {
              if (n?.data) onNodeClick(n.data as unknown as GraphEntity);
              else onNodeClick(null);
            }}
            selectedNodeId={selectedEntityId}
            className="rounded-lg"
          />
        </div>
      </div>

      {/* Entity count */}
      <p className="font-mono text-xs text-slate-600">
        Showing {filteredEntities.length} of {entities.length} entities
        {filterTypes.size > 0 && ` (${String(filterTypes.size)} type filter active)`}
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        <ExplainThis entityId={selectedEntityId ?? undefined} entityType="entity" />
        <ShowRelated entityId={selectedEntityId ?? ""} />
      </div>
      <StorylineFeed
        onShowOnMap={(id) => {
          const el = document.querySelector(`[data-entity-id="${id}"]`);
          el?.scrollIntoView({ behavior: "smooth" });
        }}
      />
    </div>
  );
}

function GraphQueryTab() {
  const [queryText, setQueryText] = useState("");
  const [startEntity, setStartEntity] = useState("");
  const [result, setResult] = useState<GraphQueryResult | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQuery = useCallback(async () => {
    if (!queryText.trim()) return;
    setSearching(true);
    setError(null);
    try {
      const result = await queryGraph({
        query: queryText,
        startEntityId: startEntity || undefined,
        maxDepth: 3,
      });
      if (result.source === "live") {
        setResult(result.data);
      } else {
        setResult(null);
        setError(result.error ?? "Backend unavailable");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Query failed");
    } finally {
      setSearching(false);
    }
  }, [queryText, startEntity]);

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div>
          <label htmlFor="graph-query" className="text-text-muted text-xs font-medium">
            Query
          </label>
          <Input
            id="graph-query"
            placeholder="Enter search term or entity name..."
            value={queryText}
            onChange={(e) => {
              setQueryText(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") void handleQuery();
            }}
            aria-label="Graph query"
            className="mt-1"
          />
        </div>
        <div>
          <label htmlFor="graph-start-entity" className="text-text-muted text-xs font-medium">
            Start Entity ID (optional)
          </label>
          <Input
            id="graph-start-entity"
            placeholder="Entity ID to start traversal from..."
            value={startEntity}
            onChange={(e) => {
              setStartEntity(e.target.value);
            }}
            aria-label="Start entity ID"
            className="mt-1"
          />
        </div>
        <div className="flex gap-3">
          <Button onClick={() => void handleQuery()} disabled={searching || !queryText.trim()}>
            {searching ? "Querying..." : "Run Query"}
          </Button>
        </div>
      </div>

      {error && (
        <ErrorState
          title="Query failed"
          message={error}
          onRetry={() => {
            void handleQuery();
          }}
        />
      )}

      {result && (
        <div className="space-y-4">
          <p className="text-text-muted text-xs">
            Found {result.totalCount} results in {result.durationMs}ms
          </p>
          {result.entities.length > 0 && (
            <div>
              <h4 className="text-text mb-2 text-sm font-semibold">Entities</h4>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {result.entities.map((e) => (
                  <div key={e.id} className="rounded-card border-border bg-surface border p-3">
                    <p className="text-text text-sm font-medium">{e.name}</p>
                    <p className="text-text-secondary text-xs">{e.type}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CreateEntityModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState("concept");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  if (!open) return null;

  const handleSubmit = async () => {
    setCreating(true);
    try {
      await createGraphEntity({ name, type, description });
      onCreated();
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <Dialog.Content>
        <div className="flex items-start justify-between">
          <Dialog.Title>Create Entity</Dialog.Title>
          <Dialog.Close />
        </div>
        <div className="space-y-4">
          <Input
            label="Name"
            placeholder="Entity name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
            aria-label="Entity name"
          />
          <Input
            label="Type"
            placeholder="e.g. concept, person, document"
            value={type}
            onChange={(e) => {
              setType(e.target.value);
            }}
            aria-label="Entity type"
          />
          <Input
            label="Description"
            placeholder="Entity description"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
            }}
            aria-label="Entity description"
          />
          <div className="flex gap-3 pt-2">
            <Button onClick={() => void handleSubmit()} disabled={creating || !name.trim()}>
              {creating ? "Creating..." : "Create"}
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </Dialog.Content>
    </Dialog>
  );
}

function GraphContent() {
  const { setFallback } = useFallback();
  const [activeTab, setActiveTab] = useState<GraphTab>("overview");
  const [stats, setStats] = useState<GraphStats | null>(null);
  const [entities, setEntities] = useState<GraphEntity[]>([]);
  const [relationships, setRelationships] = useState<GraphRelationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<GraphEntity | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsResult, entitiesResult, relsResult] = await Promise.all([
        fetchGraphStats(),
        fetchGraphEntities({ limit: 100 }),
        fetchGraphRelationships({ limit: 100 }),
      ]);
      setFallback(
        "knowledge-graph",
        statsResult.source === "fallback" || entitiesResult.source === "fallback",
      );
      if (statsResult.source === "live") setStats(statsResult.data);
      if (entitiesResult.source === "live") setEntities(entitiesResult.data);
      if (relsResult.source === "live") setRelationships(relsResult.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [setFallback]);

  useEffect(() => {
    void load();
  }, [load]);

  const tabs: { id: GraphTab; label: string; icon: string }[] = [
    { id: "overview", label: "Overview", icon: "home" },
    { id: "entities", label: "Entities", icon: "workflow" },
    { id: "relationships", label: "Relationships", icon: "share" },
    { id: "visualize", label: "Visualization", icon: "zap" },
    { id: "query", label: "Query", icon: "search" },
  ];

  return (
    <EnterpriseShell
      appId="enterprise-console"
      pageTitle="Knowledge Graph"
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Knowledge", href: "/knowledge" },
        { label: "Knowledge Graph" },
      ]}
    >
      <div className="space-y-6">
        <section className="surface-hero relative overflow-hidden p-8 lg:p-10">
          <div className="relative">
            <div className="text-primary mb-4 flex items-center gap-2 text-xs font-semibold tracking-widest uppercase">
              <EnterpriseIcon name="workflow" size={14} />
              Knowledge Graph
            </div>
            <h1 className="text-text text-3xl font-bold tracking-tight">Knowledge Graph</h1>
            <p className="text-text-secondary mt-3 max-w-2xl text-base leading-relaxed">
              Visualize and explore the interconnected web of entities, concepts, and relationships
              that power enterprise intelligence.
            </p>
          </div>
        </section>

        <div className="flex items-center justify-between">
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
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowCreate(true);
              }}
            >
              <EnterpriseIcon name="plus" size={14} />
              Add Entity
            </Button>
            <Button
              size="sm"
              onClick={() => {
                void load();
              }}
            >
              <EnterpriseIcon name="refresh" size={14} />
              Refresh
            </Button>
          </div>
        </div>

        {error && (
          <ErrorState
            title="Could not load graph data"
            message={error}
            onRetry={() => {
              void load();
            }}
          />
        )}

        {activeTab === "overview" && <GraphOverview stats={stats} loading={loading} />}
        {activeTab === "entities" && <EntityList entities={entities} loading={loading} />}
        {activeTab === "relationships" && (
          <RelationshipList relationships={relationships} loading={loading} />
        )}
        {activeTab === "visualize" && (
          <div className="relative overflow-hidden rounded-lg">
            <GraphVisualization
              entities={entities}
              relationships={relationships}
              selectedEntityId={selectedEntity?.id}
              onNodeClick={(entity) => {
                setSelectedEntity(entity);
              }}
            />

            {/* Contextual Intelligence Panel — premium frosted glass */}
            <div
              className={cn(
                "absolute top-0 right-0 z-10 flex h-full w-[340px] flex-col border-l border-white/[0.06] shadow-2xl shadow-black/40 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
                selectedEntity ? "translate-x-0" : "translate-x-full",
              )}
              style={{
                background:
                  "linear-gradient(180deg, rgba(13,18,32,0.95) 0%, rgba(7,11,20,0.98) 100%)",
                backdropFilter: "blur(40px) saturate(180%)",
              }}
            >
              {selectedEntity && (
                <>
                  <div className="flex items-start justify-between border-b border-white/[0.06] p-4">
                    <div>
                      <div className="mb-1.5 flex items-center gap-2">
                        <span className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase">
                          {selectedEntity.type}
                        </span>
                        <span className="text-[10px] text-slate-600">·</span>
                        <span className="text-[10px] font-semibold text-slate-500">
                          Intelligence Node
                        </span>
                      </div>
                      <h3 className="text-lg font-bold tracking-tight text-slate-100">
                        {selectedEntity.name}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedEntity(null);
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-white/[0.06] hover:text-slate-300"
                      aria-label="Close panel"
                    >
                      <EnterpriseIcon name="x" size={15} />
                    </button>
                  </div>

                  <div className="flex-1 space-y-5 overflow-y-auto p-4">
                    <div>
                      <span className="text-[10px] font-bold tracking-widest text-slate-600 uppercase">
                        ID
                      </span>
                      <p className="mt-1 font-mono text-[12px] break-all text-slate-400">
                        {selectedEntity.id}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold tracking-widest text-slate-600 uppercase">
                        Description
                      </span>
                      <p className="mt-1 text-[13px] leading-relaxed text-slate-400">
                        {selectedEntity.description || "No description available for this entity."}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold tracking-widest text-slate-600 uppercase">
                        Tags
                      </span>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {selectedEntity.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-white/[0.06] bg-white/[0.04] px-2.5 py-0.5 text-[10px] text-slate-500"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold tracking-widest text-slate-600 uppercase">
                        Confidence
                      </span>
                      <div className="mt-2 flex items-center gap-3">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.04]">
                          <div
                            className="h-full rounded-full bg-indigo-500/60"
                            style={{ width: `${String(selectedEntity.confidence * 100)}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] text-slate-500">
                          {(selectedEntity.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold tracking-widest text-slate-600 uppercase">
                        Source
                      </span>
                      <p className="mt-1 text-[12px] text-slate-500">
                        {selectedEntity.source || "Unknown"}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-white/[0.06] p-4">
                    <button
                      type="button"
                      className="w-full rounded-lg bg-indigo-600/80 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-indigo-500/80"
                    >
                      Investigate Entity
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        {activeTab === "query" && <GraphQueryTab />}

        <CreateEntityModal
          open={showCreate}
          onClose={() => {
            setShowCreate(false);
          }}
          onCreated={() => {
            setShowCreate(false);
            void load();
          }}
        />
      </div>
    </EnterpriseShell>
  );
}

export default function KnowledgeGraphPage() {
  return (
    <RequireAuth>
      <GraphContent />
    </RequireAuth>
  );
}
