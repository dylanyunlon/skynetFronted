/* Copyright 2026 SkyNet. Adapted from marimo. */
import { z } from "zod";

export const DownloadAsSchema = z.object({
  format: z.enum(["csv", "json", "tsv", "parquet"]),
  filename: z.string().optional(),
  includeHeaders: z.boolean().default(true),
  selectedOnly: z.boolean().default(false),
});

export type DownloadAsArgs = z.infer<typeof DownloadAsSchema>;

export const ColumnFilterSchema = z.object({
  column: z.string(),
  type: z.enum(["text", "number", "set", "date", "boolean"]),
  value: z.unknown(),
  operator: z.enum(["eq", "ne", "gt", "lt", "gte", "lte", "contains", "in", "not_in"]),
});

export const TableConfigSchema = z.object({
  pageSize: z.number().default(10),
  showColumnSummary: z.boolean().default(false),
  showCharts: z.boolean().default(false),
  enableFiltering: z.boolean().default(true),
  enableSorting: z.boolean().default(true),
  enableRowSelection: z.boolean().default(false),
});
