export interface ColumnFormatRule { column: string; format: string; locale?: string; }
export interface ColumnFormattingState { rules: ColumnFormatRule[]; enabled: boolean; }
export const INITIAL_COLUMN_FORMATTING_STATE: ColumnFormattingState = { rules: [], enabled: false };
