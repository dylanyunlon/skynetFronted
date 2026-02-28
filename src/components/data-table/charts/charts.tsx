/* Copyright 2026 SkyNet. Adapted from marimo. */

import React, { useState } from "react";
import { BarChart3, X } from "lucide-react";

export interface ChartConfig {
  columnId: string;
  chartType: "bar" | "line" | "scatter" | "histogram" | "pie";
  title?: string;
}

export function TablePanel({
  data,
  columns,
  onClose,
}: {
  data: Record<string, unknown>[];
  columns: string[];
  onClose?: () => void;
}) {
  const [selectedColumn, setSelectedColumn] = useState(columns[0] || "");
  const [chartType, setChartType] = useState<ChartConfig["chartType"]>("bar");

  return (
    <div className="border rounded-lg p-4 bg-background">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          <span className="text-sm font-medium">Chart Builder</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 hover:bg-muted rounded">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      
      <div className="flex gap-2 mb-3">
        <select
          value={selectedColumn}
          onChange={(e) => setSelectedColumn(e.target.value)}
          className="text-xs border rounded px-2 py-1 bg-background"
        >
          {columns.map((col) => (
            <option key={col} value={col}>{col}</option>
          ))}
        </select>
        <select
          value={chartType}
          onChange={(e) => setChartType(e.target.value as ChartConfig["chartType"])}
          className="text-xs border rounded px-2 py-1 bg-background"
        >
          <option value="bar">Bar</option>
          <option value="line">Line</option>
          <option value="scatter">Scatter</option>
          <option value="histogram">Histogram</option>
          <option value="pie">Pie</option>
        </select>
      </div>

      <div className="h-48 flex items-center justify-center border rounded bg-muted/20">
        <span className="text-xs text-muted-foreground">
          Chart preview for "{selectedColumn}" ({chartType})
        </span>
      </div>
    </div>
  );
}

export default TablePanel;
