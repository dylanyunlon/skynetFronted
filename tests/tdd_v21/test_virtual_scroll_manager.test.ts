/**
 * TDD v21 Module 6: Virtual Scroll Manager
 * Tests for virtual scrolling calculations, viewport management
 * Target: src/utils/virtualScrollManager.ts
 */
import { describe, it, expect } from 'vitest';

import {
  VirtualScrollConfig,
  createVirtualScrollConfig,
  calculateVisibleRange,
  VisibleRange,
  estimateItemHeight,
  calculateTotalHeight,
  getScrollToIndex,
  ScrollAlignment,
  createMessageVirtualConfig,
  createLogVirtualConfig,
  shouldEnableVirtualScroll,
  VIRTUAL_SCROLL_THRESHOLDS,
  calculateOverscan,
  VirtualItem,
  mapVisibleItems,
} from '@/utils/virtualScrollManager';

describe('Virtual Scroll Manager', () => {
  // --- Config Creation ---
  describe('createVirtualScrollConfig', () => {
    it('should create config with defaults', () => {
      const config = createVirtualScrollConfig({ itemCount: 100 });
      expect(config.itemCount).toBe(100);
      expect(config.overscan).toBeGreaterThan(0);
      expect(config.estimateSize).toBeDefined();
    });

    it('should accept custom estimateSize', () => {
      const config = createVirtualScrollConfig({ itemCount: 50, estimateSize: 80 });
      expect(config.estimateSize).toBe(80);
    });

    it('should accept custom overscan', () => {
      const config = createVirtualScrollConfig({ itemCount: 50, overscan: 10 });
      expect(config.overscan).toBe(10);
    });
  });

  // --- Visible Range ---
  describe('calculateVisibleRange', () => {
    it('should calculate start and end indices', () => {
      const range = calculateVisibleRange({
        scrollOffset: 0,
        containerHeight: 500,
        itemHeight: 50,
        itemCount: 100,
        overscan: 3,
      });
      expect(range.startIndex).toBe(0);
      expect(range.endIndex).toBeGreaterThan(0);
    });

    it('should include overscan items', () => {
      const range = calculateVisibleRange({
        scrollOffset: 500,
        containerHeight: 500,
        itemHeight: 50,
        itemCount: 100,
        overscan: 5,
      });
      // Start should be earlier than pure visible start
      expect(range.startIndex).toBeLessThan(10);
    });

    it('should clamp to valid range', () => {
      const range = calculateVisibleRange({
        scrollOffset: 9000,
        containerHeight: 500,
        itemHeight: 50,
        itemCount: 100,
        overscan: 3,
      });
      expect(range.endIndex).toBeLessThanOrEqual(99);
    });

    it('should handle empty list', () => {
      const range = calculateVisibleRange({
        scrollOffset: 0,
        containerHeight: 500,
        itemHeight: 50,
        itemCount: 0,
        overscan: 3,
      });
      expect(range.startIndex).toBe(0);
      expect(range.endIndex).toBe(0);
    });
  });

  // --- Estimate Height ---
  describe('estimateItemHeight', () => {
    it('should return default height for simple text', () => {
      const h = estimateItemHeight('Hello world', 'message');
      expect(h).toBeGreaterThan(0);
    });

    it('should increase height for multi-line content', () => {
      const short = estimateItemHeight('one line', 'message');
      const long = estimateItemHeight('line1\nline2\nline3\nline4\nline5', 'message');
      expect(long).toBeGreaterThan(short);
    });

    it('should have different heights for message vs log types', () => {
      const msg = estimateItemHeight('text', 'message');
      const log = estimateItemHeight('text', 'log');
      // Messages typically have more padding
      expect(msg).not.toBe(log);
    });
  });

  // --- Total Height ---
  describe('calculateTotalHeight', () => {
    it('should sum all item heights', () => {
      const heights = [50, 100, 50, 75];
      expect(calculateTotalHeight(heights)).toBe(275);
    });

    it('should return 0 for empty array', () => {
      expect(calculateTotalHeight([])).toBe(0);
    });
  });

  // --- Scroll To Index ---
  describe('getScrollToIndex', () => {
    it('should calculate offset for start alignment', () => {
      const offset = getScrollToIndex({
        index: 10,
        itemHeight: 50,
        containerHeight: 500,
        alignment: 'start',
      });
      expect(offset).toBe(500);
    });

    it('should center item for center alignment', () => {
      const offset = getScrollToIndex({
        index: 10,
        itemHeight: 50,
        containerHeight: 500,
        alignment: 'center',
      });
      expect(offset).toBe(275); // 500 - (500/2 - 50/2)
    });

    it('should clamp to 0 minimum', () => {
      const offset = getScrollToIndex({
        index: 0,
        itemHeight: 50,
        containerHeight: 500,
        alignment: 'center',
      });
      expect(offset).toBeGreaterThanOrEqual(0);
    });
  });

  // --- Preset Configs ---
  describe('createMessageVirtualConfig', () => {
    it('should create config optimized for chat messages', () => {
      const config = createMessageVirtualConfig(500);
      expect(config.estimateSize).toBeGreaterThanOrEqual(60);
      expect(config.overscan).toBeGreaterThanOrEqual(3);
    });
  });

  describe('createLogVirtualConfig', () => {
    it('should create config optimized for log lines', () => {
      const config = createLogVirtualConfig(10000);
      expect(config.estimateSize).toBeLessThanOrEqual(30);
      expect(config.itemCount).toBe(10000);
    });
  });

  // --- Threshold ---
  describe('shouldEnableVirtualScroll', () => {
    it('should return false for small lists', () => {
      expect(shouldEnableVirtualScroll(10)).toBe(false);
    });

    it('should return true for large lists', () => {
      expect(shouldEnableVirtualScroll(500)).toBe(true);
    });
  });

  // --- Overscan ---
  describe('calculateOverscan', () => {
    it('should increase overscan for fast scrolling', () => {
      const slow = calculateOverscan(10);
      const fast = calculateOverscan(200);
      expect(fast).toBeGreaterThan(slow);
    });

    it('should cap overscan at maximum', () => {
      const overscan = calculateOverscan(10000);
      expect(overscan).toBeLessThanOrEqual(20);
    });
  });

  // --- Map Visible Items ---
  describe('mapVisibleItems', () => {
    it('should map range to VirtualItem array', () => {
      const items = mapVisibleItems({ startIndex: 5, endIndex: 10 }, 50);
      expect(items.length).toBe(6); // inclusive
      expect(items[0].index).toBe(5);
      expect(items[0].offset).toBe(250);
    });

    it('should calculate correct offset for each item', () => {
      const items = mapVisibleItems({ startIndex: 0, endIndex: 2 }, 40);
      expect(items[0].offset).toBe(0);
      expect(items[1].offset).toBe(40);
      expect(items[2].offset).toBe(80);
    });
  });
});
