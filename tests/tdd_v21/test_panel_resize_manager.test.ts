/**
 * TDD v21 Module 4: Panel Resize Manager
 * Tests for panel layout management, size constraints, persistence
 * Target: src/utils/panelResizeManager.ts
 */
import { describe, it, expect } from 'vitest';

import {
  PanelLayout,
  PanelConfig,
  createPanelLayout,
  DEFAULT_PANEL_SIZES,
  calculatePanelSizes,
  constrainPanelSize,
  getResponsiveLayout,
  serializeLayout,
  deserializeLayout,
  PANEL_IDS,
  togglePanel,
  collapsePanel,
  expandPanel,
  isPanelCollapsed,
} from '@/utils/panelResizeManager';

describe('Panel Resize Manager', () => {
  // --- Default Layout ---
  describe('createPanelLayout', () => {
    it('should create 3-panel layout by default', () => {
      const layout = createPanelLayout();
      expect(layout.panels.length).toBe(3);
    });

    it('should have sidebar, main, and detail panels', () => {
      const layout = createPanelLayout();
      const ids = layout.panels.map((p: PanelConfig) => p.id);
      expect(ids).toContain('sidebar');
      expect(ids).toContain('main');
      expect(ids).toContain('detail');
    });

    it('should have sizes summing to 100', () => {
      const layout = createPanelLayout();
      const total = layout.panels.reduce((sum: number, p: PanelConfig) => sum + p.size, 0);
      expect(total).toBe(100);
    });

    it('should accept custom initial sizes', () => {
      const layout = createPanelLayout({ sidebar: 30, main: 50, detail: 20 });
      const sidebar = layout.panels.find((p: PanelConfig) => p.id === 'sidebar');
      expect(sidebar!.size).toBe(30);
    });
  });

  // --- Size Calculation ---
  describe('calculatePanelSizes', () => {
    it('should distribute remaining space when panel is collapsed', () => {
      const sizes = calculatePanelSizes({ sidebar: 0, main: 70, detail: 30 });
      expect(sizes.sidebar).toBe(0);
      expect(sizes.main + sizes.detail).toBe(100);
    });

    it('should normalize sizes to sum to 100', () => {
      const sizes = calculatePanelSizes({ sidebar: 20, main: 40, detail: 20 });
      expect(sizes.sidebar + sizes.main + sizes.detail).toBe(100);
    });
  });

  // --- Constraints ---
  describe('constrainPanelSize', () => {
    it('should enforce minimum size', () => {
      const size = constrainPanelSize('sidebar', 5);
      expect(size).toBeGreaterThanOrEqual(10);
    });

    it('should enforce maximum size', () => {
      const size = constrainPanelSize('sidebar', 80);
      expect(size).toBeLessThanOrEqual(50);
    });

    it('should allow 0 (collapsed)', () => {
      const size = constrainPanelSize('sidebar', 0);
      expect(size).toBe(0);
    });

    it('should pass through valid sizes', () => {
      const size = constrainPanelSize('main', 60);
      expect(size).toBe(60);
    });
  });

  // --- Responsive Layout ---
  describe('getResponsiveLayout', () => {
    it('should return mobile layout for width < 768', () => {
      const layout = getResponsiveLayout(600);
      expect(layout.mode).toBe('mobile');
      // On mobile, sidebar should be collapsed
      const sidebar = layout.panels.find((p: PanelConfig) => p.id === 'sidebar');
      expect(sidebar!.size).toBe(0);
    });

    it('should return tablet layout for 768 <= width < 1024', () => {
      const layout = getResponsiveLayout(900);
      expect(layout.mode).toBe('tablet');
    });

    it('should return desktop layout for width >= 1024', () => {
      const layout = getResponsiveLayout(1400);
      expect(layout.mode).toBe('desktop');
    });
  });

  // --- Serialization ---
  describe('serializeLayout', () => {
    it('should produce JSON string', () => {
      const layout = createPanelLayout();
      const json = serializeLayout(layout);
      expect(typeof json).toBe('string');
      expect(() => JSON.parse(json)).not.toThrow();
    });
  });

  describe('deserializeLayout', () => {
    it('should round-trip correctly', () => {
      const layout = createPanelLayout({ sidebar: 25, main: 55, detail: 20 });
      const json = serializeLayout(layout);
      const restored = deserializeLayout(json);
      expect(restored.panels.length).toBe(layout.panels.length);
    });

    it('should return default layout for invalid JSON', () => {
      const layout = deserializeLayout('invalid');
      expect(layout.panels.length).toBe(3);
    });
  });

  // --- Panel IDs ---
  describe('PANEL_IDS', () => {
    it('should contain sidebar, main, detail', () => {
      expect(PANEL_IDS).toContain('sidebar');
      expect(PANEL_IDS).toContain('main');
      expect(PANEL_IDS).toContain('detail');
    });
  });

  // --- Toggle/Collapse/Expand ---
  describe('togglePanel', () => {
    it('should collapse an expanded panel', () => {
      const layout = createPanelLayout();
      const toggled = togglePanel(layout, 'sidebar');
      const sidebar = toggled.panels.find((p: PanelConfig) => p.id === 'sidebar');
      expect(sidebar!.size).toBe(0);
    });

    it('should expand a collapsed panel', () => {
      let layout = createPanelLayout();
      layout = collapsePanel(layout, 'sidebar');
      const toggled = togglePanel(layout, 'sidebar');
      const sidebar = toggled.panels.find((p: PanelConfig) => p.id === 'sidebar');
      expect(sidebar!.size).toBeGreaterThan(0);
    });
  });

  describe('isPanelCollapsed', () => {
    it('should return false for visible panel', () => {
      const layout = createPanelLayout();
      expect(isPanelCollapsed(layout, 'sidebar')).toBe(false);
    });

    it('should return true for collapsed panel', () => {
      const layout = collapsePanel(createPanelLayout(), 'sidebar');
      expect(isPanelCollapsed(layout, 'sidebar')).toBe(true);
    });
  });
});
