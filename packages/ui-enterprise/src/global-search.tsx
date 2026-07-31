"use client";

import { usePlatformStore } from "@eaip/state";
import { getDefaultClient } from "@eaip/api";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { EnterpriseIcon } from "@eaip/icons";
import { Badge } from "@eaip/ui-primitives";

interface SearchResult {
  id: string;
  title: string;
  category: string;
  href: string;
}

interface SearchResponse {
  results: SearchResult[];
  total: number;
  query: string;
}

export function GlobalSearchTrigger() {
  const { openGlobalSearch } = usePlatformStore();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openGlobalSearch();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [openGlobalSearch]);

  return (
    <button
      type="button"
      onClick={openGlobalSearch}
      className="hidden items-center gap-2 rounded-button border border-border bg-surface px-3 py-1.5 text-sm text-text-secondary transition-smooth hover:bg-surface-tertiary md:flex"
    >
      <EnterpriseIcon name="search" size={16} />
      <span>Search...</span>
      <kbd className="rounded bg-surface-tertiary px-1.5 text-xs text-text-muted">⌘K</kbd>
    </button>
  );
}

function resultHref(result: SearchResult): string {
  switch (result.category) {
    case "agent":
      return `/agents/${result.id}`;
    case "workflow":
      return `/workflows/${result.id}`;
    case "knowledge":
    case "document":
      return `/knowledge`;
    case "memory":
      return `/memory`;
    default:
      return result.href;
  }
}

export function GlobalSearchDialog() {
  const { globalSearchOpen, closeGlobalSearch } = usePlatformStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (globalSearchOpen) {
      inputRef.current?.focus();
      setQuery("");
      setResults([]);
      setError(null);
    }
  }, [globalSearchOpen]);

  useEffect(() => {
    if (!globalSearchOpen || query.length < 2) {
      setResults([]);
      return;
    }

    const timer = window.setTimeout(() => {
      async function search() {
        setLoading(true);
        setError(null);
        try {
          const client = getDefaultClient();
          const response = await client.get<SearchResponse>("/search", { q: query, pageSize: "10" });
          if (response.error) throw response.error;
          const data = response.data ?? { results: [], total: 0, query };
          setResults(
            data.results.map((r) => ({
              ...r,
              href: resultHref(r),
            })),
          );
        } catch (err) {
          setError(err instanceof Error ? err.message : "Search failed");
        } finally {
          setLoading(false);
        }
      }
      void search();
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [globalSearchOpen, query]);

  if (!globalSearchOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-24 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Global search"
    >
      <div className="w-full max-w-2xl rounded-card border border-border bg-surface p-4 shadow-elevated">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <EnterpriseIcon name="search" size={18} className="text-text-muted" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
            }}
            placeholder="Search across EAIP..."
            className="flex-1 bg-transparent text-lg text-text outline-none placeholder:text-text-muted focus-visible:ring-2 focus-visible:ring-primary/30"
            aria-label="Search query"
          />
          <button
            type="button"
            onClick={closeGlobalSearch}
            className="rounded-button px-2 py-1 text-sm text-text-muted transition-smooth hover:bg-surface-tertiary hover:text-text"
            aria-label="Close search"
          >
            Esc
          </button>
        </div>
        <div className="max-h-96 overflow-y-auto py-2">
          {loading ? (
            <p className="py-4 text-center text-sm text-text-secondary">Searching...</p>
          ) : error ? (
            <p className="py-4 text-center text-sm text-danger">{error}</p>
          ) : results.length === 0 ? (
            <p className="py-4 text-center text-sm text-text-muted">
              {query.length < 2
                ? "Type at least 2 characters to search."
                : "No results found."}
            </p>
          ) : (
            <ul className="space-y-1">
              {results.map((result) => (
                <li key={`${result.category}-${result.id}`}>
                  <Link
                    href={result.href}
                    onClick={closeGlobalSearch}
                    className="flex items-center justify-between rounded-button px-3 py-2 transition-smooth hover:bg-surface-tertiary"
                  >
                    <span className="font-medium text-text">{result.title}</span>
                    <Badge variant="default" className="capitalize">
                      {result.category}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
