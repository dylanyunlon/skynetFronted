/* Copyright 2026 SkyNet. Adapted from marimo. */

import React, { createContext, useContext } from "react";
import type { ColumnName, ColumnHeaderStats, FieldTypesWithExternalType, BinValues } from "../types";

export interface ColumnChartSpec {
  column: ColumnName;
  chartType: "histogram" | "bar" | "boolean" | "date";
  data: BinValues | null;
  stats: ColumnHeaderStats | null;
}

export class ColumnChartSpecModel {
  private specs: Map<ColumnName, ColumnChartSpec> = new Map();
  
  constructor(
    private fieldTypes: FieldTypesWithExternalType = {},
    private columnStats: ColumnHeaderStats[] = [],
    private data: Record<string, unknown>[] = []
  ) {
    this.buildSpecs();
  }

  private buildSpecs() {
    for (const stat of this.columnStats) {
      const fieldType = this.fieldTypes[stat.column];
      const type = fieldType ? fieldType[0].type : "unknown";
      
      let chartType: ColumnChartSpec["chartType"] = "bar";
      if (type === "boolean") chartType = "boolean";
      else if (["integer", "number"].includes(type)) chartType = "histogram";
      else if (["date", "datetime"].includes(type)) chartType = "date";
      
      this.specs.set(stat.column, {
        column: stat.column,
        chartType,
        data: null,
        stats: stat,
      });
    }
  }

  getSpec(column: ColumnName): ColumnChartSpec | undefined {
    return this.specs.get(column);
  }

  getAllSpecs(): ColumnChartSpec[] {
    return Array.from(this.specs.values());
  }
}

export const ColumnChartContext = createContext<ColumnChartSpecModel | null>(null);

export function useColumnChart() {
  return useContext(ColumnChartContext);
}
