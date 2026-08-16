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
import { Dialog } from "@eaip/ui-foundation";
import { EnterpriseIcon } from "@eaip/icons";
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
                <h3 className="text-sm font-semibold text-text">Entity Types</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(stats.entityTypeCounts).map(([type, count]) => (
                    <div
                      key={type}
                      className="flex items-center justify-between py-1 text-sm"
                    >
                      <span className="text-text-secondary">{type}</span>
                      <Badge variant="glass">{count as number}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {Object.keys(stats.relationshipTypeCounts).length > 0 && (
            <Card>
              <CardHeader>
                <h3 className="text-sm font-semibold text-text">Relationship Types</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(stats.relationshipTypeCounts).map(([type, count]) => (
                    <div
                      key={type}
                      className="flex items-center justify-between py-1 text-sm"
                    >
                      <span className="text-text-secondary">{type}</span>
                      <Badge variant="glass">{count as number}</Badge>
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
          <div key={i} className="skeleton h-16 rounded-card" />
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
    <div className="divide-y divide-border rounded-card border border-border bg-surface">
      {entities.map((entity) => (
        <div
          key={entity.id}
          className="flex items-start justify-between px-4 py-3 transition-smooth hover:bg-surface-secondary"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Badge variant="glass" className="text-[10px] uppercase">
                {entity.type}
              </Badge>
              <p className="text-sm font-medium text-text">{entity.name}</p>
            </div>
            {entity.description && (
              <p className="mt-1 text-xs text-text-secondary line-clamp-2">
                {entity.description}
              </p>
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

function RelationshipList({ relationships, loading }: { relationships: GraphRelationship[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton h-12 rounded-card" />
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
    <div className="divide-y divide-border rounded-card border border-border bg-surface">
      {relationships.map((rel) => (
        <div
          key={rel.id}
          className="flex items-center justify-between px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <Badge variant="glass" className="text-[10px] uppercase">
              {rel.type}
            </Badge>
            <span className="text-sm font-medium text-text">{rel.sourceEntityId}</span>
            <EnterpriseIcon name="arrowRight" size={14} className="text-text-muted" />
            <span className="text-sm font-medium text-text">{rel.targetEntityId}</span>
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
}: {
  entities: GraphEntity[];
  relationships: GraphRelationship[];
  onNodeClick: (entity: GraphEntity) => void;
}) {
  if (entities.length === 0) {
    return (
      <EmptyState
        icon="workflow"
        title="Empty graph"
        description="No entities to display. Create entities and relationships to build your knowledge graph."
      />
    );
  }

  // Simple node-link visualization using SVG
  const width = 800;
  const height = 500;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = 180;

  const nodes = entities.slice(0, 20);
  const nodePositions = nodes.map((node, i) => {
    const angle = (i / nodes.length) * 2 * Math.PI;
    return {
      id: node.id,
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      entity: node,
    };
  });

  return (
    <Card>
      <CardContent className="p-4">
        <svg width={width} height={height} className="w-full border border-border rounded-lg">
          {relationships.slice(0, 30).map((rel) => {
            const source = nodePositions.find((n) => n.id === rel.sourceEntityId);
            const target = nodePositions.find((n) => n.id === rel.targetEntityId);
            if (!source || !target) return null;
            return (
              <line
                key={rel.id}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke="var(--color-border)"
                strokeWidth="1"
                markerEnd="url(#arrowhead)"
              />
            );
          })}
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="var(--color-border)" />
            </marker>
          </defs>
          {nodePositions.map(({ x, y, entity }) => (
            <g key={entity.id} transform={`translate(${x}, ${y})`}>
              <circle r={20} fill="var(--color-surface-secondary)" stroke="var(--color-border)" strokeWidth="2"
                style={{ cursor: "pointer" }} onClick={() => onNodeClick(entity)} />
              <text textAnchor="middle" dy="3" className="text-[8px] fill-text-muted">
                {entity.name.length > 10 ? entity.name.substring(0, 10) + "…" : entity.name}
              </text>
            </g>
          ))}
        </svg>
      </CardContent>
    </Card>
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
        setError(result.error || "Backend unavailable");
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
          <label className="text-xs font-medium text-text-muted">Query</label>
          <Input
            placeholder="Enter search term or entity name..."
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void handleQuery();
            }}
            aria-label="Graph query"
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-text-muted">Start Entity ID (optional)</label>
          <Input
            placeholder="Entity ID to start traversal from..."
            value={startEntity}
            onChange={(e) => setStartEntity(e.target.value)}
            aria-label="Start entity ID"
            className="mt-1"
          />
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => void handleQuery()}
            disabled={searching || !queryText.trim()}
          >
            {searching ? "Querying..." : "Run Query"}
          </Button>
        </div>
      </div>

      {error && (
        <ErrorState
          title="Query failed"
          message={error}
          onRetry={() => { void handleQuery(); }}
        />
      )}

      {result && (
        <div className="space-y-4">
          <p className="text-xs text-text-muted">
            Found {result.totalCount} results in {result.durationMs}ms
          </p>
          {result.entities.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-semibold text-text">Entities</h4>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {result.entities.map((e) => (
                  <div key={e.id} className="rounded-card border border-border bg-surface p-3">
                    <p className="text-sm font-medium text-text">{e.name}</p>
                    <p className="text-xs text-text-secondary">{e.type}</p>
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
            onChange={(e) => setName(e.target.value)}
            aria-label="Entity name"
          />
          <Input
            label="Type"
            placeholder="e.g. concept, person, document"
            value={type}
            onChange={(e) => setType(e.target.value)}
            aria-label="Entity type"
          />
          <Input
            label="Description"
            placeholder="Entity description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
      setFallback("knowledge-graph", statsResult.source === "fallback" || entitiesResult.source === "fallback");
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
            <div className="mb-4 flex items-center gap-2 text-xs font-semibold tracking-widest text-primary uppercase">
              <EnterpriseIcon name="workflow" size={14} />
              Knowledge Graph
            </div>
            <h1 className="text-3xl font-bold text-text tracking-tight">
              Knowledge Graph
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-text-secondary">
              Visualize and explore the interconnected web of entities, concepts, and relationships
              that power enterprise intelligence.
            </p>
          </div>
        </section>

        <div className="flex items-center justify-between">
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
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => { setShowCreate(true); }}>
              <EnterpriseIcon name="plus" size={14} />
              Add Entity
            </Button>
            <Button size="sm" onClick={() => { void load(); }}>
              <EnterpriseIcon name="refresh" size={14} />
              Refresh
            </Button>
          </div>
        </div>

        {error && (
          <ErrorState
            title="Could not load graph data"
            message={error}
            onRetry={() => { void load(); }}
          />
        )}

        {activeTab === "overview" && <GraphOverview stats={stats} loading={loading} />}
        {activeTab === "entities" && <EntityList entities={entities} loading={loading} />}
        {activeTab === "relationships" && <RelationshipList relationships={relationships} loading={loading} />}
        {activeTab === "visualize" && (
          <GraphVisualization
            entities={entities}
            relationships={relationships}
            onNodeClick={(entity) => { setSelectedEntity(entity); }}
          />
        )}
        {activeTab === "query" && <GraphQueryTab />}

        <CreateEntityModal
          open={showCreate}
          onClose={() => { setShowCreate(false); }}
          onCreated={() => { setShowCreate(false); void load(); }}
        />

        {selectedEntity && (
          <Dialog open={true} onClose={() => { setSelectedEntity(null); }}>
            <Dialog.Content>
              <div className="flex items-start justify-between">
                <Dialog.Title>{selectedEntity.name}</Dialog.Title>
                <Dialog.Close />
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-text-muted">ID</label>
                  <p className="text-sm text-text">{selectedEntity.id}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-text-muted">Type</label>
                  <p className="text-sm text-text">{selectedEntity.type}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-text-muted">Description</label>
                  <p className="text-sm text-text-secondary">{selectedEntity.description || "No description"}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-text-muted">Confidence</label>
                  <p className="text-sm text-text">{selectedEntity.confidence.toFixed(2)}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => { setSelectedEntity(null); }}>
                  Close
                </Button>
              </div>
            </Dialog.Content>
          </Dialog>
        )}
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
