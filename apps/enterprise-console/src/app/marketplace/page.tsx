"use client";

import { useState, useEffect, useCallback } from "react";
import { RequireAuth } from "@eaip/auth";
import { EnterpriseShell, ErrorState } from "@eaip/ui-enterprise";
import { Badge, Button, Input, EmptyState } from "@eaip/ui-primitives";
import { EnterpriseIcon } from "@eaip/icons";
import { usePlatformStore } from "@eaip/state";
import {
  fetchMarketplacePackages,
  fetchFeaturedPackages,
  fetchCategories,
  fetchInstallations,
  installMarketplacePackage,
  uninstallMarketplacePackage,
} from "../../services/marketplace-service";
import type { MarketplacePackage, PackageCategory } from "@eaip/marketplace";
import { useFallback } from "../../services/fallback-context";

interface PackageTypeMeta {
  label: string;
  icon: "cpu" | "workflow" | "book" | "briefcase" | "layers";
  color: string;
}

const TYPE_META: Record<string, PackageTypeMeta> & { template: PackageTypeMeta } = {
  agent: { label: "Agent", icon: "cpu", color: "text-primary" },
  tool: { label: "Tool", icon: "workflow", color: "text-success" },
  plugin: { label: "Plugin", icon: "layers", color: "text-info" },
  template: { label: "Template", icon: "briefcase", color: "text-warning" },
  adapter: { label: "Adapter", icon: "workflow", color: "text-text-secondary" },
};

function formatNumber(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return String(value);
}

