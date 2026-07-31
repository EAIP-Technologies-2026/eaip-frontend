import { useMemo, useState, type ReactNode } from "react";
import { EnterpriseIcon } from "@eaip/icons";
import { Pagination } from "@eaip/ui-foundation";
import { Skeleton, EmptyState, Button } from "@eaip/ui-primitives";

export type SortDirection = "asc" | "desc" | null;

export interface DataGridColumn<T> {
  key: string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  render?: (item: T) => ReactNode;
  getValue?: (item: T) => string | number | undefined;
}

export interface DataGridProps<T> {
  columns: DataGridColumn<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  loading?: boolean;
  skeletonRows?: number;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  pageSize?: number;
  emptyMessage?: string;
  errorMessage?: string;
  onRetry?: () => void;
  toolbar?: ReactNode;
}

export function DataGrid<T>({
  columns,
  data,
  keyExtractor,
  loading = false,
  skeletonRows = 5,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  pageSize = 10,
  emptyMessage = "No items found.",
  errorMessage,
  onRetry,
  toolbar,
}: DataGridProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);

  function toggleSort(key: string) {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDirection("asc");
    } else if (sortDirection === "asc") {
      setSortDirection("desc");
    } else if (sortDirection === "desc") {
      setSortKey(null);
      setSortDirection(null);
    }
    setPage(1);
  }

  function setFilter(key: string, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }

  function toggleSelection(id: string) {
    if (!onSelectionChange) return;
    const next = selectedIds.includes(id)
      ? selectedIds.filter((selected) => selected !== id)
      : [...selectedIds, id];
    onSelectionChange(next);
  }

  function toggleAll() {
    if (!onSelectionChange) return;
    const currentPageIds = paginatedData.map(keyExtractor);
    const allSelected = currentPageIds.every((id) => selectedIds.includes(id));
    const next = allSelected
      ? selectedIds.filter((id) => !currentPageIds.includes(id))
      : Array.from(new Set([...selectedIds, ...currentPageIds]));
    onSelectionChange(next);
  }

  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    for (const [key, value] of Object.entries(filters)) {
      if (!value) continue;
      const column = columns.find((c) => c.key === key);
      result = result.filter((item) => {
        const raw = column?.getValue
          ? column.getValue(item)
          : (item as Record<string, string | undefined>)[key];
        return String(raw ?? "").toLowerCase().includes(value.toLowerCase());
      });
    }

    if (sortKey && sortDirection) {
      const column = columns.find((c) => c.key === sortKey);
      result.sort((a, b) => {
        const aVal = column?.getValue
          ? column.getValue(a)
          : (a as Record<string, string | number | undefined>)[sortKey];
        const bVal = column?.getValue
          ? column.getValue(b)
          : (b as Record<string, string | number | undefined>)[sortKey];
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
        if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, filters, sortKey, sortDirection, columns]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedData.length / pageSize));
  const start = (page - 1) * pageSize;
  const paginatedData = filteredAndSortedData.slice(start, start + pageSize);

  const showError = Boolean(errorMessage);
  const showEmpty = !loading && !showError && paginatedData.length === 0;

  return (
    <div className="space-y-3">
      {toolbar ? <div className="flex flex-wrap items-center gap-2">{toolbar}</div> : null}

      <div className="overflow-x-auto rounded-card border border-border">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-surface-secondary">
            <tr>
              {selectable ? (
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    aria-label="Select all"
                    checked={
                      paginatedData.length > 0 &&
                      paginatedData.every((item) => selectedIds.includes(keyExtractor(item)))
                    }
                    onChange={toggleAll}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                </th>
              ) : null}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-6 py-3 text-left text-xs font-medium tracking-wider text-text-muted uppercase"
                  style={col.width ? { width: col.width } : undefined}
                >
                  <div className="flex items-center gap-2">
                    {col.sortable ? (
                      <button
                        type="button"
                        onClick={() => {
                          toggleSort(col.key);
                        }}
                        className="group flex items-center gap-1 transition-smooth hover:text-text"
                      >
                        {col.header}
                        <span className="text-text-muted transition-smooth group-hover:text-text">
                          {sortKey === col.key ? (
                            sortDirection === "asc" ? (
                              <EnterpriseIcon name="chevronUp" size={14} />
                            ) : (
                              <EnterpriseIcon name="chevronDown" size={14} />
                            )
                          ) : (
                            <EnterpriseIcon name="chevronUp" size={14} className="opacity-40" />
                          )}
                        </span>
                      </button>
                    ) : (
                      col.header
                    )}
                  </div>
                </th>
              ))}
            </tr>
            {columns.some((c) => c.filterable) ? (
              <tr>
                {selectable ? <th className="px-4 py-2" /> : null}
                {columns.map((col) => (
                  <th key={`filter-${col.key}`} className="px-6 py-2">
                    {col.filterable ? (
                      <input
                        type="text"
                        placeholder={`Filter ${col.header}`}
                        value={filters[col.key] ?? ""}
                        onChange={(e) => {
                          setFilter(col.key, e.target.value);
                        }}
                        className="w-full rounded-input border border-border bg-surface px-2 py-1 text-xs text-text placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    ) : null}
                  </th>
                ))}
              </tr>
            ) : null}
          </thead>
          <tbody className="divide-y divide-border bg-surface">
            {loading ? (
              Array.from({ length: skeletonRows }).map((_, idx) => (
                <tr key={idx}>
                  {selectable ? (
                    <td className="px-4 py-4">
                      <Skeleton className="h-4 w-4" />
                    </td>
                  ) : null}
                  {columns.map((col) => (
                    <td key={col.key} className="px-6 py-4">
                      <div className="skeleton h-4" style={{ width: `${String(60 + Math.floor(Math.random() * 30))}%` }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : showError ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="px-6 py-8 text-center"
                >
                  <EmptyState icon="alert" title="Failed to load data" description={errorMessage} action={onRetry ? <Button variant="secondary" size="sm" onClick={onRetry}>Retry</Button> : undefined} />
                </td>
              </tr>
            ) : showEmpty ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="px-6 py-8 text-center"
                >
                  <EmptyState icon="inbox" title={emptyMessage} description="No data is currently available for this view." />
                </td>
              </tr>
            ) : (
              paginatedData.map((item) => {
                const id = keyExtractor(item);
                return (
                  <tr key={id} className="transition-smooth hover:bg-surface-secondary">
                    {selectable ? (
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          aria-label="Select row"
                          checked={selectedIds.includes(id)}
                          onChange={() => {
                            toggleSelection(id);
                          }}
                          className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                        />
                      </td>
                    ) : null}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className="px-6 py-4 text-sm whitespace-nowrap text-text"
                      >
                        {col.render
                          ? col.render(item)
                          : ((item as Record<string, string>)[col.key] ?? "")}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {filteredAndSortedData.length > pageSize ? (
        <div className="flex items-center justify-between text-sm text-text-secondary">
          <span>
            Showing {start + 1}-{Math.min(start + pageSize, filteredAndSortedData.length)} of{" "}
            {filteredAndSortedData.length}
          </span>
          <Pagination currentPage={page} totalPages={totalPages} onChange={setPage} />
        </div>
      ) : null}
    </div>
  );
}
