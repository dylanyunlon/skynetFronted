export type { CopyColumnState } from "./types";
export { INITIAL_COPY_COLUMN_STATE } from "./types";
export async function copyColumnToClipboard(data: unknown[]): Promise<boolean> {
  try { await navigator.clipboard.writeText(data.map(String).join("\n")); return true; } catch { return false; }
}