function MarketplaceContent() {
  const addToast = usePlatformStore((state) => state.addToast);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [categories, setCategories] = useState<PackageCategory[]>([]);
  const [packages, setPackages] = useState<MarketplacePackage[]>([]);
  const [featured, setFeatured] = useState<MarketplacePackage[]>([]);
  const [installedIds, setInstalledIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const { setFallback } = useFallback();

  const loadMarketplace = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [pkgsRes, featuredRes, instRes, catRes] = await Promise.all([
        fetchMarketplacePackages({
          search: search || undefined,
          category: category !== "all" ? category : undefined,
        }),
        fetchFeaturedPackages(),
        fetchInstallations(),
        fetchCategories(),
      ]);

      const live =
        pkgsRes.source === "live" || featuredRes.source === "live" || instRes.source === "live";
      setFallback("marketplace", !live);

      setPackages(pkgsRes.data.packages);
      setFeatured(featuredRes.data);
      setInstalledIds(new Set(instRes.data.map((i) => i.packageId)));
      if (catRes.source === "live") setCategories(catRes.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load marketplace");
    } finally {
      setLoading(false);
    }
  }, [search, category, setFallback]);

  useEffect(() => {
    void loadMarketplace();
  }, [loadMarketplace]);

  const toggleInstall = useCallback(
    async (pkg: MarketplacePackage) => {
      const isInstalled = installedIds.has(pkg.id);
      setActioningId(pkg.id);
      try {
        if (isInstalled) {
          const result = await uninstallMarketplacePackage(pkg.id);
          if (result.source === "fallback") {
            addToast({
              type: "error",
              title: "Backend unavailable",
              message: "Uninstall could not be completed.",
            });
            return;
          }
          addToast({
            type: "success",
            title: `${pkg.name} uninstalled`,
            message: "The package has been removed.",
          });
        } else {
          const result = await installMarketplacePackage(pkg.id);
          if (result.source === "fallback") {
            addToast({
              type: "error",
              title: "Backend unavailable",
              message: "Install could not be completed.",
            });
            return;
          }
          addToast({
            type: "success",
            title: `${pkg.name} installed`,
            message: "The package is ready to use.",
          });
        }
        void loadMarketplace();
      } catch {
        addToast({
          type: "error",
          title: "Action failed",
          message: "Could not change installation state.",
        });
      } finally {
        setActioningId(null);
      }
    },
    [installedIds, addToast, loadMarketplace],
  );

  const available = packages.length + (featured.length > 0 ? 1 : 0);
  const configured = installedIds.size;
  const active = packages.filter((p) => installedIds.has(p.id)).length;

  const filterChips = ["all", ...categories.map((c) => c.id)];

  return (
    <EnterpriseShell
      appId="enterprise-console"
      pageTitle="Marketplace"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Marketplace" }]}
    >
      <div className="space-y-8">
        <section data-tour="marketplace" className="surface-hero relative overflow-hidden p-8 lg:p-10">
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
              <EnterpriseIcon name="package" size={14} />
              Marketplace
            </div>
            <h1 className="text-text text-3xl font-bold tracking-tight">Enterprise Marketplace</h1>
            <p className="text-text-secondary mt-3 max-w-2xl text-base leading-relaxed">
              Browse, publish, and install agent packs, tools, plugins, templates, and adapters that
              extend your platform.
            </p>
          </div>
        </section>

        <div className="border-border bg-surface flex flex-wrap items-center gap-4 rounded-lg border px-5 py-3">
          <div className="text-text-secondary flex items-center gap-2 text-sm">
            <EnterpriseIcon name="package" size={16} />
            <span>
              <strong className="text-text">{available}</strong> packages available
            </span>
          </div>
          <div className="bg-border h-4 w-px" />
          <div className="text-text-secondary flex items-center gap-2 text-sm">
            <EnterpriseIcon name="check" size={16} />
            <span>
              <strong className="text-text">{configured}</strong> installed
            </span>
          </div>
          <div className="bg-border h-4 w-px" />
          <div className="text-text-secondary flex items-center gap-2 text-sm">
            <EnterpriseIcon name="activity" size={16} />
            <span>
              <strong className="text-text">{active}</strong> active
            </span>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            <div className="skeleton h-8 w-72 rounded" />
            <div className="grid gap-4 lg:grid-cols-3">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="skeleton rounded-card h-32" />
              ))}
            </div>
          </div>
        ) : error ? (
          <ErrorState
            title="Could not load marketplace"
            message={error}
            onRetry={() => {
              void loadMarketplace();
            }}
          />
        ) : (
          <>
            {featured.length > 0 ? (
              <section aria-label="Featured packages">
                <h2 className="text-text mb-3 flex items-center gap-2 text-lg font-semibold">
                  <EnterpriseIcon name="sparkles" size={16} className="text-warning" />
                  Featured
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {featured.map((pkg) => {
                    const meta = TYPE_META[pkg.type] ?? TYPE_META.template;
                    const isInstalled = installedIds.has(pkg.id);
                    return (
                      <div
                        key={pkg.id}
                        className="rounded-card border-border bg-surface transition-smooth hover:border-primary/40 border p-4"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                            <EnterpriseIcon name={meta.icon} size={20} className={meta.color} />
                          </div>
                          <Badge variant="primary">Featured</Badge>
                        </div>
                        <h3 className="text-text mt-3 text-sm font-semibold">{pkg.name}</h3>
                        <p className="text-text-secondary mt-1 line-clamp-2 text-xs">
                          {pkg.description}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-1.5">
                          <Badge variant="default">{meta.label}</Badge>
                          <Badge variant="default">v{pkg.version}</Badge>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-text-muted text-[11px]">{pkg.author}</span>
                          <Button
                            variant={isInstalled ? "secondary" : "primary"}
                            size="sm"
                            loading={actioningId === pkg.id}
                            onClick={() => {
                              void toggleInstall(pkg);
                            }}
                          >
                            {isInstalled ? "Uninstall" : "Install"}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ) : null}

            <section aria-label="Browse packages">
              <div className="border-border flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1 sm:max-w-sm">
                  <Input
                    placeholder="Search packages..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                    }}
                  />
                </div>
                <div className="border-border flex flex-wrap gap-1 rounded-lg border p-0.5">
                  {filterChips.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setCategory(cat);
                      }}
                      className={`rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors ${
                        category === cat
                          ? "bg-primary text-text-inverse"
                          : "text-text-secondary hover:bg-surface-tertiary"
                      }`}
                    >
                      {cat === "all" ? "All" : cat.replace(/-/g, " ")}
                    </button>
                  ))}
                </div>
              </div>

              {packages.length === 0 ? (
                <div className="pt-6">
                  <EmptyState
                    icon="package"
                    title="No packages found"
                    description={
                      search || category !== "all"
                        ? "Try adjusting your search or category filters."
                        : "No packages have been published to the catalog yet."
                    }
                    action={
                      search || category !== "all" ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setSearch("");
                            setCategory("all");
                          }}
                        >
                          Clear Filters
                        </Button>
                      ) : undefined
                    }
                  />
                </div>
              ) : (
                <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {packages.map((pkg) => {
                    const meta = TYPE_META[pkg.type] ?? TYPE_META.template;
                    const isInstalled = installedIds.has(pkg.id);
                    return (
                      <div
                        key={pkg.id}
                        className="rounded-card border-border bg-surface transition-smooth hover:border-primary/40 border p-4"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                            <EnterpriseIcon name={meta.icon} size={20} className={meta.color} />
                          </div>
                          {isInstalled ? <Badge variant="success">Installed</Badge> : null}
                        </div>
                        <h3 className="text-text mt-3 text-sm font-semibold">{pkg.name}</h3>
                        <p className="text-text-secondary mt-1 line-clamp-2 text-xs">
                          {pkg.description}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-1.5">
                          <Badge variant="default">{meta.label}</Badge>
                          <Badge variant="default">v{pkg.version}</Badge>
                          {pkg.tags.length > 0 ? (
                            <Badge variant="default">{pkg.tags[0]}</Badge>
                          ) : null}
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <div className="text-text-muted flex items-center gap-3 text-[11px]">
                            <span className="flex items-center gap-1">
                              <EnterpriseIcon name="download" size={12} />
                              {formatNumber(pkg.downloads)}
                            </span>
                            <span className="flex items-center gap-1">
                              <EnterpriseIcon name="sparkles" size={12} className="text-warning" />
                              {pkg.rating > 0 ? pkg.rating.toFixed(1) : "—"}
                            </span>
                          </div>
                          <Button
                            variant={isInstalled ? "secondary" : "primary"}
                            size="sm"
                            loading={actioningId === pkg.id}
                            onClick={() => {
                              void toggleInstall(pkg);
                            }}
                          >
                            {isInstalled ? "Uninstall" : "Install"}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </EnterpriseShell>
  );
}

export default function MarketplacePage() {
  return (
    <RequireAuth>
      <MarketplaceContent />
    </RequireAuth>
  );
}
