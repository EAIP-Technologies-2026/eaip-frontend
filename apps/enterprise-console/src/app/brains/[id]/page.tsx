"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { RequireAuth } from "@eaip/auth";
import { AnimatedBeam, BorderBeam, EnterpriseShell, MagicCard, OrbitingCircles, PageHero, ProgressiveBlur, ShimmerButton } from "@eaip/ui-enterprise";
import { Card, CardContent, CardHeader } from "@eaip/ui-foundation";
import { Badge, Button, EmptyState, Input, Textarea } from "@eaip/ui-primitives";
import { EnterpriseIcon } from "@eaip/icons";
import {
  approveRecommendation,
  configureBrain,
  executeAction,
  fetchBrain,
  queryBrain,
  rejectRecommendation,
  rememberBrain,
} from "../../../services/brains-service";
import type { Brain, BrainRecommendation } from "../../../services/brains-service";
import { KnowledgeSourcePicker } from "../../../components/knowledge-source-picker";
import { ConfirmDialog } from "@eaip/ui-enterprise";

function BrainCommandCenterContent() {
  const params = useParams();
  const router = useRouter();
  const brainId = String(params.id);
  const [brain, setBrain] = useState<Brain | null>(null);
  const [query, setQuery] = useState("What should marketing focus on this week?");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [memory, setMemory] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setBrain(await fetchBrain(brainId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load Brain");
    } finally {
      setLoading(false);
    }
  }, [brainId]);

  useEffect(() => {
    void load();
  }, [brainId, load]);

  async function handleQuery() {
    setWorking(true);
    setError(null);
    try {
      const result = await queryBrain(brainId, query);
      setAnswer(result.answer);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Brain query failed");
    } finally {
      setWorking(false);
    }
  }

  async function handleApprove(recommendationId: string) {
    setWorking(true);
    try {
      await approveRecommendation(brainId, recommendationId);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Approval failed");
    } finally {
      setWorking(false);
    }
  }

  async function handleMemory() {
    if (!memory.trim()) return;
    setWorking(true);
    try {
      await rememberBrain(brainId, memory.trim());
      setMemory("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Memory write failed");
    } finally {
      setWorking(false);
    }
  }

  async function handleSaveKnowledge(sources: string[]) {
    await configureBrain(brainId, { knowledgeSources: sources });
    await load();
  }

  async function handleRemoveKnowledge(source: string) {
    if (!brain) return;
    const next = brain.knowledgeSources.filter((s) => s !== source);
    setWorking(true);
    try {
      await configureBrain(brainId, { knowledgeSources: next });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove source");
    } finally {
      setWorking(false);
      setRemoveTarget(null);
    }
  }

  async function handleReject(recommendationId: string) {
    setWorking(true);
    try {
      await rejectRecommendation(brainId, recommendationId);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Rejection failed");
    } finally {
      setWorking(false);
    }
  }

  async function handleExecute(recommendationId: string) {
    setWorking(true);
    try {
      await executeAction(brainId, recommendationId);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Execution failed");
    } finally {
      setWorking(false);
    }
  }

  function riskLevel(rec: BrainRecommendation): string {
    if (rec.confidence >= 0.7) return "Low";
    if (rec.confidence >= 0.4) return "Medium";
    return "High";
  }

  function riskVariant(risk: string): "success" | "warning" | "danger" {
    if (risk === "Low") return "success";
    if (risk === "Medium") return "warning";
    return "danger";
  }

  if (loading || !brain) {
    return (
      <EnterpriseShell appId="enterprise-console" pageTitle="Second Brain">
        <div className="space-y-6">
          <div className="skeleton-card h-32" />
          <div className="grid gap-5 xl:grid-cols-[1fr_1.15fr]">
            <div className="skeleton-card h-64" />
            <div className="skeleton-card h-64" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton-card h-24" />
            ))}
          </div>
        </div>
      </EnterpriseShell>
    );
  }

  return (
    <EnterpriseShell
      appId="enterprise-console"
      pageTitle={brain.name}
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Second Brain", href: "/brains" },
        { label: brain.name },
      ]}
    >
      <div className="space-y-6 lg:space-y-7">
        <PageHero
          className="lg:p-9"
          icon="brain"
          eyebrow={`${brain.businessFunction} Brain`}
          title={brain.name}
          description={brain.description}
        >
          <div className="flex flex-wrap gap-2">
            <Badge variant="success">{brain.status}</Badge>
            <Badge variant={brain.approvalRequired ? "warning" : "success"}>
              {brain.approvalRequired ? "Approval required" : "Auto-approved"}
            </Badge>
          </div>
        </PageHero>

        {/* Capability Map with Orbiting Circles */}
        <div className="grid gap-5 xl:grid-cols-[1fr_1.15fr]">
          <MagicCard className="surface-card p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Capability map</p>
            <h2 className="mt-2 text-lg font-semibold text-text">What this Brain can connect</h2>
            <OrbitingCircles
              center={
                <div className="flex flex-col items-center">
                  <EnterpriseIcon name="brain" size={20} />
                  <span className="mt-1 text-[9px]">Brain</span>
                </div>
              }
              items={[
                <span key="k" className="text-[9px]">Knowledge</span>,
                <span key="m" className="text-[9px]">Memory</span>,
                <span key="mi" className="text-[9px]">Missions</span>,
                <span key="a" className="text-[9px]">Agents</span>,
              ]}
              className="mt-4"
            />
          </MagicCard>

          {/* Animated Beam — Intelligence Flow */}
          <Card className="border-primary/15">
            <CardHeader>
              <h2 className="text-lg font-semibold text-text">Governed intelligence flow</h2>
              <p className="text-sm text-text-secondary">Informational relationship between the configured Brain capabilities.</p>
            </CardHeader>
            <CardContent>
              <AnimatedBeam
                steps={["Knowledge", "Second Brain", "Recommendation", "Approval gate", "Mission", "Memory"]}
                className="flex-wrap"
              />
            </CardContent>
          </Card>
        </div>

        {error ? (
          <div
            role="alert"
            className="rounded-card border border-danger/30 bg-danger-subtle p-4 text-sm text-danger"
          >
            {error}
          </div>
        ) : null}

        {/* Metrics with Number Ticker effect */}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Objectives", brain.objectives.length, "target"],
            ["Knowledge sources", brain.knowledgeSources.length, "book"],
            ["Missions", brain.missionIds.length, "rocket"],
            ["Memory items", brain.memoryIds.length, "brain"],
          ].map(([label, value, icon]) => (
            <Card key={String(label)} className="border-border/80 bg-surface/90 card-hover-lift">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-text-muted">{label}</span>
                  <EnterpriseIcon
                    name={
                      icon === "brain"
                        ? "brain"
                        : icon === "rocket"
                          ? "rocket"
                          : icon === "book"
                            ? "book"
                            : "layers"
                    }
                    size={18}
                    className="text-primary"
                  />
                </div>
                <p className="mt-2 text-3xl font-semibold text-text">{String(value)}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Ask the Brain */}
        <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          <Card className="border-primary/15">
            <CardHeader>
              <h2 className="text-lg font-semibold text-text">Ask the Brain</h2>
              <p className="text-sm text-text-secondary">
                Reason over configured context, then turn evidence into governed work.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                label="Business question"
                value={query}
                onChange={(event) => { setQuery(event.target.value); }}
                rows={3}
              />
              <ShimmerButton
                type="button"
                disabled={working}
                onClick={() => { void handleQuery(); }}
              >
                {working ? "Generating…" : "Generate recommendation"}
              </ShimmerButton>
              {answer ? (
                <div className="rounded-card border border-border bg-surface-secondary p-4 text-sm leading-6 text-text whitespace-pre-wrap">
                  {answer}
                </div>
              ) : (
                <p className="text-sm text-text-muted">
                  No recommendation yet. Ask a question to begin.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-text">Objectives and rules</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Responsible for
                </p>
                <ul className="mt-2 space-y-2 text-sm text-text-secondary">
                  {brain.objectives.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Operating rules
                </p>
                <ul className="mt-2 space-y-2 text-sm text-text-secondary">
                  {brain.rules.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
              <Button
                variant="secondary"
                onClick={() => { router.push("/brains"); }}
              >
                Configure Brain
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Knowledge Sources */}
        <Card className="border-border/80">
          <CardHeader className="items-start gap-4 sm:items-center">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-text">Knowledge Sources</h2>
              <p className="text-sm text-text-secondary">
                Connected collections the Brain reasons over when generating recommendations.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              iconLeft={<EnterpriseIcon name="plus" size={16} />}
              onClick={() => { setPickerOpen(true); }}
            >
              Add Knowledge
            </Button>
          </CardHeader>
          <CardContent>
            {brain.knowledgeSources.length === 0 ? (
              <EmptyState
                icon="book"
                title="No knowledge sources connected"
                description="Connect knowledge collections so the Brain can reason over your enterprise data."
                action={
                  <Button
                    size="sm"
                    iconLeft={<EnterpriseIcon name="plus" size={16} />}
                    onClick={() => { setPickerOpen(true); }}
                  >
                    Add Knowledge
                  </Button>
                }
              />
            ) : (
              <div className="space-y-2" role="list" aria-label="Connected knowledge sources">
                {brain.knowledgeSources.map((source) => (
                  <div
                    key={source}
                    role="listitem"
                    className="flex items-center justify-between rounded-card border border-border bg-surface-secondary px-4 py-3 transition-smooth hover:border-primary/30 hover:shadow-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="bg-primary-subtle text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded">
                        <EnterpriseIcon name="book" size={16} />
                      </div>
                      <span className="truncate text-sm font-medium text-text">{source}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`Remove ${source}`}
                      onClick={() => { setRemoveTarget(source); }}
                      className="shrink-0 text-text-muted hover:text-danger"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Center with Border Beam */}
        {brain.recommendations.length > 0 ? (
          <BorderBeam active={brain.recommendations.some((rec) => rec.status === "pending_approval" || rec.executionStatus === "executing")}>
            <Card className="border-warning/20">
              <CardHeader className="items-start gap-4 sm:items-center">
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-text">Action Center</h2>
                  <p className="text-sm text-text-secondary">
                    Governed recommendations requiring review, approval, and execution.
                  </p>
                </div>
                <Badge variant="primary">{brain.recommendations.length} recommendation{brain.recommendations.length !== 1 ? "s" : ""}</Badge>
              </CardHeader>
              <CardContent className="space-y-6">
                {brain.recommendations.map((rec) => {
                  const risk = riskLevel(rec);
                  const isPending = rec.status === "pending_approval";
                  const isApproved = rec.status === "approved";
                  const isRejected = rec.status === "rejected";
                  const isExecuted = rec.executionStatus === "executed";
                  const isMissionCreated = rec.status === "mission_created";
                  const isReadyForIntegration = rec.executionStatus === "ready_for_integration";

                  return (
                    <div
                      key={rec.id}
                      className="rounded-card border border-border bg-surface-secondary p-5 space-y-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base font-semibold text-text">{rec.title}</h3>
                          <p className="mt-1 text-sm leading-6 text-text-secondary">{rec.rationale}</p>
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <Badge variant={isPending ? "warning" : isApproved ? "success" : isRejected ? "danger" : isExecuted || isMissionCreated ? "primary" : "default"}>
                            {rec.status.replace(/_/g, " ")}
                          </Badge>
                          {rec.executionStatus && rec.executionStatus !== "ready_for_execution_integration" ? (
                            <Badge variant={isExecuted ? "success" : rec.executionStatus === "execution_failed" ? "danger" : "default"}>
                              {rec.executionStatus.replace(/_/g, " ")}
                            </Badge>
                          ) : null}
                        </div>
                      </div>

                      {rec.evidence.length > 0 ? (
                        <div className="grid gap-2 md:grid-cols-2">
                          {rec.evidence.slice(0, 2).map((source) => (
                            <div
                              key={source.source_id}
                              className="rounded border border-border/50 bg-surface p-3"
                            >
                              <p className="text-xs font-semibold uppercase text-text-muted">
                                {source.source_type} · {source.relevance_score.toFixed(2)}
                              </p>
                              <p className="mt-1 text-xs text-text-secondary line-clamp-2">
                                {source.content_preview}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : null}

                      <div className="grid gap-4 sm:grid-cols-3">
                        <div className="rounded border border-border/50 bg-surface p-3">
                          <p className="text-xs font-semibold uppercase text-text-muted">Expected Impact</p>
                          <p className="mt-1 text-sm font-medium text-text">
                            {rec.confidence >= 0.7 ? "High confidence action" : rec.confidence >= 0.4 ? "Moderate confidence action" : "Exploratory action"}
                          </p>
                          <p className="text-xs text-text-secondary">
                            Confidence: {Math.round(rec.confidence * 100)}%
                          </p>
                        </div>
                        <div className="rounded border border-border/50 bg-surface p-3">
                          <p className="text-xs font-semibold uppercase text-text-muted">Risk Level</p>
                          <div className="mt-1 flex items-center gap-2">
                            <Badge variant={riskVariant(risk)}>{risk}</Badge>
                          </div>
                          <p className="text-xs text-text-secondary">
                            Based on evidence confidence
                          </p>
                        </div>
                        <div className="rounded border border-border/50 bg-surface p-3">
                          <p className="text-xs font-semibold uppercase text-text-muted">Approval</p>
                          <p className="mt-1 text-sm font-medium text-text">
                            {rec.approvalRequired ? "Required" : "Auto-approved"}
                          </p>
                          <p className="text-xs text-text-secondary">
                            {isPending ? "Awaiting decision" : isApproved ? "Granted" : isRejected ? "Denied" : isExecuted ? "Completed" : rec.status.replace(/_/g, " ")}
                          </p>
                        </div>
                      </div>

                      {rec.executionResult ? (
                        <div className="rounded border border-border/50 bg-surface p-3">
                          <p className="text-xs font-semibold uppercase text-text-muted">Execution Result</p>
                          <p className="mt-1 text-sm text-text-secondary">{rec.executionResult}</p>
                        </div>
                      ) : null}

                      <div className="flex flex-wrap gap-3 border-t border-border pt-4">
                        {isPending ? (
                          <>
                            <Button
                              loading={working}
                              onClick={() => { void handleApprove(rec.id); }}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="danger"
                              loading={working}
                              onClick={() => { void handleReject(rec.id); }}
                            >
                              Reject
                            </Button>
                          </>
                        ) : null}
                        {isApproved && !rec.missionId ? (
                          <Button
                            loading={working}
                            onClick={() => { void handleExecute(rec.id); }}
                          >
                            Execute Action
                          </Button>
                        ) : null}
                        {isApproved && rec.missionId && !isExecuted && !isReadyForIntegration ? (
                          <Button
                            loading={working}
                            onClick={() => { void handleExecute(rec.id); }}
                          >
                            Execute Action
                          </Button>
                        ) : null}
                        {isMissionCreated && !isExecuted ? (
                          <Button
                            variant="secondary"
                            loading={working}
                            onClick={() => { void handleExecute(rec.id); }}
                          >
                            Execute Mission
                          </Button>
                        ) : null}
                        {isReadyForIntegration ? (
                          <span className="text-sm text-text-muted">
                            Ready for integration — external execution pending.
                          </span>
                        ) : null}
                        {isExecuted ? (
                          <span className="text-sm text-success">
                            Action executed successfully.
                          </span>
                        ) : null}
                        {isRejected ? (
                          <span className="text-sm text-danger">
                            Action rejected.
                          </span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </BorderBeam>
        ) : null}

        {/* Memory and Activity */}
        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-text">Memory and learning</h2>
              <p className="text-sm text-text-secondary">
                Inspectable context retained from approved outcomes.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Record a Brain memory"
                value={memory}
                onChange={(event) => { setMemory(event.target.value); }}
                placeholder="Approved strategy or lesson"
              />
              <Button
                variant="secondary"
                loading={working}
                onClick={() => { void handleMemory(); }}
              >
                Record memory
              </Button>
              {brain.memoryIds.length ? (
                <p className="text-sm text-text-secondary">
                  {brain.memoryIds.length} memory reference(s) recorded.
                </p>
              ) : (
                <p className="text-sm text-text-muted">Nothing remembered yet.</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-text">Activity and audit</h2>
            </CardHeader>
            <CardContent>
              <ProgressiveBlur className="max-h-80 overflow-y-auto pr-1">
                <div className="space-y-3">
                  {brain.activity.length ? (
                    brain.activity.slice(0, 8).map((entry) => (
                      <div key={entry.id} className="border-l-2 border-primary/30 pl-3">
                        <p className="text-sm font-medium text-text">
                          {entry.action.replace("_", " ")}
                        </p>
                        <p className="text-xs text-text-secondary">{entry.message}</p>
                        <time className="text-xs text-text-muted">
                          {new Date(entry.timestamp).toLocaleString()}
                        </time>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-text-muted">Brain activity will appear here.</p>
                  )}
                </div>
              </ProgressiveBlur>
            </CardContent>
          </Card>
        </div>
      </div>

      <KnowledgeSourcePicker
        open={pickerOpen}
        onClose={() => { setPickerOpen(false); }}
        currentSources={brain.knowledgeSources}
        onSave={async (sources) => { await handleSaveKnowledge(sources); }}
      />

      <ConfirmDialog
        open={removeTarget !== null}
        title="Remove Knowledge Source"
        message={
          <>
            Are you sure you want to remove{" "}
            <strong className="text-text">{removeTarget}</strong> from this Brain?
          </>
        }
        confirmLabel="Remove"
        variant="danger"
        onConfirm={() => {
          if (removeTarget) void handleRemoveKnowledge(removeTarget);
        }}
        onCancel={() => { setRemoveTarget(null); }}
      />
    </EnterpriseShell>
  );
}

export default function BrainCommandCenterPage() {
  return (
    <RequireAuth>
      <BrainCommandCenterContent />
    </RequireAuth>
  );
}
