"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RequireAuth } from "@eaip/auth";
import { usePlatformStore } from "@eaip/state";
import {
  EnterpriseShell,
  DataGrid,
  LoadingState,
  ErrorState,
  ConfirmDialog,
  FormField,
  useConfirm,
} from "@eaip/ui-enterprise";
import { Dialog } from "@eaip/ui-foundation";
import { Button, EmptyState } from "@eaip/ui-primitives";
import { useRouter } from "next/navigation";
import type { Agent } from "@eaip/agent";
import { logger } from "@eaip/logging";
import { EnterpriseIcon } from "@eaip/icons";
import {
  listAgents,
  createAgent,
  updateAgent,
  deleteAgent,
} from "../../services/agents-service";
import { useFallback } from "../../services/fallback-context";

const agentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  model: z.string().optional(),
  systemPrompt: z.string().optional(),
});

type AgentFormData = z.infer<typeof agentSchema>;

function AgentsPageContent() {
  const router = useRouter();
  const hasPermission = usePlatformStore((state) => state.hasPermission);
  const addToast = usePlatformStore((state) => state.addToast);
  const { setFallback } = useFallback();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { confirm, state: confirmState, cancel } = useConfirm();

  const form = useForm<AgentFormData>({
    resolver: zodResolver(agentSchema),
    defaultValues: {
      name: "",
      description: "",
      model: "",
      systemPrompt: "",
    },
  });

  const loadAgents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listAgents();
      setFallback("agents", result.source === "fallback");
      setAgents(result.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("Failed to load agents", { error: message });
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [setFallback]);

  useEffect(() => {
    void loadAgents();
  }, [loadAgents]);

  function openCreate() {
    setEditingAgent(null);
    form.reset({ name: "", description: "", model: "", systemPrompt: "" });
    setModalOpen(true);
  }

  function openEdit(agent: Agent) {
    setEditingAgent(agent);
    form.reset({
      name: agent.name,
      description: agent.description ?? "",
      model: agent.model ?? "",
      systemPrompt: agent.systemPrompt ?? "",
    });
    setModalOpen(true);
  }

  async function onSubmit(data: AgentFormData) {
    try {
      if (editingAgent) {
        const result = await updateAgent(editingAgent.id, data);
        setAgents((prev) => prev.map((agent) => (agent.id === result.data.id ? result.data : agent)));
        addToast({ type: "success", title: "Agent updated" });
      } else {
        const result = await createAgent(data.name, data.description);
        setAgents((prev) => [...prev, result.data]);
        addToast({ type: "success", title: "Agent created" });
      }
      setModalOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("Failed to save agent", { error: message });
      addToast({ type: "error", title: "Failed to save agent", message });
    }
  }

  async function handleDelete(agent: Agent) {
    const confirmed = await confirm({
      title: "Delete agent",
      message: `Are you sure you want to delete "${agent.name}"? This action cannot be undone.`,
      variant: "danger",
      confirmLabel: "Delete",
    });
    if (!confirmed) return;
    try {
      await deleteAgent(agent.id);
      setAgents((prev) => prev.filter((a) => a.id !== agent.id));
      addToast({ type: "success", title: "Agent deleted" });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("Failed to delete agent", { error: message });
      addToast({ type: "error", title: "Failed to delete agent", message });
    }
  }

  async function handleBulkDelete() {
    const confirmed = await confirm({
      title: "Delete selected agents",
      message: `Are you sure you want to delete ${String(selectedIds.length)} agents?`,
      variant: "danger",
      confirmLabel: "Delete",
    });
    if (!confirmed) return;
    await Promise.all(
      selectedIds.map(async (id) => {
        await deleteAgent(id);
      }),
    );
    setSelectedIds([]);
    addToast({ type: "success", title: "Selected agents deleted" });
    void loadAgents();
  }

  return (
    <EnterpriseShell
      appId="enterprise-console"
      pageTitle="Agents"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Agents" }]}
    >
      <div className="space-y-8">
        <section data-tour="agents" className="surface-hero relative overflow-hidden p-8 lg:p-10">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br from-primary-subtle/50 to-transparent blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-gradient-to-tr from-accent-glow/30 to-transparent blur-2xl" aria-hidden="true" />
          <div className="relative">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-primary uppercase mb-4">
              <EnterpriseIcon name="activity" size={14} />
              Agent Fleet
            </div>
            <h1 className="text-3xl font-bold text-text tracking-tight">Agents</h1>
            <p className="mt-3 text-base text-text-secondary max-w-2xl leading-relaxed">Manage, configure, and monitor your autonomous agent fleet across the enterprise.</p>
          </div>
        </section>

        {hasPermission("manage:agents") ? (
          <div className="flex justify-end">
            <Button variant="primary" iconLeft="plus" onClick={openCreate}>
              Create agent
            </Button>
          </div>
        ) : null}

        {loading ? (
          <LoadingState message="Loading agents..." />
        ) : error ? (
          <ErrorState message={error} onRetry={() => { void loadAgents(); }} />
        ) : agents.length === 0 ? (
          <EmptyState
            icon="robot"
            title="No agents deployed"
            description="Get started by deploying your first enterprise agent to the platform."
            action={
              <Button variant="secondary" iconLeft="plus" onClick={() => { router.push("/marketplace"); }}>Explore Marketplace</Button>
            }
          />
        ) : (
          <DataGrid
            data={agents}
            keyExtractor={(agent) => agent.id}
            selectable={hasPermission("manage:agents")}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            loading={loading}
            pageSize={10}
            toolbar={
              selectedIds.length > 0 ? (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    void handleBulkDelete();
                  }}
                >
                  Delete {selectedIds.length} selected
                </Button>
              ) : null
            }
            columns={[
              {
                key: "name",
                header: "Name",
                sortable: true,
                filterable: true,
                render: (agent) => (
                  <Link href={`/agents/${agent.id}`} className="text-primary hover:underline">
                    {agent.name}
                  </Link>
                ),
              },
              { key: "status", header: "Status", sortable: true, filterable: true },
              { key: "model", header: "Model", sortable: true, filterable: true },
              {
                key: "metrics",
                header: "Runs",
                render: (agent) => agent.metrics?.totalExecutions ?? 0,
              },
              {
                key: "actions",
                header: "Actions",
                render: (agent) => (
                  <div className="flex items-center gap-2">
                    {hasPermission("manage:agents") ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            openEdit(agent);
                          }}
                          className="text-sm text-primary hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            void handleDelete(agent);
                          }}
                          className="text-sm text-danger hover:underline"
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <Link
                        href={`/agents/${agent.id}`}
                        className="text-sm text-primary hover:underline"
                      >
                        View
                      </Link>
                    )}
                  </div>
                ),
              },
            ]}
          />
        )}
      </div>

      <Dialog
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
        }}
        title={editingAgent ? "Edit agent" : "Create agent"}
      >
        <form
          onSubmit={(event) => {
            void form.handleSubmit(onSubmit)(event);
          }}
          className="space-y-4"
        >
          <FormField control={form.control} name="name" label="Name">
            {({ field }) => (
              <input
                {...field}
                id="name"
                type="text"
                className="w-full rounded-lg border border-border px-3 py-2 text-text bg-surface placeholder:text-text-secondary"
              />
            )}
          </FormField>
          <FormField control={form.control} name="description" label="Description">
            {({ field }) => (
              <textarea
                {...field}
                id="description"
                rows={3}
                className="w-full rounded-lg border border-border px-3 py-2 text-text bg-surface placeholder:text-text-secondary"
              />
            )}
          </FormField>
          <FormField control={form.control} name="model" label="Model">
            {({ field }) => (
              <input
                {...field}
                id="model"
                type="text"
                className="w-full rounded-lg border border-border px-3 py-2 text-text bg-surface placeholder:text-text-secondary"
              />
            )}
          </FormField>
          <FormField control={form.control} name="systemPrompt" label="System Prompt">
            {({ field }) => (
              <textarea
                {...field}
                id="systemPrompt"
                rows={4}
                className="w-full rounded-lg border border-border px-3 py-2 text-text bg-surface placeholder:text-text-secondary"
              />
            )}
          </FormField>
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setModalOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={form.formState.isSubmitting}
              variant="primary"
            >
              {form.formState.isSubmitting ? "Saving..." : editingAgent ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Dialog>

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

export default function AgentsPage() {
  return (
    <RequireAuth>
      <AgentsPageContent />
    </RequireAuth>
  );
}
