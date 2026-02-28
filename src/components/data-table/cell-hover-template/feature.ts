export type { CellHoverTemplateState } from "./types";
export { INITIAL_CELL_HOVER_TEMPLATE_STATE } from "./types";
export function renderHoverTemplate(template: string, row: Record<string, unknown>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(row[key] ?? ""));
}
