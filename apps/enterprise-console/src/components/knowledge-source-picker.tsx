"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@eaip/ui-foundation";
import { Badge, Button, Checkbox, EmptyState, Input } from "@eaip/ui-primitives";
import { Spinner } from "@eaip/ui-primitives";
import type { KnowledgeCollection } from "@eaip/knowledge";
import { ApiKnowledgeClient } from "@eaip/knowledge";

export interface KnowledgeSourcePickerProps {
  open: boolean;
  onClose: () => void;
  currentSources: string[];
  onSave: (sources: string[]) => Promise<void>;
}

export function KnowledgeSourcePicker({
  open,
  onClose,
  currentSources,
  onSave,
}: KnowledgeSourcePickerProps) {
  const [collections, setCollections] = useState<KnowledgeCollection[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set(currentSources));
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const client = useMemo(() => new ApiKnowledgeClient(), []);

  const loadCollections = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await client.listCollections();
      setCollections(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load knowledge sources");
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    if (open) {
      setSelected(new Set(currentSources));
      setSearch("");
      void loadCollections();
    }
  }, [open, currentSources, loadCollections]);

  const filtered = useMemo(() => {
    if (!search.trim()) return collections;
    const q = search.toLowerCase();
    return collections.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.description ?? "").toLowerCase().includes(q),
    );
  }, [collections, search]);

  function toggle(name: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    try {
      await onSave([...selected]);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save knowledge sources");
    } finally {
      setSaving(false);
    }
  }

  const hasChanges =
    selected.size !== currentSources.length ||
    [...selected].some((s) => !currentSources.includes(s));

  return (
    <Dialog open={open} onClose={onClose} title="Add Knowledge Sources">
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto p-5 sm:p-6">
        <DialogTitle>Add Knowledge Sources</DialogTitle>
        <p className="mb-4 text-sm text-text-secondary">
          Select knowledge collections to connect to this Brain.
        </p>
        <div className="space-y-4">
          <div className="rounded-card border border-border/70 bg-surface-secondary/60 p-1">
            <Input
              placeholder="Search knowledge sources..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); }}
              aria-label="Search knowledge sources"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" className="text-primary" />
            </div>
          ) : error ? (
            <div className="rounded-card border border-danger/30 bg-danger-subtle p-4 text-sm text-danger">
              <p>{error}</p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-2"
                onClick={() => void loadCollections()}
              >
                Retry
              </Button>
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon="book"
              title={search ? "No matching sources" : "No knowledge sources available"}
              description={
                search
                  ? "Try a different search term."
                  : "Create knowledge collections in the Knowledge section first."
              }
            />
          ) : (
            <div
              className="max-h-80 space-y-1 overflow-y-auto rounded-card border border-border/80 bg-surface-secondary/40 p-1"
              role="listbox"
              aria-label="Knowledge collections"
              aria-multiselectable="true"
            >
              {filtered.map((collection) => {
                const isSelected = selected.has(collection.name);
                return (
                  <button
                    key={collection.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => { toggle(collection.name); }}
                    className={[
                      "flex w-full items-start gap-3 px-4 py-3 text-left transition-smooth",
                      "hover:bg-surface-secondary",
                      "focus:ring-primary focus:ring-2 focus:outline-none",
                      isSelected ? "bg-primary-subtle" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <Checkbox
                      checked={isSelected}
                      onChange={() => { toggle(collection.name); }}
                      aria-label={`Select ${collection.name}`}
                      className="mt-0.5"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-text">
                          {collection.name}
                        </span>
                        <Badge variant="default" className="shrink-0">
                          {collection.documentCount}{" "}
                          {collection.documentCount === 1 ? "doc" : "docs"}
                        </Badge>
                      </div>
                      {collection.description ? (
                        <p className="mt-0.5 truncate text-xs text-text-secondary">
                          {collection.description}
                        </p>
                      ) : null}
                    </div>
                    {isSelected ? (
                      <Badge variant="primary" className="shrink-0">
                        Selected
                      </Badge>
                    ) : null}
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-between border-t border-border pt-4">
            <p className="text-sm text-text-secondary">
              {selected.size} source{selected.size !== 1 ? "s" : ""} selected
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button
                loading={saving}
                disabled={!hasChanges}
                onClick={() => void handleSave()}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
