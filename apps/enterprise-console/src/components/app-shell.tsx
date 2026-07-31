"use client";

/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePlatformStore } from "@eaip/state";
import { EnterpriseIcon } from "@eaip/icons";
import { fullNavigation, commandPaletteCommands } from "@/lib/navigation-map";
import Link from "next/link";
import { useRouter } from "next/navigation";

export interface AppShellProps {
  appId: string;
  children: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
  pageTitle?: string;
}

export function AppShell({ children }: AppShellProps) {
  const hasPermission = usePlatformStore((state) => state.hasPermission);
  const [searchOpen, setSearchOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "f") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "p") {
        e.preventDefault();
        setCommandOpen(true);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setCommandOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => { window.removeEventListener("keydown", handleKeyDown); };
  }, []);

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div className="min-h-screen bg-surface-secondary">
        <div className="sticky top-16 z-20 hidden border-b border-border bg-surface md:block" ref={navRef}>
          <div className="flex items-center gap-0 overflow-x-auto px-4">
            {fullNavigation.map((cat) => {
              const visible = cat.items.filter(
                (item) => !item.permissions || item.permissions.some((p) => hasPermission(p)),
              );
              if (visible.length === 0) return null;
              const isActive = activeCategory === cat.id;
              return (
                <div key={cat.id} className="relative"
                  onMouseEnter={() => { setActiveCategory(cat.id); }}
                  onMouseLeave={() => { setActiveCategory(null); }}
                >
                  <Link
                    href={cat.href}
                    className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors hover:bg-surface-tertiary ${
                      isActive ? "text-primary" : "text-text-secondary"
                    }`}
                  >
                    <EnterpriseIcon name={cat.icon as never} size={14} />
                    {cat.label}
                    <EnterpriseIcon name="chevronDown" size={12} />
                  </Link>
                  {isActive && (
                    <div className="absolute left-0 top-full z-30 w-56 rounded-lg border border-border bg-surface shadow-xl">
                      <div className="p-2">
                        <div className="px-2 py-1.5 text-xs font-medium text-text-secondary">
                          {cat.description}
                        </div>
                        <div className="mt-1 border-t border-border" />
                        {visible.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-text hover:bg-surface-tertiary"
                            onClick={() => { setActiveCategory(null); }}
                          >
                            {item.icon ? <EnterpriseIcon name={item.icon as never} size={14} /> : null}
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => { setSearchOpen(true); }}
                className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-text-secondary transition-colors hover:bg-surface-tertiary hover:text-text"
              >
                <EnterpriseIcon name="search" size={14} />
                Search
                <kbd className="ml-1 rounded border border-border bg-surface-tertiary px-1 py-0.5 text-[10px]">
                  ⌘⇧F
                </kbd>
              </button>
              <button
                type="button"
                onClick={() => { setCommandOpen(true); }}
                className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-text-secondary transition-colors hover:bg-surface-tertiary hover:text-text"
              >
                <EnterpriseIcon name="zap" size={14} />
                Commands
                <kbd className="ml-1 rounded border border-border bg-surface-tertiary px-1 py-0.5 text-[10px]">
                  ⌘⇧P
                </kbd>
              </button>
            </div>
          </div>
        </div>
        <main className="pt-[7.5rem] transition-all duration-200 md:pl-64">
          <div className="p-6">{children}</div>
        </main>
      </div>
      {searchOpen ? (
        <SearchOverlay onClose={() => { setSearchOpen(false); }} onNavigate={(href) => { setSearchOpen(false); router.push(href); }} />
      ) : null}
      {commandOpen ? (
        <CommandPaletteOverlay onClose={() => { setCommandOpen(false); }} onNavigate={(href) => { setCommandOpen(false); router.push(href); }} />
      ) : null}
    </>
  );
}

function SearchOverlay({
  onClose,
  onNavigate,
}: {
  onClose: () => void;
  onNavigate: (href: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const allResults = useMemo(
    () => query
      ? fullNavigation
          .flatMap((cat) => cat.items)
          .filter(
            (item) =>
              item.label.toLowerCase().includes(query.toLowerCase()),
          )
          .slice(0, 20)
      : [],
    [query],
  );

  const recentSearches = [
    { label: "Data Analyst" },
    { label: "Security scan" },
    { label: "Workflow deployment" },
    { label: "API Gateway" },
  ];

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, allResults.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && allResults[selectedIndex]) {
        onNavigate(allResults[selectedIndex].href);
      }
    },
    [allResults, selectedIndex, onNavigate],
  );

  const categories = Array.from(new Set(allResults.map((r) => {
    const cat = fullNavigation.find((c) => c.items.some((i) => i.href === r.href));
    return cat?.label ?? "General";
  })));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onClick={onClose}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-xl rounded-xl border border-border bg-surface shadow-2xl"
        onClick={(e) => { e.stopPropagation(); }}
      >
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <EnterpriseIcon name="search" size={18} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); }}
            onKeyDown={handleKeyDown}
            placeholder="Search pages, agents, settings..."
            className="flex-1 bg-transparent text-sm text-text outline-none placeholder:text-text-secondary"
          />
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-text-secondary hover:bg-surface-tertiary"
          >
            <EnterpriseIcon name="x" size={16} />
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {query ? (
            allResults.length > 0 ? (
              <div className="space-y-1">
                {categories.map((cat) => {
                  const catResults = allResults.filter((r) => {
                    const c = fullNavigation.find((n) => n.items.some((i) => i.href === r.href));
                    return c?.label === cat;
                  });
                  if (catResults.length === 0) return null;
                  return (
                    <div key={cat}>
                      <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
                        {cat}
                      </div>
                          {catResults.map((result) => {
                        const globalIdx = allResults.indexOf(result);
                        return (
                          <button
                            key={result.href}
                            type="button"
                            className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm ${
                              globalIdx === selectedIndex
                                ? "bg-primary/10 text-primary"
                                : "text-text hover:bg-surface-tertiary"
                            }`}
                            onClick={() => { onNavigate(result.href); }}
                            onMouseEnter={() => { setSelectedIndex(allResults.indexOf(result)); }}
                          >
                            {result.icon ? <EnterpriseIcon name={result.icon as never} size={14} /> : null}
                            <span>{highlightMatch(result.label, query)}</span>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="px-2 py-4 text-center text-sm text-text-secondary">
                No results found for &quot;{query}&quot;
              </div>
            )
          ) : (
            <>
              <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
                Recent
              </div>
              {recentSearches.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-text-secondary hover:bg-surface-tertiary"
                >
                  <EnterpriseIcon name="history" size={14} />
                  {item.label}
                </button>
              ))}
            </>
          )}
        </div>
        <div className="flex items-center gap-4 border-t border-border px-4 py-2 text-[10px] text-text-secondary">
          <span><kbd className="rounded border border-border px-1">↑↓</kbd> Navigate</span>
          <span><kbd className="rounded border border-border px-1">↵</kbd> Open</span>
          <span><kbd className="rounded border border-border px-1">Esc</kbd> Close</span>
        </div>
      </div>
    </div>
  );
}

