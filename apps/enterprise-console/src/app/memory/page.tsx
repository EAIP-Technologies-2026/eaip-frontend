"use client";

import { RequireAuth } from "@eaip/auth";
import { Card, EnterpriseShell, LoadingState, PersonalAssistantMark } from "@eaip/ui-enterprise";
import { Badge, Button, EmptyState } from "@eaip/ui-primitives";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { fetchGovernedMemory, forgetMemory, type GovernedMemory } from "../../services/memory-service";

function MemoryContent() {
  const router = useRouter();
  const [items, setItems] = useState<GovernedMemory[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (search = query) => {
    setLoading(true);
    setError(null);
    try {
      setItems(await fetchGovernedMemory(search));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Memory is unavailable");
    } finally {
      setLoading(false);
    }
  }, [query]);

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

  return (
    <EnterpriseShell
      appId="enterprise-console"
      pageTitle="Memory"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Memory" }]}
    >
      <div className="space-y-6">
        <section data-tour="memory" className="liquid-glass rounded-2xl p-5 sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <PersonalAssistantMark size="lg" state="idle" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Personal assistant context</p>
                <h1 className="mt-1 text-2xl font-semibold text-text">Governed memory</h1>
                <p className="mt-1 max-w-2xl text-sm text-text-secondary">Inspect what EAIP remembers, where it came from, and when it expires. Memory informs answers; it never grants permission.</p>
              </div>
            </div>
            <Button variant="secondary" iconLeft="dashboard" onClick={() => { router.push("/dashboard"); }}>Back to Dashboard</Button>
          </div>
        </section>

        <Card liquid padding="md">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-text">Your memory surface</h2>
              <p className="text-xs text-text-muted">Personal, operational, and investigation context visible to your account.</p>
            </div>
            <form className="flex w-full gap-2 sm:max-w-sm" onSubmit={(event) => { event.preventDefault(); void load(); }}>
              <input aria-label="Search memory" value={query} onChange={(event) => { setQuery(event.target.value); }} placeholder="Search remembered context" className="min-w-0 flex-1 rounded-input border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none" />
              <Button type="submit" size="sm">Search</Button>
            </form>
          </div>
        </Card>

        {loading ? <LoadingState variant="skeleton" /> : error ? <p className="rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger">{error}</p> : items.length === 0 ? <EmptyState icon="brain" title="Nothing remembered yet" description="Ask your personal assistant to remember an explicit preference or investigation context." /> : (
          <div className="grid gap-4 lg:grid-cols-2">
            {items.map((item) => (
              <Card key={item.id} liquid padding="md" className="min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2"><Badge variant="glass">{item.domain}</Badge><Badge variant="glass">{item.sensitivity}</Badge></div>
                  <Button variant="ghost" size="sm" onClick={() => { void handleForget(item.id); }}>Forget</Button>
                </div>
                <p className="mt-4 break-words text-sm leading-relaxed text-text">{item.content}</p>
                <div className="mt-4 grid gap-2 border-t border-border pt-3 text-[11px] text-text-muted sm:grid-cols-2">
                  <span>Provenance: <strong className="text-text-secondary">{item.provenance}</strong></span>
                  <span>Confidence: <strong className="text-text-secondary">{Math.round(item.confidence * 100)}%</strong></span>
                  <span>Updated: <strong className="text-text-secondary">{new Date(item.updated_at).toLocaleString()}</strong></span>
                  <span>Expires: <strong className="text-text-secondary">{item.expires_at ? new Date(item.expires_at).toLocaleDateString() : "Policy managed"}</strong></span>
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
