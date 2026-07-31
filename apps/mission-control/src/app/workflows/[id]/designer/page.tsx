"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  addEdge,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
  type NodeProps,
  type ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { RequireAuth } from "@eaip/auth";
import { usePlatformStore } from "@eaip/state";
import {
  EnterpriseShell,
  LoadingState,
  ErrorState,
  ConfirmDialog,
  useConfirm,
} from "@eaip/ui-enterprise";
import { Button, Badge } from "@eaip/ui-primitives";
import { EnterpriseIcon, type IconName } from "@eaip/icons";
import {
  createWorkflowClient,
  graphToWorkflowSteps,
  type WorkflowDefinition,
  type WorkflowDesignerGraph,
  type WorkflowDesignerNode,
  type WorkflowNodeData,
  type WorkflowNodeType,
} from "@eaip/workflow";
import { logger } from "@eaip/logging";

const nodeTypeLabels: Record<WorkflowNodeType, string> = {
  start: "Start",
  end: "End",
  ai: "AI step",
  condition: "Condition",
  human: "Human approval",
};

const nodeTypeIcons: Record<WorkflowNodeType, IconName> = {
  start: "play",
  end: "stop",
  ai: "robot",
  condition: "sliders",
  human: "user",
};

const nodeTypeClasses: Record<WorkflowNodeType, string> = {
  start: "border-success bg-success-subtle text-success",
  end: "border-danger bg-danger-subtle text-danger",
  ai: "border-primary bg-primary-subtle text-primary",
  condition: "border-warning bg-warning-subtle text-warning rotate-45",
  human: "border-accent bg-accent-subtle text-accent",
};

function nodeTypeClass(type: WorkflowNodeType): string {
  return nodeTypeClasses[type];
}

function nodeTypeLabel(type: WorkflowNodeType): string {
  return nodeTypeLabels[type];
}

function DesignerNode(props: NodeProps<WorkflowDesignerNode>) {
  const { data, selected } = props;
  const isDiamond = data.type === "condition";
  return (
    <div
      className={[
        "flex h-24 w-40 items-center justify-center rounded-lg border-2 px-2 py-1 text-center text-sm font-medium shadow-sm transition-shadow",
        nodeTypeClass(data.type),
        selected ? "shadow-lg ring-2 ring-offset-2 ring-primary" : "",
      ].join(" ")}
    >
      <div className={isDiamond ? "-rotate-45" : ""}>
        <div className="text-xs opacity-70">{nodeTypeLabel(data.type)}</div>
        <div className="line-clamp-2">{data.label}</div>
      </div>
    </div>
  );
}

function paletteItemClass(type: WorkflowNodeType): string {
  const base = "flex cursor-grab items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors active:cursor-grabbing";
  const color =
    type === "start"
      ? "border-success bg-success-subtle text-success hover:bg-success-subtle"
      : type === "end"
        ? "border-danger bg-danger-subtle text-danger hover:bg-danger-subtle"
        : type === "ai"
          ? "border-primary bg-primary-subtle text-primary hover:bg-primary-subtle"
          : type === "condition"
            ? "border-warning bg-warning-subtle text-warning hover:bg-warning-subtle"
            : "border-accent bg-accent-subtle text-accent hover:bg-accent-subtle";
  return `${base} ${color}`;
}

function generateNodeId(type: WorkflowNodeType): string {
  return `${type}-${crypto.randomUUID()}`;
}

function createDefaultNode(
  type: WorkflowNodeType,
  position: { x: number; y: number },
): Node<WorkflowNodeData> {
  return {
    id: generateNodeId(type),
    position,
    data: {
      label: `New ${nodeTypeLabels[type]}`,
      type,
      agentId:
        type === "ai"
          ? "agent"
          : type === "human"
            ? "human"
            : type === "condition"
              ? "condition"
              : undefined,
    },
  };
}

function isWorkflowNodeType(value: string): value is WorkflowNodeType {
  return ["start", "end", "ai", "condition", "human"].includes(value);
}

function validateGraph(
  nodes: Node<WorkflowNodeData>[],
  edges: Edge[],
): { valid: boolean; message?: string } {
  if (nodes.length === 0) {
    return { valid: false, message: "Add at least one node to the graph." };
  }
  const startNodes = nodes.filter((node) => node.data.type === "start");
  const endNodes = nodes.filter((node) => node.data.type === "end");
  if (startNodes.length === 0) {
    return { valid: false, message: "Graph must have a Start node." };
  }
  if (startNodes.length > 1) {
    return { valid: false, message: "Graph must have only one Start node." };
  }
  if (endNodes.length === 0) {
    return { valid: false, message: "Graph must have an End node." };
  }
  if (endNodes.length > 1) {
    return { valid: false, message: "Graph must have only one End node." };
  }

  const connectedNodeIds = new Set<string>();
  for (const edge of edges) {
    connectedNodeIds.add(edge.source);
    connectedNodeIds.add(edge.target);
  }
  const disconnected = nodes.filter((node) => !connectedNodeIds.has(node.id));
  if (disconnected.length > 0 && nodes.length > 1) {
    const first = disconnected[0];
    const label = first?.data.label ?? first?.id ?? "";
    return { valid: false, message: `Node "${label}" is disconnected.` };
  }

  return { valid: true };
}

