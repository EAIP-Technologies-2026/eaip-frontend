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
  LoadingState,
  ErrorState,
  FormField,
  ConfirmDialog,
  useConfirm,
} from "@eaip/ui-enterprise";
import { Dialog } from "@eaip/ui-foundation";
import { Button } from "@eaip/ui-primitives";
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

function MissionsPageContent() {
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
      addToast({
        type: "success",
        title: "Mission executed",
        message: result.data.executionId,
      });
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

  return (
    <EnterpriseShell
      appId="mission-control"
      pageTitle="Missions"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Missions" }]}
    >
      <div className="space-y-8">
        <section className="surface-hero relative overflow-hidden p-8 lg:p-10">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br from-primary-subtle/50 to-transparent blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-gradient-to-tr from-accent-glow/30 to-transparent blur-2xl" aria-hidden="true" />
          <div className="relative">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-primary uppercase mb-4">
              <EnterpriseIcon name="activity" size={14} />
              Mission Control
            </div>
            <h1 className="text-3xl font-bold text-text tracking-tight">Missions</h1>
            <p className="mt-3 text-base text-text-secondary max-w-2xl leading-relaxed">Plan, execute, and monitor enterprise missions and coordinated agent workflows.</p>
          </div>
        </section>

        {loading ? (
          <LoadingState message="Loading missions..." />
        ) : error ? (
          <ErrorState message={error} onRetry={() => { void loadMissions(); }} />
        ) : (
          <div className="space-y-6">
            {/* Executive Summary Strip (Layer 2) */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border border-border bg-surface px-5 py-3">
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <EnterpriseIcon name="rocket" size={16} />
                <span><strong className="text-text">{String(missions.length)}</strong> missions</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <EnterpriseIcon name="play" size={16} />
                <span><strong className="text-text">{String(missions.filter((m) => m.status === "running").length)}</strong> running</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <EnterpriseIcon name="clock" size={16} />
                <span><strong className="text-text">{String(missions.filter((m) => m.status === "pending").length)}</strong> pending</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <EnterpriseIcon name="checkCircle" size={16} />
                <span><strong className="text-text">{String(missions.filter((m) => m.status === "completed").length)}</strong> completed</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <EnterpriseIcon name="alert" size={16} />
                <span><strong className="text-text">{String(missions.filter((m) => m.status === "failed").length)}</strong> failed</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <EnterpriseIcon name="layers" size={16} />
                <span><strong className="text-text">{String(Math.round(missions.reduce((acc, m) => acc + m.progress, 0) / Math.max(missions.length, 1) * 100))}%</strong> avg progress</span>
              </div>
              <div className="ml-auto">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setModalOpen(true);
                  }}
                >
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
                render: (mission) => <span className="font-medium">{mission.name}</span>,
              },
              {
                key: "status",
                header: "Status",
                sortable: true,
                filterable: true,
                render: (mission) => (
                  <span className="rounded-full bg-surface-secondary px-2 py-0.5 text-xs capitalize">
                    {mission.status}
                  </span>
                ),
              },
              {
                key: "progress",
                header: "Progress",
                sortable: true,
                render: (mission) => `${String(Math.round(mission.progress * 100))}%`,
              },
              {
                key: "agents",
                header: "Agents",
                render: (mission) => mission.agentIds.length,
              },
              {
                key: "workflows",
                header: "Workflows",
                render: (mission) => mission.workflowIds.length,
              },
              {
                key: "actions",
                header: "Actions",
                render: (mission) => (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        void handleExecute(mission);
                      }}
                      className="text-sm text-success hover:underline"
                    >
                      Execute
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        void handleDelete(mission);
                      }}
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

      <Dialog
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
        }}
        title="Create mission"
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
          <FormField control={form.control} name="agentIds" label="Agent IDs (comma separated)">
            {({ field }) => (
              <input
                {...field}
                id="agentIds"
                type="text"
                className="w-full rounded-lg border border-border px-3 py-2 text-text bg-surface placeholder:text-text-secondary"
              />
            )}
          </FormField>
          <FormField control={form.control} name="workflowIds" label="Workflow IDs (comma separated)">
            {({ field }) => (
              <input
                {...field}
                id="workflowIds"
                type="text"
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
              {form.formState.isSubmitting ? "Creating..." : "Create"}
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

export default function MissionsPage() {
  return (
    <RequireAuth>
      <MissionsPageContent />
    </RequireAuth>
  );
}
