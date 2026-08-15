"use client";

/* eslint-disable @typescript-eslint/restrict-template-expressions */

import { useEffect, useState, useCallback } from "react";
import { RequireAuth } from "@eaip/auth";
import { EnterpriseShell, ErrorState } from "@eaip/ui-enterprise";
import { Card, CardContent } from "@eaip/ui-foundation";
import { Badge, EmptyState, Button } from "@eaip/ui-primitives";
import { EnterpriseIcon } from "@eaip/icons";
import {
  fetchReportCatalog,
  fetchReportPreview,
  exportReport,
  fetchExportJobs,
  downloadReportExport,
} from "../../services/reports-service";
import type { ReportCatalog, ReportPreview, ExportJob } from "../../services/reports-service";
import { useFallback } from "../../services/fallback-context";

const SOURCE_META: Record<
  string,
  { label: string; icon: "chart" | "cpu" | "creditCard" | "book" | "activity"; color: string }
> = {
  operations: { label: "Operations", icon: "chart", color: "text-primary" },
  health: { label: "Health", icon: "cpu", color: "text-success" },
  cost: { label: "Cost", icon: "creditCard", color: "text-warning" },
  knowledge: { label: "Knowledge", icon: "book", color: "text-info" },
  events: { label: "Activity", icon: "activity", color: "text-danger" },
};

