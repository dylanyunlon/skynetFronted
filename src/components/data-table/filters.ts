/* Copyright 2026 SkyNet. Adapted from marimo. */

import type { ColumnFilterValue } from "./types";

export type { ColumnFilterValue };

export function filterToFilterCondition(filter: ColumnFilterValue) {
  return {
    column_id: filter.column,
    filter_type: filter.type,
    value: filter.value,
    operator: filter.operator,
  };
}

export function createTextFilter(column: string, value: string): ColumnFilterValue {
  return { column, type: "text", value, operator: "contains" };
}

export function createNumberFilter(column: string, value: number, operator: ColumnFilterValue["operator"] = "eq"): ColumnFilterValue {
  return { column, type: "number", value, operator };
}

export function createBooleanFilter(column: string, value: boolean): ColumnFilterValue {
  return { column, type: "boolean", value, operator: "eq" };
}

export function createSetFilter(column: string, values: unknown[]): ColumnFilterValue {
  return { column, type: "set", value: values, operator: "in" };
}
