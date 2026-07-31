"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
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
  SectionHeader,
} from "@eaip/ui-enterprise";
import { Dialog } from "@eaip/ui-foundation";
import { Button, EmptyState } from "@eaip/ui-primitives";
import { createMemoryClient, type MemoryEntry } from "@eaip/memory";
import { useDebounce } from "@eaip/hooks";
import { EnterpriseIcon } from "@eaip/icons";
import { logger } from "@eaip/logging";

const memorySchema = z.object({
  key: z.string().min(1, "Key is required"),
  value: z.string().min(1, "Value is required"),
});

type MemoryFormData = z.infer<typeof memorySchema>;

function MemoryPageContent() {
  const addToast = usePlatformStore((state) => state.addToast);
  const [memories, setMemories] = useState<MemoryEntry[]>([]);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMemory, setEditingMemory] = useState<MemoryEntry | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { confirm, state: confirmState, cancel } = useConfirm();

  const client = useMemo(() => createMemoryClient(), []);

  const form = useForm<MemoryFormData>({
    resolver: zodResolver(memorySchema),
    defaultValues: { key: "", value: "" },
  });

  const loadMemories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await client.list();
      setMemories(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("Failed to load memories", { error: message });
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    void loadMemories();
  }, [loadMemories]);

  useEffect(() => {
    async function search() {
      if (!debouncedQuery) {
        void loadMemories();
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await client.search(debouncedQuery);
        setMemories(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        logger.error("Failed to search memory", { error: message });
        setError(message);
      } finally {
        setLoading(false);
      }
    }
    void search();
  }, [debouncedQuery, client, loadMemories]);

  function openCreate() {
    setEditingMemory(null);
    form.reset({ key: "", value: "" });
    setModalOpen(true);
  }

  function openEdit(memory: MemoryEntry) {
    setEditingMemory(memory);
    form.reset({
      key: memory.key,
      value: JSON.stringify(memory.value),
    });
    setModalOpen(true);
  }

  async function onSubmit(data: MemoryFormData) {
    try {
      let parsedValue: unknown;
      try {
        parsedValue = JSON.parse(data.value);
      } catch {
        parsedValue = data.value;
      }
      await client.set(data.key, parsedValue);
      const entry: MemoryEntry = {
        id: data.key,
        key: data.key,
        value: parsedValue,
        timestamp: new Date().toISOString(),
      };
      setMemories((prev) => {
        const index = prev.findIndex((m) => m.key === data.key);
        if (index >= 0) {
          const next = [...prev];
          next[index] = entry;
          return next;
        }
        return [...prev, entry];
      });
      addToast({ type: "success", title: editingMemory ? "Memory updated" : "Memory created" });
      setModalOpen(false);
      form.reset();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("Failed to save memory", { error: message });
      addToast({ type: "error", title: "Failed to save memory", message });
    }
  }

  async function handleDelete(memory: MemoryEntry) {
    const confirmed = await confirm({
      title: "Delete memory",
      message: `Are you sure you want to delete "${memory.key}"?`,
      variant: "danger",
      confirmLabel: "Delete",
    });
    if (!confirmed) return;
    try {
      await client.delete(memory.key);
      setMemories((prev) => prev.filter((m) => m.key !== memory.key));
      addToast({ type: "success", title: "Memory deleted" });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("Failed to delete memory", { error: message });
      addToast({ type: "error", title: "Failed to delete memory", message });
    }
  }

  async function handleBulkDelete() {
    const confirmed = await confirm({
      title: "Delete selected memories",
      message: `Are you sure you want to delete ${String(selectedIds.length)} memories?`,
      variant: "danger",
      confirmLabel: "Delete",
    });
    if (!confirmed) return;
    await Promise.all(
      selectedIds.map(async (id) => {
        const memory = memories.find((m) => m.id === id);
        if (memory) await client.delete(memory.key);
      }),
    );
    setSelectedIds([]);
    addToast({ type: "success", title: "Selected memories deleted" });
    void loadMemories();
  }

  const totalEntries = memories.length;
  const storageKb = Math.round(
    memories.reduce((acc, m) => acc + JSON.stringify(m.value).length, 0) / 1024,
  );
  const lastUpdated = useMemo(() => {
    if (memories.length === 0) return "—";
    const maxTime = Math.max(...memories.map((m) => new Date(m.timestamp).getTime()));
    return new Date(maxTime).toLocaleString();
  }, [memories]);

  return (
    <EnterpriseShell
      appId="workspace"
      pageTitle="Memory"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Memory" }]}
    >
      <div className="space-y-8">
        {/* Layer 1 — Hero */}
        <section className="surface-hero relative overflow-hidden p-8 lg:p-10">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br from-primary-subtle/50 to-transparent blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-gradient-to-tr from-accent-glow/30 to-transparent blur-2xl" aria-hidden="true" />
          <div className="relative">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-primary uppercase mb-4">
              <EnterpriseIcon name="activity" size={14} />
              Memory Bank
            </div>
            <h1 className="text-3xl font-bold text-text tracking-tight">Memory</h1>
            <p className="mt-3 text-base text-text-secondary max-w-2xl leading-relaxed">Manage semantic memory entries and persistent state for your agents.</p>
          </div>
        </section>

        {/* Layer 2 — Workspace Summary Strip */}
        <section className="space-y-4">
          <SectionHeader icon="barChart" title="Memory Overview" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="surface-card rounded-card p-4">
              <p className="text-sm font-medium text-text-secondary">Total Entries</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-text">{totalEntries}</p>
            </div>
            <div className="surface-card rounded-card p-4">
              <p className="text-sm font-medium text-text-secondary">Storage Used</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-text">{storageKb} KB</p>
            </div>
            <div className="surface-card rounded-card p-4">
              <p className="text-sm font-medium text-text-secondary">Last Updated</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-text">{lastUpdated}</p>
            </div>
          </div>
        </section>

        {/* Layer 3 — Operational Workspace */}
        <section className="space-y-4">
          <SectionHeader icon="activity" title="Memory Entries" />
          <div className="surface-card rounded-card overflow-hidden">
            <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center">
              <div className="flex-1">
                <input
                  type="text"
                  value={query}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setQuery(event.target.value);
                  }}
                  placeholder="Search memory..."
                  className="block w-full rounded-lg border border-border px-3 py-2 text-sm text-text bg-surface placeholder:text-text-secondary"
                />
              </div>
              <div className="flex items-center gap-2">
                {selectedIds.length > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      void handleBulkDelete();
                    }}
                  >
                    Delete {String(selectedIds.length)} selected
                  </Button>
                )}
                <Button variant="primary" onClick={openCreate}>
                  Create memory
                </Button>
              </div>
            </div>
            {loading ? (
              <LoadingState message="Loading memories..." />
            ) : error ? (
              <ErrorState message={error} onRetry={() => { void loadMemories(); }} />
            ) : memories.length === 0 ? (
              <EmptyState
                icon="brain"
                title="No memory entries"
                description="Memory is empty. Create your first memory entry to store persistent state for agents."
                action={
                  <Button variant="primary" onClick={openCreate}>
                    Create memory
                  </Button>
                }
              />
            ) : (
              <DataGrid
                data={memories}
                keyExtractor={(memory) => memory.id}
                selectable
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                loading={loading}
                pageSize={10}
                columns={[
                  {
                    key: "key",
                    header: "Key",
                    sortable: true,
                    filterable: true,
                    render: (memory) => <span className="font-medium">{memory.key}</span>,
                  },
                  {
                    key: "value",
                    header: "Value",
                    filterable: true,
                    render: (memory) => JSON.stringify(memory.value).slice(0, 80),
                  },
                  {
                    key: "timestamp",
                    header: "Timestamp",
                    sortable: true,
                    render: (memory) => new Date(memory.timestamp).toLocaleString(),
                  },
                  {
                    key: "actions",
                    header: "Actions",
                    render: (memory) => (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            openEdit(memory);
                          }}
                          className="text-sm text-primary hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            void handleDelete(memory);
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
            )}
          </div>
        </section>
      </div>

      <Dialog
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
        }}
        title={editingMemory ? "Edit memory" : "Create memory"}
      >
        <form
          onSubmit={(event) => {
            void form.handleSubmit(onSubmit)(event);
          }}
          className="space-y-4"
        >
          <FormField control={form.control} name="key" label="Key">
            {({ field }) => (
              <input
                {...field}
                id="key"
                type="text"
                disabled={Boolean(editingMemory)}
                className="w-full rounded-lg border border-border px-3 py-2 text-text bg-surface disabled:bg-surface-secondary placeholder:text-text-secondary"
              />
            )}
          </FormField>
          <FormField control={form.control} name="value" label="Value (JSON or text)">
            {({ field }) => (
              <textarea
                {...field}
                id="value"
                rows={5}
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
              {form.formState.isSubmitting ? "Saving..." : editingMemory ? "Update" : "Create"}
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

export default function MemoryPage() {
  return (
    <RequireAuth>
      <MemoryPageContent />
    </RequireAuth>
  );
}
