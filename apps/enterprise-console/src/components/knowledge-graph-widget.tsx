"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { cn } from "@eaip/utilities";
import { InteractiveGraphCanvas, type GraphNode, type GraphEdge } from "@eaip/ui-visualizations";
import { EnterpriseIcon } from "@eaip/icons";
import {
  fetchGraphEntities,
  fetchGraphRelationships,
  type GraphEntity,
  type GraphRelationship,
} from "../services/knowledge-graph-service";
import { useFallback } from "../services/fallback-context";

interface KnowledgeGraphWidgetProps {
  className?: string;
  maxHeight?: number;
}

function entityToNode(entity: GraphEntity): GraphNode {
  return {
    id: entity.id,
    label: entity.name,
    type: entity.type,
    data: {
      description: entity.description,
      tags: entity.tags,
      confidence: entity.confidence,
      source: entity.source,
    },
  };
}

function relToEdge(rel: GraphRelationship): GraphEdge {
  return {
    id: rel.id,
    source: rel.sourceEntityId,
    target: rel.targetEntityId,
    label: rel.type,
    type: rel.type,
  };
}

const TYPE_ACCENT: Record<string, string> = {
  person: "#818cf8",
  agent: "#6366f1",
  document: "#0ea5e9",
  knowledge: "#a855f7",
  concept: "#34d399",
  organization: "#fbbf24",
  project: "#f472b6",
  workflow: "#38bdf8",
  decision: "#fb923c",
};

function getTypeAccent(type: string): string {
  const key = type.toLowerCase();
  for (const [k, v] of Object.entries(TYPE_ACCENT)) {
    if (key.includes(k)) return v;
  }
  return "#818cf8";
}

