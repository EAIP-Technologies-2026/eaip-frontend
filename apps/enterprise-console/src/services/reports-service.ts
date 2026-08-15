import type { ServiceResult } from "./service-result";
import { liveResult, fallbackResult, isNetworkError } from "./service-result";
import { getDefaultClient } from "@eaip/api";

export interface ReportMeta {
  id: string;
  name: string;
  description: string;
  sourceType: string;
  formats: string[];
}

export interface ReportCatalog {
  reports: ReportMeta[];
  engineAvailable: boolean;
  formats: string[];
  generatedAt?: string;
}

export type ReportRow = Record<string, string | number | boolean | null | undefined>;

export interface ReportPreview {
  reportId: string;
  name: string;
  generatedAt: string;
  rowCount: number;
  columns: string[];
  rows: ReportRow[];
}

export interface ExportJob {
  id: string;
  reportId: string;
  status: string;
  format: string;
  startedAt: string | null;
  completedAt: string | null;
  durationMs: number;
  fileSizeBytes: number;
  recordCount: number;
  error: string;
}

export interface ExportResult {
  reportId: string;
  name: string;
  format: string;
  generatedAt: string;
  rowCount: number;
  content: string;
  contentType: string;
  job: ExportJob | null;
}

export interface JobListResult {
  jobs: ExportJob[];
  total: number;
}

const emptyCatalog: ReportCatalog = {
  reports: [],
  engineAvailable: false,
  formats: ["json", "csv"],
};

export async function fetchReportCatalog(): Promise<ServiceResult<ReportCatalog>> {
  try {
    const client = getDefaultClient();
    const res = await client.get<ReportCatalog>("/reports");
    if (res.error) throw res.error;
    return liveResult(res.data ?? emptyCatalog);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(emptyCatalog, "Backend unavailable");
    }
    throw err;
  }
}

export async function fetchReportPreview(reportId: string): Promise<ServiceResult<ReportPreview>> {
  try {
    const client = getDefaultClient();
    const res = await client.get<ReportPreview>(`/reports/${encodeURIComponent(reportId)}/preview`);
    if (res.error) throw res.error;
    return liveResult(
      res.data ?? { reportId, name: reportId, generatedAt: "", rowCount: 0, columns: [], rows: [] },
    );
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(
        { reportId, name: reportId, generatedAt: "", rowCount: 0, columns: [], rows: [] },
        "Backend unavailable",
      );
    }
    throw err;
  }
}

export async function exportReport(
  reportId: string,
  format: string,
): Promise<ServiceResult<ExportResult>> {
  try {
    const client = getDefaultClient();
    const res = await client.post<ExportResult>(`/reports/${encodeURIComponent(reportId)}/export`, {
      format,
    });
    if (res.error) throw res.error;
    return liveResult(
      res.data ?? {
        reportId,
        name: reportId,
        format,
        generatedAt: "",
        rowCount: 0,
        content: "",
        contentType: "application/octet-stream",
        job: null,
      },
    );
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(
        {
          reportId,
          name: reportId,
          format,
          generatedAt: "",
          rowCount: 0,
          content: "",
          contentType: "application/octet-stream",
          job: null,
        },
        "Backend unavailable",
      );
    }
    throw err;
  }
}

export async function fetchExportJobs(): Promise<ServiceResult<JobListResult>> {
  try {
    const client = getDefaultClient();
    const res = await client.get<JobListResult>("/reports/jobs");
    if (res.error) throw res.error;
    return liveResult(res.data ?? { jobs: [], total: 0 });
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult({ jobs: [], total: 0 }, "Backend unavailable");
    }
    throw err;
  }
}

export function downloadReportExport(exportResult: ExportResult): void {
  const blob = new Blob([exportResult.content], { type: exportResult.contentType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const safeId = exportResult.reportId.replace(/[^a-zA-Z0-9_-]/g, "-");
  anchor.href = url;
  anchor.download = `${safeId}-report.${exportResult.format}`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
