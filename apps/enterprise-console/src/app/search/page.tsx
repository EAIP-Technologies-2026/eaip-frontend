"use client";

/* eslint-disable @typescript-eslint/restrict-template-expressions */

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { RequireAuth } from "@eaip/auth";
import { EnterpriseShell } from "@eaip/ui-enterprise";
import { Card, CardContent } from "@eaip/ui-foundation";
import { Badge, EmptyState, Button } from "@eaip/ui-primitives";
import { EnterpriseIcon } from "@eaip/icons";
import type { IconName } from "@eaip/icons";
import { useRouter } from "next/navigation";
import {
  fetchSearchResults,
  fetchSearchCapabilities,
  fetchInvestigationEvidence,
} from "../../services/search-service";
import type { SearchResult, InvestigationEvidence } from "../../services/search-service";
import type { SearchCapabilitiesResponse } from "@eaip/global-search";
import { useFallback } from "../../services/fallback-context";

const categoryLabels: Record<string, { label: string; icon: IconName; color: string }> = {
  agent: { label: "Agents", icon: "bot", color: "text-primary" },
  workflow: { label: "Workflows", icon: "workflow", color: "text-accent" },
  knowledge: { label: "Knowledge", icon: "book", color: "text-success" },
  memory: { label: "Memory", icon: "brain", color: "text-warning" },
  user: { label: "Users", icon: "users", color: "text-info" },
  monitoring: { label: "Monitoring", icon: "activity", color: "text-danger" },
  settings: { label: "Settings", icon: "settings", color: "text-text-secondary" },
};

const SOURCE_META: Record<string, { label: string; icon: IconName }> = {
  knowledge: { label: "Knowledge", icon: "book" },
  events: { label: "Events", icon: "activity" },
  notifications: { label: "Notifications", icon: "bell" },
};

