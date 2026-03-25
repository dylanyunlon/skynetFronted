/**
 * TDD v21 Module 2: Diff Engine
 * Tests for diff computation using npm 'diff' package, unified diff parsing, stats
 * Target: src/utils/diffEngine.ts
 */
import { describe, it, expect } from 'vitest';

import {
  computeUnifiedDiff,
  computeLineDiff,
  computeCharDiff,
  parseDiffStats,
  DiffLine,
  DiffStats,
  formatDiffHeader,
  splitDiffIntoHunks,
  DiffHunk,
  computeSideBySideDiff,
  SideBySideLine,
  highlightDiffChanges,
} from '@/utils/diffEngine';

describe('Diff Engine', () => {
  const oldText = 'line1\nline2\nline3\nline4\nline5';
  const newText = 'line1\nline2-modified\nline3\nnewLine\nline5';

  // --- Unified Diff ---
  describe('computeUnifiedDiff', () => {
    it('should produce unified diff string', () => {
      const diff = computeUnifiedDiff(oldText, newText, 'test.txt');
      expect(typeof diff).toBe('string');
      expect(diff).toContain('---');
      expect(diff).toContain('+++');
    });

    it('should show removed lines with -', () => {
      const diff = computeUnifiedDiff(oldText, newText, 'test.txt');
      expect(diff).toContain('-line2');
    });

    it('should show added lines with +', () => {
      const diff = computeUnifiedDiff(oldText, newText, 'test.txt');
      expect(diff).toContain('+line2-modified');
    });

    it('should return empty string for identical content', () => {
      const diff = computeUnifiedDiff(oldText, oldText, 'test.txt');
      expect(diff).toBe('');
    });

    it('should include filename in header', () => {
      const diff = computeUnifiedDiff(oldText, newText, 'src/app.ts');
      expect(diff).toContain('src/app.ts');
    });
  });

  // --- Line Diff ---
  describe('computeLineDiff', () => {
    it('should return array of DiffLine objects', () => {
      const lines = computeLineDiff(oldText, newText);
      expect(Array.isArray(lines)).toBe(true);
      expect(lines.length).toBeGreaterThan(0);
    });

    it('should mark unchanged lines as "equal"', () => {
      const lines = computeLineDiff(oldText, newText);
      const equalLines = lines.filter((l: DiffLine) => l.type === 'equal');
      expect(equalLines.length).toBeGreaterThan(0);
    });

    it('should mark removed lines as "removed"', () => {
      const lines = computeLineDiff(oldText, newText);
      const removed = lines.filter((l: DiffLine) => l.type === 'removed');
      expect(removed.length).toBeGreaterThan(0);
    });

    it('should mark added lines as "added"', () => {
      const lines = computeLineDiff(oldText, newText);
      const added = lines.filter((l: DiffLine) => l.type === 'added');
      expect(added.length).toBeGreaterThan(0);
    });

    it('should include line numbers', () => {
      const lines = computeLineDiff(oldText, newText);
      const firstLine = lines[0];
      expect(firstLine).toHaveProperty('oldLineNumber');
      expect(firstLine).toHaveProperty('newLineNumber');
    });
  });

  // --- Char Diff ---
  describe('computeCharDiff', () => {
    it('should detect character-level changes', () => {
      const changes = computeCharDiff('hello world', 'hello mars');
      expect(changes.length).toBeGreaterThan(1);
    });

    it('should mark unchanged segments', () => {
      const changes = computeCharDiff('abc', 'aXc');
      const unchanged = changes.filter(c => !c.added && !c.removed);
      expect(unchanged.length).toBeGreaterThan(0);
    });

    it('should return single unchanged segment for identical strings', () => {
      const changes = computeCharDiff('same', 'same');
      expect(changes.length).toBe(1);
      expect(changes[0].added).toBeFalsy();
      expect(changes[0].removed).toBeFalsy();
    });
  });

  // --- Diff Stats ---
  describe('parseDiffStats', () => {
    it('should count added and removed lines', () => {
      const stats = parseDiffStats(oldText, newText);
      expect(stats.added).toBeGreaterThan(0);
      expect(stats.removed).toBeGreaterThan(0);
    });

    it('should have total = added + removed', () => {
      const stats = parseDiffStats(oldText, newText);
      expect(stats.total).toBe(stats.added + stats.removed);
    });

    it('should return zero stats for identical content', () => {
      const stats = parseDiffStats(oldText, oldText);
      expect(stats.added).toBe(0);
      expect(stats.removed).toBe(0);
      expect(stats.total).toBe(0);
    });

    it('should format as "+N -M" string', () => {
      const stats = parseDiffStats(oldText, newText);
      expect(stats.formatted).toMatch(/^\+\d+ -\d+$/);
    });
  });

  // --- Diff Header ---
  describe('formatDiffHeader', () => {
    it('should include filename', () => {
      const header = formatDiffHeader('src/app.ts', { added: 5, removed: 3, total: 8, formatted: '+5 -3' });
      expect(header).toContain('src/app.ts');
    });

    it('should include stats', () => {
      const header = formatDiffHeader('test.py', { added: 10, removed: 2, total: 12, formatted: '+10 -2' });
      expect(header).toContain('+10');
      expect(header).toContain('-2');
    });
  });

  // --- Hunks ---
  describe('splitDiffIntoHunks', () => {
    it('should split unified diff into hunk objects', () => {
      const diff = computeUnifiedDiff(oldText, newText, 'test.txt');
      if (diff) {
        const hunks = splitDiffIntoHunks(diff);
        expect(Array.isArray(hunks)).toBe(true);
        expect(hunks.length).toBeGreaterThan(0);
      }
    });

    it('should have startLine and lines in each hunk', () => {
      const diff = computeUnifiedDiff(oldText, newText, 'test.txt');
      if (diff) {
        const hunks = splitDiffIntoHunks(diff);
        if (hunks.length > 0) {
          expect(hunks[0]).toHaveProperty('oldStart');
          expect(hunks[0]).toHaveProperty('newStart');
          expect(hunks[0]).toHaveProperty('lines');
        }
      }
    });

    it('should return empty array for empty diff', () => {
      const hunks = splitDiffIntoHunks('');
      expect(hunks).toEqual([]);
    });
  });

  // --- Side-by-Side ---
  describe('computeSideBySideDiff', () => {
    it('should return array of SideBySideLine pairs', () => {
      const pairs = computeSideBySideDiff(oldText, newText);
      expect(Array.isArray(pairs)).toBe(true);
      expect(pairs.length).toBeGreaterThan(0);
    });

    it('should have left and right properties', () => {
      const pairs = computeSideBySideDiff(oldText, newText);
      expect(pairs[0]).toHaveProperty('left');
      expect(pairs[0]).toHaveProperty('right');
    });

    it('should align matching lines on same row', () => {
      const pairs = computeSideBySideDiff('a\nb\nc', 'a\nX\nc');
      // First line should be equal on both sides
      expect(pairs[0].left?.content).toBe('a');
      expect(pairs[0].right?.content).toBe('a');
    });
  });

  // --- Highlight Changes ---
  describe('highlightDiffChanges', () => {
    it('should return segments with change markers for modified line', () => {
      const segments = highlightDiffChanges('hello world', 'hello mars');
      expect(segments.length).toBeGreaterThan(1);
    });

    it('should mark changed characters', () => {
      const segments = highlightDiffChanges('abc', 'aXc');
      const changed = segments.filter(s => s.type === 'changed');
      expect(changed.length).toBeGreaterThan(0);
    });
  });
});
