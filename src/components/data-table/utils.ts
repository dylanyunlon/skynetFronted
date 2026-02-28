/* Copyright 2026 SkyNet. Adapted from marimo. */

import type { ColumnName, FieldTypesWithExternalType, ColumnFilterValue } from "./types";

export function getFieldType(fieldTypes: FieldTypesWithExternalType | undefined, column: ColumnName) {
  if (!fieldTypes || !(column in fieldTypes)) {
    return { type: "unknown" as const };
  }
  return fieldTypes[column][0];
}

export function getExternalType(fieldTypes: FieldTypesWithExternalType | undefined, column: ColumnName) {
  if (!fieldTypes || !(column in fieldTypes)) {
    return "unknown";
  }
  return fieldTypes[column][1];
}

export function isNumericType(type: string): boolean {
  return ["integer", "number"].includes(type);
}

export function isBooleanType(type: string): boolean {
  return type === "boolean";
}

export function isDateType(type: string): boolean {
  return ["date", "datetime", "time"].includes(type);
}

export function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  if (typeof value === "number") {
    if (Number.isInteger(value)) {
      return value.toLocaleString();
    }
    return value.toLocaleString(undefined, { maximumFractionDigits: 6 });
  }
  if (value instanceof Date) {
    return value.toLocaleString();
  }
  return String(value);
}

export function filterToFilterCondition(filter: ColumnFilterValue) {
  return {
    column_id: filter.column,
    filter_type: filter.type,
    value: filter.value,
    operator: filter.operator,
  };
}

export function truncateString(str: string, maxLength: number = 100): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "...";
}