function formatTimestamp(iso?: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function fieldText(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return null;
}

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);
  const [allResults, setAllResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [capabilities, setCapabilities] = useState<SearchCapabilitiesResponse | null>(null);
  const [evidence, setEvidence] = useState<InvestigationEvidence | null>(null);
  const [evidenceLoading, setEvidenceLoading] = useState(false);
  const [selected, setSelected] = useState<SearchResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { setFallback } = useFallback();

  useEffect(() => {
    let cancelled = false;
    async function loadCapabilities() {
      try {
        const result = await fetchSearchCapabilities();
        if (!cancelled && result.source === "live") setCapabilities(result.data);
      } catch {
        if (!cancelled) setCapabilities(null);
      }
    }
    void loadCapabilities();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(false);
      try {
        const result = await fetchSearchResults(
          query,
          categoryFilter === "all" ? undefined : categoryFilter,
        );
        if (cancelled) return;
        setFallback("search", result.source === "fallback");
        setAllResults(result.data);
      } catch {
        if (!cancelled) {
          setAllResults([]);
          setError(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    const timer = setTimeout(() => {
      void load();
    }, 300); // debounce API calls
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, categoryFilter, setFallback]);

  useEffect(() => {
    let cancelled = false;
    async function loadEvidence() {
      if (!query.trim()) {
        setEvidence(null);
        return;
      }
      setEvidenceLoading(true);
      try {
        const result = await fetchInvestigationEvidence(query);
        if (cancelled) return;
        setEvidence(result.source === "live" ? result.data : null);
      } catch {
        if (!cancelled) setEvidence(null);
      } finally {
        if (!cancelled) setEvidenceLoading(false);
      }
    }
    void loadEvidence();
    return () => {
      cancelled = true;
    };
  }, [query]);

  const displayed = allResults;
  const categories = Array.from(new Set(allResults.map((r) => r.category)));
  const sources = capabilities?.sources ?? [];

  const evidenceCount =
    (evidence?.citations.length ?? 0) +
    (evidence?.events.length ?? 0) +
    (evidence?.failures.length ?? 0) +
    (evidence?.notifications.length ?? 0);

  return (
    <EnterpriseShell
      appId="enterprise-console"
      pageTitle="Search & Investigation"
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Search & Investigation" },
      ]}
    >
      <div className="space-y-8">
        <section className="surface-hero relative overflow-hidden p-8 lg:p-10">
          <div
            className="from-primary-subtle/50 absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br to-transparent blur-3xl"
            aria-hidden="true"
          />
          <div
            className="from-accent-glow/30 absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-gradient-to-tr to-transparent blur-2xl"
            aria-hidden="true"
          />
          <div className="relative">
            <div className="text-primary mb-4 flex items-center gap-2 text-xs font-semibold tracking-widest uppercase">
              <EnterpriseIcon name="activity" size={14} />
              Enterprise Search
            </div>
            <h1 className="text-text text-3xl font-bold tracking-tight">
              Search &amp; Investigation
            </h1>
            <p className="text-text-secondary mt-3 max-w-2xl text-base leading-relaxed">
              Find agents, workflows, knowledge, and users across the platform, then investigate
              with live evidence.
            </p>
          </div>
        </section>

        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <EnterpriseIcon
                name="search"
                size={18}
                className="text-text-secondary absolute top-1/2 left-3 -translate-y-1/2"
              />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                }}
                placeholder="Search pages, agents, settings..."
                aria-label="Search query"
                className="border-border bg-surface text-text placeholder:text-text-secondary focus:border-primary w-full rounded-lg border py-2.5 pr-4 pl-10 text-sm outline-none"
              />
            </div>
          </CardContent>
        </Card>

        {sources.length > 0 ? (
          <div
            className="flex flex-wrap items-center gap-2"
            aria-label="Search source availability"
          >
            <span className="text-text-secondary text-xs font-medium tracking-wide uppercase">
              Sources
            </span>
            {sources.map((source) => {
              const meta = SOURCE_META[source.id] ?? {
                label: source.id,
                icon: "search" as IconName,
              };
              return (
                <span
                  key={source.id}
                  title={source.description}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
                    source.available
                      ? "border-success/30 bg-success/10 text-success"
                      : "border-border bg-surface-secondary text-text-muted"
                  }`}
                >
                  <EnterpriseIcon name={meta.icon} size={12} />
                  {meta.label}
                  <Badge variant={source.available ? "success" : "default"}>
                    {source.available ? "Available" : "Unavailable"}
                  </Badge>
                </span>
              );
            })}
          </div>
        ) : null}

        {categories.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setCategoryFilter("all");
              }}
              className={`transition-smooth rounded-full px-3 py-1 text-xs font-medium ${
                categoryFilter === "all"
                  ? "bg-primary text-text-inverse shadow-sm"
                  : "bg-surface-secondary text-text-secondary hover:bg-surface-tertiary hover:text-text"
              }`}
            >
              All ({allResults.length})
            </button>
            {categories.map((cat) => {
              const meta = categoryLabels[cat] ?? {
                label: cat,
                icon: "search" as IconName,
                color: "text-text-secondary",
              };
              const count = allResults.filter((r) => r.category === cat).length;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setCategoryFilter(cat);
                  }}
                  className={`transition-smooth flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                    categoryFilter === cat
                      ? "bg-primary text-text-inverse shadow-sm"
                      : "bg-surface-secondary text-text-secondary hover:bg-surface-tertiary hover:text-text"
                  }`}
                >
                  <EnterpriseIcon name={meta.icon} size={12} />
                  {meta.label} ({count})
                </button>
              );
            })}
          </div>
        ) : null}

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="skeleton rounded-card h-16" />
            ))}
          </div>
        ) : error ? (
          <Card>
            <CardContent>
              <EmptyState
                icon="alert"
                title="Search unavailable"
                description="The search backend could not be reached. Try again in a moment."
                action={
                  <Button
                    variant="secondary"
                    size="sm"
                    iconLeft={<EnterpriseIcon name="refresh" size={14} />}
                    onClick={() => {
                      window.location.reload();
                    }}
                  >
                    Retry
                  </Button>
                }
              />
            </CardContent>
          </Card>
        ) : displayed.length > 0 ? (
          <>
            <p className="text-text-secondary text-sm">
              {query
                ? `Showing ${displayed.length} results for "${query}"`
                : `Showing ${displayed.length} results`}
            </p>
            <div className="divide-border border-border bg-surface divide-y rounded-lg border">
              {displayed.map((result) => {
                const meta = categoryLabels[result.category] ?? {
                  label: result.category,
                  icon: "search" as IconName,
                  color: "text-text-secondary",
                };
                return (
                  <div
                    key={result.id}
                    className="hover:bg-surface-tertiary/60 px-4 py-3 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <EnterpriseIcon
                        name={meta.icon}
                        size={16}
                        className={`${meta.color} mt-0.5 shrink-0`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={result.href}
                            className="text-text hover:text-primary truncate text-sm font-medium transition-colors"
                          >
                            {result.title}
                          </Link>
                          <Badge variant="default">{meta.label}</Badge>
                          {result.source ? (
                            <span className="bg-surface-tertiary text-text-muted rounded-full px-1.5 py-0.5 text-[10px] font-medium">
                              {result.source}
                            </span>
                          ) : null}
                          {typeof result.score === "number" ? (
                            <span className="text-text-muted font-mono text-[10px]">
                              {Math.round(result.score * 100)}%
                            </span>
                          ) : null}
                          {result.timestamp ? (
                            <span className="text-text-muted text-[10px]">
                              {formatTimestamp(result.timestamp)}
                            </span>
                          ) : null}
                        </div>
                        {(result.excerpt ?? result.description) ? (
                          <p className="text-text-secondary mt-1 line-clamp-2 text-xs leading-relaxed">
                            {result.excerpt ?? result.description}
                          </p>
                        ) : null}
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        iconLeft={<EnterpriseIcon name="search" size={14} />}
                        onClick={() => {
                          setSelected(result);
                        }}
                      >
                        Investigate
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <Card>
            <CardContent>
              <EmptyState
                icon="search"
                title={query ? `No results for "${query}"` : "No results"}
                description={
                  query
                    ? "Try a different search term or browse the available pages."
                    : "No search results available."
                }
                action={
                  <div className="flex gap-2">
                    {query ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setQuery("");
                          router.push("/search");
                        }}
                      >
                        Clear Search
                      </Button>
                    ) : null}
                    <Button
                      variant="secondary"
                      iconLeft={<EnterpriseIcon name="bot" size={14} />}
                      size="sm"
                      onClick={() => {
                        router.push("/agents");
                      }}
                    >
                      Browse Agents
                    </Button>
                  </div>
                }
              />
            </CardContent>
          </Card>
        )}

        {query.trim() ? (
          <section aria-labelledby="investigation-heading">
            <div className="mb-3 flex items-center justify-between">
              <h2
                id="investigation-heading"
                className="text-text flex items-center gap-2 text-lg font-semibold"
              >
                <EnterpriseIcon name="layers" size={16} className="text-primary" />
                Investigation Panel
              </h2>
              {evidenceLoading ? (
                <span className="text-text-muted text-xs">Loading evidence…</span>
              ) : (
                <Badge variant="default">{evidenceCount} items</Badge>
              )}
            </div>

            {selected ? (
              <Card className="mb-4">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-primary text-[10px] font-semibold tracking-widest uppercase">
                        Focus Result
                      </p>
                      <p className="text-text mt-1 text-sm font-medium">{selected.title}</p>
                      {selected.excerpt ? (
                        <p className="text-text-secondary mt-1 line-clamp-2 text-xs leading-relaxed">
                          {selected.excerpt}
                        </p>
                      ) : null}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      iconLeft={<EnterpriseIcon name="x" size={14} />}
                      onClick={() => {
                        setSelected(null);
                      }}
                    >
                      Clear
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {evidenceLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 2 }, (_, i) => (
                  <div key={i} className="skeleton rounded-card h-24" />
                ))}
              </div>
            ) : evidence ? (
              <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-text flex items-center gap-2 text-sm font-semibold">
                        <EnterpriseIcon name="book" size={14} className="text-success" />
                        Citations
                      </h3>
                      <Badge variant="default">{evidence.citations.length}</Badge>
                    </div>
                    {evidence.citations.length > 0 ? (
                      <ul className="space-y-2">
                        {evidence.citations.map((c) => (
                          <li
                            key={c.id}
                            className="border-border bg-surface-tertiary/40 rounded-lg border px-3 py-2"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-text-muted truncate font-mono text-[10px]">
                                {c.collection}
                              </span>
                              <span className="text-text-muted font-mono text-[10px]">
                                {Math.round(c.score * 100)}%
                              </span>
                            </div>
                            <p className="text-text-secondary mt-1 line-clamp-2 text-xs leading-relaxed">
                              {c.content}
                            </p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-text-muted py-2 text-xs">
                        No citations found for this query.
                      </p>
                    )}
                    <Link
                      href="/knowledge"
                      className="text-primary mt-3 inline-flex items-center gap-1 text-xs font-medium hover:underline"
                    >
                      Browse Knowledge
                      <EnterpriseIcon name="chevronRight" size={12} />
                    </Link>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-text flex items-center gap-2 text-sm font-semibold">
                        <EnterpriseIcon name="activity" size={14} className="text-info" />
                        Recent Events
                      </h3>
                      <Badge variant="default">{evidence.events.length}</Badge>
                    </div>
                    {evidence.events.length > 0 ? (
                      <ul className="space-y-2">
                        {evidence.events.map((ev, idx) => {
                          const record = ev as Record<string, unknown>;
                          const label = fieldText(record.type) ?? "event";
                          const ts = fieldText(record.occurred_at) ?? "";
                          const evId = fieldText(record.id) ?? `evt-${idx}`;
                          return (
                            <li key={evId} className="flex items-start gap-2 text-xs">
                              <EnterpriseIcon
                                name="circle"
                                size={8}
                                className="text-info mt-1.5 shrink-0"
                              />
                              <div className="min-w-0">
                                <span className="text-text font-medium">{label}</span>
                                {ts ? (
                                  <span className="text-text-muted"> · {formatTimestamp(ts)}</span>
                                ) : null}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="text-text-muted py-2 text-xs">No recent events.</p>
                    )}
                    <Link
                      href="/monitoring"
                      className="text-primary mt-3 inline-flex items-center gap-1 text-xs font-medium hover:underline"
                    >
                      Open Monitoring
                      <EnterpriseIcon name="chevronRight" size={12} />
                    </Link>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-text flex items-center gap-2 text-sm font-semibold">
                        <EnterpriseIcon name="alert" size={14} className="text-danger" />
                        Recent Failures
                      </h3>
                      <Badge variant={evidence.failures.length > 0 ? "danger" : "default"}>
                        {evidence.failures.length}
                      </Badge>
                    </div>
                    {evidence.failures.length > 0 ? (
                      <ul className="space-y-2">
                        {evidence.failures.map((f) => {
                          const record = f as Record<string, unknown>;
                          const severity = fieldText(record.severity) ?? "error";
                          const message =
                            fieldText(record.message) ?? fieldText(record.title) ?? "Failure";
                          const failId = fieldText(record.id) ?? message;
                          const failTs = fieldText(record.timestamp) ?? "";
                          return (
                            <li
                              key={failId}
                              className="border-danger/20 bg-danger/5 rounded-lg border px-3 py-2"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-danger font-mono text-[10px] tracking-wide uppercase">
                                  {severity}
                                </span>
                                {failTs ? (
                                  <span className="text-text-muted text-[10px]">
                                    {formatTimestamp(failTs)}
                                  </span>
                                ) : null}
                              </div>
                              <p className="text-text-secondary mt-1 line-clamp-2 text-xs leading-relaxed">
                                {message}
                              </p>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="text-text-muted py-2 text-xs">No recent failures.</p>
                    )}
                    <Link
                      href="/operations"
                      className="text-primary mt-3 inline-flex items-center gap-1 text-xs font-medium hover:underline"
                    >
                      View Operations
                      <EnterpriseIcon name="chevronRight" size={12} />
                    </Link>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-text flex items-center gap-2 text-sm font-semibold">
                        <EnterpriseIcon name="bell" size={14} className="text-warning" />
                        Notifications
                      </h3>
                      <Badge variant={evidence.notifications.length > 0 ? "warning" : "default"}>
                        {evidence.notifications.length}
                      </Badge>
                    </div>
                    {evidence.notifications.length > 0 ? (
                      <ul className="space-y-2">
                        {evidence.notifications.map((n) => {
                          const record = n as Record<string, unknown>;
                          const title =
                            fieldText(record.title) ?? fieldText(record.type) ?? "Notification";
                          const notifId = fieldText(record.id) ?? title;
                          return (
                            <li key={notifId} className="flex items-start gap-2 text-xs">
                              <EnterpriseIcon
                                name="bell"
                                size={10}
                                className="text-warning mt-1 shrink-0"
                              />
                              <div className="min-w-0">
                                <span className="text-text font-medium">{title}</span>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="text-text-muted py-2 text-xs">No notifications.</p>
                    )}
                    <Link
                      href="/notifications"
                      className="text-primary mt-3 inline-flex items-center gap-1 text-xs font-medium hover:underline"
                    >
                      Open Notifications
                      <EnterpriseIcon name="chevronRight" size={12} />
                    </Link>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent>
                  <EmptyState
                    icon="layers"
                    title="Evidence unavailable"
                    description="No live evidence could be gathered for this query."
                  />
                </CardContent>
              </Card>
            )}
          </section>
        ) : null}
      </div>
    </EnterpriseShell>
  );
}

export default function SearchPage() {
  return (
    <RequireAuth>
      <SearchContent />
    </RequireAuth>
  );
}
