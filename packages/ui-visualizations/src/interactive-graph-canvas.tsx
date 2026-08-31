"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { cn } from "@eaip/utilities";

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  x?: number;
  y?: number;
  data?: Record<string, unknown>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: string;
}

export interface InteractiveGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onNodeSelect?: (node: GraphNode | null) => void;
  selectedNodeId?: string | null;
  className?: string;
  onNodeCountChange?: (count: number) => void;
  onEdgeCountChange?: (count: number) => void;
}

interface NodeColorDef {
  fill: string;
  stroke: string;
  glow: string;
  icon: string;
}

const NODE_COLORS: Record<string, NodeColorDef> = {
  person: {
    fill: "rgba(129,140,248,0.15)",
    stroke: "#818cf8",
    glow: "rgba(129,140,248,0.35)",
    icon: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
  },
  agent: {
    fill: "rgba(99,102,241,0.15)",
    stroke: "#6366f1",
    glow: "rgba(99,102,241,0.35)",
    icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-2.5H8.5v-2H11V9.5h2v2.5h2.5v2H13v2.5h-2z",
  },
  document: {
    fill: "rgba(14,165,233,0.12)",
    stroke: "#0ea5e9",
    glow: "rgba(14,165,233,0.30)",
    icon: "M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z",
  },
  knowledge: {
    fill: "rgba(168,85,247,0.12)",
    stroke: "#a855f7",
    glow: "rgba(168,85,247,0.30)",
    icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z",
  },
  concept: {
    fill: "rgba(52,211,153,0.12)",
    stroke: "#34d399",
    glow: "rgba(52,211,153,0.30)",
    icon: "M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z",
  },
  organization: {
    fill: "rgba(251,191,36,0.12)",
    stroke: "#fbbf24",
    glow: "rgba(251,191,36,0.30)",
    icon: "M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z",
  },
  project: {
    fill: "rgba(244,114,182,0.12)",
    stroke: "#f472b6",
    glow: "rgba(244,114,182,0.30)",
    icon: "M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z",
  },
  workflow: {
    fill: "rgba(56,189,248,0.12)",
    stroke: "#38bdf8",
    glow: "rgba(56,189,248,0.30)",
    icon: "M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z",
  },
  decision: {
    fill: "rgba(251,146,60,0.12)",
    stroke: "#fb923c",
    glow: "rgba(251,146,60,0.30)",
    icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
  },
  default: {
    fill: "rgba(148,163,184,0.10)",
    stroke: "#94a3b8",
    glow: "rgba(148,163,184,0.25)",
    icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z",
  },
};

function getNodeStyle(type: string): NodeColorDef {
  const key = type.toLowerCase();
  for (const [k, v] of Object.entries(NODE_COLORS)) {
    if (key.includes(k)) return v;
  }
  const fallback: NodeColorDef = {
    fill: "rgba(148,163,184,0.10)",
    stroke: "#94a3b8",
    glow: "rgba(148,163,184,0.25)",
    icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z",
  };
  return NODE_COLORS.default ?? fallback;
}

const ENTITY_TYPE_LABELS: Record<string, string> = {
  person: "Person",
  agent: "Agent",
  document: "Document",
  knowledge: "Knowledge",
  concept: "Concept",
  organization: "Organization",
  project: "Project",
  workflow: "Workflow",
  decision: "Decision",
};

function getEntityTypes(nodes: GraphNode[]): string[] {
  const types = new Set<string>();
  for (const n of nodes) {
    types.add(n.type.toLowerCase());
  }
  return Array.from(types).sort();
}

interface PositionedNode {
  id: string;
  label: string;
  type: string;
  x: number;
  y: number;
  data?: Record<string, unknown>;
}

