"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RequireAuth } from "@eaip/auth";
import { usePlatformStore } from "@eaip/state";
import {
  EnterpriseShell,
  EnterpriseIcon,
  DataGrid,
  LoadingState,
  ErrorState,
  ConfirmDialog,
  FormField,
  useConfirm,
  Card,
  CardContent,
  SectionHeader,
} from "@eaip/ui-enterprise";
import { Dialog } from "@eaip/ui-foundation";
import { Badge, Button, EmptyState, ProgressBar } from "@eaip/ui-primitives";
import {
  createKnowledgeClient,
  type KnowledgeDocument,
  type KnowledgeCollection,
} from "@eaip/knowledge";
import { useDebounce } from "@eaip/hooks";
import { logger } from "@eaip/logging";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/plain",
  "text/markdown",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
];

const documentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  tags: z.string().optional(),
  collection: z.string().optional(),
});

type DocumentFormData = z.infer<typeof documentSchema>;

interface UploadFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: "pending" | "reading" | "uploading" | "done" | "error";
  error?: string;
  preview?: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const unit = units[i] ?? "B";
  return `${(bytes / 1024 ** i).toFixed(1)} ${unit}`;
}

function getFileIcon(type: string): string {
  if (type.startsWith("image/")) return "image";
  if (type === "application/pdf") return "fileText";
  return "document";
}

function validateFile(file: File): string | null {
  if (file.size > MAX_FILE_SIZE) {
    return `File too large (${formatBytes(file.size)}). Max size is ${formatBytes(MAX_FILE_SIZE)}.`;
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Unsupported file type.";
  }
  return null;
}

