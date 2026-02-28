/* Copyright 2026 SkyNet. Adapted from marimo. */

export interface CellStyleRule {
  column: string;
  condition: "gt" | "lt" | "eq" | "ne" | "contains" | "between";
  value: unknown;
  value2?: unknown;
  style: {
    backgroundColor?: string;
    color?: string;
    fontWeight?: string;
  };
}

export interface CellStyleState {
  rules: CellStyleRule[];
  enabled: boolean;
}

export const INITIAL_CELL_STYLE_STATE: CellStyleState = {
  rules: [],
  enabled: false,
};
