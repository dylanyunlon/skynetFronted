export type { ColumnFormatRule, ColumnFormattingState } from "./types";
export { INITIAL_COLUMN_FORMATTING_STATE } from "./types";
export function formatColumn(value: unknown, format: string, locale?: string): string {
  if (value == null) return "";
  if (typeof value === "number") {
    try { return new Intl.NumberFormat(locale, { notation: format as any }).format(value); } catch { return String(value); }
  }
  return String(value);
}