export function KnowledgeGraphWidget({ className, maxHeight = 400 }: KnowledgeGraphWidgetProps) {
  const { isFallback } = useFallback();
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [nodeCount, setNodeCount] = useState(0);
  const [edgeCount, setEdgeCount] = useState(0);

  const loadGraph = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const entitiesResult = await fetchGraphEntities({ limit: 50 });
      const relationshipsResult = await fetchGraphRelationships();

      if (entitiesResult.error) throw new Error(entitiesResult.error);
      if (relationshipsResult.error) throw new Error(relationshipsResult.error);

      const entities = entitiesResult.data;
      const relationships = relationshipsResult.data;

      const entityIds = new Set(entities.map((e: GraphEntity) => e.id));
      const filteredRels = relationships.filter(
        (r: GraphRelationship) =>
          entityIds.has(r.sourceEntityId) && entityIds.has(r.targetEntityId),
      );

      setNodes(entities.map(entityToNode));
      setEdges(filteredRels.map(relToEdge));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load knowledge graph";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isFallback) {
      void loadGraph();
    } else {
      setLoading(false);
    }
  }, [isFallback, loadGraph]);

  const handleNodeSelect = useCallback((node: GraphNode | null) => {
    setSelectedNode(node);
  }, []);

  const handleReset = useCallback(() => {
    setSelectedNode(null);
  }, []);

  if (loading) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border border-white/[0.08] shadow-2xl shadow-black/30",
          className,
        )}
        style={{
          maxHeight,
          background: "linear-gradient(180deg, rgba(15,21,37,0.95) 0%, rgba(7,11,20,0.98) 100%)",
        }}
      >
        <div className="flex h-full items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500/30 border-t-indigo-400" />
            <span className="text-sm text-slate-500">Loading knowledge graph...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border border-white/[0.08] shadow-2xl shadow-black/30",
          className,
        )}
        style={{
          maxHeight,
          background: "linear-gradient(180deg, rgba(15,21,37,0.95) 0%, rgba(7,11,20,0.98) 100%)",
        }}
      >
        <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
            <EnterpriseIcon name="alert" size={20} className="text-amber-400" />
          </div>
          <p className="text-sm text-slate-400">{error}</p>
          <button
            type="button"
            onClick={() => void loadGraph()}
            className="text-xs text-indigo-400 transition-colors hover:text-indigo-300"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border border-white/[0.08] shadow-2xl shadow-black/30",
          className,
        )}
        style={{
          maxHeight,
          background: "linear-gradient(180deg, rgba(15,21,37,0.95) 0%, rgba(7,11,20,0.98) 100%)",
        }}
      >
        <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800/50">
            <EnterpriseIcon name="layers" size={24} className="text-slate-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">No knowledge graph data</p>
            <p className="mt-1 text-xs text-slate-600">
              Knowledge entities will appear here once documents are indexed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const desc = selectedNode?.data?.description;
  const tags = selectedNode?.data?.tags;
  const tagList = Array.isArray(tags) ? (tags as string[]) : [];
  const confidence = selectedNode?.data?.confidence;
  const accentColor = selectedNode ? getTypeAccent(selectedNode.type) : "#818cf8";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/[0.08] shadow-2xl shadow-black/30",
        className,
      )}
      style={{
        maxHeight,
        background: "linear-gradient(180deg, rgba(15,21,37,0.95) 0%, rgba(7,11,20,0.98) 100%)",
      }}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02] px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-500/10">
            <EnterpriseIcon name="layers" size={13} className="text-indigo-400" />
          </div>
          <span className="text-[13px] font-semibold tracking-tight text-slate-200">
            Knowledge Graph
          </span>
          <span className="font-mono text-[11px] text-slate-600">
            {String(nodeCount || nodes.length)} entities · {String(edgeCount || edges.length)}{" "}
            relationships
          </span>
        </div>
        <div className="flex items-center gap-1">
          {selectedNode && (
            <button
              type="button"
              onClick={handleReset}
              className="rounded-md px-2 py-1 text-[11px] text-slate-500 transition-colors hover:bg-white/[0.06] hover:text-slate-300"
            >
              Reset
            </button>
          )}
          <button
            type="button"
            onClick={() => void loadGraph()}
            className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-white/[0.06] hover:text-slate-300"
            aria-label="Refresh graph"
          >
            <EnterpriseIcon name="refresh" size={13} />
          </button>
        </div>
      </div>

      {/* Graph canvas */}
      <div ref={containerRef} className="relative" style={{ height: maxHeight - 44 }}>
        <InteractiveGraphCanvas
          nodes={nodes}
          edges={edges}
          selectedNodeId={selectedNode?.id ?? null}
          onNodeSelect={handleNodeSelect}
          onNodeCountChange={setNodeCount}
          onEdgeCountChange={setEdgeCount}
          className="h-full w-full"
        />
      </div>

      {/* Selected node detail panel — frosted overlay */}
      {selectedNode && (
        <div className="absolute right-0 bottom-0 left-0 border-t border-white/[0.06] bg-[#0a0e17]/90 px-4 py-3 backdrop-blur-xl">
          <div className="flex items-start gap-3">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
              style={{
                backgroundColor: `${accentColor}15`,
                boxShadow: `0 0 12px ${accentColor}20`,
              }}
            >
              <EnterpriseIcon name="help" size={15} style={{ color: accentColor }} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-0.5 flex items-center gap-2">
                <span
                  className="text-[10px] font-semibold tracking-wider uppercase"
                  style={{ color: accentColor }}
                >
                  {selectedNode.type}
                </span>
              </div>
              <p className="truncate text-[13px] font-semibold text-slate-200">
                {selectedNode.label}
              </p>
              {typeof desc === "string" && desc.length > 0 && (
                <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-slate-500">
                  {desc}
                </p>
              )}
              {tagList.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {tagList.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/[0.06] bg-white/[0.05] px-2 py-0.5 text-[9px] text-slate-500"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              {typeof confidence === "number" && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${String(Math.round(confidence * 100))}%`,
                        backgroundColor: accentColor,
                        opacity: 0.7,
                      }}
                    />
                  </div>
                  <span className="font-mono text-[10px] text-slate-600">
                    {String(Math.round(confidence * 100))}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
