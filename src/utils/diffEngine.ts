/**
 * Diff Engine — Diff computation using npm 'diff' package
 * Uses: diff (npm package)
 */
import * as Diff from 'diff';

// --- Types ---
export interface DiffLine {
  type: 'added' | 'removed' | 'equal';
  content: string;
  oldLineNumber: number | null;
  newLineNumber: number | null;
}

export interface DiffStats {
  added: number;
  removed: number;
  total: number;
  formatted: string;
}

export interface DiffHunk {
  oldStart: number;
  newStart: number;
  oldCount: number;
  newCount: number;
  lines: string[];
}

export interface SideBySideLine {
  left: { content: string; lineNumber: number; type: 'equal' | 'removed' } | null;
  right: { content: string; lineNumber: number; type: 'equal' | 'added' } | null;
}

export interface HighlightSegment {
  text: string;
  type: 'unchanged' | 'changed';
}

// --- Unified Diff ---
export function computeUnifiedDiff(oldText: string, newText: string, filename: string): string {
  if (oldText === newText) return '';
  const patch = Diff.createPatch(filename, oldText, newText, 'old', 'new');
  return patch;
}

// --- Line Diff ---
export function computeLineDiff(oldText: string, newText: string): DiffLine[] {
  const changes = Diff.diffLines(oldText, newText);
  const result: DiffLine[] = [];
  let oldLine = 1;
  let newLine = 1;

  for (const change of changes) {
    const lines = change.value.replace(/\n$/, '').split('\n');
    for (const line of lines) {
      if (change.added) {
        result.push({ type: 'added', content: line, oldLineNumber: null, newLineNumber: newLine++ });
      } else if (change.removed) {
        result.push({ type: 'removed', content: line, oldLineNumber: oldLine++, newLineNumber: null });
      } else {
        result.push({ type: 'equal', content: line, oldLineNumber: oldLine++, newLineNumber: newLine++ });
      }
    }
  }
  return result;
}

// --- Char Diff ---
export function computeCharDiff(oldStr: string, newStr: string): Diff.Change[] {
  return Diff.diffChars(oldStr, newStr);
}

// --- Stats ---
export function parseDiffStats(oldText: string, newText: string): DiffStats {
  if (oldText === newText) return { added: 0, removed: 0, total: 0, formatted: '+0 -0' };
  const changes = Diff.diffLines(oldText, newText);
  let added = 0;
  let removed = 0;
  for (const change of changes) {
    const lineCount = change.value.replace(/\n$/, '').split('\n').length;
    if (change.added) added += lineCount;
    else if (change.removed) removed += lineCount;
  }
  return { added, removed, total: added + removed, formatted: `+${added} -${removed}` };
}

// --- Header ---
export function formatDiffHeader(filename: string, stats: DiffStats): string {
  return `${filename} ${stats.formatted}`;
}

// --- Hunks ---
export function splitDiffIntoHunks(unifiedDiff: string): DiffHunk[] {
  if (!unifiedDiff) return [];
  const hunks: DiffHunk[] = [];
  const hunkRegex = /^@@\s+-(\d+),?(\d*)\s+\+(\d+),?(\d*)\s+@@/;
  const lines = unifiedDiff.split('\n');
  let currentHunk: DiffHunk | null = null;

  for (const line of lines) {
    const match = line.match(hunkRegex);
    if (match) {
      if (currentHunk) hunks.push(currentHunk);
      currentHunk = {
        oldStart: parseInt(match[1]),
        newStart: parseInt(match[3]),
        oldCount: parseInt(match[2] || '0'),
        newCount: parseInt(match[4] || '0'),
        lines: [],
      };
    } else if (currentHunk && !line.startsWith('---') && !line.startsWith('+++') && !line.startsWith('Index:') && !line.startsWith('===') && !line.startsWith('diff')) {
      currentHunk.lines.push(line);
    }
  }
  if (currentHunk) hunks.push(currentHunk);
  return hunks;
}

// --- Side-by-Side ---
export function computeSideBySideDiff(oldText: string, newText: string): SideBySideLine[] {
  const changes = Diff.diffLines(oldText, newText);
  const result: SideBySideLine[] = [];
  let oldLine = 1;
  let newLine = 1;

  for (const change of changes) {
    const lines = change.value.replace(/\n$/, '').split('\n');
    if (change.added) {
      for (const line of lines) {
        result.push({ left: null, right: { content: line, lineNumber: newLine++, type: 'added' } });
      }
    } else if (change.removed) {
      for (const line of lines) {
        result.push({ left: { content: line, lineNumber: oldLine++, type: 'removed' }, right: null });
      }
    } else {
      for (const line of lines) {
        result.push({
          left: { content: line, lineNumber: oldLine++, type: 'equal' },
          right: { content: line, lineNumber: newLine++, type: 'equal' },
        });
      }
    }
  }
  return result;
}

// --- Highlight Changes ---
export function highlightDiffChanges(oldLine: string, newLine: string): HighlightSegment[] {
  const changes = Diff.diffChars(oldLine, newLine);
  return changes.map(c => ({
    text: c.value,
    type: (c.added || c.removed) ? 'changed' as const : 'unchanged' as const,
  }));
}
