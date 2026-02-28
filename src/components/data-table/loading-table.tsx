/* Copyright 2026 SkyNet. Adapted from marimo. */
import React from "react";

export function LoadingTable({ columns = 5, rows = 5 }: { columns?: number; rows?: number }) {
  return (
    <div className="w-full animate-pulse">
      <div className="rounded-md border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="h-9 px-3 border-b">
                  <div className="h-3 bg-muted rounded w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, ri) => (
              <tr key={ri} className="border-b">
                {Array.from({ length: columns }).map((_, ci) => (
                  <td key={ci} className="px-3 py-2">
                    <div className="h-3 bg-muted rounded" style={{ width: `${40 + Math.random() * 60}%` }} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
