"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { usePlatformStore } from "@eaip/state";
import { getDefaultClient } from "@eaip/api";
import { EnterpriseIcon } from "@eaip/icons";
import { getNavigationForApp, getAllEnterpriseApps } from "./navigation";

type PaletteMode = "navigate" | "find" | "ask";

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

const RECENTS_KEY = "eaip_palette_recents";

function loadRecents(): { id: string; label: string; href: string }[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(RECENTS_KEY) ?? "[]") as {
      id: string;
      label: string;
      href: string;
    }[];
  } catch {
    return [];
  }
}

function saveRecents(recents: { id: string; label: string; href: string }[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(RECENTS_KEY, JSON.stringify(recents.slice(0, 6)));
  } catch {
    // Ignore storage limits
  }
}

function pushRecent(entry: { id: string; label: string; href: string }) {
  const recents = loadRecents().filter((r) => r.id !== entry.id);
  recents.unshift(entry);
  saveRecents(recents);
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
    case "mission":
      return `/missions/${result.id}`;
    case "decision":
      return `/decisions/${result.id}`;
    default:
      return result.href;
  }
}

export function CommandPalette() {
  const { commandPaletteOpen, openCommandPalette, closeCommandPalette, activeRoute } =
    usePlatformStore();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<PaletteMode>("navigate");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const nav = useMemo(() => getNavigationForApp("enterprise-console"), []);
  const [recents, setRecents] = useState<{ id: string; label: string; href: string }[]>(() =>
    loadRecents(),
  );

  const navItems = useMemo(
    () =>
      nav.items.filter(
        (item) =>
          item.label.toLowerCase().includes(query.toLowerCase()) ||
          item.category?.toLowerCase().includes(query.toLowerCase()),
      ),
    [nav, query],
  );

  // Open via Cmd/Ctrl+K or Cmd/Ctrl+Shift+K — the single fused surface.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setMode(event.shiftKey ? "navigate" : "find");
        setQuery("");
        setSelectedIndex(0);
        openCommandPalette();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [openCommandPalette]);

  useEffect(() => {
    if (commandPaletteOpen) {
      setRecents(loadRecents());
      window.setTimeout(() => inputRef.current?.focus(), 30);
      setQuery("");
      setResults([]);
      setSearchError(null);
    }
  }, [commandPaletteOpen, mode]);

  // Debounced entity search for Find mode.
  useEffect(() => {
    if (!commandPaletteOpen || mode !== "find" || query.trim().length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }
    const timer = window.setTimeout(() => {
      async function search() {
        setSearching(true);
        setSearchError(null);
        try {
          const client = getDefaultClient();
          const response = await client.get<SearchResponse>("/search", {
            q: query.trim(),
            pageSize: "10",
          });
          if (response.error) throw response.error;
          const data = response.data ?? { results: [], total: 0, query };
          setResults(data.results.map((r) => ({ ...r, href: resultHref(r) })));
        } catch (err) {
          setSearchError(err instanceof Error ? err.message : "Search failed");
        } finally {
          setSearching(false);
        }
      }
      void search();
    }, 250);
    return () => {
      window.clearTimeout(timer);
    };
  }, [commandPaletteOpen, mode, query]);

  const select = useCallback(
    (item: { id: string; label?: string; title?: string; href?: string }) => {
      if (item.href) {
        pushRecent({ id: item.id, label: item.label ?? item.title ?? item.id, href: item.href });
        closeCommandPalette();
        router.push(item.href);
        return;
      }
      closeCommandPalette();
      const btn = document.querySelector<HTMLButtonElement>(
        'button[aria-label="Open personal EAIP assistant"]',
      );
      btn?.click();
    },
    [closeCommandPalette, router],
  );

  useEffect(() => {
    if (!commandPaletteOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        closeCommandPalette();
        return;
      }
      const total = mode === "find" ? results.length : navItems.length;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, total));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + Math.max(1, total)) % Math.max(1, total));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const item = mode === "find" ? results[selectedIndex] : navItems[selectedIndex];
        if (item) select(item);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [commandPaletteOpen, mode, results, navItems, selectedIndex, closeCommandPalette, select]);

  if (!commandPaletteOpen) return null;

  function runAsk() {
    const text = query.trim();
    if (!text) {
      inputRef.current?.focus();
      return;
    }
    closeCommandPalette();
    window.dispatchEvent(
      new CustomEvent("eaip:conductor-ask", { detail: { text, route: activeRoute } }),
    );
  }

  const modes: { id: PaletteMode; label: string; icon: string }[] = [
    { id: "navigate", label: "Navigate", icon: "home" },
    { id: "find", label: "Find", icon: "search" },
    { id: "ask", label: "Do / Ask", icon: "sparkles" },
  ];

  const showRecents = mode === "navigate" && query.trim().length === 0 && recents.length > 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette"
      data-slot="fused-command-palette"
      className="bg-scrim fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 backdrop-blur-sm"
    >
      <button
        type="button"
        aria-label="Close command palette"
        className="fixed inset-0 cursor-default border-0 bg-transparent"
        onClick={closeCommandPalette}
      />
      <div className="rounded-card border-border bg-surface shadow-elevated relative z-10 w-full max-w-xl overflow-hidden border">
        {/* Mode tabs */}
        <div className="border-border flex items-center gap-1 border-b px-3 pt-3">
          {modes.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                setMode(m.id);
                setQuery("");
                setSelectedIndex(0);
              }}
              className={`transition-smooth flex items-center gap-1.5 rounded-t-lg border-b-2 px-3 py-2 text-xs font-semibold ${
                mode === m.id
                  ? "border-primary text-primary"
                  : "text-text-muted hover:text-text border-transparent"
              }`}
            >
              <EnterpriseIcon name={m.icon as never} size={14} />
              {m.label}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="border-border flex items-center gap-2 border-b p-3">
          <EnterpriseIcon
            name={mode === "find" ? "search" : mode === "ask" ? "sparkles" : "home"}
            size={18}
            className="text-text-muted"
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={(e) => {
              if (mode === "ask" && e.key === "Enter") {
                e.preventDefault();
                runAsk();
              }
            }}
            placeholder={
              mode === "find"
                ? "Find an entity — e.g. 'HIRA', 'warehouse', 'apex'..."
                : mode === "ask"
                  ? "Ask or command Conductor — e.g. 'show active missions'..."
                  : "Navigate — e.g. 'knowledge graph', 'approvals'..."
            }
            className="text-text placeholder:text-text-muted flex-1 bg-transparent text-base outline-none"
            aria-label="Command palette search"
          />
          <button
            type="button"
            onClick={() => {
              if (mode === "ask") runAsk();
              else closeCommandPalette();
            }}
            className="rounded-button text-text-muted transition-smooth hover:bg-surface-tertiary hover:text-text px-2 py-1 text-xs"
          >
            {mode === "ask" ? "↵ Ask" : "Esc"}
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto p-2">
          {mode === "find" ? (
            <FindResults
              query={query}
              searching={searching}
              error={searchError}
              results={results}
              selectedIndex={selectedIndex}
              onSelect={select}
            />
          ) : mode === "ask" ? (
            <div className="p-4 text-center">
              <EnterpriseIcon name="sparkles" size={20} className="text-primary mx-auto" />
              <p className="text-text-secondary mt-2 text-sm">
                Ask Conductor to run governed actions, explain the current page, or answer questions
                about the company. Anything destructive is gated behind approval.
              </p>
              <p className="text-text-muted mt-1 text-xs">Press ↵ to ask.</p>
            </div>
          ) : (
            <ul role="listbox" aria-label="Navigation" className="space-y-1">
              {showRecents ? (
                <li className="text-text-muted px-3 pt-2 pb-1 text-[10px] font-bold tracking-wider uppercase">
                  Recent
                </li>
              ) : null}
              {showRecents
                ? recents.map((r, index) => (
                    <ListRow
                      key={`r-${r.id}`}
                      id={r.id}
                      label={r.label}
                      category="recent"
                      selected={index === selectedIndex}
                      icon="history"
                      onClick={() => {
                        select(r);
                      }}
                    />
                  ))
                : navItems.map((item, index) => (
                    <ListRow
                      key={item.id}
                      id={item.id}
                      label={item.label}
                      category={item.category}
                      selected={index === selectedIndex}
                      icon={item.icon}
                      onClick={() => {
                        select({ id: item.id, label: item.label, href: item.href });
                      }}
                    />
                  ))}
              {!showRecents && navItems.length === 0 ? (
                <li className="text-text-muted p-4 text-center text-xs">No matching pages.</li>
              ) : null}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="border-border text-text-muted flex items-center justify-between border-t px-3 py-2 text-[10px]">
          <span className="flex items-center gap-1">{getAppLabels(activeRoute)}</span>
          <span className="flex items-center gap-2">
            <kbd>↑↓</kbd> navigate <kbd>↵</kbd> select <kbd>esc</kbd> close
          </span>
        </div>
      </div>
    </div>
  );
}

