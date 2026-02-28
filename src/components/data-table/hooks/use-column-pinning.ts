/* Copyright 2026 SkyNet. Adapted from marimo. */

import { useState, useCallback } from "react";

export function useColumnPinning() {
  const [pinnedColumns, setPinnedColumns] = useState<{
    left: string[];
    right: string[];
  }>({ left: [], right: [] });

  const pinColumn = useCallback((columnId: string, side: "left" | "right") => {
    setPinnedColumns((prev) => ({
      ...prev,
      [side]: [...prev[side], columnId],
    }));
  }, []);

  const unpinColumn = useCallback((columnId: string) => {
    setPinnedColumns((prev) => ({
      left: prev.left.filter((c) => c !== columnId),
      right: prev.right.filter((c) => c !== columnId),
    }));
  }, []);

  return { pinnedColumns, pinColumn, unpinColumn };
}

export function usePanelOwnership() {
  const [activePanel, setActivePanel] = useState<string | null>(null);

  const openPanel = useCallback((panelId: string) => {
    setActivePanel(panelId);
  }, []);

  const closePanel = useCallback(() => {
    setActivePanel(null);
  }, []);

  const isActive = useCallback(
    (panelId: string) => activePanel === panelId,
    [activePanel]
  );

  return { activePanel, openPanel, closePanel, isActive };
}
