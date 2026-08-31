"use client";

import { RequireAuth } from "@eaip/auth";
import { Card, EnterpriseShell, LoadingState, PersonalAssistantMark } from "@eaip/ui-enterprise";
import { Badge, Button, EmptyState } from "@eaip/ui-primitives";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  fetchGovernedMemory,
  forgetMemory,
  type GovernedMemory,
} from "../../services/memory-service";

function MemoryContent() {
  const router = useRouter();
  const [items, setItems] = useState<GovernedMemory[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (search = query) => {
      setLoading(true);
      setError(null);
      try {
        setItems(await fetchGovernedMemory(search));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Memory is unavailable");
      } finally {
        setLoading(false);
      }
    },
    [query],
  );

  useEffect(() => {
    void load("");
  }, [load]);

  async function handleForget(id: string) {
    try {
      await forgetMemory(id);
      setItems((current) => current.filter((item) => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to forget memory");
    }
  }

  const [orgItems, setOrgItems] = useState<
    { memory_id: string; subject: string; content: string }[]
  >([]);
  useEffect(() => {
    void import("@eaip/api").then(({ getDefaultClient }) => {
      void getDefaultClient()
        .get<typeof orgItems>("/m1/org-memory")
        .then((r) => {
          if (!r.error && Array.isArray(r.data)) setOrgItems(r.data);
        });
    });
  }, []);

  return (
    <EnterpriseShell
      appId="enterprise-console"
      pageTitle="Memory"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Memory" }]}
    >
      <div className="space-y-6">
        {orgItems.length > 0 ? (
          <Card liquid padding="md">
            <div className="text-text text-sm font-semibold">
              Organizational Memory (M1) — {orgItems.length} records
            </div>
            <div className="mt-2 space-y-1">
              {orgItems.slice(0, 5).map((m) => (
                <div key={m.memory_id} className="border-border rounded border px-3 py-1 text-xs">
                  <span className="font-medium">{m.subject}</span>: {m.content.slice(0, 80)}
                </div>
              ))}
            </div>
          </Card>
        ) : null}
        <section data-tour="memory" className="liquid-glass rounded-2xl p-5 sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <PersonalAssistantMark size="lg" state="idle" />
              <div>
                <p className="text-primary text-xs font-semibold tracking-[0.18em] uppercase">
                  Personal assistant context
                </p>
                <h1 className="text-text mt-1 text-2xl font-semibold">Governed memory</h1>
                <p className="text-text-secondary mt-1 max-w-2xl text-sm">
                  Inspect what EAIP remembers, where it came from, and when it expires. Memory
                  informs answers; it never grants permission.
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              iconLeft="dashboard"
              onClick={() => {
                router.push("/dashboard");
              }}
            >
              Back to Dashboard
            </Button>
          </div>
        </section>

        <Card liquid padding="md">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-text text-base font-semibold">Your memory surface</h2>
              <p className="text-text-muted text-xs">
                Personal, operational, and investigation context visible to your account.
              </p>
            </div>
            <form
              className="flex w-full gap-2 sm:max-w-sm"
              onSubmit={(event) => {
                event.preventDefault();
                void load();
              }}
            >
              <input
                aria-label="Search memory"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                }}
                placeholder="Search remembered context"
                className="rounded-input border-border bg-surface text-text placeholder:text-text-muted focus:border-primary min-w-0 flex-1 border px-3 py-2 text-sm focus:outline-none"
              />
              <Button type="submit" size="sm">
                Search
              </Button>
            </form>
          </div>
        </Card>

        {loading ? (
          <LoadingState variant="skeleton" />
        ) : error ? (
          <p className="border-danger/30 bg-danger/10 text-danger rounded-xl border p-4 text-sm">
            {error}
          </p>
        ) : items.length === 0 ? (
          <EmptyState
            icon="brain"
            title="Nothing remembered yet"
            description="Ask your personal assistant to remember an explicit preference or investigation context."
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {items.map((item) => (
              <Card key={item.id} liquid padding="md" className="min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="glass">{item.domain}</Badge>
                    <Badge variant="glass">{item.sensitivity}</Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      void handleForget(item.id);
                    }}
                  >
                    Forget
                  </Button>
                </div>
                <p className="text-text mt-4 text-sm leading-relaxed break-words">{item.content}</p>
                <div className="border-border text-text-muted mt-4 grid gap-2 border-t pt-3 text-[11px] sm:grid-cols-2">
                  <span>
                    Provenance: <strong className="text-text-secondary">{item.provenance}</strong>
                  </span>
                  <span>
                    Confidence:{" "}
                    <strong className="text-text-secondary">
                      {Math.round(item.confidence * 100)}%
                    </strong>
                  </span>
                  <span>
                    Updated:{" "}
                    <strong className="text-text-secondary">
                      {new Date(item.updated_at).toLocaleString()}
                    </strong>
                  </span>
                  <span>
                    Expires:{" "}
                    <strong className="text-text-secondary">
                      {item.expires_at
                        ? new Date(item.expires_at).toLocaleDateString()
                        : "Policy managed"}
                    </strong>
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </EnterpriseShell>
  );
}

export default function MemoryPage() {
  return (
    <RequireAuth>
      <MemoryContent />
    </RequireAuth>
  );
}