function forceLayout(
  nodes: GraphNode[],
  edges: GraphEdge[],
  width: number,
  height: number,
): GraphNode[] {
  const positioned: PositionedNode[] = nodes.map((n, i) => {
    if (n.x !== undefined && n.y !== undefined)
      return { id: n.id, label: n.label, type: n.type, data: n.data, x: n.x, y: n.y };
    const angle = (i / Math.max(nodes.length, 1)) * 2 * Math.PI;
    const radius = Math.min(width, height) * 0.3;
    return {
      id: n.id,
      label: n.label,
      type: n.type,
      data: n.data,
      x: width / 2 + radius * Math.cos(angle) + (Math.random() - 0.5) * 40,
      y: height / 2 + radius * Math.sin(angle) + (Math.random() - 0.5) * 40,
    };
  });

  for (let iter = 0; iter < 8; iter++) {
    for (let i = 0; i < positioned.length; i++) {
      for (let j = i + 1; j < positioned.length; j++) {
        const ni = positioned[i];
        const nj = positioned[j];
        if (!ni || !nj) continue;
        const dx = nj.x - ni.x;
        const dy = nj.y - ni.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = 800 / (dist * dist);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        positioned[i] = { ...ni, x: ni.x - fx, y: ni.y - fy };
        positioned[j] = { ...nj, x: nj.x + fx, y: nj.y + fy };
      }
    }
    for (const edge of edges) {
      const si = positioned.findIndex((n) => n.id === edge.source);
      const ti = positioned.findIndex((n) => n.id === edge.target);
      if (si === -1 || ti === -1) continue;
      const ns = positioned[si];
      const nt = positioned[ti];
      if (!ns || !nt) continue;
      const dx = nt.x - ns.x;
      const dy = nt.y - ns.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = (dist - 150) * 0.02;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      positioned[si] = { ...ns, x: ns.x + fx, y: ns.y + fy };
      positioned[ti] = { ...nt, x: nt.x - fx, y: nt.y - fy };
    }
    for (let i = 0; i < positioned.length; i++) {
      const n = positioned[i];
      if (!n) continue;
      positioned[i] = {
        ...n,
        x: n.x + (width / 2 - n.x) * 0.01,
        y: n.y + (height / 2 - n.y) * 0.01,
      };
    }
  }
  return positioned;
}

