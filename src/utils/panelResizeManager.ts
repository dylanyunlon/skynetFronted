/**
 * Panel Resize Manager — Layout management for react-resizable-panels
 */

// --- Types ---
export interface PanelConfig {
  id: string;
  size: number;
  minSize: number;
  maxSize: number;
  collapsible: boolean;
  previousSize: number; // size before collapse
}

export interface PanelLayout {
  panels: PanelConfig[];
  mode: 'mobile' | 'tablet' | 'desktop';
}

// --- Constants ---
export const PANEL_IDS = ['sidebar', 'main', 'detail'] as const;

export const DEFAULT_PANEL_SIZES: Record<string, { default: number; min: number; max: number }> = {
  sidebar: { default: 20, min: 10, max: 50 },
  main: { default: 55, min: 30, max: 80 },
  detail: { default: 25, min: 10, max: 50 },
};

// --- Layout Factory ---
export function createPanelLayout(sizes?: Partial<Record<string, number>>): PanelLayout {
  const panels: PanelConfig[] = PANEL_IDS.map(id => {
    const def = DEFAULT_PANEL_SIZES[id];
    const size = sizes?.[id] ?? def.default;
    return { id, size, minSize: def.min, maxSize: def.max, collapsible: id !== 'main', previousSize: size };
  });

  // Normalize to 100
  const total = panels.reduce((s, p) => s + p.size, 0);
  if (total !== 100 && total > 0) {
    const factor = 100 / total;
    panels.forEach(p => { p.size = Math.round(p.size * factor); });
    // Fix rounding errors
    const diff = 100 - panels.reduce((s, p) => s + p.size, 0);
    panels[1].size += diff; // adjust main panel
  }

  return { panels, mode: 'desktop' };
}

// --- Size Calculation ---
export function calculatePanelSizes(sizes: Record<string, number>): Record<string, number> {
  const entries = Object.entries(sizes);
  const total = entries.reduce((s, [, v]) => s + v, 0);
  if (total === 100) return { ...sizes };
  if (total === 0) return { sidebar: 20, main: 55, detail: 25 };
  const factor = 100 / total;
  const result: Record<string, number> = {};
  for (const [k, v] of entries) {
    result[k] = Math.round(v * factor);
  }
  const diff = 100 - Object.values(result).reduce((s, v) => s + v, 0);
  if (result.main !== undefined) result.main += diff;
  return result;
}

// --- Constraints ---
export function constrainPanelSize(panelId: string, size: number): number {
  if (size === 0) return 0; // allow collapsed
  const def = DEFAULT_PANEL_SIZES[panelId];
  if (!def) return size;
  return Math.max(def.min, Math.min(def.max, size));
}

// --- Responsive ---
export function getResponsiveLayout(width: number): PanelLayout {
  if (width < 768) {
    return {
      panels: PANEL_IDS.map(id => ({
        id,
        size: id === 'main' ? 100 : 0,
        minSize: DEFAULT_PANEL_SIZES[id].min,
        maxSize: DEFAULT_PANEL_SIZES[id].max,
        collapsible: true,
        previousSize: DEFAULT_PANEL_SIZES[id].default,
      })),
      mode: 'mobile',
    };
  }
  if (width < 1024) {
    return {
      panels: [
        { id: 'sidebar', size: 0, minSize: 10, maxSize: 50, collapsible: true, previousSize: 20 },
        { id: 'main', size: 65, minSize: 30, maxSize: 80, collapsible: false, previousSize: 65 },
        { id: 'detail', size: 35, minSize: 10, maxSize: 50, collapsible: true, previousSize: 35 },
      ],
      mode: 'tablet',
    };
  }
  return createPanelLayout();
}

// --- Serialization ---
export function serializeLayout(layout: PanelLayout): string {
  return JSON.stringify({ panels: layout.panels.map(p => ({ id: p.id, size: p.size })), mode: layout.mode });
}

export function deserializeLayout(json: string): PanelLayout {
  try {
    const data = JSON.parse(json);
    if (!data.panels || !Array.isArray(data.panels)) return createPanelLayout();
    const sizes: Record<string, number> = {};
    for (const p of data.panels) sizes[p.id] = p.size;
    const layout = createPanelLayout(sizes);
    layout.mode = data.mode || 'desktop';
    return layout;
  } catch {
    return createPanelLayout();
  }
}

// --- Toggle/Collapse/Expand ---
export function collapsePanel(layout: PanelLayout, panelId: string): PanelLayout {
  const panels = layout.panels.map(p => {
    if (p.id === panelId) return { ...p, previousSize: p.size, size: 0 };
    return { ...p };
  });
  // Redistribute
  const freed = layout.panels.find(p => p.id === panelId)?.size ?? 0;
  const main = panels.find(p => p.id === 'main');
  if (main) main.size += freed;
  return { ...layout, panels };
}

export function expandPanel(layout: PanelLayout, panelId: string): PanelLayout {
  const target = layout.panels.find(p => p.id === panelId);
  if (!target) return layout;
  const restoreSize = target.previousSize || DEFAULT_PANEL_SIZES[panelId]?.default || 20;
  const panels = layout.panels.map(p => {
    if (p.id === panelId) return { ...p, size: restoreSize };
    return { ...p };
  });
  // Shrink main to compensate
  const main = panels.find(p => p.id === 'main');
  if (main) main.size -= restoreSize;
  return { ...layout, panels };
}

export function togglePanel(layout: PanelLayout, panelId: string): PanelLayout {
  const panel = layout.panels.find(p => p.id === panelId);
  if (!panel) return layout;
  return panel.size === 0 ? expandPanel(layout, panelId) : collapsePanel(layout, panelId);
}

export function isPanelCollapsed(layout: PanelLayout, panelId: string): boolean {
  const panel = layout.panels.find(p => p.id === panelId);
  return panel ? panel.size === 0 : false;
}
