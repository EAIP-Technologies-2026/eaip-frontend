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
import { Button } from "@eaip/ui-primitives";
import type { WorkflowDefinition } from "@eaip/workflow";
import { EnterpriseIcon } from "@eaip/icons";
import { logger } from "@eaip/logging";
import { fetchWorkflows, createWorkflow, updateWorkflow, deleteWorkflow, startWorkflow } from "../../services/workflows-service";

const workflowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

type WorkflowFormData = z.infer<typeof workflowSchema>;

function WorkflowsPageContent() {
  const hasPermission = usePlatformStore((state) => state.hasPermission);
  const addToast = usePlatformStore((state) => state.addToast);
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<WorkflowDefinition | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { confirm, state: confirmState, cancel } = useConfirm();

  const form = useForm<WorkflowFormData>({
    resolver: zodResolver(workflowSchema),
    defaultValues: { name: "", description: "" },
  });

  const loadWorkflows = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    setError(null);
    try {
      const result = await fetchWorkflows();
      setWorkflows(result.data);
      if (result.error) setError(result.error);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("Failed to load workflows", { error: message });
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadWorkflows(false);
  }, [loadWorkflows]);

  function openCreate() {
    setEditingWorkflow(null);
    form.reset({ name: "", description: "" });
    setModalOpen(true);
  }

  function openEdit(workflow: WorkflowDefinition) {
    setEditingWorkflow(workflow);
    form.reset({ name: workflow.name, description: "" });
    setModalOpen(true);
  }

  async function onSubmit(data: WorkflowFormData) {
    try {
      if (editingWorkflow) {
        const result = await updateWorkflow(editingWorkflow.id, data);
        if (result.error) throw new Error(result.error);
        setWorkflows((prev) =>
          prev.map((w) => (w.id === result.data.id ? result.data : w)),
        );
        addToast({ type: "success", title: "Workflow updated" });
      } else {
        const result = await createWorkflow({
          name: data.name,
          description: data.description ?? "",
          steps: [],
        });
        if (result.error) throw new Error(result.error);
        setWorkflows((prev) => [...prev, result.data]);
        addToast({ type: "success", title: "Workflow created" });
      }
      setModalOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("Failed to save workflow", { error: message });
      addToast({ type: "error", title: "Failed to save workflow", message });
    }
  }

  async function handleStart(workflowId: string) {
    if (!hasPermission("manage:workflows")) return;
    try {
      const result = await startWorkflow(workflowId);
      if (result.error) throw new Error(result.error);
      addToast({ type: "success", title: "Workflow started", message: result.data.runId });
      void loadWorkflows();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("Failed to start workflow", { error: message });
      addToast({ type: "error", title: "Failed to start workflow", message });
    }
  }

  async function handleDelete(workflow: WorkflowDefinition) {
    const confirmed = await confirm({
      title: "Delete workflow",
      message: `Are you sure you want to delete "${workflow.name}"?`,
      variant: "danger",
      confirmLabel: "Delete",
    });
    if (!confirmed) return;
    try {
      const result = await deleteWorkflow(workflow.id);
      if (result.error) throw new Error(result.error);
      setWorkflows((prev) => prev.filter((w) => w.id !== workflow.id));
      addToast({ type: "success", title: "Workflow deleted" });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("Failed to delete workflow", { error: message });
      addToast({ type: "error", title: "Failed to delete workflow", message });
    }
  }

  return (
    <EnterpriseShell
      appId="mission-control"
      pageTitle="Workflows"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Workflows" }]}
    >
      <div className="space-y-8">
        <section className="surface-hero relative overflow-hidden p-8 lg:p-10">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br from-primary-subtle/50 to-transparent blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-gradient-to-tr from-accent-glow/30 to-transparent blur-2xl" aria-hidden="true" />
          <div className="relative">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-primary uppercase mb-4">
              <EnterpriseIcon name="activity" size={14} />
              Workflow Engine
            </div>
            <h1 className="text-3xl font-bold text-text tracking-tight">Workflows</h1>
            <p className="mt-3 text-base text-text-secondary max-w-2xl leading-relaxed">Design, manage, and automate business workflows and agent orchestration.</p>
          </div>
        </section>

        {isLoading ? (
          <LoadingState message="Loading workflows..." />
        ) : error ? (
          <ErrorState message={error} onRetry={() => { void loadWorkflows(); }} />
        ) : (
          <div className="space-y-6">
            {/* Executive Summary Strip (Layer 2) */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border border-border bg-surface px-5 py-3">
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <EnterpriseIcon name="workflow" size={16} />
                <span><strong className="text-text">{String(workflows.length)}</strong> workflows</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <EnterpriseIcon name="activity" size={16} />
                <span><strong className="text-text">{String(workflows.filter((w) => w.status === "active").length)}</strong> active</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <EnterpriseIcon name="pause" size={16} />
                <span><strong className="text-text">{String(workflows.filter((w) => w.status !== "active").length)}</strong> inactive</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <EnterpriseIcon name="layers" size={16} />
                <span><strong className="text-text">{String(workflows.reduce((acc, w) => acc + w.steps.length, 0))}</strong> total steps</span>
              </div>
              <div className="ml-auto">
                {hasPermission("manage:workflows") ? (
                  <Button variant="primary" size="sm" onClick={openCreate}>
                    Create workflow
                  </Button>
                ) : null}
              </div>
            </div>

            <DataGrid
              data={workflows}
              keyExtractor={(workflow) => workflow.id}
              selectable={hasPermission("manage:workflows")}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              loading={false}
              pageSize={10}
              columns={[
              {
                key: "name",
                header: "Name",
                sortable: true,
                filterable: true,
                render: (workflow) => (
                  <Link
                    href={`/workflows/${workflow.id}`}
                    className="text-primary hover:underline"
                  >
                    {workflow.name}
                  </Link>
                ),
              },
              { key: "status", header: "Status", sortable: true, filterable: true },
              {
                key: "steps",
                header: "Steps",
                sortable: true,
                render: (workflow) => workflow.steps.length,
              },
              {
                key: "actions",
                header: "Actions",
                render: (workflow) => (
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/workflows/${workflow.id}`}
                      className="text-sm text-primary hover:underline"
                    >
                      View
                    </Link>
                    {hasPermission("manage:workflows") ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            void handleStart(workflow.id);
                          }}
                          className="text-sm text-success hover:underline"
                        >
                          Start
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            openEdit(workflow);
                          }}
                          className="text-sm text-primary hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            void handleDelete(workflow);
                          }}
                          className="text-sm text-danger hover:underline"
                        >
                          Delete
                        </button>
                      </>
                    ) : null}
                  </div>
                ),
              },
            ]}
          />
          </div>
        )}
      </div>

      <Dialog
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
        }}
        title={editingWorkflow ? "Edit workflow" : "Create workflow"}
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
              {form.formState.isSubmitting ? "Saving..." : editingWorkflow ? "Update" : "Create"}
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

export default function WorkflowsPage() {
  return (
    <RequireAuth>
      <WorkflowsPageContent />
    </RequireAuth>
  );
}
