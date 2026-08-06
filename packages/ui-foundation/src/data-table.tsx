"use client";

import type { ReactNode, HTMLAttributes } from "react";
import { useState } from "react";
import { Checkbox, Input, IconButton } from "@eaip/ui-primitives";
import { EnterpriseIcon } from "@eaip/icons";

export interface Column<T> {
  id: string;
  header: ReactNode;
  accessorKey?: keyof T;
  cell?: (row: T) => ReactNode;
  sortable?: boolean;
}

export interface DataTableProps<T> extends HTMLAttributes<HTMLDivElement> {
  columns: Column<T>[];
  data: T[];
  selectable?: boolean;
  onRowSelect?: (selectedRows: T[]) => void;
  pageSize?: number;
}

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  selectable = false,
  onRowSelect,
  pageSize = 10,
  className = "",
  ...props
}: DataTableProps<T>) {
  const [selectedIds, setSelectedIds] = useState<Record<string | number, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [filterQuery, setFilterQuery] = useState("");

  const filteredData = data.filter((row) =>
    JSON.stringify(row).toLowerCase().includes(filterQuery.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function toggleSelectAll() {
    if (Object.keys(selectedIds).length === paginatedData.length) {
      setSelectedIds({});
      if (onRowSelect) onRowSelect([]);
    } else {
      const next: Record<string | number, boolean> = {};
      paginatedData.forEach((row) => {
        next[row.id] = true;
      });
      setSelectedIds(next);
      if (onRowSelect) onRowSelect(paginatedData);
    }
  }

  function toggleSelectRow(row: T) {
    const isSelected = Boolean(selectedIds[row.id]);
    const next = { ...selectedIds, [row.id]: !isSelected };
    setSelectedIds(next);
    if (onRowSelect) {
      onRowSelect(data.filter((r) => next[r.id]));
    }
  }

  return (
    <div data-slot="data-table" className={`space-y-3 ${className}`} {...props}>
      {/* Table Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3" data-slot="table-toolbar">
        <Input
          type="search"
          placeholder="Filter table rows..."
          value={filterQuery}
          onChange={(e) => {
            setFilterQuery(e.target.value);
          }}
          className="max-w-xs"
        />
        <div className="text-text-secondary text-xs">
          Showing {paginatedData.length} of {filteredData.length} items
        </div>
      </div>

      {/* Main Table Element */}
      <div className="rounded-card border-border bg-surface overflow-x-auto border shadow-sm">
        <table className="w-full text-left text-xs md:text-sm">
          <thead className="border-border bg-surface-secondary/60 text-text-muted border-b text-xs font-semibold uppercase">
            <tr>
              {selectable ? (
                <th className="w-10 p-3">
                  <Checkbox
                    checked={
                      paginatedData.length > 0 &&
                      Object.keys(selectedIds).length === paginatedData.length
                    }
                    onChange={toggleSelectAll}
                    aria-label="Select all rows"
                  />
                </th>
              ) : null}
              {columns.map((col) => (
                <th key={col.id} className="text-text-secondary p-3 font-semibold">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-border/60 text-text divide-y">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="text-text-muted p-8 text-center"
                >
                  No table data found
                </td>
              </tr>
            ) : (
              paginatedData.map((row) => {
                const isSelected = Boolean(selectedIds[row.id]);
                return (
                  <tr
                    key={row.id}
                    data-state={isSelected ? "selected" : "idle"}
                    className={`hover:bg-surface-tertiary/60 transition-colors ${
                      isSelected ? "bg-primary-subtle/30" : ""
                    }`}
                  >
                    {selectable ? (
                      <td className="p-3">
                        <Checkbox
                          checked={isSelected}
                          onChange={() => {
                            toggleSelectRow(row);
                          }}
                          aria-label={`Select row ${String(row.id)}`}
                        />
                      </td>
                    ) : null}
                    {columns.map((col) => (
                      <td key={col.id} className="p-3">
                        {col.cell
                          ? col.cell(row)
                          : col.accessorKey
                            ? String(row[col.accessorKey])
                            : null}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-1" data-slot="pagination">
        <div className="text-text-muted text-xs">
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex items-center gap-1">
          <IconButton
            size="sm"
            variant="ghost"
            aria-label="Previous Page"
            disabled={currentPage === 1}
            onClick={() => {
              setCurrentPage((p) => Math.max(1, p - 1));
            }}
          >
            <EnterpriseIcon name="chevronLeft" size={16} />
          </IconButton>
          <IconButton
            size="sm"
            variant="ghost"
            aria-label="Next Page"
            disabled={currentPage === totalPages}
            onClick={() => {
              setCurrentPage((p) => Math.min(totalPages, p + 1));
            }}
          >
            <EnterpriseIcon name="chevronRight" size={16} />
          </IconButton>
        </div>
      </div>
    </div>
  );
}
