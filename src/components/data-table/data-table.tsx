/* Copyright 2026 SkyNet. Adapted from marimo data-table. */

import React, { useState, useMemo, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnFiltersState,
  type SortingState,
  type PaginationState,
  type RowSelectionState,
} from "@tanstack/react-table";
import { ArrowUpDown, ArrowUp, ArrowDown, Search, Download, ChevronLeft, ChevronRight } from "lucide-react";
import type { DataTableProps, DataTableSelection } from "./types";
import { formatCellValue } from "./utils";
import { cn } from "@/lib/cn";

export function DataTable<TData extends Record<string, unknown>>({
  data,
  columns,
  pageSize = 10,
  totalRows,
  selection,
  onSelectionChange,
  pagination = true,
  sorting = true,
  filtering = true,
  className,
}: DataTableProps<TData>) {
  const [sortingState, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [paginationState, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState("");

  const handleRowSelectionChange = useCallback(
    (updaterOrValue: RowSelectionState | ((old: RowSelectionState) => RowSelectionState)) => {
      const newSelection = typeof updaterOrValue === "function"
        ? updaterOrValue(rowSelection)
        : updaterOrValue;
      setRowSelection(newSelection);
      if (onSelectionChange) {
        const indices = Object.keys(newSelection)
          .filter((k) => newSelection[k])
          .map(Number);
        onSelectionChange({ selected_row_indices: indices });
      }
    },
    [rowSelection, onSelectionChange]
  );

  const table = useReactTable({
    data,
    columns: columns as any,
    state: {
      sorting: sortingState,
      columnFilters,
      pagination: paginationState,
      rowSelection,
      globalFilter,
    },
    onSortingChange: sorting ? setSorting : undefined,
    onColumnFiltersChange: filtering ? setColumnFilters : undefined,
    onPaginationChange: pagination ? setPagination : undefined,
    onRowSelectionChange: handleRowSelectionChange,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: pagination ? getPaginationRowModel() : undefined,
    getSortedRowModel: sorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: filtering ? getFilteredRowModel() : undefined,
    enableRowSelection: !!onSelectionChange,
  });

  const totalRowCount = typeof totalRows === "number" ? totalRows : data.length;

  return (
    <div className={cn("w-full space-y-3", className)}>
      {/* Toolbar */}
      {filtering && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search all columns..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-transparent pl-8 pr-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <span className="text-xs text-muted-foreground">
            {totalRowCount.toLocaleString()} rows
          </span>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="h-9 px-3 text-left align-middle font-medium text-muted-foreground whitespace-nowrap border-b cursor-pointer hover:bg-muted/80 select-none"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                      {sorting && header.column.getCanSort() && (
                        <span className="ml-1">
                          {header.column.getIsSorted() === "asc" ? (
                            <ArrowUp className="h-3.5 w-3.5" />
                          ) : header.column.getIsSorted() === "desc" ? (
                            <ArrowDown className="h-3.5 w-3.5" />
                          ) : (
                            <ArrowUpDown className="h-3.5 w-3.5 opacity-30" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No results.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-2 align-middle whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div>
            Page {paginationState.pageIndex + 1} of {table.getPageCount() || 1}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="inline-flex h-7 w-7 items-center justify-center rounded border disabled:opacity-50 hover:bg-muted"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="inline-flex h-7 w-7 items-center justify-center rounded border disabled:opacity-50 hover:bg-muted"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