function CommandPaletteOverlay({
  onClose,
  onNavigate,
}: {
  onClose: () => void;
  onNavigate: (href: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands = commandPaletteCommands;
  const filtered = query
    ? commands.filter(
        (cmd) =>
          cmd.label.toLowerCase().includes(query.toLowerCase()) ||
          cmd.category.toLowerCase().includes(query.toLowerCase()),
      )
    : commands;

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && filtered[selectedIndex]) {
        onNavigate(filtered[selectedIndex].href);
      }
    },
    [filtered, selectedIndex, onNavigate],
  );

  const categories = ["navigation", "action"] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onClick={onClose}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-xl rounded-xl border border-border bg-surface shadow-2xl"
        onClick={(e) => { e.stopPropagation(); }}
      >
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <EnterpriseIcon name="zap" size={18} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command..."
            className="flex-1 bg-transparent text-sm text-text outline-none placeholder:text-text-secondary"
          />
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-text-secondary hover:bg-surface-tertiary"
          >
            <EnterpriseIcon name="x" size={16} />
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {categories.map((cat) => {
            const catItems = filtered.filter((c) => c.category === cat);
            if (catItems.length === 0) return null;
            return (
              <div key={cat}>
                <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
                  {cat === "navigation" ? "Navigate" : "Actions"}
                </div>
                {catItems.map((cmd) => {
                  const idx = filtered.indexOf(cmd);
                  return (
                    <button
                      key={cmd.id}
                      type="button"
                      className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm ${
                        idx === selectedIndex
                          ? "bg-primary/10 text-primary"
                          : "text-text hover:bg-surface-tertiary"
                      }`}
                      onClick={() => { onNavigate(cmd.href); }}
                      onMouseEnter={() => { setSelectedIndex(idx); }}
                    >
                      <div className="flex items-center gap-2">
                        <EnterpriseIcon name={cmd.icon} size={14} />
                        <span>{cmd.label}</span>
                      </div>
                      {cmd.shortcut ? (
                        <kbd className="rounded border border-border bg-surface-tertiary px-1.5 py-0.5 text-[10px] text-text-secondary">
                          {cmd.shortcut}
                        </kbd>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            );
          })}
          {filtered.length === 0 ? (
            <div className="px-2 py-4 text-center text-sm text-text-secondary">
              No commands match &quot;{query}&quot;
            </div>
          ) : null}
        </div>
        <div className="flex items-center gap-4 border-t border-border px-4 py-2 text-[10px] text-text-secondary">
          <span><kbd className="rounded border border-border px-1">↑↓</kbd> Navigate</span>
          <span><kbd className="rounded border border-border px-1">↵</kbd> Run</span>
          <span><kbd className="rounded border border-border px-1">Esc</kbd> Close</span>
        </div>
      </div>
    </div>
  );
}

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded bg-primary/20 text-primary">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}
