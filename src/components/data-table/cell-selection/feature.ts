/* Copyright 2026 SkyNet. Adapted from marimo. */

import type { CellSelectionState } from "./types";
export type { CellSelectionState };
export { INITIAL_CELL_SELECTION_STATE } from "./types";

export function toggleCellSelection(
  state: CellSelectionState,
  rowIndex: number,
  columnId: string
): CellSelectionState {
  const newMap = new Map(state.selectedCells);
  const colSet = new Set(newMap.get(columnId) ?? []);
  if (colSet.has(rowIndex)) {
    colSet.delete(rowIndex);
  } else {
    colSet.add(rowIndex);
  }
  if (colSet.size === 0) {
    newMap.delete(columnId);
  } else {
    newMap.set(columnId, colSet);
  }
  return { ...state, selectedCells: newMap };
}

export function clearCellSelection(): CellSelectionState {
  return { selectedCells: new Map(), isSelecting: false };
}

export function getSelectedCellCount(state: CellSelectionState): number {
  let count = 0;
  for (const set of state.selectedCells.values()) {
    count += set.size;
  }
  return count;
}
