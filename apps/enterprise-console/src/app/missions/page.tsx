"use client";

import { useEffect, useState, useCallback } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RequireAuth } from "@eaip/auth";
import { usePlatformStore } from "@eaip/state";
import {
  EnterpriseShell,
  DataGrid,
  ErrorState,
  FormField,
  ConfirmDialog,
  useConfirm,
} from "@eaip/ui-enterprise";
import { Dialog, DialogContent, DialogTitle } from "@eaip/ui-foundation";
import { Button, LinearProgress } from "@eaip/ui-primitives";
import { EnterpriseIcon } from "@eaip/icons";
import { logger } from "@eaip/logging";
import { fetchMissions, createMission, executeMission, deleteMission } from "../../services/missions-service";
import type { Mission } from "../../services/missions-service";

const missionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  agentIds: z.string().optional(),
  workflowIds: z.string().optional(),
});

type MissionFormData = z.infer<typeof missionSchema>;

function MissionsContent() {
  const addToast = usePlatformStore((state) => state.addToast);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { confirm, state: confirmState, cancel } = useConfirm();

  const form = useForm<MissionFormData>({
    resolver: zodResolver(missionSchema),
    defaultValues: { name: "", description: "", agentIds: "", workflowIds: "" },
  });

  const loadMissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchMissions();
      setMissions(result.data);
      if (result.error) setError(result.error);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("Failed to load missions", { error: message });
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMissions();
  }, [loadMissions]);

  async function onSubmit(data: MissionFormData) {
    try {
      const result = await createMission({
        name: data.name,
        description: data.description,
        agentIds: data.agentIds
          ? data.agentIds.split(",").map((id) => id.trim()).filter(Boolean)
          : [],
        workflowIds: data.workflowIds
          ? data.workflowIds.split(",").map((id) => id.trim()).filter(Boolean)
          : [],
      });
      if (result.error) throw new Error(result.error);
      addToast({ type: "success", title: "Mission created" });
      setModalOpen(false);
      form.reset();
      void loadMissions();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("Failed to create mission", { error: message });
      addToast({ type: "error", title: "Failed to create mission", message });
    }
  }

  async function handleExecute(mission: Mission) {
    try {
      const result = await executeMission(mission.id);
      if (result.error) throw new Error(result.error);
      addToast({ type: "success", title: "Mission executed", message: result.data.executionId });
      void loadMissions();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("Failed to execute mission", { error: message });
      addToast({ type: "error", title: "Failed to execute mission", message });
    }
  }

  async function handleDelete(mission: Mission) {
    const confirmed = await confirm({
      title: "Delete mission",
      message: `Are you sure you want to delete "${mission.name}"?`,
      variant: "danger",
      confirmLabel: "Delete",
    });
    if (!confirmed) return;
    try {
      const result = await deleteMission(mission.id);
      if (result.error) throw new Error(result.error);
      addToast({ type: "success", title: "Mission deleted" });
      void loadMissions();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("Failed to delete mission", { error: message });
      addToast({ type: "error", title: "Failed to delete mission", message });
    }
  }

  const summary = {
    total: missions.length,
    running: missions.filter((m) => m.status === "running").length,
    pending: missions.filter((m) => m.status === "pending").length,
    completed: missions.filter((m) => m.status === "completed").length,
    failed: missions.filter((m) => m.status === "failed").length,
    avgProgress: Math.round(
      (missions.reduce((acc, m) => acc + m.progress, 0) / Math.max(missions.length, 1)) * 100,
    ),
  };

  return (
    <EnterpriseShell
      appId="enterprise-console"
      pageTitle="Missions"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Missions" }]}
    >
      <div className="space-y-8">
        <section data-tour="missions" className="surface-hero relative overflow-hidden p-8 lg:p-10">
          <div className="relative">
            <div className="mb-4 flex items-center gap-2 text-xs font-semibold tracking-widest text-primary uppercase">
              <EnterpriseIcon name="rocket" size={14} />
              Mission Control
            </div>
            <h1 className="text-3xl font-bold text-text tracking-tight">Missions</h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-text-secondary">
              Plan, execute, and monitor enterprise missions and coordinated agent workflows from a
              single orchestration surface.
            </p>
          </div>
        </section>

        {loading ? (
          <div className="space-y-4">
            <div className="skeleton-card h-12" />
            <div className="grid gap-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="skeleton-card h-16" style={{ animationDelay: String(i * 80) + "ms" }} />
              ))}
            </div>
          </div>
        ) : error && missions.length === 0 ? (
          <ErrorState title="Could not load missions" message={error} onRetry={() => void loadMissions()} />
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border border-border bg-surface px-5 py-3">
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <EnterpriseIcon name="rocket" size={16} />
                <span><strong className="text-text">{String(summary.total)}</strong> missions</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <EnterpriseIcon name="play" size={16} />
                <span><strong className="text-text">{String(summary.running)}</strong> running</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <EnterpriseIcon name="clock" size={16} />
                <span><strong className="text-text">{String(summary.pending)}</strong> pending</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <EnterpriseIcon name="checkCircle" size={16} />
                <span><strong className="text-text">{String(summary.completed)}</strong> completed</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <EnterpriseIcon name="alert" size={16} />
                <span><strong className="text-text">{String(summary.failed)}</strong> failed</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <EnterpriseIcon name="layers" size={16} />
                <span><strong className="text-text">{String(summary.avgProgress)}%</strong> avg progress</span>
              </div>
              <div className="ml-auto">
                <Button variant="primary" size="sm" iconLeft="plus" onClick={() => { setModalOpen(true); }}>
                  Create mission
                </Button>
              </div>
            </div>

            <DataGrid
              data={missions}
              keyExtractor={(mission) => mission.id}
              loading={loading}
              pageSize={10}
              columns={[
                {
                  key: "name",
                  header: "Name",
                  sortable: true,
                  filterable: true,
                  render: (mission) => (
                    <div>
                      <span className="font-medium text-text">{mission.name}</span>
                      {mission.description ? (
                        <p className="text-xs text-text-muted">{mission.description}</p>
                      ) : null}
                    </div>
                  ),
                },
                {
                  key: "status",
                  header: "Status",
                  sortable: true,
                  filterable: true,
                  render: (mission) => (
                    <span className="rounded-full bg-surface-secondary px-2 py-0.5 text-xs capitalize text-text-secondary">
                      {mission.status}
                    </span>
                  ),
                },
                {
                  key: "progress",
                  header: "Progress",
                  sortable: true,
                  render: (mission) => (
                    <div className="flex items-center gap-2">
                      <LinearProgress value={Math.round(mission.progress * 100)} className="w-24" />
                      <span className="text-xs text-text-muted">{String(Math.round(mission.progress * 100))}%</span>
                    </div>
                  ),
                },
                { key: "agents", header: "Agents", render: (mission) => mission.agentIds.length },
                { key: "workflows", header: "Workflows", render: (mission) => mission.workflowIds.length },
                {
                  key: "actions",
                  header: "Actions",
                  render: (mission) => (
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => void handleExecute(mission)}
                        className="text-sm text-success hover:underline"
                      >
                        Execute
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(mission)}
                        className="text-sm text-danger hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        )}
      </div>

      <Dialog open={modalOpen} onClose={() => { setModalOpen(false); }} title="Create mission">
        <DialogContent>
          <DialogTitle>Create mission</DialogTitle>
          <form
            onSubmit={(event) => {
              void form.handleSubmit(onSubmit)(event);
            }}
            className="mt-5 space-y-4"
          >
            <FormField control={form.control} name="name" label="Name">
              {({ field }) => (
                <input
                  {...field}
                  id="name"
                  type="text"
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-text placeholder:text-text-secondary"
                />
              )}
            </FormField>
            <FormField control={form.control} name="description" label="Description">
              {({ field }) => (
                <textarea
                  {...field}
                  id="description"
                  rows={3}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-text placeholder:text-text-secondary"
                />
              )}
            </FormField>
            <FormField control={form.control} name="agentIds" label="Agent IDs (comma separated)">
              {({ field }) => (
                <input
                  {...field}
                  id="agentIds"
                  type="text"
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-text placeholder:text-text-secondary"
                />
              )}
            </FormField>
            <FormField control={form.control} name="workflowIds" label="Workflow IDs (comma separated)">
              {({ field }) => (
                <input
                  {...field}
                  id="workflowIds"
                  type="text"
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-text placeholder:text-text-secondary"
                />
              )}
            </FormField>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => { setModalOpen(false); }}>
                Cancel
              </Button>
              <Button type="submit" loading={form.formState.isSubmitting} variant="primary">
                {form.formState.isSubmitting ? "Creating..." : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        variant={confirmState.variant}
        confirmLabel={confirmState.confirmLabel}
        cancelLabel={confirmState.cancelLabel}
        onConfirm={() => confirmState.onConfirm?.()}
        onCancel={cancel}
      />
    </EnterpriseShell>
  );
}

export default function MissionsPage() {
  return (
    <RequireAuth>
      <MissionsContent />
    </RequireAuth>
  );
}
