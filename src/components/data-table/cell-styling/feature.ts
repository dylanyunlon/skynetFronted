/* Copyright 2026 SkyNet. Adapted from marimo. */
import type { CellStyleRule, CellStyleState } from "./types";
export type { CellStyleRule, CellStyleState };
export { INITIAL_CELL_STYLE_STATE } from "./types";

export function evaluateStyle(rule: CellStyleRule, cellValue: unknown): React.CSSProperties | undefined {
  const { condition, value, value2 } = rule;
  let matches = false;
  
  switch (condition) {
    case "gt": matches = Number(cellValue) > Number(value); break;
    case "lt": matches = Number(cellValue) < Number(value); break;
    case "eq": matches = cellValue === value; break;
    case "ne": matches = cellValue !== value; break;
    case "contains": matches = String(cellValue).includes(String(value)); break;
    case "between": matches = Number(cellValue) >= Number(value) && Number(cellValue) <= Number(value2); break;
  }
  return matches ? rule.style as React.CSSProperties : undefined;
}

export function applyCellStyles(
  state: CellStyleState,
  columnId: string,
  cellValue: unknown
): React.CSSProperties | undefined {
  if (!state.enabled || state.rules.length === 0) return undefined;
  
  const applicableRules = state.rules.filter((r) => r.column === columnId);
  for (const rule of applicableRules) {
    const style = evaluateStyle(rule, cellValue);
    if (style) return style;
  }
  return undefined;
}

import React from "react";