export function InteractiveGraphCanvas({
  nodes,
  edges,
  onNodeSelect,
  selectedNodeId,
  className,
  onNodeCountChange,
  onEdgeCountChange,
}: InteractiveGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 1200, height: 800 });
  const [edgePhase, setEdgePhase] = useState(0);
  const prefersReducedMotion = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  useEffect(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setContainerSize({ width: rect.width, height: rect.height });
    setTransform({
      x: rect.width / 2 - rect.width * 0.4,
      y: rect.height / 2 - rect.height * 0.4,
      scale: 0.8,
    });
  }, []);

  useEffect(() => {
    onNodeCountChange?.(nodes.length);
  }, [nodes.length, onNodeCountChange]);

  useEffect(() => {
    onEdgeCountChange?.(edges.length);
  }, [edges.length, onEdgeCountChange]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    let running = true;
    const tick = () => {
      if (!running) return;
      setEdgePhase((p) => (p + 0.3) % 20);
      animationRef.current = window.setTimeout(tick, 50);
    };
    animationRef.current = window.setTimeout(tick, 50);
    return () => {
      running = false;
      clearTimeout(animationRef.current);
    };
  }, [prefersReducedMotion]);

  const layoutedNodes = useMemo(
    () => forceLayout(nodes, edges, containerSize.width, containerSize.height),
    [nodes, edges, containerSize.width, containerSize.height],
  );

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.001;
    setTransform((prev) => ({
      ...prev,
      scale: Math.min(Math.max(0.1, prev.scale + delta), 4),
    }));
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setTransform((prev) => ({
      ...prev,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    }));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const zoomIn = () => {
    setTransform((p) => ({ ...p, scale: Math.min(p.scale * 1.3, 4) }));
  };
  const zoomOut = () => {
    setTransform((p) => ({ ...p, scale: Math.max(p.scale / 1.3, 0.1) }));
  };
  const fitGraph = () => {
    if (!containerRef.current || layoutedNodes.length === 0) return;
    const xs = layoutedNodes.map((n) => n.x ?? 0);
    const ys = layoutedNodes.map((n) => n.y ?? 0);
    const minX = Math.min(...xs) - 60;
    const maxX = Math.max(...xs) + 60;
    const minY = Math.min(...ys) - 60;
    const maxY = Math.max(...ys) + 60;
    const rect = containerRef.current.getBoundingClientRect();
    const scaleX = rect.width / (maxX - minX);
    const scaleY = rect.height / (maxY - minY);
    const scale = Math.min(scaleX, scaleY, 2) * 0.85;
    setTransform({
      x: rect.width / 2 - ((minX + maxX) / 2) * scale,
      y: rect.height / 2 - ((minY + maxY) / 2) * scale,
      scale,
    });
  };
  const resetView = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setTransform({
      x: rect.width / 2 - rect.width * 0.4,
      y: rect.height / 2 - rect.height * 0.4,
      scale: 0.8,
    });
  };

  const getConnectedNodeIds = useCallback(
    (nodeId: string) => {
      const connected = new Set<string>();
      connected.add(nodeId);
      for (const edge of edges) {
        if (edge.source === nodeId) connected.add(edge.target);
        if (edge.target === nodeId) connected.add(edge.source);
      }
      return connected;
    },
    [edges],
  );

  const connectedSet = useMemo(() => {
    if (!selectedNodeId && !hoveredNodeId) return null;
    return getConnectedNodeIds(selectedNodeId ?? hoveredNodeId ?? "");
  }, [selectedNodeId, hoveredNodeId, getConnectedNodeIds]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || e.target instanceof SVGSVGElement) {
      onNodeSelect?.(null);
    }
  };

  const handleCanvasKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onNodeSelect?.(null);
    }
  };

  const entityTypes = useMemo(() => getEntityTypes(nodes), [nodes]);

  return (
    <div className={cn("relative h-full w-full overflow-hidden", className)}>
      {/* Graph Controls — frosted glass panel */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5">
        {[
          { label: "Zoom in", icon: "M12 4v16m-8-8h16", action: zoomIn },
          { label: "Zoom out", icon: "M4 12h16", action: zoomOut },
          {
            label: "Fit graph",
            icon: "M4 4h6V2H2v8h2V4zm16 0h-6V2h8v8h-2V4zM4 20h6v2H2v-8h2v6zm16 0h-6v2h8v-8h-2v6z",
            action: fitGraph,
          },
          {
            label: "Reset view",
            icon: "M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z",
            action: resetView,
          },
        ].map((ctrl) => (
          <button
            key={ctrl.label}
            type="button"
            onClick={ctrl.action}
            title={ctrl.label}
            aria-label={ctrl.label}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-[#0d1220]/80 text-slate-400 shadow-lg shadow-black/20 backdrop-blur-md transition-all duration-200 hover:border-white/[0.15] hover:bg-[#131a2e]/90 hover:text-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:outline-none"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={ctrl.icon} />
            </svg>
          </button>
        ))}
      </div>

      {/* Zoom indicator */}
      <div className="absolute right-3 bottom-3 z-20 rounded-md border border-white/[0.08] bg-[#0d1220]/80 px-2.5 py-1 font-mono text-[11px] text-slate-500 shadow-lg shadow-black/20 backdrop-blur-md">
        {String(Math.round(transform.scale * 100))}%
      </div>

      {/* Legend — compact entity type indicator */}
      {entityTypes.length > 1 && (
        <div className="absolute bottom-3 left-3 z-20 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-white/[0.08] bg-[#0d1220]/80 px-3 py-2 shadow-lg shadow-black/20 backdrop-blur-md">
          {entityTypes.map((t) => {
            const style = getNodeStyle(t);
            return (
              <div key={t} className="flex items-center gap-1.5">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: style.stroke, boxShadow: `0 0 6px ${style.glow}` }}
                />
                <span className="text-[10px] font-medium text-slate-500 capitalize">
                  {ENTITY_TYPE_LABELS[t] ?? t}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Canvas — interactive graph surface */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <div
        ref={containerRef}
        className={cn(
          "relative h-full w-full cursor-grab overflow-hidden active:cursor-grabbing",
          className,
        )}
        style={{
          background: "radial-gradient(ellipse at 50% 40%, #0f172a 0%, #070b14 60%, #030509 100%)",
        }}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onClick={handleCanvasClick}
        onKeyDown={handleCanvasKeyDown}
        role="img"
        aria-label="Knowledge graph visualization. Use mouse to pan and zoom. Click nodes to inspect. Press Escape to deselect."
      >
        <svg
          width="100%"
          height="100%"
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
        >
          <defs>
            {/* Arrow markers */}
            <marker
              id="arrowhead"
              markerWidth="8"
              markerHeight="6"
              refX="26"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="rgba(148,163,184,0.35)" />
            </marker>
            <marker
              id="arrowhead-active"
              markerWidth="8"
              markerHeight="6"
              refX="26"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="rgba(129,140,248,0.8)" />
            </marker>

            {/* Node glow gradients per type */}
            {Object.entries(NODE_COLORS).map(([key, def]) => (
              <radialGradient key={`glow-${key}`} id={`node-glow-${key}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={def.glow} stopOpacity="0.6" />
                <stop offset="60%" stopColor={def.glow} stopOpacity="0.15" />
                <stop offset="100%" stopColor={def.glow} stopOpacity="0" />
              </radialGradient>
            ))}

            {/* Generic node glow fallback */}
            <radialGradient id="node-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(129,140,248,0.4)" stopOpacity="0.5" />
              <stop offset="100%" stopColor="rgba(129,140,248,0)" stopOpacity="0" />
            </radialGradient>

            {/* Selection ring gradient */}
            <radialGradient id="selection-ring" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(129,140,248,0.0)" stopOpacity="0" />
              <stop offset="70%" stopColor="rgba(129,140,248,0.08)" stopOpacity="0.08" />
              <stop offset="100%" stopColor="rgba(129,140,248,0.15)" stopOpacity="0.15" />
            </radialGradient>

            {/* Node shadow filter */}
            <filter id="node-shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="rgba(0,0,0,0.3)" />
            </filter>
            <filter id="node-glow-filter" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="6" />
            </filter>

            {/* Animated edge particle pattern */}
            <pattern
              id="edge-flow"
              patternUnits="userSpaceOnUse"
              width="20"
              height="4"
              patternTransform={`rotate(0) translate(${String(edgePhase)}, 0)`}
            >
              <circle cx="2" cy="2" r="1" fill="rgba(129,140,248,0.5)" />
            </pattern>
          </defs>

          <g
            transform={`translate(${String(transform.x)}, ${String(transform.y)}) scale(${String(transform.scale)})`}
          >
            {/* Edges */}
            {edges.map((edge) => {
              const source = layoutedNodes.find((n) => n.id === edge.source);
              const target = layoutedNodes.find((n) => n.id === edge.target);
              if (
                !source ||
                !target ||
                source.x === undefined ||
                source.y === undefined ||
                target.x === undefined ||
                target.y === undefined
              )
                return null;

              const isSourceConnected = connectedSet?.has(edge.source) ?? true;
              const isTargetConnected = connectedSet?.has(edge.target) ?? true;
              const isHighlighted = isSourceConnected && isTargetConnected && connectedSet !== null;
              const isActive =
                selectedNodeId === edge.source ||
                selectedNodeId === edge.target ||
                hoveredNodeId === edge.source ||
                hoveredNodeId === edge.target;
              const opacity = connectedSet && !isHighlighted ? 0.04 : isActive ? 0.9 : 0.2;

              const dx = target.x - source.x;
              const dy = target.y - source.y;
              const mx = (source.x + target.x) / 2 - dy * 0.05;
              const my = (source.y + target.y) / 2 + dx * 0.05;

              return (
                <g
                  key={edge.id}
                  style={{ opacity, transition: "opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}
                >
                  {/* Edge glow for active */}
                  {isActive && (
                    <path
                      d={`M ${String(source.x)} ${String(source.y)} Q ${String(mx)} ${String(my)} ${String(target.x)} ${String(target.y)}`}
                      fill="none"
                      stroke="rgba(129,140,248,0.15)"
                      strokeWidth={6}
                      strokeLinecap="round"
                    />
                  )}
                  <path
                    d={`M ${String(source.x)} ${String(source.y)} Q ${String(mx)} ${String(my)} ${String(target.x)} ${String(target.y)}`}
                    fill="none"
                    stroke={isActive ? "rgba(129,140,248,0.7)" : "rgba(148,163,184,0.25)"}
                    strokeWidth={isActive ? 1.8 : 0.8}
                    strokeDasharray={isActive && !prefersReducedMotion ? "4 3" : "none"}
                    markerEnd={isActive ? "url(#arrowhead-active)" : "url(#arrowhead)"}
                    className="transition-all duration-300"
                  />
                  {edge.label && isActive && (
                    <text
                      x={mx}
                      y={my - 8}
                      textAnchor="middle"
                      className="text-[9px] font-medium select-none"
                      fill="rgba(148,163,184,0.7)"
                    >
                      {edge.label}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {layoutedNodes.map((node) => {
              if (node.x === undefined || node.y === undefined) return null;
              const isSelected = selectedNodeId === node.id;
              const isHovered = hoveredNodeId === node.id;
              const isConnected = connectedSet?.has(node.id) ?? true;
              const isDimmed = connectedSet && !isConnected;
              const style = getNodeStyle(node.type);
              const nodeRadius = isSelected ? 24 : isHovered ? 22 : 18;
              const typeKey = node.type.toLowerCase();
              const glowId = NODE_COLORS[typeKey] ? `node-glow-${typeKey}` : "node-glow";

              return (
                <g
                  key={node.id}
                  transform={`translate(${String(node.x)}, ${String(node.y)})`}
                  className="pointer-events-auto cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNodeSelect?.(node);
                  }}
                  onMouseEnter={() => {
                    setHoveredNodeId(node.id);
                  }}
                  onMouseLeave={() => {
                    setHoveredNodeId(null);
                  }}
                  style={{
                    opacity: isDimmed ? 0.06 : 1,
                    transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  {/* Outer glow ring — selected */}
                  {isSelected && (
                    <>
                      <circle r={48} fill={`url(#${glowId})`} opacity={0.7} />
                      <circle r={36} fill="url(#selection-ring)" />
                    </>
                  )}

                  {/* Outer glow ring — hovered */}
                  {isHovered && !isSelected && (
                    <circle r={34} fill={`url(#${glowId})`} opacity={0.4} />
                  )}

                  {/* Ambient depth ring */}
                  <circle
                    r={nodeRadius + 2}
                    fill="none"
                    stroke={isSelected ? style.stroke : "transparent"}
                    strokeWidth={1}
                    strokeOpacity={0.15}
                    strokeDasharray="2 2"
                  />

                  {/* Main node body */}
                  <circle
                    r={nodeRadius}
                    fill={isSelected || isHovered ? style.fill : "rgba(15,21,37,0.85)"}
                    stroke={style.stroke}
                    strokeWidth={isSelected ? 2.5 : isHovered ? 2 : 1.2}
                    strokeOpacity={isSelected ? 1 : isHovered ? 0.7 : 0.4}
                    filter={isSelected ? "url(#node-shadow)" : undefined}
                    className="transition-all duration-200"
                  />

                  {/* Inner highlight arc */}
                  <path
                    d={`M ${String(-nodeRadius * 0.6)} ${String(-nodeRadius * 0.3)} A ${String(nodeRadius * 0.8)} ${String(nodeRadius * 0.8)} 0 0 1 ${String(nodeRadius * 0.6)} ${String(-nodeRadius * 0.3)}`}
                    fill="none"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth={1}
                    strokeLinecap="round"
                  />

                  {/* Icon */}
                  <path
                    d={style.icon}
                    fill={isSelected ? style.stroke : "rgba(148,163,184,0.6)"}
                    fillOpacity={isSelected ? 0.95 : isHovered ? 0.8 : 0.5}
                    transform="translate(-12, -12) scale(1)"
                    className="transition-all duration-200"
                  />

                  {/* Label */}
                  <text
                    y={nodeRadius + 14}
                    textAnchor="middle"
                    className="select-none"
                    fill={isSelected ? "rgba(241,245,249,0.95)" : "rgba(148,163,184,0.8)"}
                    fontSize={11}
                    fontWeight={isSelected ? 600 : 500}
                    fontFamily="Inter, system-ui, sans-serif"
                  >
                    {node.label}
                  </text>

                  {/* Type badge */}
                  <text
                    y={nodeRadius + 26}
                    textAnchor="middle"
                    className="select-none"
                    fill={isSelected ? style.stroke : "rgba(100,116,139,0.6)"}
                    fontSize={8}
                    fontWeight={600}
                    fontFamily="Inter, system-ui, sans-serif"
                    letterSpacing="0.08em"
                  >
                    {node.type.toUpperCase()}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
}
