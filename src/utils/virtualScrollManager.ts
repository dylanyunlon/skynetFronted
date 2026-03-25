/**
 * Virtual Scroll Manager — viewport calculations, overscan, presets
 * v21 Module 6
 */

export interface VirtualScrollConfig {
  itemCount: number;
  estimateSize: number;
  overscan: number;
}

export interface VisibleRange {
  startIndex: number;
  endIndex: number;
}

export interface VirtualItem {
  index: number;
  offset: number;
  size: number;
}

export type ScrollAlignment = 'start' | 'center' | 'end';

export const VIRTUAL_SCROLL_THRESHOLDS = {
  enableAt: 100,       // enable virtual scroll at 100+ items
  maxOverscan: 20,
  defaultOverscan: 5,
  defaultItemHeight: 50,
};

// --- Config Creation ---

export function createVirtualScrollConfig(opts: {
  itemCount: number;
  estimateSize?: number;
  overscan?: number;
}): VirtualScrollConfig {
  return {
    itemCount: opts.itemCount,
    estimateSize: opts.estimateSize ?? VIRTUAL_SCROLL_THRESHOLDS.defaultItemHeight,
    overscan: opts.overscan ?? VIRTUAL_SCROLL_THRESHOLDS.defaultOverscan,
  };
}

// --- Visible Range ---

export function calculateVisibleRange(params: {
  scrollOffset: number;
  containerHeight: number;
  itemHeight: number;
  itemCount: number;
  overscan: number;
}): VisibleRange {
  const { scrollOffset, containerHeight, itemHeight, itemCount, overscan } = params;
  if (itemCount === 0) return { startIndex: 0, endIndex: 0 };

  const rawStart = Math.floor(scrollOffset / itemHeight);
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const rawEnd = rawStart + visibleCount;

  const startIndex = Math.max(0, rawStart - overscan);
  const endIndex = Math.min(itemCount - 1, rawEnd + overscan);

  return { startIndex, endIndex };
}

// --- Estimate Height ---

export function estimateItemHeight(content: string, type: 'message' | 'log'): number {
  const lineCount = content.split('\n').length;
  const basePadding = type === 'message' ? 32 : 8;
  const lineHeight = type === 'message' ? 24 : 18;
  return basePadding + lineCount * lineHeight;
}

// --- Total Height ---

export function calculateTotalHeight(heights: number[]): number {
  let total = 0;
  for (const h of heights) total += h;
  return total;
}

// --- Scroll To Index ---

export function getScrollToIndex(params: {
  index: number;
  itemHeight: number;
  containerHeight: number;
  alignment: ScrollAlignment;
}): number {
  const { index, itemHeight, containerHeight, alignment } = params;
  const itemOffset = index * itemHeight;

  let result: number;
  switch (alignment) {
    case 'start':
      result = itemOffset;
      break;
    case 'center':
      result = itemOffset - (containerHeight / 2 - itemHeight / 2);
      break;
    case 'end':
      result = itemOffset - containerHeight + itemHeight;
      break;
    default:
      result = itemOffset;
  }

  return Math.max(0, result);
}

// --- Preset Configs ---

export function createMessageVirtualConfig(itemCount: number): VirtualScrollConfig {
  return {
    itemCount,
    estimateSize: 80,
    overscan: 5,
  };
}

export function createLogVirtualConfig(itemCount: number): VirtualScrollConfig {
  return {
    itemCount,
    estimateSize: 22,
    overscan: 10,
  };
}

// --- Threshold ---

export function shouldEnableVirtualScroll(itemCount: number): boolean {
  return itemCount >= VIRTUAL_SCROLL_THRESHOLDS.enableAt;
}

// --- Overscan ---

export function calculateOverscan(scrollSpeed: number): number {
  // Faster scrolling = more overscan
  const base = 3;
  const speedFactor = Math.min(scrollSpeed / 50, 1); // normalize 0-1
  const overscan = Math.round(base + speedFactor * 17);
  return Math.min(overscan, VIRTUAL_SCROLL_THRESHOLDS.maxOverscan);
}

// --- Map Visible Items ---

export function mapVisibleItems(range: VisibleRange, itemHeight: number): VirtualItem[] {
  const items: VirtualItem[] = [];
  for (let i = range.startIndex; i <= range.endIndex; i++) {
    items.push({
      index: i,
      offset: i * itemHeight,
      size: itemHeight,
    });
  }
  return items;
}