function getAppLabels(_route: string): string {
  const apps = getAllEnterpriseApps();
  const labels = apps.map((a) => a.shortLabel).join(" · ");
  return `EAIP ${labels}`;
}

function ListRow({
  id,
  label,
  category,
  selected,
  icon,
  onClick,
}: {
  id: string;
  label: string;
  category?: string;
  selected: boolean;
  icon?: string;
  onClick: () => void;
}) {
  return (
    <li
      key={id}
      role="option"
      tabIndex={0}
      aria-selected={selected}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={`rounded-button transition-smooth flex cursor-pointer items-center justify-between px-3 py-2 text-sm ${
        selected
          ? "bg-primary-subtle text-primary font-semibold"
          : "text-text-secondary hover:bg-surface-tertiary"
      }`}
    >
      <div className="flex items-center gap-2">
        {icon ? <EnterpriseIcon name={icon as never} size={16} /> : null}
        <span>{label}</span>
        {category ? (
          <span className="text-text-muted text-[10px]">
            {category === "recent"
              ? "recent"
              : category === "OPERATE"
                ? "operate"
                : category === "INTELLIGENCE"
                  ? "intelligence"
                  : category === "GOVERN"
                    ? "govern"
                    : category === "OBSERVE"
                      ? "observe"
                      : category === "EXTEND"
                        ? "extend"
                        : category}
          </span>
        ) : null}
      </div>
    </li>
  );
}

