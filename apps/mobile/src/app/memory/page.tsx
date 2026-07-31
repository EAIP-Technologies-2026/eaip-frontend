"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RequireAuth } from "@eaip/auth";
import { usePlatformStore } from "@eaip/state";
import { FormField, LoadingState, ErrorState, Card, CardContent } from "@eaip/ui-enterprise";
import { Button, Input } from "@eaip/ui-primitives";
import { createMemoryClient, type MemoryEntry } from "@eaip/memory";
import { useDebounce } from "@eaip/hooks";
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
  const [showForm, setShowForm] = useState(false);

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
      addToast({ type: "success", title: "Memory saved" });
      setShowForm(false);
      form.reset();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("Failed to save memory", { error: message });
      addToast({ type: "error", title: "Failed to save memory", message });
    }
  }

  return (
    <div className="space-y-4">
      <Input
        type="text"
        value={query}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setQuery(event.target.value);
        }}
        placeholder="Search memory..."
        iconLeft="search"
      />

      <Button
        type="button"
        variant={showForm ? "secondary" : "primary"}
        size="lg"
        className="w-full"
        iconLeft={showForm ? "x" : "plus"}
        onClick={() => {
          setShowForm((prev) => !prev);
        }}
      >
        {showForm ? "Cancel" : "Add memory"}
      </Button>

      {showForm ? (
        <Card>
          <CardContent>
            <form
              onSubmit={(event) => {
                void form.handleSubmit(onSubmit)(event);
              }}
              className="space-y-3"
            >
              <FormField control={form.control} name="key" label="Key">
                {({ field }) => (
                  <input
                    {...field}
                    id="key"
                    type="text"
                    className="w-full rounded-lg border border-border px-3 py-3 text-base"
                  />
                )}
              </FormField>
              <FormField control={form.control} name="value" label="Value">
                {({ field }) => (
                  <textarea
                    {...field}
                    id="value"
                    rows={3}
                    className="w-full rounded-lg border border-border px-3 py-3 text-base"
                  />
                )}
              </FormField>
              <Button
                type="submit"
                size="lg"
                loading={form.formState.isSubmitting}
                disabled={form.formState.isSubmitting}
                className="w-full"
              >
                Save
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {loading ? (
        <LoadingState message="Loading memories..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => { void loadMemories(); }} />
      ) : (
        <div className="space-y-3">
          {memories.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-text-secondary">
                No memories yet. Tap Add memory to create one.
              </CardContent>
            </Card>
          ) : (
            memories.map((memory) => (
              <Card key={memory.id} className="active:scale-[0.98] transition-smooth">
                <CardContent className="space-y-1">
                  <p className="text-sm font-semibold text-text">{memory.key}</p>
                  <p className="break-words text-sm text-text-secondary">
                    {JSON.stringify(memory.value).slice(0, 120)}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function MemoryPage() {
  return (
    <RequireAuth>
      <MemoryPageContent />
    </RequireAuth>
  );
}
