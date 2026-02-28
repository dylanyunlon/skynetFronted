/* Copyright 2026 SkyNet. Adapted from marimo. */
import React, { useState } from "react";
import { Columns3, Search } from "lucide-react";
import type { ColumnName, FieldTypesWithExternalType, ColumnHeaderStats } from "../types";
import { getFieldType } from "../utils";

export function ColumnExplorerPanel({
  columns,
  fieldTypes,
  stats,
  onColumnSelect,
}: {
  columns: ColumnName[];
  fieldTypes?: FieldTypesWithExternalType;
  stats?: ColumnHeaderStats[];
  onColumnSelect?: (column: ColumnName) => void;
}) {
  const [filter, setFilter] = useState("");

  const filtered = columns.filter((c) =>
    c.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="border rounded-lg p-3 bg-background max-h-80 overflow-auto">
      <div className="flex items-center gap-2 mb-2">
        <Columns3 className="h-4 w-4" />
        <span className="text-sm font-medium">Columns ({columns.length})</span>
      </div>
      <div className="relative mb-2">
        <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Filter columns..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="h-7 w-full rounded border bg-transparent pl-7 pr-2 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>
      <div className="space-y-1">
        {filtered.map((col) => {
          const ft = fieldTypes ? getFieldType(fieldTypes, col) : undefined;
          const stat = stats?.find((s) => s.column === col);
          return (
            <button
              key={col}
              onClick={() => onColumnSelect?.(col)}
              className="w-full flex items-center justify-between px-2 py-1 rounded text-xs hover:bg-muted text-left"
            >
              <span className="truncate">{col}</span>
              <span className="text-muted-foreground ml-2 shrink-0">
                {ft?.type || "?"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