function FindResults({
  query,
  searching,
  error,
  results,
  selectedIndex,
  onSelect,
}: {
  query: string;
  searching: boolean;
  error: string | null;
  results: SearchResult[];
  selectedIndex: number;
  onSelect: (item: SearchResult) => void;
}) {
  return (
    <div className="space-y-1">
      {searching ? (
        <p className="text-text-secondary p-4 text-center text-xs">Searching...</p>
      ) : error ? (
        <p className="text-danger p-4 text-center text-xs">{error}</p>
      ) : query.trim().length < 2 ? (
        <p className="text-text-muted p-4 text-center text-xs">
          Type at least 2 characters to search every entity.
        </p>
      ) : results.length === 0 ? (
        <p className="text-text-muted p-4 text-center text-xs">No results found.</p>
      ) : (
        results.map((r, index) => (
          <ListRow
            key={`${r.category}-${r.id}`}
            id={r.id}
            label={r.title}
            category={r.category}
            selected={index === selectedIndex}
            icon={categoryIcon(r.category)}
            onClick={() => {
              onSelect(r);
            }}
          />
        ))
      )}
    </div>
  );
}

function categoryIcon(category: string): string {
  switch (category) {
    case "agent":
      return "robot";
    case "workflow":
      return "workflow";
    case "knowledge":
    case "document":
      return "book";
    case "memory":
      return "brain";
    case "mission":
      return "rocket";
    case "decision":
      return "gitPullRequest";
    default:
      return "search";
  }
}
