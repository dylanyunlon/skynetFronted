/* Copyright 2026 SkyNet. Adapted from marimo. */

import type { ColumnDef } from "@tanstack/react-table";

export type ColumnName = string;

export interface FieldType {
  type: "boolean" | "integer" | "number" | "string" | "date" | "datetime" | "time" | "unknown";
}

export interface FieldTypesWithExternalType {
  [key: string]: [FieldType, string];
}

export interface ColumnHeaderStats {
  column: ColumnName;
  min?: number | string | null;
  max?: number | string | null;
  unique?: number | null;
  nulls?: number | null;
  true_count?: number | null;
  false_count?: number | null;
}

export interface DataTableSelection {
  selected_row_indices: number[];
}

export interface BinValues {
  bins: Array<{
    left: number;
    right: number;
    count: number;
  }>;
}

export const TOO_MANY_ROWS = "too_many" as const;
export type TooManyRows = typeof TOO_MANY_ROWS;

export interface DataTableColumn<TData = unknown> extends ColumnDef<TData> {
  id: string;
  accessorKey?: string;
  header: string;
}

export interface DataTableProps<TData = unknown> {
  data: TData[];
  columns: DataTableColumn<TData>[];
  pageSize?: number;
  totalRows: number | TooManyRows;
  selection?: DataTableSelection;
  onSelectionChange?: (selection: DataTableSelection) => void;
  pagination?: boolean;
  sorting?: boolean;
  filtering?: boolean;
  fieldTypes?: FieldTypesWithExternalType;
  columnHeaders?: ColumnHeaderStats[];
  showDownload?: boolean;
  showColumnSummary?: boolean;
  showCharts?: boolean;
  className?: string;
}

export type ColumnFilterValue = {
  column: ColumnName;
  type: "text" | "number" | "set" | "date" | "boolean";
  value: unknown;
  operator: "eq" | "ne" | "gt" | "lt" | "gte" | "lte" | "contains" | "in" | "not_in";
};

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export interface PaginationProps {
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  onPageChange: (pageIndex: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}
