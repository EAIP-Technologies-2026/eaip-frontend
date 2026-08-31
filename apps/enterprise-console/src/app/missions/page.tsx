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
import {
  fetchMissions,
  createMission,
  executeMission,
  deleteMission,
} from "../../services/missions-service";
import type { Mission } from "../../services/missions-service";
import { ExplainThis } from "../../components/explain-this";
import { ShowRelated } from "../../components/show-related-panel";
import { ImpactMarkers } from "../../components/impact-markers";
import { StorylineFeed } from "../../components/storyline-feed";

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
  const [selectedId, setSelectedId] = useState<string | null>(null);
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
          ? data.agentIds
              .split(",")
              .map((id) => id.trim())
              .filter(Boolean)
          : [],
        workflowIds: data.workflowIds
          ? data.workflowIds
              .split(",")
              .map((id) => id.trim())
              .filter(Boolean)
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
            <div className="text-primary mb-4 flex items-center gap-2 text-xs font-semibold tracking-widest uppercase">
              <EnterpriseIcon name="rocket" size={14} />
              Mission Control
            </div>
            <h1 className="text-text text-3xl font-bold tracking-tight">Missions</h1>
            <p className="text-text-secondary mt-3 max-w-2xl text-base leading-relaxed">
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
                <div
                  key={i}
                  className="skeleton-card h-16"
                  style={{ animationDelay: String(i * 80) + "ms" }}
                />
              ))}
            </div>
          </div>
        ) : error && missions.length === 0 ? (
          <ErrorState
            title="Could not load missions"
            message={error}
            onRetry={() => void loadMissions()}
          />
        ) : (
          <div className="space-y-6">
            <div className="border-border bg-surface flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border px-5 py-3">
              <div className="text-text-secondary flex items-center gap-2 text-sm">
                <EnterpriseIcon name="rocket" size={16} />
                <span>
                  <strong className="text-text">{String(summary.total)}</strong> missions
                </span>
              </div>
              <div className="bg-border h-4 w-px" />
              <div className="text-text-secondary flex items-center gap-2 text-sm">
                <EnterpriseIcon name="play" size={16} />
                <span>
                  <strong className="text-text">{String(summary.running)}</strong> running
                </span>
              </div>
              <div className="bg-border h-4 w-px" />
              <div className="text-text-secondary flex items-center gap-2 text-sm">
                <EnterpriseIcon name="clock" size={16} />
                <span>
                  <strong className="text-text">{String(summary.pending)}</strong> pending
                </span>
              </div>
              <div className="bg-border h-4 w-px" />
              <div className="text-text-secondary flex items-center gap-2 text-sm">
                <EnterpriseIcon name="checkCircle" size={16} />
                <span>
                  <strong className="text-text">{String(summary.completed)}</strong> completed
                </span>
              </div>
              <div className="bg-border h-4 w-px" />
              <div className="text-text-secondary flex items-center gap-2 text-sm">
                <EnterpriseIcon name="alert" size={16} />
                <span>
                  <strong className="text-text">{String(summary.failed)}</strong> failed
                </span>
              </div>
              <div className="bg-border h-4 w-px" />
              <div className="text-text-secondary flex items-center gap-2 text-sm">
                <EnterpriseIcon name="layers" size={16} />
                <span>
                  <strong className="text-text">{String(summary.avgProgress)}%</strong> avg progress
                </span>
              </div>
              <div className="ml-auto">
                <Button
                  variant="primary"
                  size="sm"
                  iconLeft="plus"
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
              onRowClick={(mission) => {
                setSelectedId(mission.id);
              }}
              columns={[
                {
                  key: "name",
                  header: "Name",
                  sortable: true,
                  filterable: true,
                  render: (mission) => (
                    <div>
                      <span className="text-text font-medium">{mission.name}</span>
                      {mission.description ? (
                        <p className="text-text-muted text-xs">{mission.description}</p>
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
                    <span className="bg-surface-secondary text-text-secondary rounded-full px-2 py-0.5 text-xs capitalize">
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
                      <span className="text-text-muted text-xs">
                        {String(Math.round(mission.progress * 100))}%
                      </span>
                    </div>
                  ),
                },
                { key: "agents", header: "Agents", render: (mission) => mission.agentIds.length },
                {
                  key: "workflows",
                  header: "Workflows",
                  render: (mission) => mission.workflowIds.length,
                },
                {
                  key: "actions",
                  header: "Actions",
                  render: (mission) => (
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => void handleExecute(mission)}
                        className="text-success text-sm hover:underline"
                      >
                        Execute
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(mission)}
                        className="text-danger text-sm hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  ),
                },
              ]}
            />
            {selectedId ? (
              <div className="border-border bg-surface/40 mt-6 space-y-4 rounded-xl border p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Mission to outcome — {selectedId}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedId(null);
                    }}
                  >
                    Close
                  </Button>
                </div>
                <p className="text-text-muted text-xs">
                  Why it started, what workflow executed, which KPI was affected, and whether the
                  prediction was accurate — composed from M2 predictions + approvals + audit proof
                  (synthetic demo data).
                </p>
                <ImpactMarkers entityId={selectedId} />
                <div className="grid gap-4 md:grid-cols-2">
                  <ExplainThis entityId={selectedId} entityType="mission" />
                  <ShowRelated entityId={selectedId} />
                </div>
                <StorylineFeed
                  onShowOnMap={(id) =>
                    window.open(`/knowledge/graph?focus=${encodeURIComponent(id)}`, "_self")
                  }
                />
              </div>
            ) : null}
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
                  className="border-border bg-surface text-text placeholder:text-text-secondary w-full rounded-lg border px-3 py-2"
                />
              )}
            </FormField>
            <FormField control={form.control} name="description" label="Description">
              {({ field }) => (
                <textarea
                  {...field}
                  id="description"
                  rows={3}
                  className="border-border bg-surface text-text placeholder:text-text-secondary w-full rounded-lg border px-3 py-2"
                />
              )}
            </FormField>
            <FormField control={form.control} name="agentIds" label="Agent IDs (comma separated)">
              {({ field }) => (
                <input
                  {...field}
                  id="agentIds"
                  type="text"
                  className="border-border bg-surface text-text placeholder:text-text-secondary w-full rounded-lg border px-3 py-2"
                />
              )}
            </FormField>
            <FormField
              control={form.control}
              name="workflowIds"
              label="Workflow IDs (comma separated)"
            >
              {({ field }) => (
                <input
                  {...field}
                  id="workflowIds"
                  type="text"
                  className="border-border bg-surface text-text placeholder:text-text-secondary w-full rounded-lg border px-3 py-2"
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
