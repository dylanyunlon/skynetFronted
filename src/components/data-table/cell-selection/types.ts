/* Copyright 2026 SkyNet. Adapted from marimo. */

export interface CellSelectionState {
  selectedCells: Map<string, Set<number>>; // columnId -> Set of rowIndices
  isSelecting: boolean;
  startCell?: { rowIndex: number; columnId: string };
}

export const INITIAL_CELL_SELECTION_STATE: CellSelectionState = {
  selectedCells: new Map(),
  isSelecting: false,
};
