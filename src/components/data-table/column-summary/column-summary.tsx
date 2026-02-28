/* Copyright 2026 SkyNet. Adapted from marimo. */

import React from "react";
import { ColumnChartContext, ColumnChartSpecModel } from "./chart-spec-model";
export { ColumnChartContext, ColumnChartSpecModel };

export function ColumnSummary({ 
  column, 
  stats 
}: { 
  column: string; 
  stats: { min?: unknown; max?: unknown; unique?: number; nulls?: number } | null;
}) {
  if (!stats) return null;
  
  return (
    <div className="text-xs text-muted-foreground space-y-0.5 p-1">
      {stats.unique != null && (
        <div>Unique: {stats.unique}</div>
      )}
      {stats.nulls != null && stats.nulls > 0 && (
        <div>Nulls: {stats.nulls}</div>
      )}
      {stats.min != null && (
        <div>Min: {String(stats.min)}</div>
      )}
      {stats.max != null && (
        <div>Max: {String(stats.max)}</div>
      )}
    </div>
  );
}