const SOURCE_LINKS: Record<string, string> = {
  operations: "/operations",
  health: "/health",
  cost: "/cost",
  knowledge: "/knowledge",
  events: "/monitoring",
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

function ReportsContent() {
  const [catalog, setCatalog] = useState<ReportCatalog | null>(null);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [preview, setPreview] = useState<ReportPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [jobs, setJobs] = useState<ExportJob[]>([]);
  const [exportFormat, setExportFormat] = useState("json");
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const { setFallback } = useFallback();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setCatalogLoading(true);
      try {
        const result = await fetchReportCatalog();
        if (cancelled) return;
        setFallback("reports", result.source === "fallback");
        setCatalog(result.data);
      } catch {
        if (!cancelled) setCatalog(null);
      } finally {
        if (!cancelled) setCatalogLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [setFallback]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const result = await fetchExportJobs();
        if (!cancelled && result.source === "live") setJobs(result.data.jobs);
      } catch {
        if (!cancelled) setJobs([]);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadPreview = useCallback(async (reportId: string) => {
    setSelectedId(reportId);
    setPreviewLoading(true);
    setPreview(null);
    try {
      const result = await fetchReportPreview(reportId);
      if (result.source === "live") setPreview(result.data);
      else setPreview(null);
    } catch {
      setPreview(null);
    } finally {
      setPreviewLoading(false);
    }
  }, []);

  const runExport = useCallback(async (reportId: string, format: string) => {
    setExportingId(reportId);
    setExportError(null);
    try {
      const result = await exportReport(reportId, format);
      if (result.source === "live" && result.data.content) {
        downloadReportExport(result.data);
        const jobResult = await fetchExportJobs();
        if (jobResult.source === "live") setJobs(jobResult.data.jobs);
      } else if (result.source === "fallback") {
        setExportError("Export unavailable: backend not reachable.");
      }
    } catch {
      setExportError("Export failed. Try again.");
    } finally {
      setExportingId(null);
    }
  }, []);

  const reports = catalog?.reports ?? [];

  return (
    <EnterpriseShell
      appId="enterprise-console"
      pageTitle="Reports"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Reports" }]}
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
              <EnterpriseIcon name="barChart" size={14} />
              Enterprise Reporting
            </div>
            <h1 className="text-text text-3xl font-bold tracking-tight">Reports</h1>
            <p className="text-text-secondary mt-3 max-w-2xl text-base leading-relaxed">
              Run standard operational reports and export them as CSV or JSON from live platform
              data.
            </p>
          </div>
        </section>

        {catalogLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="skeleton rounded-card h-24" />
            ))}
          </div>
        ) : reports.length === 0 ? (
          <Card>
            <CardContent>
              <EmptyState
                icon="barChart"
                title="No reports available"
                description="The reporting engine could not be reached."
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {reports.map((report) => {
              const sourceMeta = SOURCE_META[report.sourceType] ?? {
                label: report.sourceType,
                icon: "chart" as const,
                color: "text-text-secondary",
              };
              const isSelected = selectedId === report.id;
              const isExporting = exportingId === report.id;
              return (
                <Card key={report.id} className={isSelected ? "ring-primary/50 ring-1" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <EnterpriseIcon
                        name={sourceMeta.icon}
                        size={18}
                        className={`${sourceMeta.color} mt-0.5 shrink-0`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-text text-sm font-semibold">{report.name}</h3>
                          <Badge variant="default">{sourceMeta.label}</Badge>
                        </div>
                        <p className="text-text-secondary mt-1 text-xs leading-relaxed">
                          {report.description}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          {report.formats.map((f) => (
                            <button
                              key={f}
                              type="button"
                              onClick={() => {
                                setExportFormat(f);
                              }}
                              className={`transition-smooth rounded-md border px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase ${
                                exportFormat === f && isSelected
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-border text-text-muted hover:text-text"
                              }`}
                            >
                              {f}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="border-border/50 mt-3 flex flex-wrap items-center gap-2 border-t pt-3">
                      <Button
                        variant={isSelected ? "primary" : "secondary"}
                        size="sm"
                        iconLeft={<EnterpriseIcon name="search" size={14} />}
                        loading={previewLoading && isSelected}
                        onClick={() => {
                          void loadPreview(report.id);
                        }}
                      >
                        {isSelected ? "Preview" : "Open"}
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        iconLeft={<EnterpriseIcon name="download" size={14} />}
                        loading={isExporting}
                        onClick={() => {
                          void runExport(report.id, exportFormat);
                        }}
                      >
                        Export {exportFormat.toUpperCase()}
                      </Button>
                      <span className="flex-1" />
                      <a
                        href={SOURCE_LINKS[report.sourceType] ?? "/reports"}
                        className="text-primary inline-flex items-center gap-1 text-[11px] font-medium hover:underline"
                      >
                        View source
                        <EnterpriseIcon name="chevronRight" size={12} />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {exportError ? (
          <Card>
            <CardContent>
              <ErrorState title="Export failed" message={exportError} />
            </CardContent>
          </Card>
        ) : null}

        {previewLoading ? (
          <div className="space-y-2">
            <div className="skeleton h-6 w-64 rounded" />
            <div className="skeleton rounded-card h-48" />
          </div>
        ) : preview ? (
          <section aria-label="Report preview">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-text flex items-center gap-2 text-lg font-semibold">
                <EnterpriseIcon name="fileText" size={16} className="text-primary" />
                {preview.name}
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-text-muted text-xs">
                  {preview.rowCount} rows · {formatTimestamp(preview.generatedAt)}
                </span>
                <Badge variant="default">{preview.reportId}</Badge>
              </div>
            </div>
            {preview.rows.length > 0 ? (
              <Card>
                <CardContent className="overflow-x-auto p-0">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-border bg-surface-tertiary/60 border-b">
                        {preview.columns.map((col) => (
                          <th
                            key={col}
                            className="text-text-muted px-4 py-2 text-[11px] font-semibold tracking-wide whitespace-nowrap uppercase"
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-border divide-y">
                      {preview.rows.map((row, idx) => (
                        <tr
                          key={`${preview.reportId}-${idx}`}
                          className="hover:bg-surface-tertiary/40"
                        >
                          {preview.columns.map((col) => {
                            const value = row[col];
                            return (
                              <td
                                key={col}
                                className="text-text-secondary px-4 py-2 text-xs whitespace-nowrap"
                              >
                                {value === null || value === undefined ? "—" : String(value)}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent>
                  <EmptyState
                    icon="fileText"
                    title="No rows"
                    description="This report currently has no data to display."
                  />
                </CardContent>
              </Card>
            )}
          </section>
        ) : null}

        {jobs.length > 0 ? (
          <section aria-label="Recent exports">
            <h2 className="text-text mb-3 flex items-center gap-2 text-lg font-semibold">
              <EnterpriseIcon name="history" size={16} className="text-primary" />
              Recent Exports
            </h2>
            <Card>
              <CardContent className="overflow-x-auto p-0">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-border bg-surface-tertiary/60 border-b">
                      <th className="text-text-muted px-4 py-2 text-[11px] font-semibold tracking-wide uppercase">
                        Report
                      </th>
                      <th className="text-text-muted px-4 py-2 text-[11px] font-semibold tracking-wide uppercase">
                        Format
                      </th>
                      <th className="text-text-muted px-4 py-2 text-[11px] font-semibold tracking-wide uppercase">
                        Status
                      </th>
                      <th className="text-text-muted px-4 py-2 text-[11px] font-semibold tracking-wide uppercase">
                        Records
                      </th>
                      <th className="text-text-muted px-4 py-2 text-[11px] font-semibold tracking-wide uppercase">
                        Duration
                      </th>
                      <th className="text-text-muted px-4 py-2 text-[11px] font-semibold tracking-wide uppercase">
                        Completed
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-border divide-y">
                    {jobs.map((job) => (
                      <tr key={job.id} className="hover:bg-surface-tertiary/40">
                        <td className="text-text px-4 py-2 text-xs">{job.reportId}</td>
                        <td className="text-text-secondary px-4 py-2 text-xs uppercase">
                          {job.format}
                        </td>
                        <td className="px-4 py-2">
                          <Badge
                            variant={
                              job.status === "completed"
                                ? "success"
                                : job.status === "failed"
                                  ? "danger"
                                  : "default"
                            }
                          >
                            {job.status}
                          </Badge>
                        </td>
                        <td className="text-text-secondary px-4 py-2 text-xs">{job.recordCount}</td>
                        <td className="text-text-secondary px-4 py-2 text-xs">
                          {job.durationMs}ms
                        </td>
                        <td className="text-text-secondary px-4 py-2 text-xs">
                          {formatTimestamp(job.completedAt ?? undefined)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </section>
        ) : null}
      </div>
    </EnterpriseShell>
  );
}

export default function ReportsPage() {
  return (
    <RequireAuth>
      <ReportsContent />
    </RequireAuth>
  );
}
