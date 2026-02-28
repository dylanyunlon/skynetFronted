/* Copyright 2026 SkyNet. Adapted from marimo. */
import React from "react";
import { Eye, X } from "lucide-react";
import { formatCellValue } from "../utils";

export function RowViewerPanel({
  row,
  columns,
  onClose,
}: {
  row: Record<string, unknown>;
  columns: string[];
  onClose?: () => void;
}) {
  return (
    <div className="border rounded-lg p-4 bg-background max-h-96 overflow-auto">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          <span className="text-sm font-medium">Row Detail</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 hover:bg-muted rounded">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <div className="space-y-2">
        {columns.map((col) => (
          <div key={col} className="flex gap-3 text-xs">
            <span className="font-medium text-muted-foreground min-w-[120px] shrink-0">{col}</span>
            <span className="break-all">{formatCellValue(row[col])}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
