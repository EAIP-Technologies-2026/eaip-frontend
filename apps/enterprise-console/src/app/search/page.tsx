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
import { useRouter } from "next/navigation";
import { fetchSearchResults } from "../../services/search-service";
import type { SearchResult } from "../../services/search-service";
import { useFallback } from "../../services/fallback-context";

const categoryLabels: Record<string, { label: string; icon: string; color: string }> = {
  agent: { label: "Agents", icon: "robot", color: "text-primary" },
  workflow: { label: "Workflows", icon: "workflow", color: "text-accent" },
  knowledge: { label: "Knowledge", icon: "book", color: "text-success" },
  memory: { label: "Memory", icon: "brain", color: "text-warning" },
  user: { label: "Users", icon: "users", color: "text-info" },
  monitoring: { label: "Monitoring", icon: "activity", color: "text-danger" },
  settings: { label: "Settings", icon: "settings", color: "text-text-secondary" },
};

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);
  const [allResults, setAllResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const inputRef = useRef<HTMLInputElement>(null);
  const { setFallback } = useFallback();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const result = await fetchSearchResults();
        if (cancelled) return;
        setFallback("search", result.source === "fallback");
        setAllResults(result.data);
      } catch {
        setAllResults([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [setFallback]);

  const filtered = query
    ? allResults.filter((r) => r.title.toLowerCase().includes(query.toLowerCase()))
    : allResults;

  const displayed = categoryFilter === "all"
    ? filtered
    : filtered.filter((r) => r.category === categoryFilter);

  const categories = Array.from(new Set(filtered.map((r) => r.category)));

  return (
    <EnterpriseShell
      appId="enterprise-console"
      pageTitle="Search"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Search" }]}
    >
      <div className="space-y-8">
        <section className="surface-hero relative overflow-hidden p-8 lg:p-10">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br from-primary-subtle/50 to-transparent blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-gradient-to-tr from-accent-glow/30 to-transparent blur-2xl" aria-hidden="true" />
          <div className="relative">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-primary uppercase mb-4">
              <EnterpriseIcon name="activity" size={14} />
              Enterprise Search
            </div>
            <h1 className="text-3xl font-bold text-text tracking-tight">Search</h1>
            <p className="mt-3 text-base text-text-secondary max-w-2xl leading-relaxed">Find agents, workflows, knowledge, and users across the entire platform.</p>
          </div>
        </section>

        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <EnterpriseIcon name="search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); }}
                placeholder="Search pages, agents, settings..."
                className="w-full rounded-lg border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-text outline-none placeholder:text-text-secondary focus:border-primary"
              />
            </div>
          </CardContent>
        </Card>

        {categories.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => { setCategoryFilter("all"); }}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-smooth ${
                categoryFilter === "all" ? "bg-primary text-text-inverse shadow-sm" : "bg-surface-secondary text-text-secondary hover:bg-surface-tertiary hover:text-text"
              }`}
            >
              All ({filtered.length})
            </button>
            {categories.map((cat) => {
              const meta = categoryLabels[cat] ?? { label: cat, icon: "search", color: "text-text-secondary" };
              const count = filtered.filter((r) => r.category === cat).length;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => { setCategoryFilter(cat); }}
                  className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-smooth ${
                    categoryFilter === cat ? "bg-primary text-text-inverse shadow-sm" : "bg-surface-secondary text-text-secondary hover:bg-surface-tertiary hover:text-text"
                  }`}
                >
                  <EnterpriseIcon name={meta.icon as never} size={12} />
                  {meta.label} ({count})
                </button>
              );
            })}
          </div>
        ) : null}

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="skeleton h-16 rounded-card" />
            ))}
          </div>
        ) : displayed.length > 0 ? (
          <>
            <p className="text-sm text-text-secondary">
              {query ? `Showing ${displayed.length} results for "${query}"` : `Showing ${displayed.length} results`}
            </p>
            <div className="divide-y divide-border rounded-lg border border-border bg-surface">
              {displayed.map((result) => {
                const meta = categoryLabels[result.category] ?? { label: result.category, icon: "search", color: "text-text-secondary" };
                return (
                  <Link
                    key={result.id}
                    href={result.href}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-tertiary"
                  >
                    <EnterpriseIcon name={meta.icon as never} size={16} className={meta.color} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-text">
                        {result.title}
                      </p>
                    </div>
                    <Badge variant="default">{meta.label}</Badge>
                    <EnterpriseIcon name="chevronRight" size={14} className="text-text-secondary" />
                  </Link>
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
                description={query ? "Try a different search term or browse the available pages." : "No search results available."}
                action={
                  <div className="flex gap-2">
                    {query ? (
                      <Button variant="secondary" size="sm" onClick={() => { setQuery(""); router.push("/search"); }}>Clear Search</Button>
                    ) : null}
                    <Button variant="secondary" iconLeft="robot" size="sm" onClick={() => { router.push("/agents"); }}>Browse Agents</Button>
                  </div>
                }
              />
            </CardContent>
          </Card>
        )}
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