function DesignerPageContent() {
  const params = useParams();
  const workflowId = String(params.id);
  const router = useRouter();
  const hasPermission = usePlatformStore((state) => state.hasPermission);
  const addToast = usePlatformStore((state) => state.addToast);
  const { confirm, state: confirmState, cancel } = useConfirm();

  const client = useMemo(() => createWorkflowClient(), []);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<WorkflowDesignerNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([] as Edge[]);
  const [workflow, setWorkflow] = useState<WorkflowDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [autosaving, setAutosaving] = useState(false);
  const [autosaveStatus, setAutosaveStatus] = useState<string>("");
  const [validation, setValidation] = useState<{ valid: boolean; message?: string }>({ valid: true });
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance<WorkflowDesignerNode> | null>(null);

  const nodeTypes = useMemo(() => ({ designerNode: DesignerNode }), []);

  const loadDesigner = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [workflowData, graph] = await Promise.all([
        client.getWorkflow(workflowId),
        client.getDesignerGraph(workflowId),
      ]);
      setWorkflow(workflowData);
      if ((graph?.nodes.length ?? 0) > 0) {
        setNodes(graph?.nodes ?? []);
        setEdges(graph?.edges ?? []);
      } else {
        const defaultNodes: Node<WorkflowNodeData>[] = [
          createDefaultNode("start", { x: 100, y: 200 }),
          createDefaultNode("end", { x: 600, y: 200 }),
        ];
        setNodes(defaultNodes);
        setEdges([]);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("Failed to load designer", { error: message });
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [workflowId, client, setNodes, setEdges]);

  useEffect(() => {
    void loadDesigner();
  }, [loadDesigner]);

  useEffect(() => {
    setValidation(validateGraph(nodes, edges));
  }, [nodes, edges]);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge({ ...connection, animated: true }, eds));
    },
    [setEdges],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData("application/reactflow");
      if (!isWorkflowNodeType(type) || !reactFlowWrapper.current || !reactFlowInstance) return;

      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });
      const newNode = createDefaultNode(type, position);
      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes],
  );

  function handleAddNode(type: WorkflowNodeType) {
    const newNode = createDefaultNode(type, { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 });
    setNodes((nds) => nds.concat(newNode));
  }

  async function handleSave() {
    const check = validateGraph(nodes, edges);
    if (!check.valid) {
      addToast({ type: "error", title: "Validation failed", message: check.message });
      return;
    }
    setSaving(true);
    try {
      const graph: WorkflowDesignerGraph = { nodes, edges };
      await client.saveDesignerGraph(workflowId, graph);
      await client.updateWorkflow(workflowId, { steps: graphToWorkflowSteps(graph) });
      addToast({ type: "success", title: "Workflow saved" });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("Failed to save designer graph", { error: message });
      addToast({ type: "error", title: "Failed to save workflow", message });
    } finally {
      setSaving(false);
    }
  }

  async function handleAutosave() {
    setAutosaving(true);
    setAutosaveStatus("Autosaving...");
    try {
      const graph: WorkflowDesignerGraph = { nodes, edges };
      await client.autosaveDesignerGraph(workflowId, graph);
      setAutosaveStatus("Autosaved");
      addToast({ type: "success", title: "Autosaved" });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("Failed to autosave designer graph", { error: message });
      setAutosaveStatus("Autosave failed");
      addToast({ type: "error", title: "Autosave failed", message });
    } finally {
      setAutosaving(false);
    }
  }

  async function handleLoadAutosave() {
    setLoading(true);
    try {
      const graph = await client.loadAutosave(workflowId);
      if (graph) {
        setNodes(graph.nodes);
        setEdges(graph.edges);
        setAutosaveStatus("Autosave restored");
        addToast({ type: "success", title: "Autosave restored" });
      } else {
        setAutosaveStatus("No autosave found");
        addToast({ type: "info", title: "No autosave found" });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("Failed to load autosave", { error: message });
      addToast({ type: "error", title: "Failed to load autosave", message });
    } finally {
      setLoading(false);
    }
  }

  async function handleClearAutosave() {
    const confirmed = await confirm({
      title: "Clear autosave",
      message: "Are you sure you want to discard the autosaved graph?",
      variant: "danger",
      confirmLabel: "Clear",
    });
    if (!confirmed) return;
    try {
      await client.clearAutosave(workflowId);
      setAutosaveStatus("Autosave cleared");
      addToast({ type: "success", title: "Autosave cleared" });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("Failed to clear autosave", { error: message });
      addToast({ type: "error", title: "Failed to clear autosave", message });
    }
  }

  async function handleCreateVersion() {
    try {
      const version = await client.createVersion(workflowId, `Version ${new Date().toISOString()}`);
      addToast({ type: "success", title: "Version created", message: version.id });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("Failed to create version", { error: message });
      addToast({ type: "error", title: "Failed to create version", message });
    }
  }

  function handlePreview() {
    router.push(`/workflows/${workflowId}`);
  }

  const paletteTypes: WorkflowNodeType[] = ["start", "ai", "condition", "human", "end"];

  return (
    <EnterpriseShell
      appId="mission-control"
      pageTitle={workflow?.name ? `${workflow.name} - Designer` : "Workflow designer"}
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Workflows", href: "/workflows" },
        { label: workflow?.name ?? workflowId, href: `/workflows/${workflowId}` },
        { label: "Designer" },
      ]}
    >
      {loading ? (
        <LoadingState message="Loading designer..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => { void loadDesigner(); }} />
      ) : (
        <div className="flex h-[calc(100vh-10rem)] flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-surface p-4">
            <div className="flex items-center gap-2">
              <Badge variant={validation.valid ? "success" : "danger"}>
                {validation.valid ? "Valid" : "Invalid"}
              </Badge>
              {validation.message ? (
                <span className="text-sm text-danger">{validation.message}</span>
              ) : (
                <span className="text-sm text-text-secondary">Graph is connected with one start and one end.</span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {autosaveStatus ? (
                <span className="text-xs text-text-secondary">{autosaveStatus}</span>
              ) : null}
              {hasPermission("manage:workflows") ? (
                <>
                  <Button variant="secondary" size="sm" onClick={handlePreview} iconLeft="layoutDashboard">
                    Preview
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => { void handleAutosave(); }}
                    loading={autosaving}
                    iconLeft="save"
                  >
                    Autosave
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => { void handleLoadAutosave(); }}
                    iconLeft="refresh"
                  >
                    Load autosave
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { void handleClearAutosave(); }}
                    iconLeft="trash"
                  >
                    Clear autosave
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => { void handleCreateVersion(); }}
                    iconLeft="tag"
                  >
                    Create version
                  </Button>
                  <Button
                    onClick={() => { void handleSave(); }}
                    loading={saving}
                    disabled={!validation.valid}
                    size="sm"
                    iconLeft="save"
                  >
                    Save
                  </Button>
                </>
              ) : null}
            </div>
          </div>

          <div className="flex flex-1 gap-4 overflow-hidden">
            <aside className="w-56 rounded-lg border bg-surface p-4">
              <h3 className="mb-3 text-sm font-semibold text-text">Palette</h3>
              <p className="mb-3 text-xs text-text-secondary">Drag a node onto the canvas.</p>
              <div className="space-y-2">
                {paletteTypes.map((type) => (
                  <div
                    key={type}
                    draggable
                    onDragStart={(event) => {
                      event.dataTransfer.setData("application/reactflow", type);
                      event.dataTransfer.effectAllowed = "move";
                    }}
                    className={paletteItemClass(type)}
                  >
                    <EnterpriseIcon name={nodeTypeIcons[type]} size={16} />
                    <span>{nodeTypeLabels[type]}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 border-t pt-4">
                <p className="mb-2 text-xs text-text-secondary">Or add directly:</p>
                <div className="flex flex-wrap gap-2">
                  {paletteTypes.map((type) => (
                    <button
                      key={`add-${type}`}
                      type="button"
                      onClick={() => { handleAddNode(type); }}
                      className="rounded-full bg-surface-secondary px-2 py-1 text-xs text-text hover:bg-surface-tertiary"
                    >
                      + {nodeTypeLabels[type]}
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            <div ref={reactFlowWrapper} className="flex-1 rounded-lg border bg-surface-secondary">
              <ReactFlow<WorkflowDesignerNode>
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onInit={setReactFlowInstance}
                onDrop={onDrop}
                onDragOver={onDragOver}
                nodeTypes={nodeTypes}
                fitView
                attributionPosition="bottom-right"
              >
                <Background gap={16} size={1} />
                <Controls />
                <MiniMap nodeStrokeWidth={3} zoomable pannable />
              </ReactFlow>
            </div>
          </div>
        </div>
      )}

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

export default function WorkflowDesignerPage() {
  return (
    <RequireAuth>
      <DesignerPageContent />
    </RequireAuth>
  );
}
