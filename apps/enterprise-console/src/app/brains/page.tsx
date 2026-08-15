"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { RequireAuth } from "@eaip/auth";
import { EnterpriseShell, PageHero, MagicCard, ShimmerButton, BorderBeam } from "@eaip/ui-enterprise";
import { Dialog, DialogContent, DialogTitle } from "@eaip/ui-foundation";
import { Badge, Button, EmptyState, Input, Textarea } from "@eaip/ui-primitives";
import { EnterpriseIcon } from "@eaip/icons";
import { createBrain, fetchBrainTemplates, fetchBrains } from "../../services/brains-service";
import type { Brain, BrainTemplate } from "../../services/brains-service";

function BrainListContent() {
  const router = useRouter();
  const [brains, setBrains] = useState<Brain[]>([]);
  const [templates, setTemplates] = useState<BrainTemplate[]>([]);
  const [open, setOpen] = useState(false);
  const [template, setTemplate] = useState("marketing");
  const [name, setName] = useState("Marketing Brain");
  const [description, setDescription] = useState("");
  const [objective, setObjective] = useState("Improve qualified customer acquisition.");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void Promise.all([fetchBrains(), fetchBrainTemplates()])
      .then(([loadedBrains, loadedTemplates]) => {
        setBrains(loadedBrains);
        setTemplates(loadedTemplates);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Unable to load brains");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const selectedTemplate = useMemo(
    () => templates.find((item) => item.id === template),
    [template, templates],
  );

  function selectTemplate(value: string) {
    setTemplate(value);
    const next = templates.find((item) => item.id === value);
    if (next) {
      setName(next.name);
      setDescription(next.description);
      setObjective(next.objectives[0] ?? "");
    }
  }

  async function handleCreate() {
    setSaving(true);
    setError(null);
    try {
      const brain = await createBrain({
        template,
        name,
        description: description || selectedTemplate?.description,
        businessFunction: selectedTemplate?.businessFunction ?? "Custom",
        objectives: objective ? [objective] : [],
      });
      router.push(`/brains/${brain.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create brain");
    } finally {
      setSaving(false);
    }
  }

  return (
    <EnterpriseShell
      appId="enterprise-console"
      pageTitle="Second Brain"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Second Brain" }]}
    >
      <div className="space-y-6 lg:space-y-7">
        <div data-tour="brains">
          <PageHero
            icon="brain"
            eyebrow="EAIP Second Brain"
            title="Turn business context into governed action."
            description="Create a business-function intelligence layer that knows its objectives, reasons over evidence, proposes missions, and remembers approved outcomes."
          >
            <ShimmerButton type="button" onClick={() => { setOpen(true); }}>
              <EnterpriseIcon name="plus" size={18} className="mr-2" />
              Create a Brain
            </ShimmerButton>
          </PageHero>
        </div>

        {error ? <div role="alert" className="rounded-card border border-danger/30 bg-danger-subtle p-4 text-sm text-danger">{error}</div> : null}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton-card h-48" />
            ))}
          </div>
        ) : brains.length === 0 ? (
          <EmptyState
            icon="brain"
            title="No business brains yet"
            description="Start with a Marketing Brain to turn acquisition questions into reviewable, evidence-backed missions."
            action={
              <Button onClick={() => { setOpen(true); }}>
                Create Marketing Brain
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-text">Your business brains</p>
                <p className="mt-1 text-xs text-text-secondary">Open a command center to inspect context, recommendations, and governed outcomes.</p>
              </div>
              <Badge variant="default">{brains.length} active</Badge>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {brains.map((brain) => (
                <BorderBeam key={brain.id} active={brain.status === "active"}>
                  <MagicCard className="border border-border bg-surface">
                    <button type="button" onClick={() => { router.push(`/brains/${brain.id}`); }} className="block w-full p-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-subtle text-primary">
                            <EnterpriseIcon name="brain" size={20} />
                          </div>
                          <div>
                            <p className="font-semibold text-text">{brain.name}</p>
                            <p className="mt-0.5 text-xs text-text-secondary">{brain.businessFunction}</p>
                          </div>
                        </div>
                        <Badge variant="success">Active</Badge>
                      </div>
                      <p className="mt-4 line-clamp-2 text-sm text-text-secondary">{brain.objectives[0] ?? "No objective configured"}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-xs text-text-muted">{brain.knowledgeSources.length} knowledge sources</span>
                        <span className="inline-flex text-xs font-semibold text-primary">Open command center →</span>
                      </div>
                    </button>
                  </MagicCard>
                </BorderBeam>
              ))}
            </div>
          </div>
        )}

        <Dialog open={open} onClose={() => { setOpen(false); }} title="Create a governed Brain">
          <DialogContent>
            <DialogTitle>Configure your business function</DialogTitle>
            <div className="mt-5 space-y-4">
              <label className="block text-sm font-medium text-text" htmlFor="brain-template">Brain type</label>
              <select id="brain-template" value={template} onChange={(event) => { selectTemplate(event.target.value); }} className="w-full rounded-input border border-border bg-surface px-3 py-2.5 text-text">
                {templates.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
              <Input label="Name" value={name} onChange={(event) => { setName(event.target.value); }} />
              <Textarea label="Purpose" value={description} onChange={(event) => { setDescription(event.target.value); }} rows={3} />
              <Input label="Primary objective" value={objective} onChange={(event) => { setObjective(event.target.value); }} />
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="secondary" onClick={() => { setOpen(false); }}>Cancel</Button>
                <Button loading={saving} onClick={() => void handleCreate()}>Create Brain</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </EnterpriseShell>
  );
}

export default function BrainsPage() {
  return <RequireAuth><BrainListContent /></RequireAuth>;
}