function KnowledgePageContent() {
  const addToast = usePlatformStore((state) => state.addToast);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [collections, setCollections] = useState<KnowledgeCollection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [uploadEnabled, setUploadEnabled] = useState(true);
  const [uploads, setUploads] = useState<UploadFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { confirm, state: confirmState, cancel } = useConfirm();

  const client = useMemo(() => createKnowledgeClient(), []);

  const form = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
    defaultValues: { title: "", content: "", tags: "", collection: "" },
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [docs, cols] = await Promise.all([
        client.listDocuments(selectedCollection || undefined),
        client.listCollections(),
      ]);
      setDocuments(docs);
      setCollections(cols);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("Failed to load knowledge", { error: message });
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [selectedCollection, client]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    async function search() {
      if (!debouncedQuery) {
        void loadData();
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await client.search(debouncedQuery, {
          collection: selectedCollection || undefined,
          pageSize: 20,
        });
        setDocuments(response.results.map((r) => r.document));
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        logger.error("Failed to search knowledge", { error: message });
        setError(message);
      } finally {
        setLoading(false);
      }
    }
    void search();
  }, [debouncedQuery, selectedCollection, client, loadData]);

  async function onSubmit(data: DocumentFormData) {
    try {
      const created = await client.createDocument({
        title: data.title,
        content: data.content,
        collection: data.collection,
        tags: data.tags ? data.tags.split(",").map((t) => t.trim()) : [],
      });
      setDocuments((prev) => [...prev, created]);
      addToast({ type: "success", title: "Document created" });
      setModalOpen(false);
      form.reset();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("Failed to create document", { error: message });
      addToast({ type: "error", title: "Failed to create document", message });
    }
  }

  async function handleDelete(document: KnowledgeDocument) {
    const confirmed = await confirm({
      title: "Delete document",
      message: `Are you sure you want to delete "${document.title}"?`,
      variant: "danger",
      confirmLabel: "Delete",
    });
    if (!confirmed) return;
    try {
      await client.deleteDocument(document.id);
      setDocuments((prev) => prev.filter((d) => d.id !== document.id));
      addToast({ type: "success", title: "Document deleted" });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("Failed to delete document", { error: message });
      addToast({ type: "error", title: "Failed to delete document", message });
    }
  }

  function updateUpload(id: string, patch: Partial<UploadFile>) {
    setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));
  }

  function removeUpload(id: string) {
    setUploads((prev) => prev.filter((u) => u.id !== id));
  }

  function readFile(upload: UploadFile): Promise<string | undefined> {
    return new Promise((resolve) => {
      if (!upload.file.type.startsWith("image/")) {
        resolve(undefined);
        return;
      }
      const reader = new FileReader();
      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const pct = (event.loaded / event.total) * 50;
          updateUpload(upload.id, { progress: pct });
        }
      };
      reader.onload = () => {
        updateUpload(upload.id, { progress: 50 });
        resolve(reader.result as string);
      };
      reader.onerror = () => {
        resolve(undefined);
      };
      reader.readAsDataURL(upload.file);
    });
  }

  async function processUpload(upload: UploadFile) {
    const validationError = validateFile(upload.file);
    if (validationError) {
      updateUpload(upload.id, { status: "error", error: validationError, progress: 0 });
      return;
    }

    if (!uploadEnabled) {
      updateUpload(upload.id, {
        status: "error",
        error: "Object storage is not available.",
      });
      return;
    }

    updateUpload(upload.id, { status: "reading" });
    const preview = await readFile(upload);
    updateUpload(upload.id, { preview, status: "uploading" });

    try {
      // Simulate staged upload progress since the backend does not stream.
      updateUpload(upload.id, { progress: 75 });
      await client.uploadDocument(upload.file, selectedCollection || undefined);
      updateUpload(upload.id, { progress: 100, status: "done" });
      addToast({ type: "success", title: "Document uploaded", message: upload.name });
      void loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("Failed to upload document", { error: message });
      setUploadEnabled(false);
      updateUpload(upload.id, {
        status: "error",
        error: "Upload unavailable. Object storage is not available.",
      });
      addToast({
        type: "warning",
        title: "Upload unavailable",
        message: "Object storage is not available; upload has been disabled.",
      });
    }
  }

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    const newUploads: UploadFile[] = Array.from(files).map((file) => ({
      id: crypto.randomUUID(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      progress: 0,
      status: "pending",
    }));
    setUploads((prev) => [...prev, ...newUploads]);
    for (const upload of newUploads) {
      await processUpload(upload);
    }
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragOver(false);
    void handleFiles(event.dataTransfer.files);
  }

  function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragOver(false);
  }

  const totalDocuments = documents.length;
  const totalCollections = collections.length;
  const indexedCount = documents.filter((d) => (d.status ?? "indexed") === "indexed").length;

  return (
    <EnterpriseShell
      appId="workspace"
      pageTitle="Knowledge"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Knowledge" }]}
    >
      <div className="space-y-8">
        {/* Layer 1 — Hero */}
        <section className="surface-hero relative overflow-hidden p-8 lg:p-10">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br from-primary-subtle/50 to-transparent blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-gradient-to-tr from-accent-glow/30 to-transparent blur-2xl" aria-hidden="true" />
          <div className="relative">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-primary uppercase mb-4">
              <EnterpriseIcon name="activity" size={14} />
              Knowledge Base
            </div>
            <h1 className="text-3xl font-bold text-text tracking-tight">Knowledge</h1>
            <p className="mt-3 text-base text-text-secondary max-w-2xl leading-relaxed">Organize, upload, and search your knowledge collections and documents.</p>
          </div>
        </section>

        {/* Layer 2 — Workspace Summary Strip */}
        <section className="space-y-4">
          <SectionHeader icon="barChart" title="Knowledge Overview" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="surface-card rounded-card p-4">
              <p className="text-sm font-medium text-text-secondary">Documents</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-text">{totalDocuments}</p>
            </div>
            <div className="surface-card rounded-card p-4">
              <p className="text-sm font-medium text-text-secondary">Collections</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-text">{totalCollections}</p>
            </div>
            <div className="surface-card rounded-card p-4">
              <p className="text-sm font-medium text-text-secondary">Indexed</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-text">{indexedCount}</p>
            </div>
          </div>
        </section>

        {/* Layer 3 — Operational Workspace */}
        <section className="space-y-4">
          <SectionHeader icon="activity" title="Knowledge Base" />

          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              void handleFiles(e.target.files);
              e.target.value = "";
            }}
          />

          <Card
            className={[
              "border-dashed transition-smooth",
              dragOver
                ? "border-primary bg-primary-subtle"
                : "border-border hover:border-primary hover:bg-surface-secondary",
            ].join(" ")}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => {
              fileInputRef.current?.click();
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                fileInputRef.current?.click();
              }
            }}
            aria-label="Drop files here or click to upload"
          >
            <CardContent className="flex cursor-pointer flex-col items-center justify-center gap-3 py-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-tertiary text-text-muted">
                <EnterpriseIcon name="upload" size={24} />
              </div>
              <div>
                <p className="font-medium text-text">Drop files here or click to upload</p>
                <p className="text-xs text-text-muted">
                  Images, PDFs, Word docs, and text files up to {formatBytes(MAX_FILE_SIZE)}.
                </p>
              </div>
            </CardContent>
          </Card>

          {uploads.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-text">Uploads</h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setUploads((prev) => prev.filter((u) => u.status !== "done"));
                  }}
                >
                  Clear completed
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {uploads.map((upload) => (
                  <Card
                    key={upload.id}
                    padding="sm"
                    className={[
                      "flex flex-col gap-3",
                      upload.status === "error" && "border-danger",
                      upload.status === "done" && "border-success",
                    ].join(" ")}
                  >
                    <div className="flex items-start gap-3">
                      {upload.preview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={upload.preview}
                          alt={upload.name}
                          className="h-12 w-12 rounded-md object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-surface-tertiary text-text-muted">
                          <EnterpriseIcon name={getFileIcon(upload.type)} size={20} />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-text">{upload.name}</p>
                        <p className="text-xs text-text-muted">{formatBytes(upload.size)}</p>
                      </div>
                      <Badge
                        variant={
                          upload.status === "done"
                            ? "success"
                            : upload.status === "error"
                              ? "danger"
                              : "default"
                        }
                      >
                        {upload.status === "done"
                          ? "Done"
                          : upload.status === "error"
                            ? "Error"
                            : upload.status === "uploading"
                              ? "Uploading"
                              : upload.status === "reading"
                                ? "Reading"
                                : "Pending"}
                      </Badge>
                    </div>
                    {upload.status !== "error" && upload.status !== "done" && (
                      <ProgressBar value={upload.progress} showLabel />
                    )}
                    {upload.status === "done" && (
                      <ProgressBar value={100} variant="success" showLabel />
                    )}
                    {upload.error && (
                      <p className="text-xs text-danger" role="alert">
                        {upload.error}
                      </p>
                    )}
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        iconLeft="x"
                        onClick={() => {
                          removeUpload(upload.id);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="surface-card rounded-card overflow-hidden">
            <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center">
              <div className="flex-1">
                <input
                  type="text"
                  value={query}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setQuery(event.target.value);
                  }}
                  placeholder="Search knowledge..."
                  className="block w-full rounded-lg border border-border px-3 py-2 text-sm text-text bg-surface placeholder:text-text-secondary"
                />
              </div>
              <select
                value={selectedCollection}
                onChange={(e) => {
                  setSelectedCollection(e.target.value);
                }}
                className="rounded-lg border border-border px-3 py-2 text-sm text-text bg-surface"
              >
                <option value="">All collections</option>
                {collections.map((collection) => (
                  <option key={collection.id} value={collection.name}>
                    {collection.name}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  iconLeft="upload"
                  onClick={() => {
                    fileInputRef.current?.click();
                  }}
                >
                  Upload files
                </Button>
                <Button
                  type="button"
                  iconLeft="plus"
                  onClick={() => {
                    setModalOpen(true);
                  }}
                >
                  Create document
                </Button>
              </div>
            </div>
            {loading ? (
              <LoadingState message="Loading knowledge..." />
            ) : error ? (
              <ErrorState message={error} onRetry={() => { void loadData(); }} />
            ) : documents.length === 0 ? (
              <EmptyState
                icon="book"
                title="No documents yet"
                description="Upload files or create documents to build your knowledge base."
                action={
                  <Button
                    type="button"
                    iconLeft="plus"
                    onClick={() => {
                      setModalOpen(true);
                    }}
                  >
                    Create document
                  </Button>
                }
              />
            ) : (
              <DataGrid
                data={documents}
                keyExtractor={(document) => document.id}
                loading={loading}
                pageSize={10}
                columns={[
                  {
                    key: "title",
                    header: "Title",
                    sortable: true,
                    filterable: true,
                    render: (document) => <span className="font-medium">{document.title}</span>,
                  },
                  {
                    key: "tags",
                    header: "Tags",
                    filterable: true,
                    render: (document) => document.tags.join(", ") || "—",
                  },
                  {
                    key: "collection",
                    header: "Collection",
                    sortable: true,
                    filterable: true,
                    render: (document) => document.collection ?? "—",
                  },
                  {
                    key: "status",
                    header: "Status",
                    sortable: true,
                    filterable: true,
                    render: (document) => document.status ?? "indexed",
                  },
                  {
                    key: "createdAt",
                    header: "Created",
                    sortable: true,
                    render: (document) => new Date(document.createdAt).toLocaleString(),
                  },
                  {
                    key: "actions",
                    header: "Actions",
                    render: (document) => (
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          iconLeft="trash"
                          onClick={() => {
                            void handleDelete(document);
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    ),
                  },
                ]}
              />
            )}
          </div>
        </section>
      </div>

      <Dialog
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
        }}
        title="Create document"
      >
        <form
          onSubmit={(event) => {
            void form.handleSubmit(onSubmit)(event);
          }}
          className="space-y-4"
        >
          <FormField control={form.control} name="title" label="Title">
            {({ field }) => (
              <input
                {...field}
                id="title"
                type="text"
                className="w-full rounded-lg border border-border px-3 py-2 text-text bg-surface placeholder:text-text-secondary"
              />
            )}
          </FormField>
          <FormField control={form.control} name="content" label="Content">
            {({ field }) => (
              <textarea
                {...field}
                id="content"
                rows={6}
                className="w-full rounded-lg border border-border px-3 py-2 text-text bg-surface placeholder:text-text-secondary"
              />
            )}
          </FormField>
          <FormField control={form.control} name="tags" label="Tags (comma separated)">
            {({ field }) => (
              <input
                {...field}
                id="tags"
                type="text"
                className="w-full rounded-lg border border-border px-3 py-2 text-text bg-surface placeholder:text-text-secondary"
              />
            )}
          </FormField>
          <FormField control={form.control} name="collection" label="Collection">
            {({ field }) => (
              <select
                {...field}
                id="collection"
                className="w-full rounded-lg border border-border px-3 py-2 text-text bg-surface"
              >
                <option value="">Default</option>
                {collections.map((collection) => (
                  <option key={collection.id} value={collection.name}>
                    {collection.name}
                  </option>
                ))}
              </select>
            )}
          </FormField>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setModalOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={form.formState.isSubmitting}
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </Dialog>

      <ConfirmDialog
        open={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        variant={confirmState.variant}
        confirmLabel={confirmState.confirmLabel}
        cancelLabel={confirmState.cancelLabel}
        onConfirm={() => {
          confirmState.onConfirm?.();
        }}
        onCancel={cancel}
      />
    </EnterpriseShell>
  );
}

export default function KnowledgePage() {
  return (
    <RequireAuth>
      <KnowledgePageContent />
    </RequireAuth>
  );
}
