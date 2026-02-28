/* Copyright 2026 SkyNet. */
export function getCellId(rowIndex: number, columnId: string): string {
  return `${rowIndex}-${columnId}`;
}
export function parseCellId(cellId: string): { rowIndex: number; columnId: string } | null {
  const idx = cellId.indexOf("-");
  if (idx === -1) return null;
  return { rowIndex: Number(cellId.slice(0, idx)), columnId: cellId.slice(idx + 1) };
}
